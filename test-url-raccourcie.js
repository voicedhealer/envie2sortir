// Test avec l'URL raccourcie de l'utilisateur
const testUrl = "https://maps.app.goo.gl/z9BUXstYFcfZtiuE7";

async function testUrlRaccourcie() {
  console.log('🧪 Test avec URL raccourcie Google Maps...');
  console.log('📋 URL:', testUrl);
  
  try {
    // Test résolution
    console.log('\n1️⃣ Test résolution URL raccourcie...');
    const resolveResponse = await fetch('http://localhost:3001/api/resolve-google-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    const resolveData = await resolveResponse.json();
    console.log('✅ Résolution réussie:', resolveData);
    
    if (resolveData.success) {
      console.log('\n🎉 Succès ! Votre URL raccourcie fonctionne maintenant !');
      console.log('📌 Place ID récupéré:', resolveData.placeId);
      console.log('\n📝 Vous pouvez maintenant:');
      console.log('   - Utiliser cette URL dans le formulaire d\'enrichissement');
      console.log('   - Tester sur http://localhost:3001/demo-enrichment');
      console.log('   - Utiliser dans http://localhost:3001/etablissements/nouveau');
    } else {
      console.error('❌ Échec:', resolveData.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testUrlRaccourcie();
