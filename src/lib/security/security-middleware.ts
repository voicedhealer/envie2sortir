import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, searchRateLimit, uploadRateLimit, imagesReadRateLimit } from './rate-limit-extended';
import { sanitizeInput } from './sanitization';

export async function applySecurityMiddleware(
  request: NextRequest,
  endpoint: string
): Promise<NextResponse | null> {
  // Rate limiting selon l'endpoint et la méthode
  let rateLimitResult;
  const method = request.method;
  
  if (endpoint.includes('/search') || endpoint.includes('/recherche')) {
    rateLimitResult = await searchRateLimit(request);
  } else if (endpoint.includes('/upload') || (endpoint.includes('/images') && (method === 'POST' || method === 'PUT' || method === 'DELETE'))) {
    // Rate limiting strict pour les uploads/modifications d'images
    rateLimitResult = await uploadRateLimit(request);
  } else if (endpoint.includes('/images') && method === 'GET') {
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
