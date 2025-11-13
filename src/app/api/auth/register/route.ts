import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/supabase/auth-actions';
import { z } from 'zod';
import { sanitizeInput, sanitizeEmail } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom de famille doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation')
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
      firstName: sanitizeInput(body.firstName),
      lastName: sanitizeInput(body.lastName),
      email: sanitizeEmail(body.email),
      password: sanitizeInput(body.password),
      acceptTerms: body.acceptTerms
    };
    
    // Validation des données
    const validatedData = registerSchema.parse(sanitizedBody);
    
    // Créer le compte
    const result = await signUp(
      validatedData.firstName,
      validatedData.lastName,
      validatedData.email,
      validatedData.password
    );

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/auth/register', 'POST', 200, responseTime, {
      userId: result.user.id,
      ipAddress
    });

    await requestLogger.info('Successful registration', {
      email: validatedData.email,
      userId: result.user.id,
      responseTime
    });

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName
      }
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Logging des erreurs de sécurité
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      recordAPIMetric('/api/auth/register', 'POST', 409, responseTime, { ipAddress });
      await requestLogger.warn('Duplicate registration attempt', {
        email: body?.email,
        error: error.message,
        ipAddress
      });
    } else {
      recordAPIMetric('/api/auth/register', 'POST', 400, responseTime, { ipAddress });
      await requestLogger.error('Registration error', {
        error: error.message,
        ipAddress
      }, error);
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Données invalides',
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Erreur lors de la création du compte' 
      },
      { status: 400 }
    );
  }
}
