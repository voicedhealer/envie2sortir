import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de déconnexion avec Supabase Auth
 * 
 * Déconnecte l'utilisateur en supprimant la session Supabase
 * et redirige vers la page d'accueil ou l'URL de callback.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Déconnecter l'utilisateur
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion', details: error.message },
        { status: 500 }
      );
    }

    // Récupérer l'URL de callback depuis les paramètres ou le body
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    console.log('✅ Déconnexion réussie, redirection vers:', callbackUrl);

    // Rediriger vers l'URL de callback
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  } catch (error: any) {
    console.error('❌ Exception lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Support GET pour compatibilité avec les liens de déconnexion
 */
export async function GET(request: NextRequest) {
  return POST(request);
}

