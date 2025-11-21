import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Route de déconnexion complète
 * Supprime la session Supabase et tous les cookies associés
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [API signout] Starting sign out...');
    
    const supabase = await createClient();
    
    // Déconnecter l'utilisateur avec scope global
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error('❌ [API signout] Erreur lors de la déconnexion:', error);
    }

    // Supprimer manuellement tous les cookies Supabase
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('🍪 [API signout] Cookies trouvés:', allCookies.map(c => c.name));
    
    // Créer une réponse avec suppression des cookies
    const response = NextResponse.json({ success: true });
    
    // Supprimer tous les cookies qui commencent par 'sb-'
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        console.log('🗑️ [API signout] Suppression cookie:', cookie.name);
        response.cookies.delete(cookie.name);
      }
    });

    console.log('✅ [API signout] Déconnexion réussie');
    
    return response;
  } catch (error: any) {
    console.error('❌ [API signout] Exception:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Support GET pour compatibilité
 */
export async function GET(request: NextRequest) {
  return POST(request);
}

