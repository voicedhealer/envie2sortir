import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔍 Session:', { user: session?.user, hasEmail: !!session?.user?.email });

    if (!session || !session.user) {
      console.log('❌ Pas de session');
      return NextResponse.json({ error: 'Non autorisé - Session manquante' }, { status: 401 });
    }

    const { imageId, establishmentId } = await request.json();

    console.log('📥 Requête:', { imageId, establishmentId });

    if (!imageId || !establishmentId) {
      return NextResponse.json({ error: 'Image ID et Establishment ID requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: {
        owner: true // Inclure les données du propriétaire
      }
    });

    console.log('🏢 Établissement:', { 
      found: !!establishment, 
      ownerId: establishment?.ownerId,
      ownerEmail: establishment?.owner?.email,
      userEmail: session.user.email 
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      console.log('❌ Email manquant dans la session');
      return NextResponse.json({ error: 'Email utilisateur manquant' }, { status: 400 });
    }

    // Vérifier que l'email de l'utilisateur correspond à l'email du propriétaire
    if (establishment.owner.email !== userEmail) {
      console.log('❌ Propriétaire différent:', { 
        ownerEmail: establishment.owner.email, 
        userEmail 
      });
      return NextResponse.json({ error: 'Non autorisé - Vous n\'êtes pas le propriétaire' }, { status: 403 });
    }

    // Retirer isCardImage de toutes les images de cet établissement
    await prisma.image.updateMany({
      where: { 
        establishmentId,
        isCardImage: true 
      },
      data: { isCardImage: false },
    });

    // Définir la nouvelle image de card
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: { isCardImage: true },
    });

    console.log('✅ Image de card définie:', imageId);

    return NextResponse.json({
      success: true,
      message: 'Image de card définie avec succès',
      image: updatedImage,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la définition de l\'image de card:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Erreur lors de la définition de l\'image de card',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

