// Test du système de géocodage
async function testGeocoding() {
  console.log('🧪 Test du système de géocodage...\n');
  
  const testAddresses = [
    '6 Rue Bannelier, 21000 Dijon',
    '8 Pl. Raspail, 69007 Lyon',
    '123 Rue de la Paix, 75001 Paris'
  ];
  
  for (const address of testAddresses) {
    try {
      console.log(`📍 Test: ${address}`);
      
      const response = await fetch(`http://localhost:3001/api/geocode?address=${encodeURIComponent(address)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`   ✅ Coordonnées: ${result.data.latitude}, ${result.data.longitude}`);
        
        // Vérifier si les coordonnées semblent correctes
        const lat = result.data.latitude;
        const lng = result.data.longitude;
        
        if (address.includes('Dijon')) {
          const isDijon = lat > 47.2 && lat < 47.4 && lng > 4.9 && lng < 5.2;
          console.log(`   ${isDijon ? '✅' : '❌'} Coordonnées Dijon: ${isDijon ? 'Correctes' : 'Incorrectes'}`);
        } else if (address.includes('Lyon')) {
          const isLyon = lat > 45.6 && lat < 45.8 && lng > 4.7 && lng < 4.9;
          console.log(`   ${isLyon ? '✅' : '❌'} Coordonnées Lyon: ${isLyon ? 'Correctes' : 'Incorrectes'}`);
        } else if (address.includes('Paris')) {
          const isParis = lat > 48.8 && lat < 48.9 && lng > 2.2 && lng < 2.4;
          console.log(`   ${isParis ? '✅' : '❌'} Coordonnées Paris: ${isParis ? 'Correctes' : 'Incorrectes'}`);
        }
      } else {
        console.log(`   ❌ Erreur: ${result.error || 'Inconnue'}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erreur de connexion: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🏁 Test terminé');
}

// Attendre que le serveur soit prêt
setTimeout(testGeocoding, 2000);
