import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

// GET /api/messaging/unread-count - Compter les messages non lus
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement les permissions
    const supabase = await createClient();
    let unreadCount = 0;

    const isUserAdmin = await isAdmin();

    if (isUserAdmin) {
      // Compter les messages non lus des professionnels
      // Utiliser une requête SELECT normale puis compter côté serveur pour éviter les problèmes RLS avec count
      const { data: messages, error: countError } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_type', 'PROFESSIONAL')
        .eq('is_read', false);

      if (countError) {
        console.error('❌ Erreur comptage messages (admin):', countError);
        console.error('❌ Code:', countError.code);
        console.error('❌ Message:', countError.message);
        console.error('❌ Détails:', JSON.stringify(countError, null, 2));
        return NextResponse.json({ 
          error: "Erreur serveur",
          details: countError.message || 'Erreur RLS lors du comptage',
          code: countError.code
        }, { status: 500 });
      }

      unreadCount = messages?.length || 0;
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
        // Utiliser une requête SELECT normale puis compter côté serveur
        const { data: messages, error: countError } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', conversationIds)
          .eq('sender_type', 'ADMIN')
          .eq('is_read', false);

        if (countError) {
          console.error('❌ Erreur comptage messages (pro):', countError);
          console.error('❌ Code:', countError.code);
          console.error('❌ Message:', countError.message);
          console.error('❌ Détails:', JSON.stringify(countError, null, 2));
          return NextResponse.json({ 
            error: "Erreur serveur",
            details: countError.message || 'Erreur RLS lors du comptage',
            code: countError.code
          }, { status: 500 });
        }

        unreadCount = messages?.length || 0;
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

