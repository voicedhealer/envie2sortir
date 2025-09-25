import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth-actions';
import { z } from 'zod';
import { sanitizeInput, sanitizeEmail } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    const body = await request.json();
    
    // Sanitisation des données d'entrée
    const sanitizedBody = {
      email: sanitizeEmail(body.email),
      password: sanitizeInput(body.password)
    };
    
    // Validation des données
    const validatedData = loginSchema.parse(sanitizedBody);
    
    // Tenter la connexion
    await signIn(validatedData.email, validatedData.password);

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/auth/login', 'POST', 200, responseTime, {
      userId: 'authenticated',
      ipAddress
    });

    await requestLogger.info('Successful login', {
      email: validatedData.email,
      responseTime
    });

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie'
    });

  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    
    // Logging des erreurs de sécurité
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Invalid credentials') || errorMessage.includes('User not found')) {
      recordAPIMetric('/api/auth/login', 'POST', 401, responseTime, { ipAddress });
      await requestLogger.warn('Failed login attempt', {
        email: body?.email,
        error: errorMessage,
        ipAddress
      });
    } else {
      recordAPIMetric('/api/auth/login', 'POST', 500, responseTime, { ipAddress });
      await requestLogger.error('Login error', {
        error: errorMessage,
        ipAddress
      }, error instanceof Error ? error : undefined);
    }
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Données invalides',
          errors: (error as any).errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage || 'Erreur lors de la connexion' 
      },
      { status: 401 }
    );
  }
}
