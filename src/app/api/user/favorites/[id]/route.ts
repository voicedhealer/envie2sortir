import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const favoriteId = params.id;

    // Vérifier que le favori appartient à l'utilisateur
    const favorite = await prisma.userFavorite.findFirst({
      where: {
        id: favoriteId,
        userId: session.user.id
      }
    });

    if (!favorite) {
      return NextResponse.json({ error: 'Favori introuvable' }, { status: 404 });
    }

    // Supprimer le favori
    await prisma.userFavorite.delete({
      where: { id: favoriteId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Retiré des favoris' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du favori' },
      { status: 500 }
    );
  }
}
