import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function validateCSRFMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Vérifier si la requête nécessite une validation CSRF
  if (!shouldValidateCSRF(request)) {
    return null;
  }

  try {
    const method = request.method;
    let csrfToken: string | null = null;

    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      // Récupérer le token depuis le body ou les headers
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const body = await request.clone().json();
        csrfToken = body.csrfToken;
      } else if (contentType?.includes('multipart/form-data')) {
        const formData = await request.clone().formData();
        csrfToken = formData.get('csrfToken') as string;
      } else {
        csrfToken = request.headers.get('x-csrf-token');
      }
    }

    if (!csrfToken) {
      await logger.warn('CSRF token missing', {
        method: request.method,
        url: request.url,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json(
        { error: 'CSRF token manquant' },
        { status: 403 }
      );
    }

    // Générer l'ID de session pour la validation
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const sessionId = `${ipAddress}-${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;

    // Valider le token
    const isValid = validateCSRFToken(sessionId, csrfToken);
    
    if (!isValid) {
      await logger.warn('CSRF token validation failed', {
        method: request.method,
        url: request.url,
        ip: ipAddress,
        token: csrfToken.slice(0, 8) + '...' // Masquer pour la sécurité
      });

      return NextResponse.json(
        { error: 'Token CSRF invalide ou expiré' },
        { status: 403 }
      );
    }

    return null; // Token valide, continuer

  } catch (error) {
    await logger.error('CSRF validation error', {
      method: request.method,
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined);

    return NextResponse.json(
      { error: 'Erreur de validation CSRF' },
      { status: 500 }
    );
  }
}

function shouldValidateCSRF(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Ne pas valider les requêtes GET et HEAD
  if (method === 'GET' || method === 'HEAD') {
    return false;
  }

  // Ne pas valider les endpoints publics
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/csrf/token',
    '/api/categories',
    '/api/etablissements/random',
    '/api/recherche',
    '/api/user/favorites' // APIs des favoris - authentifiées via session
  ];

  if (publicEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    return false;
  }

  // Ne pas valider les endpoints de monitoring
  if (pathname.startsWith('/api/monitoring/')) {
    return false;
  }

  // Valider tous les autres endpoints qui modifient des données
  return true;
}
