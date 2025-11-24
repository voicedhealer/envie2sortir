import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that users
  // need to sign in again every time they visit a page.

  const {
    data: { user },
    error: getUserError
  } = await supabase.auth.getUser();
  
  console.log('🔧 [Middleware] getUser result:', {
    hasUser: !!user,
    userId: user?.id,
    error: getUserError?.message,
    path: request.nextUrl.pathname
  });

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
  ];

  const { pathname } = request.nextUrl;

  // Si c'est une page publique, autoriser l'accès
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return supabaseResponse;
  }

  // Exception : permettre l'accès à la page de confirmation après paiement Stripe
  // même si la session est temporairement perdue
  const searchParams = request.nextUrl.searchParams;
  const isStripeSuccess = pathname === '/dashboard/subscription' && searchParams.get('success') === 'true';
  
  // Pour les pages protégées, vérifier l'authentification
  if (
    !user &&
    !isStripeSuccess &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/mon-compte'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

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

