import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, type, timestamp } = body;

    // Validation des données
    if (!dealId || !type || !['liked', 'disliked'].includes(type)) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    // Vérifier que le bon plan existe
    const deal = await prisma.dailyDeal.findUnique({
      where: { id: dealId },
      select: { id: true, establishmentId: true, title: true }
    });

    if (!deal) {
      return NextResponse.json(
        { error: 'Bon plan non trouvé' },
        { status: 404 }
      );
    }

    // Obtenir l'IP de l'utilisateur pour éviter les doublons
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    // Vérifier si l'utilisateur a déjà donné son avis sur ce bon plan
    const existingEngagement = await prisma.dealEngagement.findFirst({
      where: {
        dealId: dealId,
        userIp: ip
      }
    });

    if (existingEngagement) {
      // Mettre à jour l'engagement existant
      await prisma.dealEngagement.update({
        where: { id: existingEngagement.id },
        data: {
          type: type,
          timestamp: new Date(timestamp)
        }
      });
    } else {
      // Créer un nouvel engagement
      await prisma.dealEngagement.create({
        data: {
          dealId: dealId,
          establishmentId: deal.establishmentId,
          type: type,
          userIp: ip,
          timestamp: new Date(timestamp)
        }
      });
    }

    console.log(`Engagement ${type} enregistré pour le deal ${dealId} (${deal.title})`);

    return NextResponse.json({
      success: true,
      message: 'Engagement enregistré avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'engagement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les statistiques d'engagement d'un bon plan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const establishmentId = searchParams.get('establishmentId');

    if (!dealId && !establishmentId) {
      return NextResponse.json(
        { error: 'dealId ou establishmentId requis' },
        { status: 400 }
      );
    }

    let whereClause: any = {};
    if (dealId) {
      whereClause.dealId = dealId;
    } else if (establishmentId) {
      whereClause.establishmentId = establishmentId;
    }

    // Récupérer les statistiques d'engagement
    const engagements = await prisma.dealEngagement.findMany({
      where: whereClause,
      select: {
        type: true,
        timestamp: true,
        dealId: true
      }
    });

    // Calculer les statistiques
    const stats = engagements.reduce((acc, engagement) => {
      if (engagement.type === 'liked') {
        acc.liked++;
      } else if (engagement.type === 'disliked') {
        acc.disliked++;
      }
      return acc;
    }, { liked: 0, disliked: 0 });

    const total = stats.liked + stats.disliked;
    const engagementRate = total > 0 ? (stats.liked / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        total,
        engagementRate: Math.round(engagementRate * 100) / 100
      },
      engagements: engagements.slice(-10) // Derniers 10 engagements pour debugging
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



