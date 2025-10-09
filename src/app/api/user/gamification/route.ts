import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Définition des badges disponibles
const AVAILABLE_BADGES = [
  { id: 'curieux', name: 'Curieux', description: '5 engagements sur des événements', threshold: 5, icon: '🔍' },
  { id: 'explorateur', name: 'Explorateur', description: '15 engagements sur des événements', threshold: 15, icon: '🗺️' },
  { id: 'ambassadeur', name: 'Ambassadeur', description: '50 engagements sur des événements', threshold: 50, icon: '👑' },
  { id: 'feu-artifice', name: 'Feu d\'artifice', description: 'Contribué à un événement atteignant 150%', threshold: 0, icon: '🎆' }
];

// GET - Récupérer les badges et le karma de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        karmaPoints: true,
        gamificationBadges: true,
        eventEngagements: {
          select: { 
            id: true,
            type: true,
            createdAt: true,
            event: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const unlockedBadges = (user.gamificationBadges as any[]) || [];
    const totalEngagements = user.eventEngagements.length;

    // Calculer les badges disponibles et leur progression
    const badgesStatus = AVAILABLE_BADGES.map(badge => {
      const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
      const progress = badge.threshold > 0 
        ? Math.min((totalEngagements / badge.threshold) * 100, 100)
        : 0;

      return {
        ...badge,
        isUnlocked,
        progress,
        unlockedAt: isUnlocked 
          ? unlockedBadges.find(b => b.id === badge.id)?.unlockedAt 
          : null
      };
    });

    // Statistiques d'engagement par type
    const engagementsByType = {
      'envie': user.eventEngagements.filter(e => e.type === 'envie').length,
      'grande-envie': user.eventEngagements.filter(e => e.type === 'grande-envie').length,
      'decouvrir': user.eventEngagements.filter(e => e.type === 'decouvrir').length,
      'pas-envie': user.eventEngagements.filter(e => e.type === 'pas-envie').length
    };

    return NextResponse.json({
      karmaPoints: user.karmaPoints,
      totalEngagements,
      badges: badgesStatus,
      unlockedBadges,
      engagementsByType,
      recentEngagements: user.eventEngagements.slice(0, 5) // Les 5 derniers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la gamification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

// POST - Débloquer un badge manuel (pour badges spéciaux)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { badgeId, reason } = body;

    if (!badgeId) {
      return NextResponse.json(
        { error: 'Badge ID requis' },
        { status: 400 }
      );
    }

    // Vérifier que le badge existe
    const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge invalide' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gamificationBadges: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const currentBadges = (user.gamificationBadges as any[]) || [];

    // Vérifier si le badge est déjà débloqué
    if (currentBadges.some(b => b.id === badgeId)) {
      return NextResponse.json(
        { error: 'Badge déjà débloqué' },
        { status: 400 }
      );
    }

    // Ajouter le nouveau badge
    const newBadge = {
      ...badge,
      unlockedAt: new Date().toISOString(),
      reason: reason || 'Déblocage manuel'
    };

    const updatedBadges = [...currentBadges, newBadge];

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        gamificationBadges: updatedBadges
      }
    });

    return NextResponse.json({
      success: true,
      badge: newBadge,
      totalBadges: updatedBadges.length
    });

  } catch (error) {
    console.error('Erreur lors du déblocage du badge:', error);
    return NextResponse.json(
      { error: 'Erreur lors du déblocage du badge' },
      { status: 500 }
    );
  }
}

