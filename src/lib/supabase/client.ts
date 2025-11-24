import { createBrowserClient } from '@supabase/ssr';

// Client singleton pour le navigateur avec support des cookies via @supabase/ssr
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // En mode build, retourner un client mock pour éviter les erreurs
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('⚠️ Supabase environment variables not set during build');
      // Retourner un client mock qui ne fonctionnera pas mais évitera les erreurs de build
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
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

