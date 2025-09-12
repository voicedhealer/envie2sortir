// Test de debugging pour l'enrichissement
async function testEnrichmentDebug() {
  console.log('🔍 Test de debugging de l\'enrichissement...');
  
  const testUrl = "https://www.google.com/maps/place/Restaurant+Test/@48.8566,2.3522,17z";
  
  try {
    // Test étape 1: Résolution URL
    console.log('\n1️⃣ Test résolution URL...');
    const resolveResponse = await fetch('http://localhost:3001/api/resolve-google-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    console.log('Status résolution:', resolveResponse.status);
    
    if (!resolveResponse.ok) {
      const errorText = await resolveResponse.text();
      console.error('❌ Erreur résolution:', errorText);
      return;
    }
    
    const resolveData = await resolveResponse.json();
    console.log('✅ Données résolution:', resolveData);
    
    if (!resolveData.success || !resolveData.placeId) {
      console.error('❌ Données invalides:', resolveData);
      return;
    }
    
    // Test étape 2: Appel Google Places (simulation sans vraie clé API)
    console.log('\n2️⃣ Test Google Places (simulation)...');
    console.log('Place ID à utiliser:', resolveData.placeId);
    
    // Si c'est des coordonnées
    if (resolveData.placeId.includes(',')) {
      console.log('📍 Type: Coordonnées - utiliserait l\'API Nearby Search');
    } else {
      console.log('🏢 Type: Place ID - utiliserait l\'API Place Details');
    }
    
    console.log('✅ Test réussi ! Le système devrait fonctionner.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testEnrichmentDebug();
