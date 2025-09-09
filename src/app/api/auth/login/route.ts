import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth-actions';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = loginSchema.parse(body);
    
    // Tenter la connexion
    await signIn(validatedData.email, validatedData.password);

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie'
    });

  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    
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
        message: error.message || 'Erreur lors de la connexion' 
      },
      { status: 401 }
    );
  }
}
