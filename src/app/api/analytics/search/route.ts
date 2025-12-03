import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin pour accéder aux analytics de recherche
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Accès refusé. Admin requis.' }, { status: 403 });
    }

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
    // Une recherche est "sans résultats" si TOUTES les recherches pour ce terme ont result_count === 0
    // On vérifie dans les données brutes pour être sûr
    const searchesWithoutResultsMap = new Map<string, number>();
    (searches || []).forEach((search: any) => {
      const term = (search.search_term || '').toLowerCase().trim();
      // Si cette recherche spécifique n'a pas de résultats
      if ((search.result_count || 0) === 0) {
        searchesWithoutResultsMap.set(term, (searchesWithoutResultsMap.get(term) || 0) + 1);
      }
    });

    // Filtrer pour ne garder que les termes où TOUTES les recherches n'ont pas de résultats
    const searchesWithoutResults = Array.from(searchesWithoutResultsMap.entries())
      .filter(([term, count]) => {
        // Vérifier qu'aucune recherche pour ce terme n'a eu de résultats
        const hasAnyResults = (searches || []).some((search: any) => {
          const searchTerm = (search.search_term || '').toLowerCase().trim();
          return searchTerm === term && (search.result_count || 0) > 0;
        });
        return !hasAnyResults;
      })
      .map(([searchTerm, count]) => ({
        searchTerm,
        count,
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

    // Statistiques des villes les plus recherchées
    const cityMap = new Map<string, number>();
    (searches || []).forEach((search: any) => {
      const searchCity = search.searched_city || search.city;
      if (searchCity) {
        cityMap.set(searchCity, (cityMap.get(searchCity) || 0) + 1);
      }
    });
    const topCities = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Statistiques des rayons de recherche (si disponible)
    const radiusMap = new Map<number, number>();
    (searches || []).forEach((search: any) => {
      const radius = search.search_radius;
      if (radius !== null && radius !== undefined) {
        radiusMap.set(radius, (radiusMap.get(radius) || 0) + 1);
      }
    });
    const radiusStats = Array.from(radiusMap.entries())
      .map(([radius, count]) => ({ radius, count }))
      .sort((a, b) => b.count - a.count);

    // Parcours utilisateur : séquences de recherche -> clic
    // IMPORTANT: Si un clic existe, la recherche DOIT avoir des résultats (logique métier)
    const userJourneys: Array<{
      searchTerm: string;
      city?: string;
      radius?: number;
      hasResults: boolean;
      hasClick: boolean;
      clickedEstablishment?: string;
      dataInconsistency?: boolean; // Flag pour détecter les incohérences
    }> = (searches || []).map((search: any) => {
      const hasClick = !!(search.clicked_establishment_id && search.clicked_establishment_name);
      const resultCount = search.result_count || 0;
      const hasResults = resultCount > 0;
      
      // Détecter les incohérences : un clic ne peut pas exister sans résultats
      const dataInconsistency = hasClick && !hasResults;
      
      // Si un clic existe mais result_count = 0, c'est probablement une incohérence de timing
      // On considère qu'il y a eu des résultats (sinon le clic serait impossible)
      const correctedHasResults = hasClick ? true : hasResults;
      
      return {
        searchTerm: search.search_term,
        city: search.searched_city || search.city,
        radius: search.search_radius,
        hasResults: correctedHasResults,
        hasClick,
        clickedEstablishment: search.clicked_establishment_name || undefined,
        dataInconsistency, // Garder l'info pour le debug
      };
    });

    return NextResponse.json({
      period,
      startDate: startDateISO,
      totalSearches: (searches || []).length,
      topSearches: topSearches.slice(0, 20),
      searchesWithoutResults,
      searchTrends,
      topCities,
      radiusStats,
      userJourneys: userJourneys.slice(0, 100) // Limiter à 100 pour éviter une réponse trop lourde
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

