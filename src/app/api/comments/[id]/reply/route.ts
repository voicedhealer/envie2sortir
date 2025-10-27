import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// POST - Répondre à un avis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'professional') {
      return NextResponse.json({ error: 'Accès refusé - Professionnel requis' }, { status: 403 });
    }

    const commentId = params.id;
    const { reply } = await request.json();

    if (!reply || reply.trim().length < 5) {
      return NextResponse.json({ 
        error: 'La réponse doit contenir au moins 5 caractères' 
      }, { status: 400 });
    }

    if (reply.length > 500) {
      return NextResponse.json({ 
        error: 'La réponse ne peut pas dépasser 500 caractères' 
      }, { status: 400 });
    }

    // Vérifier que le commentaire existe et appartient à un établissement du professionnel
    const comment = await prisma.userComment.findUnique({
      where: { id: commentId },
      include: {
        establishment: {
          select: {
            id: true,
            ownerId: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Vérifier que le professionnel est le propriétaire de l'établissement
    if (comment.establishment.ownerId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Vous n\'êtes pas autorisé à répondre à cet avis' 
      }, { status: 403 });
    }

    // Mettre à jour le commentaire avec la réponse
    const updatedComment = await prisma.userComment.update({
      where: { id: commentId },
      data: {
        establishmentReply: reply.trim(),
        repliedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      comment: updatedComment 
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la réponse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la réponse' },
      { status: 500 }
    );
  }
}
