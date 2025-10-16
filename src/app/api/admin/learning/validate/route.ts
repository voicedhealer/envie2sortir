import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patternId, patternName, validatedType, validatedBy } = await request.json();

    if (!patternId || !patternName || !validatedType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Valider le pattern (marquer comme corrigé avec le type détecté)
    await prisma.establishmentLearningPattern.update({
      where: { id: patternId },
      data: {
        correctedType: validatedType,
        isCorrected: true,
        correctedBy: validatedBy || session.user.email || 'admin',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Pattern validé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur validation pattern:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erreur inconnue') : undefined
    }, { status: 500 });
  }
}
