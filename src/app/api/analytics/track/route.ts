import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';
import { getPremiumRequiredError } from '@/lib/subscription-utils';

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

    const supabase = await createClient();

    // Vérifier que l'établissement existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      );
    }

    // Enregistrer l'événement de clic
    const { error: insertError } = await supabase
      .from('click_analytics')
      .insert({
        establishment_id: establishmentId,
        element_type: elementType,
        element_id: elementId,
        element_name: elementName,
        action,
        section_context: sectionContext,
        user_agent: userAgent,
        referrer,
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      });

    if (insertError) {
      console.error('Erreur enregistrement analytics:', insertError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

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
    const user = await getCurrentUser();
    if (!user) {
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

    // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est propriétaire
    const supabase = await createClient();

    // Vérifier le plan d'abonnement de l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', establishmentId)
      .single();

    if (establishmentError) {
      console.error('❌ [Analytics] Erreur récupération établissement:', establishmentError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération de l\'établissement',
          details: establishmentError.message,
          code: establishmentError.code
        },
        { status: 500 }
      );
    }

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

    const startDateISO = startDate.toISOString();
    console.log(`🔍 [Analytics GET] Récupération données pour établissement ${establishmentId}, période ${period}, depuis ${startDateISO}`);

    // Récupérer toutes les données d'analytics pour cette période
    const { data: allClicks, error: clicksError } = await supabase
      .from('click_analytics')
      .select('*')
      .eq('establishment_id', establishmentId)
      .gte('timestamp', startDateISO);

    if (clicksError) {
      console.error('❌ [Analytics GET] Erreur récupération analytics:', clicksError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des analytics',
          details: clicksError.message,
          code: clicksError.code
        },
        { status: 500 }
      );
    }

    console.log(`✅ [Analytics GET] ${allClicks?.length || 0} enregistrements trouvés`);

    // Grouper par élément (elementType, elementId, elementName)
    const statsMap = new Map<string, { elementType: string; elementId: string; elementName: string; count: number }>();
    const statsByTypeMap = new Map<string, number>();

    (allClicks || []).forEach((click: any) => {
      const key = `${click.element_type}-${click.element_id}-${click.element_name}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          elementType: click.element_type,
          elementId: click.element_id,
          elementName: click.element_name,
          count: 0
        });
      }
      statsMap.get(key)!.count++;

      // Stats par type
      const typeCount = statsByTypeMap.get(click.element_type) || 0;
      statsByTypeMap.set(click.element_type, typeCount + 1);
    });

    const stats = Array.from(statsMap.values())
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        elementType: item.elementType,
        elementId: item.elementId,
        elementName: item.elementName,
        _count: { id: item.count }
      }));

    const statsByType = Array.from(statsByTypeMap.entries()).map(([elementType, count]) => ({
      elementType,
      _count: { id: count }
    }));

    console.log(`✅ [Analytics GET] Données formatées:`, {
      totalClicks: allClicks?.length || 0,
      topElementsCount: stats.length,
      statsByTypeCount: statsByType.length,
    });

    // Statistiques temporelles (clics par heure de la journée)
    const hourlyData = (allClicks || []).map((click: any) => ({
      timestamp: new Date(click.timestamp)
    }));

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

    // Statistiques des avis
    const { data: comments, error: commentsError } = await supabase
      .from('user_comments')
      .select('rating, created_at')
      .eq('establishment_id', establishmentId)
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false });

    let reviewsStats = {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentReviews: 0, // Avis des 7 derniers jours
      trend: 'stable' as 'positive' | 'negative' | 'stable',
      previousPeriodAverage: 0,
    };

    if (!commentsError && comments && comments.length > 0) {
      const totalRating = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
      reviewsStats.totalReviews = comments.length;
      reviewsStats.averageRating = totalRating / comments.length;

      // Distribution des notes
      comments.forEach((c: any) => {
        const rating = c.rating || 0;
        if (rating >= 1 && rating <= 5) {
          reviewsStats.ratingDistribution[rating as keyof typeof reviewsStats.ratingDistribution]++;
        }
      });

      // Avis récents (7 derniers jours)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      reviewsStats.recentReviews = comments.filter((c: any) => 
        new Date(c.created_at) >= new Date(sevenDaysAgo)
      ).length;

      // Calcul de la tendance (comparaison avec la période précédente)
      const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime())).toISOString();
      const { data: previousComments } = await supabase
        .from('user_comments')
        .select('rating')
        .eq('establishment_id', establishmentId)
        .gte('created_at', previousPeriodStart)
        .lt('created_at', startDateISO);

      if (previousComments && previousComments.length > 0) {
        const previousTotalRating = previousComments.reduce((sum, c) => sum + (c.rating || 0), 0);
        reviewsStats.previousPeriodAverage = previousTotalRating / previousComments.length;
        
        const diff = reviewsStats.averageRating - reviewsStats.previousPeriodAverage;
        if (diff > 0.2) {
          reviewsStats.trend = 'positive';
        } else if (diff < -0.2) {
          reviewsStats.trend = 'negative';
        } else {
          reviewsStats.trend = 'stable';
        }
      }
    }

    return NextResponse.json({
      period,
      startDate,
      totalClicks: stats.reduce((sum, stat) => sum + stat._count.id, 0),
      topElements: stats.slice(0, 10),
      statsByType,
      hourlyStats,
      reviewsStats,
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
