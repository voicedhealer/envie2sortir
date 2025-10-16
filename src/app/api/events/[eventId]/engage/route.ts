import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Types d'engagement et leurs scores
const ENGAGEMENT_SCORES = {
  'envie': 1,
  'grande-envie': 3,
  'decouvrir': 2,
  'pas-envie': -1
} as const;

type EngagementType = keyof typeof ENGAGEMENT_SCORES;

// Calcul du pourcentage de la jauge (0-150%)
function calculateGaugePercentage(totalScore: number): number {
  // Formule : on considère qu'un score de 15 = 100%
  // Donc 22.5 = 150%
  const percentage = (totalScore / 15) * 100;
  return Math.min(Math.max(percentage, 0), 150); // Clamp entre 0 et 150
}

// Vérifier si un nouveau badge doit être débloqué
function checkNewBadge(
  currentEngagements: number,
  previousEngagements: number
): { id: string; name: string; threshold: number } | null {
  const badges = [
    { id: 'curieux', name: 'Curieux', threshold: 5 },
    { id: 'explorateur', name: 'Explorateur', threshold: 15 },
    { id: 'ambassadeur', name: 'Ambassadeur', threshold: 50 }
  ];

  for (const badge of badges) {
    if (currentEngagements >= badge.threshold && previousEngagements < badge.threshold) {
      return badge;
    }
  }
  return null;
}

// POST - Créer ou mettre à jour un engagement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour réagir à un événement' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body;

    // Validation du type d'engagement
    if (!type || !Object.keys(ENGAGEMENT_SCORES).includes(type)) {
      return NextResponse.json(
        { error: 'Type d\'engagement invalide' },
        { status: 400 }
      );
    }

    const { eventId } = await params;
    const userId = session.user.id;

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    // Obtenir le nombre d'engagements précédents de l'utilisateur
    const previousEngagementsCount = await prisma.eventEngagement.count({
      where: { userId }
    });

    // Créer ou mettre à jour l'engagement
    const engagement = await prisma.eventEngagement.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      },
      update: {
        type,
        createdAt: new Date() // Mettre à jour la date
      },
      create: {
        eventId,
        userId,
        type
      }
    });

    // Calculer le score de karma pour cet engagement
    const karmaPoints = ENGAGEMENT_SCORES[type as EngagementType];

    // Mettre à jour le karma de l'utilisateur
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        karmaPoints: {
          increment: karmaPoints
        }
      },
      select: {
        karmaPoints: true,
        gamificationBadges: true,
        eventEngagements: {
          select: { id: true }
        }
      }
    });

    // Vérifier si un nouveau badge doit être débloqué
    const currentEngagementsCount = user.eventEngagements.length;
    const newBadge = checkNewBadge(currentEngagementsCount, previousEngagementsCount);
    
    let updatedBadges = user.gamificationBadges as any[] || [];
    
    if (newBadge && !updatedBadges.some(b => b.id === newBadge.id)) {
      updatedBadges = [...updatedBadges, { ...newBadge, unlockedAt: new Date().toISOString() }];
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          gamificationBadges: updatedBadges
        }
      });
    }

    // Récupérer les stats globales de l'événement avec les infos utilisateur
    const engagements = await prisma.eventEngagement.findMany({
      where: { eventId },
      select: { 
        type: true,
        userId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const stats = {
      envie: 0,
      'grande-envie': 0,
      'decouvrir': 0,
      'pas-envie': 0
    };

    // Grouper les utilisateurs par type d'engagement
    const usersByEngagement = {
      envie: [],
      'grande-envie': [],
      'decouvrir': [],
      'pas-envie': []
    };

    let totalScore = 0;

    engagements.forEach(eng => {
      stats[eng.type as EngagementType]++;
      totalScore += ENGAGEMENT_SCORES[eng.type as EngagementType];
      
      // Ajouter l'utilisateur à la liste correspondante
      if (eng.user) {
        usersByEngagement[eng.type as EngagementType].push({
          id: eng.userId,
          firstName: eng.user.firstName,
          lastName: eng.user.lastName,
          initials: `${eng.user.firstName?.[0] || ''}${eng.user.lastName?.[0] || ''}`.toUpperCase()
        });
      }
    });

    const gaugePercentage = calculateGaugePercentage(totalScore);

    // Déterminer le badge de l'événement
    let eventBadge = null;
    if (gaugePercentage >= 150) {
      eventBadge = { type: 'fire', label: '🔥 C\'EST LE FEU !', color: '#9C27B0' };
    } else if (gaugePercentage >= 100) {
      eventBadge = { type: 'gold', label: '🏆 Coup de Cœur', color: '#FFD700' };
    } else if (gaugePercentage >= 75) {
      eventBadge = { type: 'silver', label: '⭐ Populaire', color: '#C0C0C0' };
    } else if (gaugePercentage >= 50) {
      eventBadge = { type: 'bronze', label: '👍 Apprécié', color: '#CD7F32' };
    }

    return NextResponse.json({
      success: true,
      engagement,
      stats,
      gaugePercentage,
      eventBadge,
      userEngagement: type,
      newBadge,
      userKarma: user.karmaPoints,
      usersByEngagement
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'engagement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'engagement' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les stats d'engagement d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les engagements de l'événement avec les infos utilisateur
    const engagements = await prisma.eventEngagement.findMany({
      where: { eventId },
      select: { 
        type: true, 
        userId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const stats = {
      envie: 0,
      'grande-envie': 0,
      'decouvrir': 0,
      'pas-envie': 0
    };

    // Grouper les utilisateurs par type d'engagement
    const usersByEngagement = {
      envie: [],
      'grande-envie': [],
      'decouvrir': [],
      'pas-envie': []
    };

    let totalScore = 0;
    let userEngagement = null;

    engagements.forEach(eng => {
      stats[eng.type as EngagementType]++;
      totalScore += ENGAGEMENT_SCORES[eng.type as EngagementType];
      
      // Ajouter l'utilisateur à la liste correspondante
      if (eng.user) {
        usersByEngagement[eng.type as EngagementType].push({
          id: eng.userId,
          firstName: eng.user.firstName,
          lastName: eng.user.lastName,
          initials: `${eng.user.firstName?.[0] || ''}${eng.user.lastName?.[0] || ''}`.toUpperCase()
        });
      }
      
      if (session?.user?.id && eng.userId === session.user.id) {
        userEngagement = eng.type;
      }
    });

    const gaugePercentage = calculateGaugePercentage(totalScore);

    // Déterminer le badge de l'événement
    let eventBadge = null;
    if (gaugePercentage >= 150) {
      eventBadge = { type: 'fire', label: '🔥 C\'EST LE FEU !', color: '#9C27B0' };
    } else if (gaugePercentage >= 100) {
      eventBadge = { type: 'gold', label: '🏆 Coup de Cœur', color: '#FFD700' };
    } else if (gaugePercentage >= 75) {
      eventBadge = { type: 'silver', label: '⭐ Populaire', color: '#C0C0C0' };
    } else if (gaugePercentage >= 50) {
      eventBadge = { type: 'bronze', label: '👍 Apprécié', color: '#CD7F32' };
    }

    return NextResponse.json({
      stats,
      gaugePercentage,
      totalScore,
      eventBadge,
      userEngagement,
      totalEngagements: engagements.length,
      usersByEngagement
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    );
  }
}

