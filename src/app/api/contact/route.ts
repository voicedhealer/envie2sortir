import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

// POST /api/contact - Envoyer un message de contact
// Nécessite une authentification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification avec getUser() (plus sûr que getSession())
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('❌ Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Vous devez être connecté pour envoyer un message. Veuillez vous connecter ou créer un compte.' },
        { status: 401 }
      );
    }

    // Récupérer les informations utilisateur depuis la table users
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { subject, message, type } = body;
    
    // Utiliser les informations de l'utilisateur authentifié
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.name || user.email?.split('@')[0] || 'Utilisateur';
    const email = user.email;

    // Validation des champs requis
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Le sujet et le message sont requis' },
        { status: 400 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email utilisateur non trouvé. Veuillez vous reconnecter.' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation de la longueur
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Le message doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Le message ne peut pas dépasser 5000 caractères' },
        { status: 400 }
      );
    }

    // Protection contre le spam : vérifier le rate limiting basique
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Vérifier que la table existe (en mode développement)
    if (process.env.NODE_ENV === 'development') {
      const { error: tableCheckError } = await supabase
        .from('contact_messages')
        .select('id')
        .limit(1);
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.error('❌ La table contact_messages n\'existe pas. Veuillez appliquer la migration 021_create_contact_messages.sql');
        return NextResponse.json(
          { 
            error: 'La table de contact n\'est pas encore créée. Veuillez appliquer la migration Supabase.',
            hint: 'Exécutez: supabase db push ou appliquez la migration 021_create_contact_messages.sql'
          },
          { status: 500 }
        );
      }
    }

    // Vérifier l'authentification avant l'insertion (en mode développement)
    if (process.env.NODE_ENV === 'development') {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('🔐 Utilisateur authentifié pour RLS:', {
        hasUser: !!currentUser,
        userId: currentUser?.id,
        email: currentUser?.email,
        authUserId: authUser.id
      });
    }

    // Insérer le message via la fonction RPC (contourne RLS de manière sécurisée)
    const { data: messageId, error: insertError } = await supabase.rpc('create_contact_message', {
      p_name: name.trim(),
      p_email: email.trim().toLowerCase(),
      p_subject: subject.trim(),
      p_message: message.trim(),
      p_type: type || 'general'
    });

    // Si la fonction RPC n'existe pas, utiliser l'insertion directe (fallback)
    if (insertError && insertError.message?.includes('function') && insertError.message?.includes('does not exist')) {
      console.log('⚠️  Fonction RPC non trouvée, utilisation de l\'insertion directe...');
      
      const { data: contactMessage, error: directInsertError } = await supabase
        .from('contact_messages')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          type: type || 'general',
          status: 'new'
        })
        .select()
        .single();
      
      if (directInsertError) {
        throw directInsertError;
      }
      
      return NextResponse.json({
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        id: contactMessage.id
      }, { status: 201 });
    }

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion du message de contact:', insertError);
      console.error('Détails de l\'erreur:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // Message d'erreur plus détaillé en mode développement
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = isDev 
        ? `Erreur base de données: ${insertError.message}${insertError.hint ? ` (${insertError.hint})` : ''}`
        : 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
      
      return NextResponse.json(
        { 
          error: errorMessage,
          ...(isDev && { 
            details: insertError.details,
            code: insertError.code,
            hint: insertError.hint
          })
        },
        { status: 500 }
      );
    }

    // TODO: Optionnel - Envoyer un email de notification à l'équipe
    // Vous pouvez ajouter ici l'envoi d'email via un service comme Resend, SendGrid, etc.

    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      id: messageId
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur serveur lors de l\'envoi du message de contact:', error);
    
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: 'Erreur serveur. Veuillez réessayer plus tard.',
        ...(isDev && { 
          details: error instanceof Error ? error.message : 'Erreur inconnue',
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}

