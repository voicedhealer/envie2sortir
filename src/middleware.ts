import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { applySecurityMiddleware } from "@/lib/security";
import { validateCSRFMiddleware } from "@/lib/csrf-middleware";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Pour les autres routes, appliquer la sécurité
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      // Vérification CSRF
      const csrfCheck = await validateCSRFMiddleware(req);
      if (csrfCheck) {
        return csrfCheck;
      }

      // Rate limiting et autres protections
      const securityCheck = await applySecurityMiddleware(req, pathname);
      if (securityCheck) {
        return securityCheck;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
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
          '/api/auth',
          '/api/categories',
          '/api/etablissements',
          '/api/recherche',
          '/api/geocode',
          '/api/verify-siret'
        ];

        // Si c'est une page publique, autoriser l'accès
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }

        // Pour les autres pages, vérifier l'authentification
        return !!token;
      }
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*'
  ]
};