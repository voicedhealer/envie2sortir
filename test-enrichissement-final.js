// Test final du système d'enrichissement avec l'URL utilisateur
const testUrl = "https://maps.app.goo.gl/z9BUXstYFcfZtiuE7";

async function testEnrichissementFinal() {
  console.log('🎯 Test final du système d\'enrichissement...');
  console.log('📋 URL:', testUrl);
  
  try {
    // Test étape 1: Résolution URL
    console.log('\n1️⃣ Résolution URL raccourcie...');
    const resolveResponse = await fetch('http://localhost:3001/api/resolve-google-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    const resolveData = await resolveResponse.json();
    console.log('✅ URL résolue:', resolveData.success ? 'OUI' : 'NON');
    console.log('📌 Place ID:', resolveData.placeId);
    console.log('🏢 Nom du lieu:', resolveData.placeName);
    
    if (!resolveData.success) {
      throw new Error('Échec résolution URL');
    }
    
    // Test étape 2: API Google Places
    console.log('\n2️⃣ Appel API Google Places...');
    const placesResponse = await fetch('http://localhost:3001/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: resolveData.placeId,
        placeName: resolveData.placeName,
        fields: 'name,rating,user_ratings_total,types,price_level,vicinity,geometry,photos',
        apiKey: 'AIzaSyBRt1PnF9d0tSWKUsmyx8FiwcIIJEntJw0'
      })
    });
    
    const placesData = await placesResponse.json();
    console.log('✅ API Google Places:', placesData.status === 'OK' ? 'SUCCÈS' : 'ÉCHEC');
    
    if (placesData.status === 'OK') {
      const result = placesData.result;
      console.log('📊 Données récupérées:');
      console.log('   - Nom:', result.name);
      console.log('   - Note:', result.rating + '/5 (' + result.user_ratings_total + ' avis)');
      console.log('   - Type:', result.types.join(', '));
      console.log('   - Prix:', result.price_level ? 'Niveau ' + result.price_level : 'Non spécifié');
      console.log('   - Adresse:', result.vicinity);
      console.log('   - Photos:', result.photos ? result.photos.length + ' disponibles' : 'Aucune');
      
      console.log('\n🎉 SUCCÈS TOTAL ! Le système d\'enrichissement fonctionne parfaitement !');
      console.log('\n📝 Vous pouvez maintenant:');
      console.log('   ✅ Utiliser votre URL dans l\'interface');
      console.log('   ✅ Tester sur http://localhost:3001/demo-enrichment');
      console.log('   ✅ Créer un établissement sur http://localhost:3001/etablissements/nouveau');
    } else {
      console.error('❌ Erreur API Google Places:', placesData.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEnrichissementFinal();
