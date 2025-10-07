import { NextRequest, NextResponse } from 'next/server';
import { serverLearningService } from '@/lib/server-learning-service';

export async function POST(request: NextRequest) {
  try {
    const { name, detectedType, googleTypes, keywords, confidence } = await request.json();

    if (!name || !detectedType) {
      return NextResponse.json(
        { error: 'Nom et type détecté requis' },
        { status: 400 }
      );
    }

    // Sauvegarder le pattern d'apprentissage
    await serverLearningService.saveLearningPattern({
      name,
      detectedType,
      googleTypes: googleTypes || [],
      keywords: keywords || [],
      confidence: confidence || 0.8
    });

    return NextResponse.json({
      success: true,
      message: 'Pattern sauvegardé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde pattern:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la sauvegarde du pattern',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}

