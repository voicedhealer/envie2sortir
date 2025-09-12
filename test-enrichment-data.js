// Test pour voir les données exactes retournées par l'enrichissement
const testUrl = "https://maps.app.goo.gl/z9BUXstYFcfZtiuE7";

async function testEnrichmentData() {
  console.log('🧪 Test des données d\'enrichissement...');
  
  try {
    // Étape 1: Résolution URL
    console.log('\n1️⃣ Résolution URL...');
    const resolveResponse = await fetch('http://localhost:3001/api/resolve-google-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    const resolveData = await resolveResponse.json();
    console.log('✅ URL résolue:', resolveData.success);
    console.log('📌 Place ID:', resolveData.placeId);
    console.log('🏢 Nom:', resolveData.placeName);
    
    // Étape 2: API Google Places avec tous les champs
    console.log('\n2️⃣ Appel API Google Places complet...');
    const placesResponse = await fetch('http://localhost:3001/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: resolveData.placeId,
        placeName: resolveData.placeName,
        fields: 'name,types,price_level,rating,user_ratings_total,business_status,opening_hours,website,formatted_phone_number,reviews,photos,formatted_address,vicinity,geometry',
        apiKey: 'AIzaSyBRt1PnF9d0tSWKUsmyx8FiwcIIJEntJw0'
      })
    });
    
    const placesData = await placesResponse.json();
    console.log('✅ API Google Places:', placesData.status);
    
    if (placesData.status === 'OK') {
      const result = placesData.result;
      
      console.log('\n📊 DONNÉES DÉTAILLÉES:');
      console.log('🏢 Nom:', result.name);
      console.log('📍 Adresse complète:', result.formatted_address || result.vicinity);
      console.log('📞 Téléphone:', result.formatted_phone_number);
      console.log('🌐 Site web:', result.website);
      console.log('⭐ Note:', result.rating, '(' + result.user_ratings_total + ' avis)');
      console.log('💰 Niveau prix:', result.price_level);
      console.log('🏷️ Types:', result.types);
      
      console.log('\n🕐 HORAIRES D\'OUVERTURE:');
      if (result.opening_hours) {
        console.log('📋 Structure opening_hours:', Object.keys(result.opening_hours));
        if (result.opening_hours.weekday_text) {
          console.log('📅 Texte des jours:', result.opening_hours.weekday_text);
        }
        if (result.opening_hours.periods) {
          console.log('⏰ Périodes:', result.opening_hours.periods);
        }
      } else {
        console.log('❌ Pas d\'horaires disponibles');
      }
      
      console.log('\n📝 AVIS (premiers 2):');
      if (result.reviews && result.reviews.length > 0) {
        result.reviews.slice(0, 2).forEach((review, i) => {
          console.log(`Avis ${i + 1}: "${review.text?.substring(0, 100)}..." (${review.rating}⭐)`);
        });
      } else {
        console.log('❌ Pas d\'avis disponibles');
      }
      
    } else {
      console.error('❌ Erreur API:', placesData.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEnrichmentData();
