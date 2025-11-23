import { NextRequest } from "next/server";
import { applySecurityMiddleware } from "@/lib/security";
import { validateCSRFMiddleware } from "@/lib/csrf-middleware";
import { updateSession } from "@/lib/supabase/middleware";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const searchParams = req.nextUrl.searchParams;

  // Exception : permettre l'accès à la page de confirmation après paiement Stripe
  // même si la session est temporairement perdue
  if (pathname === '/dashboard/subscription' && searchParams.get('success') === 'true') {
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
  }

  // Mettre à jour la session Supabase (gère l'authentification)
  const supabaseResponse = await updateSession(req);

  // Pour les routes dashboard et admin, appliquer la sécurité supplémentaire
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
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

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*'
  ]
};