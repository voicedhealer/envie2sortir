import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDealActive } from '@/lib/deal-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const { establishmentId } = await params;
    console.log('API deals/active - establishmentId:', establishmentId);
    
    // Vérifier que l'ID est valide
    if (!establishmentId) {
      console.error('API deals/active - establishmentId manquant');
      return NextResponse.json(
        { error: 'ID d\'établissement manquant' },
        { status: 400 }
      );
    }
    
    // Date actuelle
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Récupérer les bons plans actifs
    console.log('API deals/active - Recherche des deals pour:', { establishmentId, today, tomorrow });
    
    const activeDeals = await prisma.dailyDeal.findMany({
      where: {
        establishmentId,
        isActive: true,
        OR: [
          // Bons plans non récurrents avec dates spécifiques
          {
            isRecurring: false,
            dateDebut: {
              lte: tomorrow
            },
            dateFin: {
              gte: today
            }
          },
          // Bons plans récurrents (toujours actifs selon leur logique)
          {
            isRecurring: true
          }
        ]
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
        // Champs de récurrence
        isRecurring: true,
        recurrenceType: true,
        recurrenceDays: true,
        recurrenceEndDate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('API deals/active - Deals trouvés:', activeDeals.length, activeDeals);

    // Filtrer les bons plans qui sont actifs maintenant en utilisant la fonction centralisée
    const currentActiveDeals = activeDeals.filter(deal => {
      // Convertir les types JSON en types appropriés
      const dealWithCorrectTypes = {
        ...deal,
        recurrenceDays: Array.isArray(deal.recurrenceDays) ? deal.recurrenceDays as number[] : null
      };
      return isDealActive(dealWithCorrectTypes);
    });

    console.log('API deals/active - Deals actifs maintenant:', currentActiveDeals.length, currentActiveDeals);

    return NextResponse.json({
      success: true,
      deals: currentActiveDeals
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des bons plans actifs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}