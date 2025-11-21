import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

const ENGAGEMENT_SCORES = {
  'envie': 1,
  'grande-envie': 3,
  'decouvrir': 2,
  'pas-envie': -1
} as const;

type EngagementType = keyof typeof ENGAGEMENT_SCORES;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const period = searchParams.get('period') || '30d';

    if (!establishmentId) {
      return NextResponse.json(
        { error: 'establishmentId is required' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [Analytics Events] Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

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

    const startDateISO = startDate.toISOString();

    // Récupérer tous les événements de l'établissement
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, start_date, end_date')
      .eq('establishment_id', establishmentId)
      .gte('start_date', startDateISO)
      .order('start_date', { ascending: false });

    if (eventsError) {
      console.error('❌ [Analytics Events] Erreur récupération événements:', eventsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        totalEvents: 0,
        totalEngagements: 0,
        statsByType: {
          envie: 0,
          'grande-envie': 0,
          decouvrir: 0,
          'pas-envie': 0
        },
        eventsStats: [],
        period,
        startDate: startDateISO
      });
    }

    const eventIds = events.map(e => e.id);

    // Récupérer tous les engagements pour ces événements
    const { data: engagements, error: engagementsError } = await supabase
      .from('event_engagements')
      .select('event_id, type, created_at')
      .in('event_id', eventIds)
      .gte('created_at', startDateISO);

    if (engagementsError) {
      console.error('❌ [Analytics Events] Erreur récupération engagements:', engagementsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des engagements' },
        { status: 500 }
      );
    }

    // Calculer les statistiques globales
    const statsByType = {
      envie: 0,
      'grande-envie': 0,
      decouvrir: 0,
      'pas-envie': 0
    };

    let totalScore = 0;

    (engagements || []).forEach((eng: any) => {
      const engagementType = eng.type as EngagementType;
      if (Object.keys(ENGAGEMENT_SCORES).includes(engagementType)) {
        statsByType[engagementType]++;
        totalScore += ENGAGEMENT_SCORES[engagementType];
      }
    });

    // Calculer les statistiques par événement
    const eventsStats = events.map(event => {
      const eventEngagements = (engagements || []).filter(
        (eng: any) => eng.event_id === event.id
      );

      const eventStats = {
        envie: 0,
        'grande-envie': 0,
        decouvrir: 0,
        'pas-envie': 0
      };

      let eventScore = 0;

      eventEngagements.forEach((eng: any) => {
        const engagementType = eng.type as EngagementType;
        if (Object.keys(ENGAGEMENT_SCORES).includes(engagementType)) {
          eventStats[engagementType]++;
          eventScore += ENGAGEMENT_SCORES[engagementType];
        }
      });

      const totalEngagements = Object.values(eventStats).reduce((a, b) => a + b, 0);

      return {
        eventId: event.id,
        title: event.title,
        startDate: event.start_date,
        endDate: event.end_date || null,
        totalEngagements,
        stats: eventStats,
        score: eventScore
      };
    });

    // Trier les événements par nombre d'engagements décroissant
    eventsStats.sort((a, b) => b.totalEngagements - a.totalEngagements);

    const totalEngagements = Object.values(statsByType).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      totalEvents: events.length,
      totalEngagements,
      statsByType,
      totalScore,
      eventsStats,
      period,
      startDate: startDateISO
    });

  } catch (error) {
    console.error('❌ [Analytics Events] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

