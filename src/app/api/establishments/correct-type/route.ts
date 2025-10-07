import { NextRequest, NextResponse } from 'next/server';
import { serverLearningService } from '@/lib/server-learning-service';

export async function POST(request: NextRequest) {
  try {
    const { establishmentName, detectedType, correctedType } = await request.json();

    if (!establishmentName || !detectedType || !correctedType) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Corriger le type dans la base d'apprentissage
    await serverLearningService.correctEstablishmentType(
      establishmentName,
      correctedType,
      'user' // TODO: Récupérer l'ID utilisateur depuis la session
    );

    return NextResponse.json({
      success: true,
      message: 'Type corrigé avec succès',
      correctedType
    });

  } catch (error) {
    console.error('❌ Erreur correction type:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la correction du type',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}
