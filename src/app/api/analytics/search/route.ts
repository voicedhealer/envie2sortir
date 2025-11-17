import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    
    // Les recherches sont globales, pas liées à un établissement spécifique

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

    const supabase = await createClient();
    const startDateISO = startDate.toISOString();

    // Récupérer toutes les recherches pour la période
    const { data: searches, error: searchesError } = await supabase
      .from('search_analytics')
      .select('*')
      .gte('timestamp', startDateISO)
      .order('timestamp', { ascending: false });

    if (searchesError) {
      console.error('Erreur récupération search analytics:', searchesError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Grouper par terme de recherche
    const searchMap = new Map<string, {
      searchCount: number;
      clickCount: number;
      establishments: Map<string, { name: string; clicks: number }>;
      hasResults: boolean;
    }>();

    (searches || []).forEach((search: any) => {
      const term = (search.search_term || '').toLowerCase().trim();
      
      if (!searchMap.has(term)) {
        searchMap.set(term, {
          searchCount: 0,
          clickCount: 0,
          establishments: new Map(),
          hasResults: (search.result_count || 0) > 0,
        });
      }

      const data = searchMap.get(term)!;
      data.searchCount++;

      // Si l'utilisateur a cliqué sur un établissement
      if (search.clicked_establishment_id && search.clicked_establishment_name) {
        data.clickCount++;
        
        const estId = search.clicked_establishment_id;
        if (!data.establishments.has(estId)) {
          data.establishments.set(estId, {
            name: search.clicked_establishment_name,
            clicks: 0,
          });
        }
        data.establishments.get(estId)!.clicks++;
      }

      // Mettre à jour si au moins une recherche a des résultats
      if ((search.result_count || 0) > 0) {
        data.hasResults = true;
      }
    });

    // Transformer en tableau et calculer les taux de conversion
    const topSearches = Array.from(searchMap.entries())
      .map(([searchTerm, data]) => ({
        searchTerm,
        searchCount: data.searchCount,
        clickCount: data.clickCount,
        conversionRate: data.searchCount > 0 
          ? Math.round((data.clickCount / data.searchCount) * 100) 
          : 0,
        topClickedEstablishments: Array.from(data.establishments.entries())
          .map(([establishmentId, estData]) => ({
            establishmentId,
            establishmentName: estData.name,
            clicks: estData.clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
        hasResults: data.hasResults,
      }))
      .filter(search => search.searchCount > 0)
      .sort((a, b) => b.searchCount - a.searchCount);

    // Recherches sans résultats (opportunités)
    const searchesWithoutResults = topSearches
      .filter(search => !search.hasResults)
      .map(search => ({
        searchTerm: search.searchTerm,
        count: search.searchCount,
      }));

    // Tendances temporelles - grouper par jour
    const trendsMap = new Map<string, number>();
    (searches || []).forEach((search: any) => {
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
    });

    const searchTrends = Array.from(trendsMap.entries())
      .map(([date, count]) => ({
        date,
        searches: count,
        clicks: 0 // À calculer si nécessaire
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      period,
      startDate: startDateISO,
      totalSearches: (searches || []).length,
      topSearches: topSearches.slice(0, 20),
      searchesWithoutResults,
      searchTrends
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

