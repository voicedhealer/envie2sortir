import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { applySecurityMiddleware } from '@/lib/security';
import { logger, generateRequestId } from '@/lib/monitoring';
import { validateCSRFMiddleware } from '@/lib/csrf-middleware';

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    
    // Générer un ID de requête pour le tracking
    const requestId = generateRequestId();
    
    // Logging de sécurité pour toutes les requêtes
    await logger.info('Request received', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Protection du dashboard
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth', req.url));
      }

      // Vérifier que l'utilisateur est un professionnel
      if (token.role !== 'pro') {
        return NextResponse.redirect(new URL('/auth?error=AccessDenied', req.url));
      }

      // Note: La vérification de l'établissement se fera côté API
      // Le middleware ne peut pas utiliser Prisma directement
    }

    // Protection des pages admin
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        await logger.warn('Unauthorized admin access attempt', {
          requestId,
          pathname,
          userId: token?.id,
          ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
        });
        return NextResponse.redirect(new URL('/auth?error=AccessDenied', req.url));
      }
    }

    // Protection de sécurité pour les APIs
    if (pathname.startsWith('/api/')) {
      // Validation CSRF
      const csrfCheck = await validateCSRFMiddleware(req);
      if (csrfCheck) {
        await logger.warn('CSRF validation blocked request', {
          requestId,
          pathname,
          reason: 'CSRF token validation failed'
        });
        return csrfCheck;
      }

      // Rate limiting et autres protections
      const securityCheck = await applySecurityMiddleware(req, pathname);
      if (securityCheck) {
        await logger.warn('Security middleware blocked request', {
          requestId,
          pathname,
          reason: 'Rate limit or security violation'
        });
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
