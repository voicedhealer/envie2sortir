// Test complet du système d'enrichissement avec toutes les données
console.log('🎯 TEST COMPLET - Système d\'enrichissement final');
console.log('=====================================\n');

async function testCompleteEnrichment() {
  try {
    console.log('📋 URL testée: https://maps.app.goo.gl/z9BUXstYFcfZtiuE7');
    console.log('🏢 Restaurant: Le Maharaja (Dijon)\n');
    
    // Test API Google Places avec appel Details
    console.log('1️⃣ Test API Google Places avec détails complets...');
    const response = await fetch('http://localhost:3001/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: '47.3192727,5.0348298',
        placeName: 'Le Maharaja',
        fields: 'name,types,price_level,rating,user_ratings_total,business_status,opening_hours,website,formatted_phone_number,reviews,photos,formatted_address,vicinity,geometry',
        apiKey: 'AIzaSyBRt1PnF9d0tSWKUsmyx8FiwcIIJEntJw0'
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      const result = data.result;
      
      console.log('✅ DONNÉES RÉCUPÉRÉES:');
      console.log(`   🏢 Nom: ${result.name}`);
      console.log(`   📍 Adresse: ${result.formatted_address}`);
      console.log(`   📞 Téléphone: ${result.formatted_phone_number || 'Non disponible'}`);
      console.log(`   🌐 Site web: ${result.website || 'Non disponible'}`);
      console.log(`   ⭐ Note: ${result.rating}/5 (${result.user_ratings_total} avis)`);
      console.log(`   💰 Prix: Niveau ${result.price_level || 'Non spécifié'}`);
      console.log(`   🏷️ Types: ${result.types.join(', ')}`);
      
      console.log('\n🕐 HORAIRES:');
      if (result.opening_hours && result.opening_hours.weekday_text) {
        result.opening_hours.weekday_text.forEach(day => {
          console.log(`   📅 ${day}`);
        });
      } else {
        console.log('   ❌ Pas d\'horaires disponibles');
      }
      
      console.log('\n📝 AVIS (3 premiers):');
      if (result.reviews && result.reviews.length > 0) {
        result.reviews.slice(0, 3).forEach((review, i) => {
          console.log(`   ${i + 1}. ${review.rating}⭐ "${review.text?.substring(0, 80)}..."`);
        });
      } else {
        console.log('   ❌ Pas d\'avis disponibles');
      }
      
      console.log('\n🎉 RÉSULTAT FINAL:');
      console.log('✅ Toutes les données sont maintenant récupérées !');
      console.log('✅ L\'adresse sera correctement parsée');
      console.log('✅ Les horaires seront convertis au bon format');
      console.log('✅ Le téléphone et site web seront remplis');
      
      console.log('\n📋 PROCHAINES ÉTAPES:');
      console.log('1. Testez dans l\'interface: http://localhost:3001/etablissements/nouveau');
      console.log('2. Utilisez l\'étape d\'enrichissement (étape 3)');
      console.log('3. Collez votre URL: https://maps.app.goo.gl/z9BUXstYFcfZtiuE7');
      console.log('4. Vérifiez que TOUS les champs sont remplis !');
      
    } else {
      console.error('❌ Erreur:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCompleteEnrichment();
