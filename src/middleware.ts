import { NextRequest, NextResponse } from "next/server";
import { applySecurityMiddleware } from "@/lib/security";
import { validateCSRFMiddleware } from "@/lib/csrf-middleware";
import { updateSession } from "@/lib/supabase/middleware";

// Le middleware Next.js utilise Edge Runtime par défaut
// Ne pas spécifier de runtime pour utiliser Edge Runtime

// Variable pour activer/désactiver le mode "wait" (page d'attente)
// Mettre à false pour désactiver la redirection vers la page d'attente
const WAIT_MODE_ENABLED = process.env.NEXT_PUBLIC_WAIT_MODE === 'true' || process.env.WAIT_MODE === 'true';

export default async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const searchParams = req.nextUrl.searchParams;

    // Mettre à jour la session Supabase (gère l'authentification)
    let supabaseResponse: NextResponse;
    try {
      supabaseResponse = await updateSession(req);
    } catch (error) {
      console.error('❌ Erreur updateSession dans middleware:', error);
      supabaseResponse = NextResponse.next();
    }

    // Vérifier si l'utilisateur est un professionnel (pour limiter l'accès)
    let isProfessional = false;
    let professionalId: string | null = null;
    let establishmentSlug: string | null = null;

    try {
      const { createServerClient } = await import('@supabase/ssr');
      const cookieStore = await import('next/headers').then(m => m.cookies());
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {
              // Ne rien faire ici, géré par updateSession
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Vérifier si c'est un professionnel
        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', user.id)
          .single();

        if (professional) {
          isProfessional = true;
          professionalId = professional.id;

          // Récupérer le slug de l'établissement du professionnel
          const { data: establishment } = await supabase
            .from('establishments')
            .select('slug')
            .eq('owner_id', professional.id)
            .maybeSingle();

          if (establishment) {
            establishmentSlug = establishment.slug;
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification professionnel dans middleware:', error);
      // En cas d'erreur, continuer sans restriction
    }

    // Si le mode "wait" est activé, rediriger toutes les routes vers /wait
    // sauf certaines exceptions
    if (WAIT_MODE_ENABLED) {
      // Routes autorisées même en mode wait
      const allowedPaths = [
        '/wait',                    // La page d'attente elle-même
        '/api/newsletter',          // API newsletter
        '/api/wait',                // API pour la page d'attente
        '/_next',                   // Assets Next.js
        '/favicon',                 // Favicon
        '/robots.txt',              // Robots.txt
        '/sitemap',                 // Sitemap
        '/public',                  // Assets publics
      ];

      // Si c'est un professionnel authentifié, autoriser l'accès au dashboard et à la page de modification
      if (isProfessional) {
        const professionalAllowedPaths = [
          '/dashboard',
          '/api/professional',
          '/api/dashboard',
          '/api/csrf', // API CSRF pour les tokens
          '/api/stripe', // API Stripe pour la gestion des abonnements
        ];

        // Autoriser la page de modification de leur établissement
        if (establishmentSlug && pathname === `/etablissements/${establishmentSlug}/modifier`) {
          // Route autorisée
        } else if (professionalAllowedPaths.some(path => pathname.startsWith(path))) {
          // Route autorisée
        } else if (pathname.startsWith('/_next') || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|eot)$/)) {
          // Assets autorisés
        } else {
          // Rediriger vers le dashboard
          const url = req.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      } else {
        // Pour les non-professionnels, vérifier si la route est autorisée
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path)) ||
                          pathname.startsWith('/_next') ||
                          pathname.startsWith('/api/newsletter') ||
                          pathname.startsWith('/api/wait') ||
                          pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|eot)$/);

        // Si la route n'est pas autorisée, rediriger vers /wait
        if (!isAllowed && pathname !== '/wait') {
          const url = req.nextUrl.clone();
          url.pathname = '/wait';
          return NextResponse.redirect(url);
        }
      }
    } else {
      // Si le mode wait n'est pas activé mais que c'est un professionnel,
      // limiter l'accès au dashboard et à la page de modification de leur établissement
      if (isProfessional) {
        const professionalAllowedPaths = [
          '/dashboard',
          '/api/professional',
          '/api/dashboard',
          '/api/csrf', // API CSRF pour les tokens
          '/api/stripe', // API Stripe pour la gestion des abonnements
          '/wait', // Permettre l'accès à la page wait pour se connecter
          '/api/wait',
        ];

        // Autoriser la page de modification de leur établissement
        const isOwnEstablishmentEdit = establishmentSlug && 
          pathname === `/etablissements/${establishmentSlug}/modifier`;

        if (!isOwnEstablishmentEdit && 
            !professionalAllowedPaths.some(path => pathname.startsWith(path)) &&
            !pathname.startsWith('/_next') &&
            !pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|eot)$/)) {
          // Rediriger vers le dashboard
          const url = req.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    }

    // Exception : permettre l'accès à la page de confirmation après paiement Stripe
    // même si la session est temporairement perdue
    if (pathname === '/dashboard/subscription' && searchParams.get('success') === 'true') {
      try {
        // Mettre à jour la session mais ne pas bloquer si elle est perdue
        const supabaseResponse = await updateSession(req);
        
        // Appliquer la sécurité mais permettre l'accès même sans session valide
        const csrfCheck = await validateCSRFMiddleware(req);
        if (csrfCheck && csrfCheck.status !== 200) {
          return csrfCheck;
        }

        const securityCheck = await applySecurityMiddleware(req, pathname);
        if (securityCheck && securityCheck.status !== 200) {
          return securityCheck;
        }

        // Permettre l'accès à la page de confirmation
        return supabaseResponse;
      } catch (error) {
        console.error('❌ Erreur middleware pour /dashboard/subscription:', error);
        // En cas d'erreur, permettre quand même l'accès
        return NextResponse.next();
      }
    }


    // Pour les routes dashboard et admin, appliquer la sécurité supplémentaire
    // Note: Les routes admin sont exclues du rate limiting dans applySecurityMiddleware
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      try {
        // Vérification CSRF
        const csrfCheck = await validateCSRFMiddleware(req);
        if (csrfCheck) {
          return csrfCheck;
        }

        // Rate limiting et autres protections (les routes admin sont exclues du rate limiting)
        const securityCheck = await applySecurityMiddleware(req, pathname);
        if (securityCheck) {
          return securityCheck;
        }
      } catch (error) {
        console.error('❌ Erreur sécurité middleware:', error);
        // En cas d'erreur de sécurité, continuer quand même
      }
    }
    
    // Pour les routes API admin, appliquer la sécurité mais exclure du rate limiting
    if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/analytics/')) {
      try {
        // Vérification CSRF uniquement (pas de rate limiting pour les routes admin)
        const csrfCheck = await validateCSRFMiddleware(req);
        if (csrfCheck) {
          return csrfCheck;
        }
        // Les routes admin sont déjà exclues du rate limiting dans applySecurityMiddleware
      } catch (error) {
        console.error('❌ Erreur sécurité middleware API admin:', error);
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('❌ Erreur critique dans le middleware:', error);
    // En cas d'erreur critique, permettre l'accès pour éviter un écran blanc
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};