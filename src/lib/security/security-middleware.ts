import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, searchRateLimit, uploadRateLimit, imageManagementRateLimit, imagesReadRateLimit } from './rate-limit-extended';
import { sanitizeInput } from './sanitization';

export async function applySecurityMiddleware(
  request: NextRequest,
  endpoint: string
): Promise<NextResponse | null> {
  // Rate limiting selon l'endpoint et la méthode
  let rateLimitResult;
  const method = request.method;
  
  // Exclure les routes admin analytics du rate limiting strict
  // /api/analytics/search est une route admin, pas une recherche utilisateur
  const isAdminAnalyticsRoute = endpoint.includes('/api/analytics/');
  
  if ((endpoint.includes('/search') || endpoint.includes('/recherche')) && !isAdminAnalyticsRoute) {
    // Rate limiting strict uniquement pour les recherches utilisateur
    rateLimitResult = await searchRateLimit(request);
  } else if (endpoint.includes('/upload') || (endpoint.includes('/images') && method === 'POST')) {
    // Rate limiting pour les uploads de nouveaux fichiers uniquement
    rateLimitResult = await uploadRateLimit(request);
  } else if (endpoint.includes('/images') && (method === 'PUT' || method === 'DELETE')) {
    // Rate limiting plus permissif pour la gestion des images (définir principale, supprimer, etc.)
    rateLimitResult = await imageManagementRateLimit(request);
  } else if ((endpoint.includes('/images') || endpoint.includes('/etablissements/images')) && method === 'GET') {
    // Rate limiting très permissif pour la lecture des images
    rateLimitResult = await imagesReadRateLimit(request);
  } else {
    rateLimitResult = await apiRateLimit(request);
  }

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes',
        message: 'Veuillez réessayer dans quelques minutes',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  return null; // Continuer le traitement
}

export function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeInput(body);
  }
  
  if (typeof body === 'object' && body !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return body;
}
