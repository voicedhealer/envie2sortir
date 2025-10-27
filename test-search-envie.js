// Script de test pour la recherche par envie

const testQueries = [
  {
    envie: "faire du karting",
    expectedType: "karting/loisir",
    description: "Recherche de karting - devrait retourner des pistes de kart"
  },
  {
    envie: "faire du kart et boire un verre",
    expectedType: "mixte",
    description: "Recherche mixte - karting puis bar"
  },
  {
    envie: "manger un poulet tandoori",
    expectedType: "restaurant",
    description: "Recherche de nourriture spécifique - indien"
  },
  {
    envie: "manger indien ce midi",
    expectedType: "restaurant",
    description: "Recherche de nourriture indienne"
  },
  {
    envie: "boire un cocktail en terrasse",
    expectedType: "bar/café",
    description: "Recherche de bar avec terrasse"
  },
  {
    envie: "pizzeria",
    expectedType: "restaurant",
    description: "Recherche simple de pizzeria"
  },
  {
    envie: "jouer au bowling",
    expectedType: "loisir/sport",
    description: "Recherche de bowling"
  },
  {
    envie: "regarder un film au cinéma",
    expectedType: "cinéma",
    description: "Recherche de cinéma"
  }
];

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testSearchQuery(query, expectedType, description) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 TEST: "${query}"`);
  console.log(`📝 Description: ${description}`);
  console.log(`🎯 Type attendu: ${expectedType}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const url = `${BASE_URL}/api/recherche/envie?envie=${encodeURIComponent(query)}&rayon=20&lat=47.322&lng=5.041`;
    console.log(`🌐 URL: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ ERREUR: ${data.error || 'Erreur inconnue'}`);
      return { query, success: false, results: [] };
    }

    console.log(`✅ ${data.total || 0} résultat(s) trouvé(s)\n`);

    if (data.results && data.results.length > 0) {
      console.log(`📊 TOP 5 RÉSULTATS:\n`);
      data.results.slice(0, 5).forEach((est, index) => {
        const score = est.score?.toFixed(1) || 'N/A';
        const thematicScore = est.thematicScore || 0;
        const distance = est.distance || 'N/A';
        const isOpen = est.isOpen ? '🟢 Ouvert' : '🔴 Fermé';
        
        console.log(`  ${index + 1}. ${est.name}`);
        console.log(`     📍 Distance: ${distance}km | Score: ${score} (thé: ${thematicScore}) | ${isOpen}`);
        
        if (est.activities && est.activities.length > 0) {
          console.log(`     🎯 Activités: ${est.activities.join(', ')}`);
        }
        
        if (est.matchedTags && est.matchedTags.length > 0) {
          console.log(`     🏷️  Tags: ${est.matchedTags.join(', ')}`);
        }
        
        console.log('');
      });

      // Analyse de pertinence
      const relevantResults = data.results.filter(est => est.thematicScore > 0);
      const irrelevantResults = data.results.filter(est => est.thematicScore === 0);
      
      console.log(`\n📈 ANALYSE:`);
      console.log(`   ✅ Pertinents: ${relevantResults.length}`);
      console.log(`   ❌ Non pertinents: ${irrelevantResults.length}`);
      
      if (irrelevantResults.length > 0) {
        console.log(`\n⚠️  RÉSULTATS NON PERTINENTS:`);
        irrelevantResults.forEach(est => {
          console.log(`   - ${est.name} (activités: ${est.activities?.join(', ') || 'aucune'})`);
        });
      }

      return { 
        query, 
        success: true, 
        results: data.results,
        relevantCount: relevantResults.length,
        totalCount: data.results.length
      };
    } else {
      console.log(`⚠️  Aucun résultat trouvé`);
      return { query, success: true, results: [], relevantCount: 0, totalCount: 0 };
    }

  } catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
    return { query, success: false, results: [] };
  }
}

async function runAllTests() {
  console.log(`\n${'#'.repeat(80)}`);
  console.log(`   TEST DE LA RECHERCHE PAR ENVIE - ENVIE2SORTIR`);
  console.log(`${'#'.repeat(80)}\n`);
  console.log(`🌐 URL de base: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}\n`);

  const results = [];

  for (const test of testQueries) {
    const result = await testSearchQuery(test.envie, test.expectedType, test.description);
    results.push(result);
    
    // Pause entre les tests pour ne pas surcharger le serveur
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé final
  console.log(`\n${'#'.repeat(80)}`);
  console.log(`   RÉSUMÉ DES TESTS`);
  console.log(`${'#'.repeat(80)}\n`);

  let totalTests = 0;
  let successfulTests = 0;
  let totalResults = 0;
  let totalRelevant = 0;

  results.forEach(result => {
    totalTests++;
    if (result.success) successfulTests++;
    if (result.totalCount) totalResults += result.totalCount;
    if (result.relevantCount) totalRelevant += result.relevantCount;
    
    const pertinence = result.totalCount > 0 
      ? ((result.relevantCount / result.totalCount) * 100).toFixed(1)
      : '0';
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} "${result.query}" → ${result.totalCount} résultat(s), ${result.relevantCount} pertinent(s) (${pertinence}%)`);
  });

  console.log(`\n📊 STATISTIQUES GLOBALES:`);
  console.log(`   Tests exécutés: ${totalTests}`);
  console.log(`   Tests réussis: ${successfulTests}`);
  console.log(`   Résultats totaux: ${totalResults}`);
  console.log(`   Résultats pertinents: ${totalRelevant}`);
  
  if (totalResults > 0) {
    const pertinenceGlobal = ((totalRelevant / totalResults) * 100).toFixed(1);
    console.log(`   Taux de pertinence global: ${pertinenceGlobal}%`);
  }

  console.log(`\n${'#'.repeat(80)}\n`);
}

// Démarrer les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
