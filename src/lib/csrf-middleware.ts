import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/security';

export async function validateCSRFMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  // Désactiver la validation CSRF en développement
  const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
  if (isDevelopment) {
    console.log('🔓 CSRF désactivé en développement');
    return undefined;
  }

  // Vérifier si la requête nécessite une validation CSRF
  if (!shouldValidateCSRF(request)) {
    return undefined;
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
      console.warn('CSRF token missing:', {
        method: request.method,
        url: request.url,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json(
        { error: 'CSRF token manquant' },
        { status: 403 }
      );
    }

    // Utiliser une approche plus simple pour le sessionId
    // En développement, utiliser une clé fixe pour éviter les problèmes d'IP
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    const sessionId = isDevelopment ? 'dev-session' : 
      `${request.ip || request.headers.get('x-forwarded-for') || 'unknown'}-${btoa(request.headers.get('user-agent') || '').slice(0, 16)}`;
    
    // Debug logs
    console.log('🔍 CSRF Debug:', {
      isDevelopment,
      sessionId: sessionId.slice(0, 20) + '...',
      token: csrfToken.slice(0, 8) + '...'
    });

    // Valider le token
    const isValid = validateCSRFToken(sessionId, csrfToken);
    
    if (!isValid) {
      console.warn('CSRF token validation failed:', {
        method: request.method,
        url: request.url,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        token: csrfToken.slice(0, 8) + '...' // Masquer pour la sécurité
      });

      return NextResponse.json(
        { error: 'Token CSRF invalide ou expiré' },
        { status: 403 }
      );
    }

    return undefined; // Token valide, continuer

  } catch (error) {
    console.error('CSRF validation error:', {
      method: request.method,
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

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
    '/api/user/favorites', // APIs des favoris - authentifiées via session
    '/api/etablissements/images' // API des images - protégée par session
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
