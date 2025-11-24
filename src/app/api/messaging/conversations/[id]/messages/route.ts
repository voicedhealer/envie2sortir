import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

// POST /api/messaging/conversations/[id]/messages - Envoyer un message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement les permissions
    const supabase = await createClient();
    const { id } = await params;

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, professional_id, status, admin_id')
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
    const isProfessionalOwner = 
      user.userType === "professional" && 
      conversation.professional_id === user.id;

    if (!isUserAdmin && !isProfessionalOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Déterminer le type d'expéditeur
    const senderType = isUserAdmin ? "ADMIN" : "PROFESSIONAL";

    // Créer le message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: user.id,
        sender_type: senderType,
        content,
        is_read: false
      })
      .select()
      .single();

    if (messageError || !message) {
      console.error('Erreur création message:', messageError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Mettre à jour lastMessageAt et assigner l'admin si premier message admin
    const updateData: any = {
      last_message_at: new Date().toISOString()
    };

    if (isUserAdmin && !conversation.admin_id) {
      updateData.admin_id = user.id;
    }

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id);

    // Convertir snake_case -> camelCase
    const formattedMessage = {
      ...message,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      senderType: message.sender_type,
      isRead: message.is_read,
      createdAt: message.created_at
    };

    return NextResponse.json({ message: formattedMessage }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

