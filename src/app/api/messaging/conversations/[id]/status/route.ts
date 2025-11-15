import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/supabase/helpers";

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

    // Utiliser le client admin pour bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [Messaging Status] Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide (open ou closed requis)" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const { data: conversation, error: conversationError } = await supabase
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
    const isProfessionalOwner = 
      user.userType === "professional" && 
      conversation.professional_id === user.id;

    if (!isUserAdmin && !isProfessionalOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', id)
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
      .single();

    if (updateError || !updatedConversation) {
      console.error('Erreur mise à jour statut:', updateError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Compter les messages
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', id);

    // Convertir snake_case -> camelCase
    const professional = Array.isArray(updatedConversation.professional) ? updatedConversation.professional[0] : updatedConversation.professional;
    const admin = Array.isArray(updatedConversation.admin) ? updatedConversation.admin[0] : updatedConversation.admin;

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

