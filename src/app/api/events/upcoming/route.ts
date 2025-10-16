import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');

    const now = new Date();
    
    // Récupérer les événements à venir ET en cours
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            // Événements futurs
            startDate: {
              gte: now
            }
          },
          {
            // Événements en cours (ont commencé mais pas encore terminés)
            AND: [
              { startDate: { lte: now } },
              {
                OR: [
                  { endDate: { gte: now } },
                  { endDate: null } // Événements sans date de fin
                ]
              }
            ]
          }
        ],
        establishment: {
          status: 'approved', // Seulement les établissements approuvés
          ...(city ? { city } : {})
        }
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            address: true
          }
        },
        engagements: {
          select: {
            type: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: limit
    });

    // Calculer le score d'engagement pour chaque événement
    const eventsWithScore = events.map(event => {
      const SCORES = {
        'envie': 1,
        'grande-envie': 3,
        'decouvrir': 2,
        'pas-envie': -1
      };

      const score = event.engagements.reduce((total, eng) => {
        return total + (SCORES[eng.type as keyof typeof SCORES] || 0);
      }, 0);

      const { engagements, ...eventData } = event;

      return {
        ...eventData,
        engagementScore: score,
        engagementCount: engagements.length
      };
    });

    // Trier par score d'engagement décroissant pour identifier les trending
    const trending = [...eventsWithScore]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    return NextResponse.json({
      events: eventsWithScore,
      trending,
      total: eventsWithScore.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

