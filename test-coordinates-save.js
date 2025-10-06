const { PrismaClient } = require('@prisma/client');

async function testCoordinatesSave() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Test de sauvegarde des coordonnées GPS...\n');
    
    // 1. Tester l'API de géocodage
    console.log('1️⃣ Test de l\'API de géocodage...');
    const testAddress = '6 Rue Bannelier, 21000 Dijon';
    
    try {
      const response = await fetch(`http://localhost:3000/api/geocode?address=${encodeURIComponent(testAddress)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`   ✅ Géocodage réussi: ${result.data.latitude}, ${result.data.longitude}`);
        
        // 2. Vérifier les établissements existants
        console.log('\n2️⃣ Vérification des établissements existants...');
        const establishments = await prisma.establishment.findMany({
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
            status: true
          }
        });
        
        console.log(`   📊 ${establishments.length} établissement(s) trouvé(s)`);
        
        const establishmentsWithCoords = establishments.filter(est => est.latitude && est.longitude);
        const establishmentsWithoutCoords = establishments.filter(est => !est.latitude || !est.longitude);
        
        console.log(`   ✅ Avec coordonnées: ${establishmentsWithCoords.length}`);
        console.log(`   ❌ Sans coordonnées: ${establishmentsWithoutCoords.length}`);
        
        // Afficher les établissements sans coordonnées
        if (establishmentsWithoutCoords.length > 0) {
          console.log('\n   📍 Établissements sans coordonnées:');
          establishmentsWithoutCoords.forEach(est => {
            console.log(`      - ${est.name} (${est.city || 'Ville inconnue'}) - ${est.address}`);
          });
        }
        
        // 3. Tester la mise à jour des coordonnées pour un établissement sans coordonnées
        if (establishmentsWithoutCoords.length > 0) {
          console.log('\n3️⃣ Test de mise à jour des coordonnées...');
          const testEstablishment = establishmentsWithoutCoords[0];
          
          console.log(`   🎯 Test sur: ${testEstablishment.name}`);
          console.log(`   📍 Adresse: ${testEstablishment.address}`);
          
          // Mettre à jour avec les coordonnées de test
          const updateResult = await prisma.establishment.update({
            where: { id: testEstablishment.id },
            data: {
              latitude: result.data.latitude,
              longitude: result.data.longitude
            }
          });
          
          console.log(`   ✅ Coordonnées mises à jour: ${updateResult.latitude}, ${updateResult.longitude}`);
          
          // Vérifier que la mise à jour a fonctionné
          const verifyResult = await prisma.establishment.findUnique({
            where: { id: testEstablishment.id },
            select: { latitude: true, longitude: true }
          });
          
          console.log(`   🔍 Vérification: ${verifyResult.latitude}, ${verifyResult.longitude}`);
        }
        
        // 4. Rechercher spécifiquement "Dream Away VR"
        console.log('\n4️⃣ Recherche de "Dream Away VR"...');
        const dreamAwayVR = await prisma.establishment.findFirst({
          where: {
            name: {
              contains: 'dream',
              mode: 'insensitive'
            }
          },
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
            status: true
          }
        });
        
        if (dreamAwayVR) {
          console.log(`   🎮 Trouvé: ${dreamAwayVR.name}`);
          console.log(`   📍 Adresse: ${dreamAwayVR.address}`);
          console.log(`   🏙️ Ville: ${dreamAwayVR.city || 'Non définie'}`);
          console.log(`   📊 Statut: ${dreamAwayVR.status}`);
          console.log(`   🗺️ Coordonnées: ${dreamAwayVR.latitude || 'N/A'}, ${dreamAwayVR.longitude || 'N/A'}`);
          
          if (!dreamAwayVR.latitude || !dreamAwayVR.longitude) {
            console.log('\n   🔧 Tentative de géocodage pour Dream Away VR...');
            
            // Géocoder l'adresse de Dream Away VR
            const dreamAwayResponse = await fetch(`http://localhost:3000/api/geocode?address=${encodeURIComponent(dreamAwayVR.address)}`);
            const dreamAwayResult = await dreamAwayResponse.json();
            
            if (dreamAwayResult.success && dreamAwayResult.data) {
              console.log(`   ✅ Coordonnées trouvées: ${dreamAwayResult.data.latitude}, ${dreamAwayResult.data.longitude}`);
              
              // Mettre à jour Dream Away VR
              await prisma.establishment.update({
                where: { id: dreamAwayVR.id },
                data: {
                  latitude: dreamAwayResult.data.latitude,
                  longitude: dreamAwayResult.data.longitude
                }
              });
              
              console.log('   ✅ Coordonnées sauvegardées pour Dream Away VR');
            } else {
              console.log(`   ❌ Impossible de géocoder: ${dreamAwayResult.error}`);
            }
          }
        } else {
          console.log('   ❌ Dream Away VR non trouvé');
        }
        
      } else {
        console.log(`   ❌ Géocodage échoué: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur de connexion: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCoordinatesSave();
