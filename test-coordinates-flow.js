const { PrismaClient } = require('@prisma/client');

async function testCoordinatesFlow() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Test du flux complet des coordonnées GPS...\n');
    
    // 1. Vérifier que tous les établissements ont des coordonnées
    console.log('1️⃣ Vérification des coordonnées dans la base de données...');
    const establishments = await prisma.establishment.findMany({
      where: {
        status: 'approved'
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        latitude: true,
        longitude: true
      }
    });
    
    console.log(`   📊 ${establishments.length} établissement(s) approuvé(s) trouvé(s)`);
    
    const withCoords = establishments.filter(est => est.latitude && est.longitude);
    const withoutCoords = establishments.filter(est => !est.latitude || !est.longitude);
    
    console.log(`   ✅ Avec coordonnées: ${withCoords.length}`);
    console.log(`   ❌ Sans coordonnées: ${withoutCoords.length}`);
    
    if (withoutCoords.length > 0) {
      console.log('\n   📍 Établissements sans coordonnées:');
      withoutCoords.forEach(est => {
        console.log(`      - ${est.name} (${est.city || 'Ville inconnue'})`);
      });
    }
    
    // 2. Vérifier spécifiquement Dream Away VR
    console.log('\n2️⃣ Vérification de Dream Away VR...');
    const dreamAwayVR = establishments.find(est => 
      est.name.toLowerCase().includes('dream')
    );
    
    if (dreamAwayVR) {
      console.log(`   🎮 Trouvé: ${dreamAwayVR.name}`);
      console.log(`   📍 Adresse: ${dreamAwayVR.address}`);
      console.log(`   🏙️ Ville: ${dreamAwayVR.city || 'Non définie'}`);
      console.log(`   🗺️ Coordonnées: ${dreamAwayVR.latitude || 'N/A'}, ${dreamAwayVR.longitude || 'N/A'}`);
      
      if (dreamAwayVR.latitude && dreamAwayVR.longitude) {
        console.log('   ✅ Dream Away VR a des coordonnées GPS - la mini carte devrait s\'afficher');
      } else {
        console.log('   ❌ Dream Away VR n\'a pas de coordonnées GPS - la mini carte ne s\'affichera pas');
      }
    } else {
      console.log('   ❌ Dream Away VR non trouvé');
    }
    
    // 3. Vérifier la qualité des coordonnées
    console.log('\n3️⃣ Vérification de la qualité des coordonnées...');
    let validCoords = 0;
    let invalidCoords = 0;
    
    withCoords.forEach(est => {
      const lat = est.latitude;
      const lng = est.longitude;
      
      // Vérifier si les coordonnées sont dans les limites de la France
      const isInFrance = lat >= 41.0 && lat <= 51.5 && lng >= -5.5 && lng <= 9.5;
      
      if (isInFrance) {
        validCoords++;
      } else {
        invalidCoords++;
        console.log(`   ⚠️ Coordonnées suspectes: ${est.name} - ${lat}, ${lng}`);
      }
    });
    
    console.log(`   ✅ Coordonnées valides: ${validCoords}`);
    console.log(`   ⚠️ Coordonnées suspectes: ${invalidCoords}`);
    
    // 4. Résumé final
    console.log('\n4️⃣ Résumé final...');
    if (withoutCoords.length === 0) {
      console.log('   ✅ Tous les établissements ont des coordonnées GPS');
      console.log('   ✅ La mini carte devrait s\'afficher sur toutes les pages publiques');
      console.log('   ✅ La recherche géographique devrait fonctionner correctement');
    } else {
      console.log(`   ⚠️ ${withoutCoords.length} établissement(s) sans coordonnées GPS`);
      console.log('   ⚠️ Ces établissements n\'auront pas de mini carte');
      console.log('   ⚠️ Ces établissements ne seront pas trouvés par la recherche géographique');
    }
    
    // 5. Test de l'API de géocodage
    console.log('\n5️⃣ Test de l\'API de géocodage...');
    try {
      const testAddress = '24 Bd de Brosses 1er étage, 21000 Dijon';
      const response = await fetch(`http://localhost:3000/api/geocode?address=${encodeURIComponent(testAddress)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`   ✅ API de géocodage fonctionnelle`);
        console.log(`   📍 Test: ${testAddress} → ${result.data.latitude}, ${result.data.longitude}`);
      } else {
        console.log(`   ❌ API de géocodage en panne: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur de connexion à l'API: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCoordinatesFlow();
