import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            imageUrl: true,
            avgRating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ favorites });

  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { establishmentId } = await request.json();

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID d\'établissement requis' }, { status: 400 });
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Créer le favori (ou le récupérer s'il existe déjà)
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_establishmentId: {
          userId: session.user.id,
          establishmentId: establishmentId
        }
      },
      create: {
        userId: session.user.id,
        establishmentId: establishmentId
      },
      update: {},
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            imageUrl: true,
            avgRating: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      favorite,
      message: 'Ajouté aux favoris' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    );
  }
}
