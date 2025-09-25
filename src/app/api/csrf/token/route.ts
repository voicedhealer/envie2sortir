import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    // Générer un ID de session temporaire basé sur l'IP et l'User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const sessionId = `${ipAddress}-${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;
    
    // Générer le token CSRF
    const csrfToken = generateCSRFToken(sessionId);
    
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/csrf/token', 'GET', 200, responseTime, { ipAddress });

    await requestLogger.info('CSRF token generated', {
      sessionId: sessionId.slice(0, 8) + '...', // Masquer pour la sécurité
      responseTime
    });

    return NextResponse.json({ 
      token: csrfToken,
      expires: Date.now() + 3600000 // 1 heure
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/csrf/token', 'GET', 500, responseTime, { ipAddress });

    await requestLogger.error('CSRF token generation failed', {
      error: error.message,
      ipAddress
    }, error);

    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
