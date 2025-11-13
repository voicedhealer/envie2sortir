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

    const supabase = createClient();

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

    const supabase = createClient();
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
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment || establishment.subscription !== 'PREMIUM') {
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

    // Récupérer toutes les données d'analytics pour cette période
    const { data: allClicks, error: clicksError } = await supabase
      .from('click_analytics')
      .select('*')
      .eq('establishment_id', establishmentId)
      .gte('timestamp', startDateISO);

    if (clicksError) {
      console.error('Erreur récupération analytics:', clicksError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

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
