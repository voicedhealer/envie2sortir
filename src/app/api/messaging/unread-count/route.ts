import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";

// GET /api/messaging/unread-count - Compter les messages non lus
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Utiliser le client admin pour bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [Messaging Unread Count] Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });
    let unreadCount = 0;

    const isUserAdmin = await isAdmin();

    if (isUserAdmin) {
      // Compter les messages non lus des professionnels
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'PROFESSIONAL')
        .eq('is_read', false);

      if (countError) {
        console.error('Erreur comptage messages:', countError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      unreadCount = count || 0;
    } else if (user.userType === "professional") {
      // Compter les messages non lus de l'admin dans les conversations du pro
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('professional_id', user.id);

      if (conversationsError) {
        console.error('Erreur récupération conversations:', conversationsError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      const conversationIds = (conversations || []).map((c: any) => c.id);

      if (conversationIds.length > 0) {
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .eq('sender_type', 'ADMIN')
          .eq('is_read', false);

        if (countError) {
          console.error('Erreur comptage messages:', countError);
          return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }

        unreadCount = count || 0;
      }
    } else {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Erreur lors du comptage des messages non lus:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

