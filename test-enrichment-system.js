// Script de test pour le système d'enrichissement
// Ce script teste les différentes APIs et fonctionnalités

const testUrls = [
  // Restaurant français à Paris
  'https://maps.google.com/maps/place/Restaurant+Le+Central/@48.8566,2.3522,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!8m2!3d48.8566!4d2.3522!16s%2Fg%2F11c0w8r0x0',
  
  // Bar parisien
  'https://maps.google.com/maps/place/Le+Comptoir+du+Relais/@48.8566,2.3522,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!8m2!3d48.8566!4d2.3522!16s%2Fg%2F11c0w8r0x0',
  
  // Format court Google Maps
  'https://goo.gl/maps/ABC123',
  
  // Format avec place_id
  'https://maps.google.com/maps/place/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4'
];

async function testUrlResolution() {
  console.log('🧪 Test de résolution d\'URLs Google Maps...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`📝 Test URL: ${url}`);
      
      const response = await fetch('http://localhost:3000/api/resolve-google-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Place ID extrait: ${data.placeId}`);
      } else {
        console.log(`❌ Erreur: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
    }
    
    console.log('---');
  }
}

async function testGooglePlacesProxy() {
  console.log('\n🧪 Test du proxy Google Places...\n');
  
  // Place ID d'exemple (restaurant parisien)
  const testPlaceId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
  
  try {
    const response = await fetch('http://localhost:3000/api/google-places-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId: testPlaceId,
        fields: 'name,types,price_level,rating,user_ratings_total,opening_hours,website,formatted_phone_number,reviews,photos,formatted_address',
        apiKey: 'YOUR_API_KEY_HERE' // À remplacer par votre vraie clé
      })
    });
    
    const data = await response.json();
    
    if (data.result) {
      console.log('✅ Données Google Places récupérées:');
      console.log(`   Nom: ${data.result.name}`);
      console.log(`   Types: ${data.result.types?.join(', ')}`);
      console.log(`   Note: ${data.result.rating}/5`);
      console.log(`   Prix: ${data.result.price_level || 'Non spécifié'}`);
      console.log(`   Adresse: ${data.result.formatted_address}`);
    } else {
      console.log('❌ Erreur:', data.error || 'Données non trouvées');
    }
    
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
  }
}

async function testEnrichmentSystem() {
  console.log('\n🧪 Test du système d\'enrichissement complet...\n');
  
  const testUrl = testUrls[0]; // Premier URL de test
  
  try {
    // Simuler l'appel au système d'enrichissement
    console.log(`📝 Test d'enrichissement avec: ${testUrl}`);
    
    // 1. Résolution de l'URL
    const resolveResponse = await fetch('http://localhost:3000/api/resolve-google-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    const resolveData = await resolveResponse.json();
    
    if (!resolveData.success) {
      console.log('❌ Impossible de résoudre l\'URL');
      return;
    }
    
    console.log(`✅ Place ID résolu: ${resolveData.placeId}`);
    
    // 2. Récupération des données Google Places
    const placesResponse = await fetch('http://localhost:3000/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: resolveData.placeId,
        fields: 'name,types,price_level,rating,user_ratings_total,opening_hours,website,formatted_phone_number,reviews,photos,formatted_address',
        apiKey: 'YOUR_API_KEY_HERE' // À remplacer par votre vraie clé
      })
    });
    
    const placesData = await placesResponse.json();
    
    if (placesData.result) {
      console.log('✅ Données Google Places récupérées');
      
      // 3. Simulation de la génération de tags "envie"
      const mockEnrichmentData = {
        name: placesData.result.name,
        establishmentType: 'restaurant', // Simulé
        priceLevel: placesData.result.price_level || 2,
        rating: placesData.result.rating || 0,
        address: placesData.result.formatted_address,
        phone: placesData.result.formatted_phone_number,
        website: placesData.result.website,
        envieTags: [
          'Envie de bien manger',
          'Envie de sortir dîner',
          'Envie de découvrir',
          'Envie de français',
          'Envie de tradition'
        ],
        specialties: ['Envie de moules frites', 'Envie de coq au vin'],
        atmosphere: ['Envie de romantique', 'Envie de familial'],
        accessibility: ['Accessible PMR'],
        googlePlaceId: resolveData.placeId,
        googleBusinessUrl: testUrl,
        googleRating: placesData.result.rating || 0,
        googleReviewCount: placesData.result.user_ratings_total || 0
      };
      
      console.log('🎯 Données d\'enrichissement générées:');
      console.log(`   Nom: ${mockEnrichmentData.name}`);
      console.log(`   Type: ${mockEnrichmentData.establishmentType}`);
      console.log(`   Tags "envie": ${mockEnrichmentData.envieTags.join(', ')}`);
      console.log(`   Spécialités: ${mockEnrichmentData.specialties.join(', ')}`);
      
    } else {
      console.log('❌ Erreur lors de la récupération des données Google Places');
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Démarrage des tests du système d\'enrichissement\n');
  console.log('⚠️  Assurez-vous que le serveur Next.js est démarré sur localhost:3000');
  console.log('⚠️  Configurez votre clé API Google Places dans le fichier .env.local\n');
  
  await testUrlResolution();
  await testGooglePlacesProxy();
  await testEnrichmentSystem();
  
  console.log('\n✅ Tests terminés !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Configurez votre clé API Google Places');
  console.log('2. Testez l\'interface utilisateur dans le formulaire d\'établissement');
  console.log('3. Vérifiez la génération des tags "envie"');
  console.log('4. Testez la personnalisation des tags');
}

// Exécuter les tests si le script est appelé directement
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = {
  testUrlResolution,
  testGooglePlacesProxy,
  testEnrichmentSystem,
  runTests
};
