import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

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
    let user;
    try {
      user = await getCurrentUser();
    } catch (authError: any) {
      console.error('❌ Erreur d\'authentification lors du vote:', authError);
      // Si c'est une erreur de refresh token invalide, retourner une erreur 401
      if (authError?.message?.includes('Refresh Token') || authError?.message?.includes('Invalid Refresh Token')) {
        return NextResponse.json(
          { error: 'Session expirée. Veuillez vous reconnecter.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Vous devez être connecté pour réagir à un événement' },
        { status: 401 }
      );
    }
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour réagir à un événement' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
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
    const userId = user.id;

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    // Obtenir le nombre d'engagements précédents de l'utilisateur
    const { count: previousEngagementsCount } = await supabase
      .from('event_engagements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Vérifier si un engagement existe déjà
    const { data: existingEngagement } = await supabase
      .from('event_engagements')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    let engagement;
    if (existingEngagement) {
      // Mettre à jour l'engagement existant
      const { data: updatedEngagement, error: updateError } = await supabase
        .from('event_engagements')
        .update({
          type,
          created_at: new Date().toISOString()
        })
        .eq('id', existingEngagement.id)
        .select()
        .single();

      if (updateError || !updatedEngagement) {
        console.error('Erreur mise à jour engagement:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la création de l\'engagement' },
          { status: 500 }
        );
      }
      engagement = updatedEngagement;
    } else {
      // Créer un nouvel engagement
      const { data: newEngagement, error: createError } = await supabase
        .from('event_engagements')
        .insert({
          event_id: eventId,
          user_id: userId,
          type
        })
        .select()
        .single();

      if (createError || !newEngagement) {
        console.error('Erreur création engagement:', createError);
        return NextResponse.json(
          { error: 'Erreur lors de la création de l\'engagement' },
          { status: 500 }
        );
      }
      engagement = newEngagement;
    }

    // Calculer le score de karma pour cet engagement
    const karmaPoints = ENGAGEMENT_SCORES[type as EngagementType];

    // Récupérer l'utilisateur actuel
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('karma_points, gamification_badges')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Erreur récupération utilisateur:', userError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Mettre à jour le karma de l'utilisateur
    const newKarmaPoints = (userData.karma_points || 0) + karmaPoints;
    const { data: updatedUser, error: karmaUpdateError } = await supabase
      .from('users')
      .update({ karma_points: newKarmaPoints })
      .eq('id', userId)
      .select('karma_points, gamification_badges')
      .single();

    if (karmaUpdateError || !updatedUser) {
      console.error('Erreur mise à jour karma:', karmaUpdateError);
    }

    // Récupérer le nombre total d'engagements de l'utilisateur
    const { count: currentEngagementsCount } = await supabase
      .from('event_engagements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Vérifier si un nouveau badge doit être débloqué
    const newBadge = checkNewBadge(currentEngagementsCount || 0, previousEngagementsCount || 0);
    
    let updatedBadges = typeof updatedUser?.gamification_badges === 'string'
      ? JSON.parse(updatedUser.gamification_badges || '[]')
      : (updatedUser?.gamification_badges || []);
    
    if (newBadge && !updatedBadges.some((b: any) => b.id === newBadge.id)) {
      updatedBadges = [...updatedBadges, { ...newBadge, unlockedAt: new Date().toISOString() }];
      
      await supabase
        .from('users')
        .update({ gamification_badges: JSON.stringify(updatedBadges) })
        .eq('id', userId);
    }

    // Récupérer les stats globales de l'événement avec les infos utilisateur
    const { data: engagements, error: engagementsError } = await supabase
      .from('event_engagements')
      .select(`
        type,
        user_id,
        user:users!event_engagements_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_id', eventId);

    if (engagementsError) {
      console.error('Erreur récupération engagements:', engagementsError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'engagement' },
        { status: 500 }
      );
    }

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

    (engagements || []).forEach((eng: any) => {
      stats[eng.type as EngagementType]++;
      totalScore += ENGAGEMENT_SCORES[eng.type as EngagementType];
      
      // Ajouter l'utilisateur à la liste correspondante
      const user = Array.isArray(eng.user) ? eng.user[0] : eng.user;
      if (user) {
        usersByEngagement[eng.type as EngagementType].push({
          id: eng.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          initials: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
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
      engagement: {
        id: engagement.id,
        eventId: engagement.event_id,
        userId: engagement.user_id,
        type: engagement.type,
        createdAt: engagement.created_at
      },
      stats,
      gaugePercentage,
      eventBadge,
      userEngagement: type,
      newBadge,
      userKarma: updatedUser?.karma_points || 0,
      usersByEngagement,
      totalEngagements: (engagements || []).length
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
    const user = await getCurrentUser();
    const supabase = await createClient();
    const { eventId } = await params;

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les engagements de l'événement avec les infos utilisateur
    const { data: engagements, error: engagementsError } = await supabase
      .from('event_engagements')
      .select(`
        type,
        user_id,
        user:users!event_engagements_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_id', eventId);

    if (engagementsError) {
      console.error('Erreur récupération engagements:', engagementsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des stats' },
        { status: 500 }
      );
    }

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

    (engagements || []).forEach((eng: any) => {
      stats[eng.type as EngagementType]++;
      totalScore += ENGAGEMENT_SCORES[eng.type as EngagementType];
      
      // Ajouter l'utilisateur à la liste correspondante
      const userData = Array.isArray(eng.user) ? eng.user[0] : eng.user;
      if (userData) {
        usersByEngagement[eng.type as EngagementType].push({
          id: eng.user_id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          initials: `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase()
        });
      }
      
      if (user?.id && eng.user_id === user.id) {
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
      totalEngagements: (engagements || []).length,
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

