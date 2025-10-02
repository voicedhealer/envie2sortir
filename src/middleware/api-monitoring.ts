import { NextRequest, NextResponse } from 'next/server';
import { recordAPIMetric } from '@/lib/monitoring';

export function withAPIMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;
    
    let response: NextResponse;
    
    try {
      // Exécuter le handler original
      response = await handler(req);
    } catch (error) {
      // En cas d'erreur, créer une réponse d'erreur
      const responseTime = Date.now() - startTime;
      recordAPIMetric(endpoint, method, 500, responseTime, {
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
      });
      
      console.error('API Error:', error);
      response = NextResponse.json(
        { error: 'Erreur serveur interne' },
        { status: 500 }
      );
    }
    
    // Enregistrer les métriques
    const responseTime = Date.now() - startTime;
    recordAPIMetric(endpoint, method, response.status, responseTime, {
      ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    });
    
    return response;
  };
}

// Middleware pour les routes API spécifiques
export function createAPIMiddleware() {
  return (req: NextRequest) => {
    const url = new URL(req.url);
    
    // Vérifier si c'est une route API
    if (url.pathname.startsWith('/api/')) {
      const startTime = Date.now();
      const endpoint = url.pathname;
      const method = req.method;
      
      // Intercepter la réponse
      const originalNext = NextResponse.next();
      
      // Enregistrer les métriques après la réponse
      setTimeout(() => {
        const responseTime = Date.now() - startTime;
        recordAPIMetric(endpoint, method, 200, responseTime, {
          ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
        });
      }, 0);
      
      return originalNext;
    }
    
    return NextResponse.next();
  };
}
