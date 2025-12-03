/**
 * Script de test pour vérifier que le tracking des recherches fonctionne
 * 
 * Usage: tsx scripts/test-search-tracking.ts
 */

async function testSearchTracking() {
  console.log('🧪 Test du tracking des recherches...\n');

  // Test 1: Vérifier que l'API répond
  console.log('📡 Test 1: Appel de l\'API /api/analytics/search/track');
  try {
    const testSearchTerm = `test-tracking-${Date.now()}`;
    const response = await fetch('http://localhost:3000/api/analytics/search/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm: testSearchTerm,
        resultCount: 5,
        searchedCity: 'Paris',
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ API répond correctement');
      console.log('   - Recherche enregistrée:', testSearchTerm);
    } else {
      console.error('❌ Erreur API:', data.error || response.statusText);
      console.error('   - Status:', response.status);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'appel API:', error.message);
    console.error('   💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  }

  console.log('\n💡 Pour tester manuellement:');
  console.log('   1. Ouvrez le site sur http://localhost:3000');
  console.log('   2. Effectuez une recherche avec "Envie de..."');
  console.log('   3. Ouvrez la console du navigateur (F12)');
  console.log('   4. Vérifiez qu\'il n\'y a pas d\'erreur dans la console');
  console.log('   5. Vérifiez dans Supabase que la recherche est enregistrée');
  console.log('\n📊 Pour vérifier dans Supabase:');
  console.log('   - Exécutez le script: scripts/check-search-analytics.sql');
}

testSearchTracking();

