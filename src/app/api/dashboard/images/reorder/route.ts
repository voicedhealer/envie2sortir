import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { establishmentId, imageOrder } = await request.json();

    console.log('🔄 Réorganisation des images:', {
      establishmentId,
      userId: session.user.id,
      newOrder: imageOrder
    });

    // Vérifier que l'établissement appartient bien à l'utilisateur
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        ownerId: session.user.id
      },
      include: {
        images: true
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    console.log('✅ Établissement trouvé:', establishment.name);
    console.log('📸 Images actuelles:', establishment.images.length);

    // Mettre à jour l'ordre des images
    // Pour chaque image dans le nouvel ordre, mettre à jour son index
    const updatePromises = imageOrder.map(async (imageUrl: string, index: number) => {
      // Trouver l'image correspondante
      const image = establishment.images.find(img => img.url === imageUrl);
      
      console.log(`🔄 Image ${index + 1}:`, {
        url: imageUrl,
        trouvée: !!image,
        imageId: image?.id
      });
      
      if (image) {
        return prisma.image.update({
          where: { id: image.id },
          data: { 
            ordre: index, // ✅ CORRECTION : Le champ s'appelle "ordre" dans le schéma
            isPrimary: index === 0 // La première image devient l'image principale
          }
        });
      }
    });

    const results = await Promise.all(updatePromises.filter(Boolean));
    console.log('✅ Nombre d\'images mises à jour:', results.length);

    // Mettre à jour aussi l'imageUrl principale de l'établissement
    if (imageOrder.length > 0) {
      await prisma.establishment.update({
        where: { id: establishmentId },
        data: { imageUrl: imageOrder[0] }
      });
    }

    console.log('✅ Ordre des images mis à jour avec succès');

    return NextResponse.json({
      success: true,
      message: 'Ordre des images mis à jour'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réorganisation des images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réorganisation des images' },
      { status: 500 }
    );
  }
}

