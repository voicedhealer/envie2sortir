import { NextRequest } from "next/server";
import { applySecurityMiddleware } from "@/lib/security";
import { validateCSRFMiddleware } from "@/lib/csrf-middleware";
import { updateSession } from "@/lib/supabase/middleware";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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