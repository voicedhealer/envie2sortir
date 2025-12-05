import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizeInput, sanitizeEmail } from '@/lib/security';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitisation des données d'entrée
    const sanitizedBody = {
      email: sanitizeEmail(body.email),
      password: sanitizeInput(body.password),
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
            // Stocker pour les retourner dans la réponse
            cookiesToReturn.push(...cookiesToSet);
          },
        },
      }
    );

    // Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      let errorMessage = 'Email ou mot de passe incorrect';

      if (authError.message?.includes('Invalid login credentials') ||
          authError.message?.includes('invalid_credentials')) {
        errorMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
      } else if (authError.message?.includes('email') && authError.message?.includes('confirm')) {
        errorMessage = 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.';
      } else {
        errorMessage = authError.message || errorMessage;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la connexion',
        },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un professionnel
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, email, first_name, last_name, subscription_plan')
      .eq('id', authData.user.id)
      .single();

    if (professionalError || !professional) {
      // Déconnecter l'utilisateur s'il n'est pas un professionnel
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: false,
          error: 'Ce compte n\'est pas un compte professionnel. Veuillez utiliser le formulaire d\'inscription.',
        },
        { status: 403 }
      );
    }

    // Vérifier que l'établissement existe et son statut
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name, slug, status')
      .eq('owner_id', professional.id)
      .maybeSingle();

    // Créer la réponse avec les cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Connexion réussie',
        professional: {
          id: professional.id,
          email: professional.email,
          firstName: professional.first_name,
          lastName: professional.last_name,
        },
        establishment: establishment
          ? {
              id: establishment.id,
              name: establishment.name,
              slug: establishment.slug,
              status: establishment.status,
            }
          : null,
      },
      { status: 200 }
    );

    // Ajouter les cookies à la réponse
    cookiesToReturn.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion professionnel:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides. Veuillez vérifier vos informations.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.',
      },
      { status: 500 }
    );
  }
}

