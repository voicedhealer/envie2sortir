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

    const { id } = await params;

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

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
      .select('id, professional_id, status, admin_id')
      .eq('id', id)
      .single();

    if (conversationError || !conversation) {
      console.error('❌ [POST /api/messaging/conversations/[id]/messages] Erreur récupération conversation:', conversationError);
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les droits d'accès
    const isUserAdmin = await isAdmin();
    let isUserProfessional = user.userType === "professional" || user.role === "professional" || user.role === "pro";
    
    // Si userType n'est pas défini, vérifier dans la table professionals
    if (!isUserProfessional && !isUserAdmin) {
      const { data: professionalCheck } = await adminClient
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (professionalCheck) {
        isUserProfessional = true;
      }
    }
    
    const isProfessionalOwner = 
      isUserProfessional && 
      conversation.professional_id === user.id;

    if (!isUserAdmin && !isProfessionalOwner) {
      console.error('❌ [POST /api/messaging/conversations/[id]/messages] Accès non autorisé:', {
        isUserAdmin,
        isUserProfessional,
        isProfessionalOwner,
        userId: user.id,
        conversationProfessionalId: conversation.professional_id
      });
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Déterminer le type d'expéditeur
    const senderType = isUserAdmin ? "ADMIN" : "PROFESSIONAL";

    // Créer le message (utiliser adminClient)
    const { data: message, error: messageError } = await adminClient
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
      console.error('❌ [POST /api/messaging/conversations/[id]/messages] Erreur création message:', messageError);
      return NextResponse.json({ 
        error: "Erreur serveur",
        details: messageError?.message || 'Erreur inconnue'
      }, { status: 500 });
    }

    // Mettre à jour lastMessageAt et assigner l'admin si premier message admin
    const updateData: any = {
      last_message_at: new Date().toISOString()
    };

    if (isUserAdmin && !conversation.admin_id) {
      updateData.admin_id = user.id;
    }

    await adminClient
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

