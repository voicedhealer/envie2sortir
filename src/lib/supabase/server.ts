import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Pendant le build, retourner un client mock pour éviter les erreurs
  if (!supabaseUrl || !supabaseAnonKey) {
    // Détecter si on est en mode build (Next.js définit cette variable)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build' ||
                        !process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (isBuildTime) {
      console.warn('⚠️ Supabase environment variables not set during build - using mock client');
      // Retourner un client mock qui ne fonctionnera pas mais évitera les erreurs de build
      try {
        const cookieStore = await cookies();
        return createServerClient(
          'https://placeholder.supabase.co',
          'placeholder-key',
          {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          }
        );
      } catch {
        // Si cookies() échoue aussi (pendant le build), retourner un client mock minimal
        return createServerClient(
          'https://placeholder.supabase.co',
          'placeholder-key',
          {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          }
        );
      }
    }
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

