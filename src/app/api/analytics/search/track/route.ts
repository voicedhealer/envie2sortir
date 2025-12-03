import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// PUT pour mettre à jour le resultCount d'une recherche récente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm, resultCount } = body;

    if (!searchTerm || resultCount === undefined) {
      return NextResponse.json(
        { error: 'searchTerm and resultCount are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const searchTermLower = searchTerm.trim().toLowerCase();

    // Trouver la recherche la plus récente pour ce terme (dans les 5 dernières minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: recentSearch, error: findError } = await supabase
      .from('search_analytics')
      .select('id')
      .eq('search_term', searchTermLower)
      .gte('timestamp', fiveMinutesAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('Erreur recherche search analytics:', findError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (recentSearch) {
      // Mettre à jour la recherche trouvée
      const updateData: any = { result_count: resultCount };
      if (radius !== undefined) {
        updateData.search_radius = radius;
      }
      
      const { error: updateError } = await supabase
        .from('search_analytics')
        .update(updateData)
        .eq('id', recentSearch.id);

      if (updateError) {
        console.error('Erreur mise à jour search analytics:', updateError);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, updated: true });
    } else {
      // Aucune recherche récente trouvée, créer une nouvelle entrée
      const { error: insertError } = await supabase
        .from('search_analytics')
        .insert({
          search_term: searchTermLower,
          result_count: resultCount,
          timestamp: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erreur enregistrement search analytics:', insertError);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error) {
    console.error('Search analytics update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      searchTerm,
      resultCount,
      clickedEstablishmentId,
      clickedEstablishmentName,
      userAgent,
      referrer,
      city,
      searchedCity,
      radius,
    } = body;

    // Validation des données requises
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'searchTerm is required' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour contourner RLS si nécessaire
    // Sinon utiliser le client normal (qui devrait fonctionner avec la politique publique)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let supabase;
    if (supabaseServiceKey && supabaseUrl) {
      // Utiliser le client admin pour garantir l'insertion
      supabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('🔑 [Search Track] Utilisation du client admin pour l\'insertion');
    } else {
      supabase = await createClient();
      console.log('👤 [Search Track] Utilisation du client normal');
    }

    const searchData: any = {
      search_term: searchTerm.trim().toLowerCase(),
      result_count: resultCount || 0,
      clicked_establishment_id: clickedEstablishmentId || null,
      clicked_establishment_name: clickedEstablishmentName || null,
      user_agent: userAgent || request.headers.get('user-agent') || null,
      referrer: referrer || request.headers.get('referer') || null,
      city: city || null,
      searched_city: searchedCity || null,
      timestamp: new Date().toISOString()
    };

    // Ajouter le rayon si fourni (nécessite une migration pour ajouter la colonne)
    if (radius !== undefined) {
      searchData.search_radius = radius;
    }

    console.log('📝 [Search Track] Enregistrement recherche:', {
      searchTerm: searchData.search_term,
      resultCount: searchData.result_count,
      searchedCity: searchData.searched_city
    });

    // Enregistrer la recherche
    const { data: insertedData, error: insertError } = await supabase
      .from('search_analytics')
      .insert(searchData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [Search Track] Erreur enregistrement search analytics:', insertError);
      console.error('   - Code:', insertError.code);
      console.error('   - Message:', insertError.message);
      console.error('   - Details:', insertError.details);
      console.error('   - Hint:', insertError.hint);
      return NextResponse.json(
        { 
          error: 'Internal server error',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('✅ [Search Track] Recherche enregistrée avec succès:', insertedData?.id);
    return NextResponse.json({ success: true, id: insertedData?.id });
  } catch (error) {
    console.error('Search tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH pour mettre à jour clicked_establishment_id d'une recherche récente
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm, clickedEstablishmentId, clickedEstablishmentName } = body;

    if (!searchTerm || !clickedEstablishmentId || !clickedEstablishmentName) {
      return NextResponse.json(
        { error: 'searchTerm, clickedEstablishmentId and clickedEstablishmentName are required' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour contourner RLS si nécessaire
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let supabase;
    if (supabaseServiceKey && supabaseUrl) {
      supabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      supabase = await createClient();
    }

    const searchTermLower = searchTerm.trim().toLowerCase();

    // Trouver la recherche la plus récente pour ce terme (dans les 30 dernières minutes)
    // On utilise une fenêtre plus large car l'utilisateur peut cliquer après avoir vu les résultats
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const { data: recentSearch, error: findError } = await supabase
      .from('search_analytics')
      .select('id, clicked_establishment_id, result_count')
      .eq('search_term', searchTermLower)
      .gte('timestamp', thirtyMinutesAgo.toISOString())
      .is('clicked_establishment_id', null) // Ne mettre à jour que si pas déjà cliqué
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('❌ [Search Track PATCH] Erreur recherche search analytics:', findError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (recentSearch) {
      // Vérifier la cohérence : si result_count = 0, on ne devrait pas pouvoir cliquer
      // Mais on enregistre quand même le clic (peut-être que result_count n'a pas encore été mis à jour)
      // On va forcer result_count à au moins 1 si un clic est enregistré
      const updateData: any = {
        clicked_establishment_id: clickedEstablishmentId,
        clicked_establishment_name: clickedEstablishmentName
      };
      
      // Si result_count = 0 mais qu'on enregistre un clic, mettre à jour result_count à 1
      // (car on ne peut pas cliquer sans résultats)
      if ((recentSearch.result_count || 0) === 0) {
        updateData.result_count = 1;
        console.log('⚠️ [Search Track PATCH] Correction: result_count était 0 mais un clic existe, mise à jour à 1');
      }
      
      // Mettre à jour la recherche trouvée
      const { error: updateError } = await supabase
        .from('search_analytics')
        .update(updateData)
        .eq('id', recentSearch.id);

      if (updateError) {
        console.error('❌ [Search Track PATCH] Erreur mise à jour search analytics:', updateError);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      console.log('✅ [Search Track PATCH] Clic enregistré pour recherche:', {
        searchTerm: searchTermLower,
        establishmentId: clickedEstablishmentId,
        establishmentName: clickedEstablishmentName
      });

      return NextResponse.json({ success: true, updated: true });
    } else {
      // Aucune recherche récente trouvée, c'est OK (peut-être que la recherche a été faite il y a plus de 30 minutes)
      console.log('⚠️ [Search Track PATCH] Aucune recherche récente trouvée pour:', searchTermLower);
      return NextResponse.json({ success: false, message: 'No recent search found' });
    }
  } catch (error) {
    console.error('❌ [Search Track PATCH] Search analytics update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

