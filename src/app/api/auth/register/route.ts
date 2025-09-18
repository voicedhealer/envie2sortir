import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth-actions';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom de famille doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = registerSchema.parse(body);
    
    // Créer le compte
    const result = await signUp(
      validatedData.firstName,
      validatedData.lastName,
      validatedData.email,
      validatedData.password
    );

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
    console.error('Erreur lors de l\'inscription:', error);
    
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
