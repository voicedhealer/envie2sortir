import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDealActive } from '@/lib/deal-utils';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre de limite depuis l'URL (par défaut 12)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Date actuelle
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Récupérer tous les bons plans actifs avec les informations de l'établissement
    const activeDeals = await prisma.dailyDeal.findMany({
      where: {
        isActive: true,
        dateDebut: {
          lte: tomorrow
        },
        dateFin: {
          gte: today
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        modality: true,
        originalPrice: true,
        discountedPrice: true,
        imageUrl: true,
        pdfUrl: true,
        dateDebut: true,
        dateFin: true,
        heureDebut: true,
        heureFin: true,
        isActive: true,
        promoUrl: true,
        createdAt: true,
        establishmentId: true,
        establishment: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            category: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Plus récents en premier
      },
      take: limit > 0 ? limit : undefined // Si limit = 0, récupérer tous
    });

    // Filtrer les bons plans qui sont actifs maintenant
    const currentActiveDeals = activeDeals.filter(deal => {
      return isDealActive(deal);
    });

    return NextResponse.json({
      success: true,
      deals: currentActiveDeals,
      total: currentActiveDeals.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de tous les bons plans actifs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

