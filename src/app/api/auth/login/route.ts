import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    
    // Créer le client Supabase pour cette requête avec gestion explicite des cookies
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    // Stocker les cookies à retourner dans la réponse
    const cookiesToReturn: Array<{ name: string; value: string; options?: any }> = [];
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // NE PAS set dans cookieStore (read-only dans les API routes)
            // Juste stocker pour les retourner dans la réponse
            cookiesToReturn.push(...cookiesToSet);
          },
        },
      }
    );
    
    // Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    });

    if (authError) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/auth/login', 'POST', 401, responseTime, { ipAddress });
      await requestLogger.warn('Failed login attempt', {
        email: validatedData.email,
        error: authError.message,
        ipAddress
      });

      // Messages d'erreur plus spécifiques
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (authError.message?.includes('Invalid login credentials') || 
          authError.message?.includes('invalid_credentials')) {
        errorMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
      } else if (authError.message?.includes('email') && authError.message?.includes('confirm')) {
        errorMessage = 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail ou contactez le support.';
      } else if (authError.message?.includes('Email not confirmed')) {
        errorMessage = 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.';
      } else {
        errorMessage = authError.message || errorMessage;
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          errorCode: authError.status || 'AUTH_ERROR'
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de la connexion' 
        },
        { status: 401 }
      );
    }

    // Récupérer les infos utilisateur depuis la table users ou professionals
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    let user;
    if (userData) {
      user = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        userType: 'user'
      };
    } else {
      // Si pas trouvé dans users, chercher dans professionals
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (professionalData) {
        // Récupérer l'établissement associé
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', professionalData.id)
          .single();

        user = {
          id: professionalData.id,
          email: professionalData.email,
          firstName: professionalData.first_name,
          lastName: professionalData.last_name,
          role: 'pro',
          userType: 'professional',
          establishmentId: establishment?.id || null
        };
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Profil utilisateur non trouvé' 
          },
          { status: 404 }
        );
      }
    }

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/auth/login', 'POST', 200, responseTime, {
      userId: user.id,
      ipAddress
    });

    await requestLogger.info('Successful login', {
      email: validatedData.email,
      userId: user.id,
      responseTime
    });

    // Créer la réponse JSON avec les cookies de session Supabase
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: user
    });

    // Ajouter tous les cookies Supabase à la réponse
    console.log('🍪 [API Login] Setting cookies:', cookiesToReturn.length, 'cookies');
    cookiesToReturn.forEach(({ name, value, options }) => {
      console.log('🍪 [API Login] Setting cookie:', name, 'with options:', options);
      // Utiliser les options par défaut de Supabase SSR, mais s'assurer que httpOnly est correct
      // Les cookies Supabase doivent être httpOnly pour la sécurité, sauf pour les cookies de session access_token
      const cookieOptions = {
        ...options,
        // Garder httpOnly tel que défini par Supabase (généralement true pour la sécurité)
        httpOnly: options?.httpOnly !== false, // Respecter la valeur de Supabase, mais par défaut true
        sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
        secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
        path: options?.path || '/',
        // S'assurer que maxAge est défini si fourni
        ...(options?.maxAge && { maxAge: options.maxAge }),
        ...(options?.expires && { expires: options.expires })
      };
      response.cookies.set(name, value, cookieOptions);
    });

    return response;

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
