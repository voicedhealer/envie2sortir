import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin requis' },
        { status: 403 }
      );
    }

    // Récupérer tous les établissements avec leurs analytics
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        clickAnalytics: {
          select: {
            elementId: true,
            elementName: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    // Traiter les données pour chaque établissement
    const establishmentsWithAnalytics = establishments.map(establishment => {
      const analytics = establishment.clickAnalytics;
      const totalClicks = analytics.length;
      
      // Trouver l'élément le plus cliqué
      const elementCounts = analytics.reduce((acc, click) => {
        const key = click.elementName || click.elementId;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topElement = Object.entries(elementCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      const lastActivity = analytics.length > 0 ? analytics[0].timestamp : new Date();

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        totalClicks,
        topElement: topElement ? topElement[0] : 'Aucune donnée',
        topElementClicks: topElement ? topElement[1] : 0,
        lastActivity: lastActivity.toISOString(),
      };
    });

    // Trier par nombre de clics (décroissant)
    establishmentsWithAnalytics.sort((a, b) => b.totalClicks - a.totalClicks);

    return NextResponse.json(establishmentsWithAnalytics);
  } catch (error) {
    console.error('Error fetching establishments analytics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
