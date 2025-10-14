import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma as prismaShared } from '@/lib/prisma';
import { getPremiumRequiredError } from '@/lib/subscription-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      establishmentId,
      elementType,
      elementId,
      elementName,
      action,
      sectionContext,
      userAgent,
      referrer,
      timestamp,
    } = body;

    // Validation des données requises
    if (!establishmentId || !elementType || !elementId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      );
    }

    // Enregistrer l'événement de clic
    await prisma.clickAnalytics.create({
      data: {
        establishmentId,
        elementType,
        elementId,
        elementName,
        action,
        sectionContext,
        userAgent,
        referrer,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pour récupérer les statistiques (pour les dashboards)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'abonnement: Premium requis pour consulter les analytics détaillés
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    if (!establishmentId) {
      return NextResponse.json(
        { error: 'establishmentId is required' },
        { status: 400 }
      );
    }

    // Vérifier le plan d'abonnement de l'établissement
    const establishment = await prismaShared.establishment.findUnique({
      where: { id: establishmentId },
      select: { subscription: true }
    });
    if (!establishment || establishment.subscription !== 'PREMIUM') {
      const error = getPremiumRequiredError('Analytics');
      return NextResponse.json(error, { status: error.status });
    }

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Récupérer les statistiques
    const stats = await prisma.clickAnalytics.groupBy({
      by: ['elementType', 'elementId', 'elementName'],
      where: {
        establishmentId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Statistiques par type d'élément
    const statsByType = await prisma.clickAnalytics.groupBy({
      by: ['elementType'],
      where: {
        establishmentId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Statistiques temporelles (clics par heure de la journée)
    const hourlyData = await prisma.clickAnalytics.findMany({
      where: {
        establishmentId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
      },
    });

    // Grouper par heure de la journée (0-23)
    const hourlyStatsMap = new Map<number, number>();
    
    hourlyData.forEach(click => {
      const hour = click.timestamp.getHours();
      hourlyStatsMap.set(hour, (hourlyStatsMap.get(hour) || 0) + 1);
    });

    // Créer le tableau des heures avec toutes les heures de 0 à 23
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      clicks: hourlyStatsMap.get(hour) || 0,
      hourLabel: `${hour.toString().padStart(2, '0')}h`,
    }));

    return NextResponse.json({
      period,
      startDate,
      totalClicks: stats.reduce((sum, stat) => sum + stat._count.id, 0),
      topElements: stats.slice(0, 10),
      statsByType,
      hourlyStats,
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
