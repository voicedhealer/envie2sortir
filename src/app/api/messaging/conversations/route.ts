import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin, requireEstablishment } from "@/lib/supabase/helpers";

// GET /api/messaging/conversations - Lister les conversations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let conversations;

    const isUserAdmin = await isAdmin();
    const isUserProfessional = user.userType === 'professional';

    if (isUserAdmin) {
      // Admin peut voir toutes les conversations
      let query = supabase
        .from('conversations')
        .select(`
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
        `)
        .order('last_message_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('Erreur récupération conversations:', conversationsError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Récupérer le dernier message et le count pour chaque conversation
      conversations = await Promise.all((conversationsData || []).map(async (conv: any) => {
        const [lastMessageResult, unreadCountResult] = await Promise.all([
          supabase
            .from('messages')
            .select('id, content, created_at, sender_type, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .eq('sender_type', 'PROFESSIONAL')
        ]);

        const lastMessage = lastMessageResult.data;
        const unreadCount = unreadCountResult.count || 0;

        const professional = Array.isArray(conv.professional) ? conv.professional[0] : conv.professional;
        const admin = Array.isArray(conv.admin) ? conv.admin[0] : conv.admin;

        return {
          ...conv,
          professionalId: conv.professional_id,
          adminId: conv.admin_id,
          lastMessageAt: conv.last_message_at,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
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
          messages: lastMessage ? [{
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.created_at,
            senderType: lastMessage.sender_type,
            isRead: lastMessage.is_read
          }] : [],
          _count: {
            messages: unreadCount
          }
        };
      }));

      // Filtrer par messages non lus si demandé
      if (unreadOnly) {
        conversations = conversations.filter((conv: any) => conv._count.messages > 0);
      }
    } else if (isUserProfessional) {
      // Pro ne peut voir que ses conversations
      let query = supabase
        .from('conversations')
        .select(`
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
        `)
        .eq('professional_id', user.id)
        .order('last_message_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('Erreur récupération conversations:', conversationsError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Récupérer le dernier message et le count pour chaque conversation
      conversations = await Promise.all((conversationsData || []).map(async (conv: any) => {
        const [lastMessageResult, unreadCountResult] = await Promise.all([
          supabase
            .from('messages')
            .select('id, content, created_at, sender_type, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .eq('sender_type', 'ADMIN')
        ]);

        const lastMessage = lastMessageResult.data;
        const unreadCount = unreadCountResult.count || 0;

        const professional = Array.isArray(conv.professional) ? conv.professional[0] : conv.professional;
        const admin = Array.isArray(conv.admin) ? conv.admin[0] : conv.admin;

        return {
          ...conv,
          professionalId: conv.professional_id,
          adminId: conv.admin_id,
          lastMessageAt: conv.last_message_at,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
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
          messages: lastMessage ? [{
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.created_at,
            senderType: lastMessage.sender_type,
            isRead: lastMessage.is_read
          }] : [],
          _count: {
            messages: unreadCount
          }
        };
      }));

      // Filtrer par messages non lus si demandé
      if (unreadOnly) {
        conversations = conversations.filter((conv: any) => conv._count.messages > 0);
      }
    } else {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/messaging/conversations - Créer une conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();
    const { subject, professionalId, initialMessage } = body;

    if (!subject || !initialMessage) {
      return NextResponse.json(
        { error: "Sujet et message initial requis" },
        { status: 400 }
      );
    }

    const isUserAdmin = await isAdmin();
    let conversation;

    if (isUserAdmin) {
      // Admin crée une conversation avec un pro
      if (!professionalId) {
        return NextResponse.json(
          { error: "ID du professionnel requis" },
          { status: 400 }
        );
      }

      // Créer la conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          subject,
          professional_id: professionalId,
          admin_id: user.id,
          status: 'open',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('Erreur création conversation:', convError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Créer le message initial
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          sender_type: 'ADMIN',
          content: initialMessage,
          is_read: false
        })
        .select()
        .single();

      if (messageError) {
        console.error('Erreur création message:', messageError);
      }

      // Récupérer la conversation complète
      const { data: fullConversation, error: fullError } = await supabase
        .from('conversations')
        .select(`
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
          ),
          messages:messages!messages_conversation_id_fkey (*)
        `)
        .eq('id', newConversation.id)
        .single();

      if (fullError || !fullConversation) {
        console.error('Erreur récupération conversation:', fullError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Convertir snake_case -> camelCase
      const professional = Array.isArray(fullConversation.professional) ? fullConversation.professional[0] : fullConversation.professional;
      const admin = Array.isArray(fullConversation.admin) ? fullConversation.admin[0] : fullConversation.admin;

      conversation = {
        ...fullConversation,
        professionalId: fullConversation.professional_id,
        adminId: fullConversation.admin_id,
        lastMessageAt: fullConversation.last_message_at,
        createdAt: fullConversation.created_at,
        updatedAt: fullConversation.updated_at,
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
        messages: (fullConversation.messages || []).map((msg: any) => ({
          ...msg,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          isRead: msg.is_read,
          createdAt: msg.created_at
        }))
      };
    } else if (user.userType === "professional") {
      // Pro crée une conversation (ticket support)
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          subject,
          professional_id: user.id,
          status: 'open',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('Erreur création conversation:', convError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Créer le message initial
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          sender_type: 'PROFESSIONAL',
          content: initialMessage,
          is_read: false
        })
        .select()
        .single();

      if (messageError) {
        console.error('Erreur création message:', messageError);
      }

      // Récupérer la conversation complète
      const { data: fullConversation, error: fullError } = await supabase
        .from('conversations')
        .select(`
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
          ),
          messages:messages!messages_conversation_id_fkey (*)
        `)
        .eq('id', newConversation.id)
        .single();

      if (fullError || !fullConversation) {
        console.error('Erreur récupération conversation:', fullError);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      // Convertir snake_case -> camelCase
      const professional = Array.isArray(fullConversation.professional) ? fullConversation.professional[0] : fullConversation.professional;
      const admin = Array.isArray(fullConversation.admin) ? fullConversation.admin[0] : fullConversation.admin;

      conversation = {
        ...fullConversation,
        professionalId: fullConversation.professional_id,
        adminId: fullConversation.admin_id,
        lastMessageAt: fullConversation.last_message_at,
        createdAt: fullConversation.created_at,
        updatedAt: fullConversation.updated_at,
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
        messages: (fullConversation.messages || []).map((msg: any) => ({
          ...msg,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          isRead: msg.is_read,
          createdAt: msg.created_at
        }))
      };
    } else {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

