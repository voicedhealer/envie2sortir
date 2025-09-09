import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protection du dashboard
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      // Vérifier que l'utilisateur est un professionnel
      if (token.role !== 'pro') {
        return NextResponse.redirect(new URL('/auth/login?error=AccessDenied', req.url));
      }

      // Vérifier qu'il a un établissement
      if (!token.establishmentId) {
        return NextResponse.redirect(new URL('/auth/login?error=NoEstablishment', req.url));
      }

      // Protection des fonctionnalités Premium
      if (pathname.includes('/events') && token.subscription !== 'PREMIUM') {
        return NextResponse.redirect(new URL('/dashboard?error=PremiumRequired', req.url));
      }
    }

    // Protection des pages admin
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/login?error=AccessDenied', req.url));
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
          '/auth/login',
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
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/etablissements/:path*/modifier',
    '/api/professional/:path*',
    '/api/dashboard/events/:path*',
    '/api/etablissements/:path*'
  ]
};