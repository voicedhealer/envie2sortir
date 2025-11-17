import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

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
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Récupérer l'utilisateur avec ses badges
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('karma_points, gamification_badges')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les engagements de l'utilisateur
    const { data: eventEngagements, error: engagementsError } = await supabase
      .from('event_engagements')
      .select(`
        id,
        type,
        created_at,
        event:events (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (engagementsError) {
      console.error('Erreur récupération engagements:', engagementsError);
    }

    const unlockedBadges = typeof userData.gamification_badges === 'string'
      ? JSON.parse(userData.gamification_badges || '[]')
      : (userData.gamification_badges || []);
    const totalEngagements = (eventEngagements || []).length;

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
      'envie': (eventEngagements || []).filter((e: any) => e.type === 'envie').length,
      'grande-envie': (eventEngagements || []).filter((e: any) => e.type === 'grande-envie').length,
      'decouvrir': (eventEngagements || []).filter((e: any) => e.type === 'decouvrir').length,
      'pas-envie': (eventEngagements || []).filter((e: any) => e.type === 'pas-envie').length
    };

    // Formater les engagements récents
    const recentEngagements = (eventEngagements || []).slice(0, 5).map((e: any) => ({
      id: e.id,
      type: e.type,
      createdAt: e.created_at,
      event: Array.isArray(e.event) ? e.event[0] : e.event
    }));

    return NextResponse.json({
      karmaPoints: userData.karma_points || 0,
      totalEngagements,
      badges: badgesStatus,
      unlockedBadges,
      engagementsByType,
      recentEngagements
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
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
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

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('gamification_badges')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const currentBadges = typeof userData.gamification_badges === 'string'
      ? JSON.parse(userData.gamification_badges || '[]')
      : (userData.gamification_badges || []);

    // Vérifier si le badge est déjà débloqué
    if (currentBadges.some((b: any) => b.id === badgeId)) {
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

    const { error: updateError } = await supabase
      .from('users')
      .update({ gamification_badges: JSON.stringify(updatedBadges) })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur mise à jour badges:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du déblocage du badge' },
        { status: 500 }
      );
    }

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

