import { NextRequest, NextResponse } from 'next/server';
import { serverLearningService } from '@/lib/server-learning-service';

export async function POST(request: NextRequest) {
  try {
    const { name, googleTypes, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nom d\'établissement requis' },
        { status: 400 }
      );
    }

    // Obtenir les suggestions basées sur l'apprentissage
    const suggestions = await serverLearningService.suggestEstablishmentType({
      name,
      googleTypes: googleTypes || [],
      description: description || ''
    });

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('❌ Erreur suggestions type:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des suggestions',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}
