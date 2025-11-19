import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route callback pour OAuth (Google, Facebook)
 * 
 * Cette route est appelée après une connexion OAuth réussie.
 * Elle échange le code OAuth contre une session Supabase et redirige l'utilisateur.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Gérer les erreurs OAuth
  if (error) {
    console.error('❌ [OAuth Callback] Erreur OAuth:', error, errorDescription);
    const errorUrl = new URL('/auth', request.url);
    errorUrl.searchParams.set('error', 'OAuthError');
    errorUrl.searchParams.set('message', errorDescription || 'Erreur lors de la connexion OAuth');
    return NextResponse.redirect(errorUrl);
  }

  // Si pas de code, rediriger vers la page d'auth
  if (!code) {
    console.warn('⚠️ [OAuth Callback] Pas de code OAuth dans l\'URL');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    const supabase = await createClient();
    
    // Échanger le code contre une session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ [OAuth Callback] Erreur échange code:', exchangeError);
      const errorUrl = new URL('/auth', request.url);
      errorUrl.searchParams.set('error', 'ExchangeError');
      errorUrl.searchParams.set('message', exchangeError.message || 'Erreur lors de l\'échange du code OAuth');
      return NextResponse.redirect(errorUrl);
    }

    if (!data.session || !data.user) {
      console.error('❌ [OAuth Callback] Pas de session ou utilisateur après échange');
      const errorUrl = new URL('/auth', request.url);
      errorUrl.searchParams.set('error', 'NoSession');
      errorUrl.searchParams.set('message', 'Aucune session créée');
      return NextResponse.redirect(errorUrl);
    }

    console.log('✅ [OAuth Callback] Session créée avec succès pour:', data.user.email);

    // Vérifier si l'utilisateur existe dans la table users ou professionals
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .maybeSingle();

    const { data: professionalData, error: profError } = await supabase
      .from('professionals')
      .select('id, email')
      .eq('id', data.user.id)
      .maybeSingle();

    // Si l'utilisateur n'existe pas, créer un compte utilisateur
    if (!userData && !professionalData) {
      console.log('📝 [OAuth Callback] Création d\'un nouvel utilisateur OAuth');
      
      // Récupérer les métadonnées OAuth
      const metadata = data.user.user_metadata || {};
      const firstName = metadata.first_name || metadata.given_name || '';
      const lastName = metadata.last_name || metadata.family_name || '';
      const fullName = metadata.full_name || metadata.name || `${firstName} ${lastName}`.trim() || data.user.email?.split('@')[0] || '';

      // Créer l'utilisateur dans la table users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          first_name: firstName,
          last_name: lastName,
          name: fullName,
          provider: data.user.app_metadata?.provider || 'oauth',
          role: 'user',
          avatar_url: metadata.avatar_url || metadata.picture || null
        });

      if (insertError) {
        console.error('❌ [OAuth Callback] Erreur création utilisateur:', insertError);
        // Ne pas bloquer, l'utilisateur peut se connecter quand même
      } else {
        console.log('✅ [OAuth Callback] Utilisateur créé avec succès');
      }
    } else if (professionalData) {
      // Les professionnels ne peuvent pas se connecter via OAuth
      console.warn('⚠️ [OAuth Callback] Tentative de connexion OAuth pour un professionnel');
      const errorUrl = new URL('/auth', request.url);
      errorUrl.searchParams.set('error', 'ProfessionalOAuthNotAllowed');
      errorUrl.searchParams.set('message', 'Les professionnels ne peuvent pas se connecter via Google ou Facebook');
      return NextResponse.redirect(errorUrl);
    }

    // Déterminer l'URL de redirection selon le rôle
    let redirectUrl = callbackUrl;
    if (userData?.role === 'admin') {
      redirectUrl = '/admin';
    } else if (professionalData) {
      redirectUrl = '/dashboard';
    } else if (callbackUrl === '/') {
      redirectUrl = '/?welcome=true';
    }

    console.log('✅ [OAuth Callback] Redirection vers:', redirectUrl);
    
    // Rediriger vers l'URL de callback
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error('❌ [OAuth Callback] Exception:', error);
    const errorUrl = new URL('/auth', request.url);
    errorUrl.searchParams.set('error', 'CallbackError');
    errorUrl.searchParams.set('message', error.message || 'Erreur lors du traitement du callback OAuth');
    return NextResponse.redirect(errorUrl);
  }
}

