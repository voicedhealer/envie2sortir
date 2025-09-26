import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (session.user.userType !== 'user' && session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = session.user.id;

    // Supprimer toutes les données associées à l'utilisateur
    await prisma.$transaction(async (tx) => {
      // Supprimer les favoris
      await tx.userFavorite.deleteMany({
        where: { userId }
      });

      // Supprimer les avis
      await tx.userComment.deleteMany({
        where: { userId }
      });

      // Supprimer les likes
      await tx.userLike.deleteMany({
        where: { userId }
      });

      // Supprimer l'utilisateur
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Compte supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
}
