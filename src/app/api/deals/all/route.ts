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
    
    console.log('📊 API /api/deals/all - Recherche des deals actifs...', { limit, today, tomorrow });
    
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
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            imageUrl: true,
            activities: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Plus récents en premier
      },
      take: limit > 0 ? limit : undefined // Si limit = 0, récupérer tous
    });

    console.log(`📊 API /api/deals/all - ${activeDeals.length} deals trouvés avant filtrage`);

    // Filtrer les bons plans qui sont actifs maintenant
    const currentActiveDeals = activeDeals.filter(deal => {
      return isDealActive(deal);
    });

    console.log(`✅ API /api/deals/all - ${currentActiveDeals.length} deals actifs retournés`);

    return NextResponse.json({
      success: true,
      deals: currentActiveDeals,
      total: currentActiveDeals.length
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de tous les bons plans actifs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

