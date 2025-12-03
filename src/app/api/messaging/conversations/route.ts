import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin, requireEstablishment } from "@/lib/supabase/helpers";

// GET /api/messaging/conversations - Lister les conversations
export async function GET(request: NextRequest) {
  try {
    console.log('📬 [GET /api/messaging/conversations] Début récupération conversations');
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ [GET /api/messaging/conversations] Utilisateur non authentifié');
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    console.log('👤 [GET /api/messaging/conversations] Utilisateur:', {
      id: user.id,
      userType: user.userType,
      role: user.role
    });

    // ✅ Utiliser le client normal - RLS vérifie automatiquement les permissions
    // Les politiques RLS pour conversations et messages garantissent que :
    // - Les professionnels voient leurs conversations
    // - Les admins voient toutes les conversations
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20"); // Limiter à 20 conversations
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    console.log('📋 [GET /api/messaging/conversations] Paramètres:', {
      status,
      unreadOnly,
      limit,
      page,
      offset
    });

    let conversations;

    const isUserAdmin = await isAdmin();
    // Vérifier si l'utilisateur est un professionnel (via userType ou en vérifiant dans la table professionals)
    let isUserProfessional = user.userType === 'professional' || user.role === 'professional' || user.role === 'pro';
    
    console.log('🔍 [GET /api/messaging/conversations] Vérifications initiales:', {
      isUserAdmin,
      isUserProfessional,
      userType: user.userType,
      role: user.role
    });
    
    // Si userType n'est pas défini mais que l'utilisateur existe, vérifier dans la table professionals
    if (!isUserProfessional && !isUserAdmin) {
      console.log('🔍 [GET /api/messaging/conversations] Vérification dans table professionals...');
      const { data: professionalCheck, error: professionalCheckError } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (professionalCheckError) {
        console.error('❌ [GET /api/messaging/conversations] Erreur vérification professionals:', professionalCheckError);
      }
      
      if (professionalCheck) {
        console.log('✅ [GET /api/messaging/conversations] Utilisateur confirmé comme professionnel');
        isUserProfessional = true;
      } else {
        console.log('❌ [GET /api/messaging/conversations] Utilisateur non trouvé dans professionals');
      }
    }

    if (isUserAdmin) {
      console.log('👑 [GET /api/messaging/conversations] Mode admin - récupération de toutes les conversations');
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
        .order('last_message_at', { ascending: false })
        .range(offset, offset + limit - 1); // Pagination

      if (status) {
        query = query.eq('status', status);
      }

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('❌ [GET /api/messaging/conversations] Erreur récupération conversations (admin):', conversationsError);
        return NextResponse.json({ 
          error: "Erreur serveur",
          details: conversationsError?.message || 'Erreur inconnue'
        }, { status: 500 });
      }

      console.log(`✅ [GET /api/messaging/conversations] ${conversationsData?.length || 0} conversations récupérées (admin)`);

      // Optimisation: Récupérer tous les IDs de conversations
      const conversationIds = (conversationsData || []).map((conv: any) => conv.id);
      
      // Si aucune conversation, retourner un tableau vide
      if (conversationIds.length === 0) {
        conversations = [];
      } else {
        // Récupérer tous les derniers messages en une seule requête
        const { data: allLastMessages } = await supabase
          .from('messages')
          .select('id, content, created_at, sender_type, is_read, conversation_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });
        
        // Grouper les messages par conversation_id et prendre le premier
        const lastMessagesByConv = new Map<string, any>();
        allLastMessages?.forEach((msg: any) => {
          if (!lastMessagesByConv.has(msg.conversation_id)) {
            lastMessagesByConv.set(msg.conversation_id, msg);
          }
        });
        
        // Récupérer tous les counts de messages non lus en une seule requête
        const { data: allUnreadMessages } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .eq('is_read', false)
          .eq('sender_type', 'PROFESSIONAL');
        
        // Compter les messages non lus par conversation
        const unreadCountsByConv = new Map<string, number>();
        allUnreadMessages?.forEach((msg: any) => {
          const count = unreadCountsByConv.get(msg.conversation_id) || 0;
          unreadCountsByConv.set(msg.conversation_id, count + 1);
        });
        
        // Construire les conversations avec les données récupérées
        conversations = (conversationsData || []).map((conv: any) => {
          const lastMessage = lastMessagesByConv.get(conv.id);
          const unreadCount = unreadCountsByConv.get(conv.id) || 0;

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
        });

        // Filtrer par messages non lus si demandé
        if (unreadOnly) {
          conversations = conversations.filter((conv: any) => conv._count.messages > 0);
        }
      }
    } else if (isUserProfessional) {
      console.log('💼 [GET /api/messaging/conversations] Mode professionnel - récupération conversations pour:', user.id);
      // Pro ne peut voir que ses conversations
      // Utiliser le client admin pour contourner les restrictions RLS sur la table users
      // (même sans jointure explicite, Supabase vérifie la contrainte FK)
      const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ [GET /api/messaging/conversations] Variables d\'environnement Supabase manquantes');
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
      
      // Ne pas inclure la jointure vers users car RLS bloque l'accès pour les professionnels
      let query = adminClient
        .from('conversations')
        .select(`
          *,
          professional:professionals!conversations_professional_id_fkey (
            id,
            first_name,
            last_name,
            email,
            company_name
          )
        `)
        .eq('professional_id', user.id)
        .order('last_message_at', { ascending: false})
        .range(offset, offset + limit - 1); // Pagination

      if (status) {
        query = query.eq('status', status);
      }

      console.log('💼 [GET /api/messaging/conversations] Exécution requête pour professionnel:', user.id);
      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('❌ [GET /api/messaging/conversations] Erreur récupération conversations (pro):', conversationsError);
        console.error('❌ [GET /api/messaging/conversations] Détails erreur:', {
          message: conversationsError?.message,
          code: conversationsError?.code,
          details: conversationsError?.details,
          hint: conversationsError?.hint
        });
        return NextResponse.json({ 
          error: "Erreur serveur",
          details: conversationsError?.message || 'Erreur inconnue'
        }, { status: 500 });
      }

      console.log(`✅ [GET /api/messaging/conversations] ${conversationsData?.length || 0} conversations récupérées (pro)`);

      // Optimisation: Récupérer tous les IDs de conversations
      const conversationIds = (conversationsData || []).map((conv: any) => conv.id);
      
      // Si aucune conversation, retourner un tableau vide
      if (conversationIds.length === 0) {
        conversations = [];
      } else {
        // Récupérer tous les derniers messages en une seule requête
        const { data: allLastMessages } = await supabase
          .from('messages')
          .select('id, content, created_at, sender_type, is_read, conversation_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });
        
        // Grouper les messages par conversation_id et prendre le premier
        const lastMessagesByConv = new Map<string, any>();
        allLastMessages?.forEach((msg: any) => {
          if (!lastMessagesByConv.has(msg.conversation_id)) {
            lastMessagesByConv.set(msg.conversation_id, msg);
          }
        });
        
        // Récupérer tous les counts de messages non lus en une seule requête
        const { data: allUnreadMessages } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .eq('is_read', false)
          .eq('sender_type', 'ADMIN');
        
        // Compter les messages non lus par conversation
        const unreadCountsByConv = new Map<string, number>();
        allUnreadMessages?.forEach((msg: any) => {
          const count = unreadCountsByConv.get(msg.conversation_id) || 0;
          unreadCountsByConv.set(msg.conversation_id, count + 1);
        });
        
        // Construire les conversations avec les données récupérées
        conversations = (conversationsData || []).map((conv: any) => {
          const lastMessage = lastMessagesByConv.get(conv.id);
          const unreadCount = unreadCountsByConv.get(conv.id) || 0;

          const professional = Array.isArray(conv.professional) ? conv.professional[0] : conv.professional;
          // Pas de données admin pour les professionnels (RLS bloque l'accès à la table users)

          return {
            ...conv,
            professionalId: conv.professional_id,
            adminId: conv.admin_id || null,
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
            admin: null, // Les professionnels ne peuvent pas lire les données admin (RLS)
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
        });

        // Filtrer par messages non lus si demandé
        if (unreadOnly) {
          conversations = conversations.filter((conv: any) => conv._count.messages > 0);
        }
      }
    } else if (isUserProfessional) {
      console.log('💼 [GET /api/messaging/conversations] Mode professionnel - récupération conversations pour:', user.id);
      // Pro ne peut voir que ses conversations
      // Utiliser le client admin pour contourner les restrictions RLS sur la table users
      // (même sans jointure explicite, Supabase vérifie la contrainte FK)
      const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ [GET /api/messaging/conversations] Variables d\'environnement Supabase manquantes');
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
      
      // Ne pas inclure la jointure vers users car RLS bloque l'accès pour les professionnels
      let query = adminClient
        .from('conversations')
        .select(`
          *,
          professional:professionals!conversations_professional_id_fkey (
            id,
            first_name,
            last_name,
            email,
            company_name
          )
        `)
        .eq('professional_id', user.id)
        .order('last_message_at', { ascending: false})
        .range(offset, offset + limit - 1); // Pagination

      if (status) {
        query = query.eq('status', status);
      }

      console.log('💼 [GET /api/messaging/conversations] Exécution requête pour professionnel:', user.id);
      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('❌ [GET /api/messaging/conversations] Erreur récupération conversations (pro):', conversationsError);
        console.error('❌ [GET /api/messaging/conversations] Détails erreur:', {
          message: conversationsError?.message,
          code: conversationsError?.code,
          details: conversationsError?.details,
          hint: conversationsError?.hint
        });
        return NextResponse.json({ 
          error: "Erreur serveur",
          details: conversationsError?.message || 'Erreur inconnue'
        }, { status: 500 });
      }

      console.log(`✅ [GET /api/messaging/conversations] ${conversationsData?.length || 0} conversations récupérées (pro)`);

      // Optimisation: Récupérer tous les IDs de conversations
      const conversationIds = (conversationsData || []).map((conv: any) => conv.id);
      
      // Si aucune conversation, retourner un tableau vide
      if (conversationIds.length === 0) {
        conversations = [];
      } else {
        // Récupérer tous les derniers messages en une seule requête (utiliser adminClient)
        const { data: allLastMessages } = await adminClient
          .from('messages')
          .select('id, content, created_at, sender_type, is_read, conversation_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });
        
        // Grouper les messages par conversation_id et prendre le premier
        const lastMessagesByConv = new Map<string, any>();
        allLastMessages?.forEach((msg: any) => {
          if (!lastMessagesByConv.has(msg.conversation_id)) {
            lastMessagesByConv.set(msg.conversation_id, msg);
          }
        });
        
        // Récupérer tous les counts de messages non lus en une seule requête (utiliser adminClient)
        const { data: allUnreadMessages } = await adminClient
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .eq('is_read', false)
          .eq('sender_type', 'ADMIN');
        
        // Compter les messages non lus par conversation
        const unreadCountsByConv = new Map<string, number>();
        allUnreadMessages?.forEach((msg: any) => {
          const count = unreadCountsByConv.get(msg.conversation_id) || 0;
          unreadCountsByConv.set(msg.conversation_id, count + 1);
        });
        
        // Construire les conversations avec les données récupérées
        conversations = (conversationsData || []).map((conv: any) => {
          const lastMessage = lastMessagesByConv.get(conv.id);
          const unreadCount = unreadCountsByConv.get(conv.id) || 0;

          const professional = Array.isArray(conv.professional) ? conv.professional[0] : conv.professional;
          // Pas de données admin pour les professionnels (RLS bloque l'accès à la table users)

          return {
            ...conv,
            professionalId: conv.professional_id,
            adminId: conv.admin_id || null,
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
            admin: null, // Les professionnels ne peuvent pas lire les données admin (RLS)
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
        });

        // Filtrer par messages non lus si demandé
        if (unreadOnly) {
          conversations = conversations.filter((conv: any) => conv._count.messages > 0);
        }
      }
    } else {
      console.error('❌ [GET /api/messaging/conversations] Accès non autorisé - ni admin ni professionnel');
      console.error('❌ [GET /api/messaging/conversations] Détails utilisateur:', {
        id: user.id,
        userType: user.userType,
        role: user.role,
        isUserAdmin,
        isUserProfessional
      });
      return NextResponse.json({ 
        error: "Accès non autorisé",
        userType: user.userType,
        role: user.role
      }, { status: 403 });
    }

    console.log(`✅ [GET /api/messaging/conversations] Retour de ${conversations?.length || 0} conversations`);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("❌ [GET /api/messaging/conversations] Erreur lors de la récupération des conversations:", error);
    console.error("❌ [GET /api/messaging/conversations] Stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// POST /api/messaging/conversations - Créer une conversation
export async function POST(request: NextRequest) {
  try {
    console.log('📨 [POST /api/messaging/conversations] Début création conversation');
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ [POST /api/messaging/conversations] Utilisateur non authentifié');
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    console.log('👤 [POST /api/messaging/conversations] Utilisateur:', {
      id: user.id,
      userType: user.userType,
      role: user.role
    });

    const body = await request.json();
    const { subject, professionalId, initialMessage } = body;

    console.log('📝 [POST /api/messaging/conversations] Données reçues:', {
      subject,
      hasProfessionalId: !!professionalId,
      hasInitialMessage: !!initialMessage
    });

    // ✅ Utiliser le client normal - RLS vérifie automatiquement les permissions
    const supabase = await createClient();

    if (!subject || !initialMessage) {
      return NextResponse.json(
        { error: "Sujet et message initial requis" },
        { status: 400 }
      );
    }

    const isUserAdmin = await isAdmin();
    // Vérifier si l'utilisateur est un professionnel (via userType ou en vérifiant dans la table professionals)
    let isUserProfessional = user.userType === 'professional' || user.role === 'professional' || user.role === 'pro';
    
    // Si userType n'est pas défini mais que l'utilisateur existe, vérifier dans la table professionals
    if (!isUserProfessional && !isUserAdmin) {
      console.log('🔍 [POST /api/messaging/conversations] Vérification dans table professionals...');
      const { data: professionalCheck } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (professionalCheck) {
        console.log('✅ [POST /api/messaging/conversations] Utilisateur confirmé comme professionnel');
        isUserProfessional = true;
      } else {
        console.log('❌ [POST /api/messaging/conversations] Utilisateur non trouvé dans professionals');
      }
    }

    console.log('🔐 [POST /api/messaging/conversations] Vérifications:', {
      isUserAdmin,
      isUserProfessional
    });

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
    } else if (isUserProfessional) {
      // Pro crée une conversation (ticket support)
      console.log('💼 [POST /api/messaging/conversations] Création conversation par professionnel');
      // Utiliser le client admin pour contourner les restrictions RLS sur la table users
      // car la contrainte FK vers users nécessite des permissions même si admin_id est null
      const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ [POST /api/messaging/conversations] Variables d\'environnement Supabase manquantes');
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
      
      const { data: newConversation, error: convError } = await adminClient
        .from('conversations')
        .insert({
          subject,
          professional_id: user.id,
          admin_id: null, // Explicitement null pour éviter les problèmes de FK
          status: 'open',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('❌ [POST /api/messaging/conversations] Erreur création conversation:', convError);
        return NextResponse.json({ 
          error: "Erreur serveur", 
          details: convError?.message || 'Erreur inconnue'
        }, { status: 500 });
      }

      console.log('✅ [POST /api/messaging/conversations] Conversation créée:', newConversation.id);

      // Créer le message initial (utiliser aussi le client admin pour cohérence)
      const { data: message, error: messageError } = await adminClient
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
        console.error('❌ [POST /api/messaging/conversations] Erreur création message:', messageError);
      } else {
        console.log('✅ [POST /api/messaging/conversations] Message initial créé');
      }

      // Récupérer la conversation complète (utiliser le client admin pour éviter les problèmes RLS)
      console.log('📥 [POST /api/messaging/conversations] Récupération conversation complète (sans admin)');
      const { data: fullConversation, error: fullError } = await adminClient
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
          messages:messages!messages_conversation_id_fkey (*)
        `)
        .eq('id', newConversation.id)
        .single();

      if (fullError || !fullConversation) {
        console.error('❌ [POST /api/messaging/conversations] Erreur récupération conversation:', fullError);
        return NextResponse.json({ 
          error: "Erreur serveur",
          details: fullError?.message || 'Erreur inconnue'
        }, { status: 500 });
      }

      // Récupérer les données du professionnel depuis la réponse
      const professional = Array.isArray(fullConversation.professional) ? fullConversation.professional[0] : fullConversation.professional;

      // Construire la conversation sans données admin (car admin_id est null pour une conversation créée par un pro)
      conversation = {
        ...fullConversation,
        professionalId: fullConversation.professional_id,
        adminId: null, // Pas d'admin assigné lors de la création par un pro
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
        admin: null, // Pas d'admin pour une conversation créée par un professionnel
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
      console.error('❌ [POST /api/messaging/conversations] Accès non autorisé - ni admin ni professionnel');
      return NextResponse.json({ 
        error: "Accès non autorisé",
        userType: user.userType,
        role: user.role
      }, { status: 403 });
    }

    console.log('✅ [POST /api/messaging/conversations] Conversation créée avec succès');
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/messaging/conversations] Erreur lors de la création de la conversation:", error);
    console.error("❌ [POST /api/messaging/conversations] Stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

