import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole } from '@/lib/supabase/helpers';

export async function updateSession(request: NextRequest) {
  // ✅ CORRECTION : Créer la réponse initiale avec les headers de la requête
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set in middleware');
    return supabaseResponse;
  }

  // ✅ CORRECTION : Utiliser get/set/remove au lieu de getAll/setAll pour une meilleure propagation
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // ✅ CORRECTION : Force secure: false en développement
          const isProduction = process.env.NODE_ENV === 'production';
          const cookieOptions = { 
            ...options, 
            secure: isProduction, 
            sameSite: 'lax' as const,
            path: options?.path || '/',
            // ✅ CRITIQUE : httpOnly doit être false pour que le client JavaScript puisse lire les cookies Supabase
            httpOnly: false,
          };

          request.cookies.set({ name, value, ...cookieOptions });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({ name, value, ...cookieOptions });
        },
        remove(name: string, options: CookieOptions) {
          // ✅ CORRECTION : Force secure: false en développement
          const isProduction = process.env.NODE_ENV === 'production';
          const cookieOptions = { 
            ...options, 
            secure: isProduction, 
            sameSite: 'lax' as const,
            path: options?.path || '/',
            // ✅ CRITIQUE : httpOnly doit être false pour que le client JavaScript puisse lire les cookies Supabase
            httpOnly: false,
          };

          request.cookies.set({ name, value: '', ...cookieOptions });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({ name, value: '', ...cookieOptions });
        },
      },
    }
  );

  // ✅ CORRECTION : Logs de debug pour les cookies
  console.log('🍪 [Middleware] Cookies entrants:', request.cookies.getAll().map(c => c.name).filter(n => n.startsWith('sb-')));

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that users
  // need to sign in again every time they visit a page.

  // ✅ CORRECTION : Forcer le refresh de la session pour la propager dans les cookies
  await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPaths = [
    '/',
    '/recherche',
    '/recherche/envie',
    '/carte',
    '/etablissements',
    '/etablissements/nouveau',
    '/auth',
    '/auth/error',
    '/wait',
    '/robots.txt',
    '/sitemap',
    '/api/newsletter',
    '/api/wait',
  ];

  // Pour les pages publiques, pas besoin de vérifier l'utilisateur - évite les logs inutiles
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|eot)$/)) {
    return supabaseResponse;
  }

  // ✅ CORRECTION : Appeler getUser() pour forcer la mise à jour de la session
  // Cela garantit que les cookies sont bien synchronisés
  const {
    data: { user },
    error: getUserError
  } = await supabase.auth.getUser();
  
  // ✅ CORRECTION : Utiliser la fonction unifiée getUserRole qui priorise app_metadata.role
  const userRole = getUserRole(user);
  const isAdmin = userRole === 'admin';
  
  // Ne logger que pour les pages protégées quand l'utilisateur n'est pas connecté
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/mon-compte'))) {
    console.log('🔐 [Middleware] Auth required:', {
      path: pathname,
      error: getUserError?.message,
      cookiesCount: request.cookies.getAll().length,
      supabaseCookies: request.cookies.getAll().filter(c => c.name.startsWith('sb-')).length
    });
  }

  // Exception : permettre l'accès à la page de confirmation après paiement Stripe
  // même si la session est temporairement perdue
  const searchParams = request.nextUrl.searchParams;
  const isStripeSuccess = pathname === '/dashboard/subscription' && searchParams.get('success') === 'true';
  
  // ✅ CORRECTION : Vérifier d'abord si on a des cookies Supabase même si getUser() a échoué
  // Cela permet de gérer les cas où la session est en cours de synchronisation
  const hasSupabaseCookies = request.cookies.getAll().some(c => c.name.startsWith('sb-'));
  
  // ✅ CORRECTION : Pour les pages protégées, vérifier l'authentification
  // Mais éviter les boucles de redirection si on vient déjà de /auth ou si on a des cookies
  const isFromAuth = request.headers.get('referer')?.includes('/auth') || 
                     request.nextUrl.searchParams.get('from') === 'auth';
  
  // ✅ CORRECTION : Si on a des cookies Supabase mais pas de user, attendre un peu
  // (la session pourrait être en cours de synchronisation)
  const shouldWaitForSession = hasSupabaseCookies && !user && pathname.startsWith('/admin');
  
  if (
    !user &&
    !isStripeSuccess &&
    !isFromAuth && // ✅ Éviter les boucles si on vient de /auth
    !shouldWaitForSession && // ✅ Ne pas rediriger si on a des cookies (session en cours)
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/mon-compte'))
  ) {
    console.log('🔐 [Middleware] Redirection vers /auth:', {
      path: pathname,
      hasUser: !!user,
      hasSupabaseCookies,
      isFromAuth,
      cookiesCount: request.cookies.getAll().length,
      supabaseCookies: request.cookies.getAll().filter(c => c.name.startsWith('sb-')).length
    });
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    // Ajouter un paramètre pour éviter les boucles
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // ✅ CORRECTION : Si on a un utilisateur admin mais qu'on est sur /auth, rediriger vers /admin
  if (user && isAdmin && pathname === '/auth') {
    console.log('👑 [Middleware] Admin détecté sur /auth, redirection vers /admin');
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  
  // ✅ CORRECTION : Si on a des cookies Supabase sur /auth mais pas encore de user détecté,
  // laisser passer (la session se synchronisera au prochain refresh)
  if (hasSupabaseCookies && pathname === '/auth' && !user) {
    console.log('⏳ [Middleware] Cookies Supabase détectés sur /auth, session en cours de synchronisation');
  }

  // ✅ CORRECTION : Logs de debug pour les cookies sortants
  console.log('🍪 [Middleware] Cookies sortants:', supabaseResponse.cookies.getAll().map(c => c.name).filter(n => n.startsWith('sb-')));

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

