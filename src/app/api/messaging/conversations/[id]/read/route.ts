import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/messaging/conversations/[id]/read - Marquer les messages comme lus
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Utiliser le client admin pour contourner les restrictions RLS
    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: "Erreur de configuration serveur" 
      }, { status: 500 });
    }
    
    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Vérifier que la conversation existe
    const { data: conversation, error: conversationError } = await adminClient
      .from('conversations')
      .select('id, professional_id')
      .eq('id', id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les droits d'accès
    const isUserAdmin = await isAdmin();
    const isUserProfessional = user.userType === "professional" || user.role === "professional" || user.role === "pro";
    const isProfessionalOwner = 
      isUserProfessional && 
      conversation.professional_id === user.id;

    if (!isUserAdmin && !isProfessionalOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Marquer comme lus les messages de l'autre partie
    const senderTypeToMarkAsRead = isUserAdmin ? "PROFESSIONAL" : "ADMIN";

    const { count, error: updateError } = await adminClient
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .eq('sender_type', senderTypeToMarkAsRead)
      .eq('is_read', false)
      .select('*', { count: 'exact', head: true });

    if (updateError) {
      console.error('Erreur marquage messages:', updateError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      markedAsRead: count || 0,
    });
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

