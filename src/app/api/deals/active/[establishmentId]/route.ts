import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    // Récupérer les bons plans actifs pour aujourd'hui
    console.log('API deals/active - Recherche des deals pour:', { establishmentId, today, tomorrow });
    
    const activeDeals = await prisma.dailyDeal.findMany({
      where: {
        establishmentId,
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
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('API deals/active - Deals trouvés:', activeDeals.length, activeDeals);

    // Filtrer les bons plans qui sont actifs maintenant (selon les heures si spécifiées)
    const currentActiveDeals = activeDeals.filter(deal => {
      // Si pas d'heures spécifiées, actif toute la journée
      if (!deal.heureDebut && !deal.heureFin) {
        return true;
      }
      
      // Si modalité remplie, actif toute la journée
      if (deal.modality) {
        return true;
      }
      
      // Sinon, vérifier les heures
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      let startTime = 0; // 00h00 par défaut
      let endTime = 24 * 60 - 1; // 23h59 par défaut
      
      if (deal.heureDebut) {
        const [hours, minutes] = deal.heureDebut.split(':').map(Number);
        startTime = hours * 60 + minutes;
      }
      
      if (deal.heureFin) {
        const [hours, minutes] = deal.heureFin.split(':').map(Number);
        endTime = hours * 60 + minutes;
      }
      
      return currentTime >= startTime && currentTime <= endTime;
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