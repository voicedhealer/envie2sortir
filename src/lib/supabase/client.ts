import { createBrowserClient } from '@supabase/ssr';

// Client singleton pour le navigateur avec support des cookies via @supabase/ssr
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si on est côté serveur, retourner null (sera géré par le composant appelant)
  if (typeof window === 'undefined') {
    return null as any;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Si les variables ne sont pas définies, retourner un client mock pour éviter les erreurs
    // Cela permet au site de se charger même si les variables ne sont pas configurées
    console.warn('⚠️ Supabase environment variables not set - using mock client. Some features may not work.');
    
    if (!supabaseInstance) {
      // Créer un client mock qui ne fonctionnera pas mais évitera les erreurs
      supabaseInstance = createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    return supabaseInstance;
  }

  if (!supabaseInstance) {
    // ✅ CORRECTION : Configurer les options de cookies pour localhost
    const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
    supabaseInstance = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookieOptions: {
          // IMPORTANT : Désactiver Secure en dev pour que les cookies soient acceptés sur http://localhost
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
        },
      }
    );
  }
  return supabaseInstance;
}

// Export aussi l'instance pour compatibilité (lazy initialization)
let supabaseExport: ReturnType<typeof createBrowserClient> | null = null;
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    if (!supabaseExport) {
      supabaseExport = createClient();
    }
    return supabaseExport[prop as keyof typeof supabaseExport];
  }
});

