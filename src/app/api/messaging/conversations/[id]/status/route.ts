import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/messaging/conversations/[id]/status - Changer le statut
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

    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide (open ou closed requis)" },
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
      .select('id, professional_id')
      .eq('id', id)
      .single();

    if (conversationError || !conversation) {
      console.error('❌ [PATCH /api/messaging/conversations/[id]/status] Erreur récupération conversation:', conversationError);
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
      console.error('❌ [PATCH /api/messaging/conversations/[id]/status] Accès non autorisé:', {
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

    // Mettre à jour le statut (utiliser adminClient)
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

    const { data: updatedConversation, error: updateError } = await adminClient
      .from('conversations')
      .update({ status })
      .eq('id', id)
      .select(selectQuery)
      .single();

    if (updateError || !updatedConversation) {
      console.error('❌ [PATCH /api/messaging/conversations/[id]/status] Erreur mise à jour statut:', updateError);
      return NextResponse.json({ 
        error: "Erreur serveur",
        details: updateError?.message || 'Erreur inconnue'
      }, { status: 500 });
    }

    // Compter les messages (utiliser adminClient)
    const { count: messagesCount } = await adminClient
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', id);

    // Convertir snake_case -> camelCase
    const professional = Array.isArray(updatedConversation.professional) ? updatedConversation.professional[0] : updatedConversation.professional;
    const admin = isUserAdmin && updatedConversation.admin 
      ? (Array.isArray(updatedConversation.admin) ? updatedConversation.admin[0] : updatedConversation.admin)
      : null;

    const formattedConversation = {
      ...updatedConversation,
      professionalId: updatedConversation.professional_id,
      adminId: updatedConversation.admin_id,
      lastMessageAt: updatedConversation.last_message_at,
      createdAt: updatedConversation.created_at,
      updatedAt: updatedConversation.updated_at,
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
      _count: {
        messages: messagesCount || 0
      }
    };

    return NextResponse.json({ conversation: formattedConversation });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

