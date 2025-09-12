import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    
    // Récupérer l'image avec l'établissement associé
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        establishment: {
          select: {
            id: true,
            ownerId: true
          }
        }
      }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    if (image.establishment.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), 'public', image.url);
      await unlink(filePath);
      console.log('🗑️ Fichier supprimé:', filePath);
    } catch (fileError) {
      console.warn('⚠️ Impossible de supprimer le fichier physique:', fileError);
      // Continuer même si le fichier physique n'existe pas
    }

    // Supprimer l'image de la base de données
    await prisma.image.delete({
      where: { id }
    });

    // Vérifier s'il reste des images pour cet établissement
    const remainingImages = await prisma.image.findMany({
      where: { establishmentId: image.establishment.id },
      orderBy: { createdAt: 'desc' }
    });

    // Mettre à jour l'imageUrl de l'établissement
    if (remainingImages.length > 0) {
      // Utiliser la première image restante
      await prisma.establishment.update({
        where: { id: image.establishment.id },
        data: { imageUrl: remainingImages[0].url }
      });
      console.log('✅ ImageUrl de l\'établissement mise à jour avec:', remainingImages[0].url);
    } else {
      // Aucune image restante, vider l'imageUrl
      await prisma.establishment.update({
        where: { id: image.establishment.id },
        data: { imageUrl: null }
      });
      console.log('✅ ImageUrl de l\'établissement vidée (aucune image restante)');
    }

    console.log('✅ Image supprimée de la base de données:', id);

    return NextResponse.json({ 
      message: 'Image supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression de l\'image' 
    }, { status: 500 });
  }
}
