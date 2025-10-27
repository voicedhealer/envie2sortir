import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// POST - Signaler un avis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const commentId = params.id;
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Veuillez indiquer la raison du signalement (minimum 10 caractères)' 
      }, { status: 400 });
    }

    // Vérifier que le commentaire existe
    const comment = await prisma.userComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Marquer l'avis comme signalé
    const updatedComment = await prisma.userComment.update({
      where: { id: commentId },
      data: {
        isReported: true,
        reportReason: reason.trim(),
        reportedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Avis signalé avec succès. Notre équipe va l\'examiner.',
      comment: updatedComment 
    });

  } catch (error) {
    console.error('❌ Erreur lors du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement' },
      { status: 500 }
    );
  }
}
