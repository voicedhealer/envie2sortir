import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

// GET /api/messaging/conversations/[id] - Détails d'une conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier les droits d'accès d'abord
    const isUserAdmin = await isAdmin();
    const isUserProfessional = user.userType === "professional" || user.role === "professional" || user.role === "pro";
    
    // Utiliser le client admin pour contourner les restrictions RLS sur la table users
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

    // Récupérer la conversation (sans jointure vers users pour les professionnels)
    const selectQuery = isUserAdmin 
      ? `
        *,
        professional:professionals!conversations_professional_id_fkey (
          id,
          first_name,
          last_name,
          email,
          company_name
        ),
        admin:users!conversations_admin_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `
      : `
        *,
        professional:professionals!conversations_professional_id_fkey (
          id,
          first_name,
          last_name,
          email,
          company_name
        )
      `;

    const { data: conversation, error: conversationError } = await adminClient
      .from('conversations')
      .select(selectQuery)
      .eq('id', id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les droits d'accès
    const isProfessionalOwner = 
      isUserProfessional && 
      conversation.professional_id === user.id;

    if (!isUserAdmin && !isProfessionalOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les messages (utiliser adminClient)
    const { data: messages, error: messagesError } = await adminClient
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Erreur récupération messages:', messagesError);
    }

    // Convertir snake_case -> camelCase
    const professional = Array.isArray(conversation.professional) ? conversation.professional[0] : conversation.professional;
    const admin = isUserAdmin && conversation.admin 
      ? (Array.isArray(conversation.admin) ? conversation.admin[0] : conversation.admin)
      : null;

    const formattedConversation = {
      ...conversation,
      professionalId: conversation.professional_id,
      adminId: conversation.admin_id || null,
      lastMessageAt: conversation.last_message_at,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      professional: professional ? {
        id: professional.id,
        firstName: professional.first_name,
        lastName: professional.last_name,
        email: professional.email,
        companyName: professional.company_name
      } : null,
      admin: admin ? {
        id: admin.id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email
      } : null,
      messages: (messages || []).map((msg: any) => ({
        ...msg,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderType: msg.sender_type,
        isRead: msg.is_read,
        createdAt: msg.created_at
      }))
    };

    return NextResponse.json({ conversation: formattedConversation });
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

