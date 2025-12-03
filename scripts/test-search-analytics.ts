/**
 * Script de test pour vérifier que les recherches sont bien trackées
 * 
 * Usage: tsx scripts/test-search-analytics.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSearchAnalytics() {
  console.log('🔍 Test des analytics de recherche...\n');

  try {
    // 1. Vérifier les dernières recherches enregistrées
    console.log('📊 1. Dernières recherches enregistrées (10 dernières):');
    const { data: recentSearches, error: recentError } = await adminClient
      .from('search_analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Erreur:', recentError);
      return;
    }

    if (!recentSearches || recentSearches.length === 0) {
      console.log('⚠️  Aucune recherche enregistrée pour le moment');
      console.log('💡 Pour tester : effectuez une recherche sur le site avec la barre "Envie de..."\n');
    } else {
      console.log(`✅ ${recentSearches.length} recherche(s) trouvée(s):\n`);
      recentSearches.forEach((search, index) => {
        console.log(`   ${index + 1}. "${search.search_term}"`);
        console.log(`      - Date: ${new Date(search.timestamp).toLocaleString('fr-FR')}`);
        console.log(`      - Résultats: ${search.result_count}`);
        console.log(`      - Établissement cliqué: ${search.clicked_establishment_name || 'Aucun'}`);
        console.log(`      - Ville recherchée: ${search.searched_city || 'N/A'}`);
        console.log(`      - User Agent: ${search.user_agent ? (search.user_agent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop') : 'N/A'}`);
        console.log('');
      });
    }

    // 2. Statistiques globales
    console.log('📊 2. Statistiques globales (30 derniers jours):');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: last30Days, error: statsError } = await adminClient
      .from('search_analytics')
      .select('*')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (statsError) {
      console.error('❌ Erreur:', statsError);
      return;
    }

    const totalSearches = last30Days?.length || 0;
    const searchesWithClicks = last30Days?.filter(s => s.clicked_establishment_id).length || 0;
    const searchesWithoutResults = last30Days?.filter(s => s.result_count === 0).length || 0;
    const conversionRate = totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0;

    console.log(`   - Total recherches: ${totalSearches}`);
    console.log(`   - Recherches avec clics: ${searchesWithClicks}`);
    console.log(`   - Recherches sans résultats: ${searchesWithoutResults}`);
    console.log(`   - Taux de conversion: ${conversionRate.toFixed(1)}%\n`);

    // 3. Top 10 des termes de recherche
    console.log('📊 3. Top 10 des termes de recherche:');
    const searchTermsMap = new Map<string, number>();
    last30Days?.forEach(search => {
      const term = search.search_term?.toLowerCase().trim() || '';
      searchTermsMap.set(term, (searchTermsMap.get(term) || 0) + 1);
    });

    const topSearches = Array.from(searchTermsMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    if (topSearches.length === 0) {
      console.log('   ⚠️  Aucun terme de recherche trouvé\n');
    } else {
      topSearches.forEach(([term, count], index) => {
        console.log(`   ${index + 1}. "${term}" - ${count} fois`);
      });
      console.log('');
    }

    // 4. Test d'enregistrement d'une recherche de test
    console.log('📊 4. Test d\'enregistrement d\'une recherche de test:');
    const testSearchTerm = `test-${Date.now()}`;
    const { data: testInsert, error: testError } = await adminClient
      .from('search_analytics')
      .insert({
        search_term: testSearchTerm,
        result_count: 5,
        searched_city: 'Paris',
        user_agent: 'Test Script',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (testError) {
      console.error('   ❌ Erreur lors de l\'insertion de test:', testError);
    } else {
      console.log('   ✅ Recherche de test enregistrée avec succès');
      console.log(`      - ID: ${testInsert.id}`);
      console.log(`      - Terme: "${testInsert.search_term}"`);
      
      // Supprimer la recherche de test
      await adminClient
        .from('search_analytics')
        .delete()
        .eq('id', testInsert.id);
      console.log('   ✅ Recherche de test supprimée\n');
    }

    // 5. Vérification de la structure de la table
    console.log('📊 5. Vérification de la structure de la table:');
    if (recentSearches && recentSearches.length > 0) {
      const sample = recentSearches[0];
      const requiredFields = ['search_term', 'timestamp', 'result_count'];
      const optionalFields = ['clicked_establishment_id', 'clicked_establishment_name', 'user_agent', 'searched_city'];
      
      console.log('   Champs requis:');
      requiredFields.forEach(field => {
        const exists = field in sample;
        console.log(`      - ${field}: ${exists ? '✅' : '❌'}`);
      });
      
      console.log('   Champs optionnels présents:');
      optionalFields.forEach(field => {
        const exists = field in sample && sample[field as keyof typeof sample] !== null;
        console.log(`      - ${field}: ${exists ? '✅' : '⚠️  (null ou absent)'}`);
      });
      console.log('');
    }

    console.log('✅ Test terminé avec succès !');
    console.log('\n💡 Pour voir les résultats dans l\'admin:');
    console.log('   1. Allez sur /admin/recherches');
    console.log('   2. Vérifiez que vos recherches apparaissent dans le tableau');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

testSearchAnalytics();

