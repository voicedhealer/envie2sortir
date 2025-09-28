const { PrismaClient } = require('@prisma/client');

async function checkBodegaCoordinates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🏢 Vérification des coordonnées de Bodega Les Halles Dijon...\n');
    
    // Récupérer l'établissement Bodega
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'Bodega'
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (establishment) {
      console.log('🏢 Établissement trouvé :');
      console.log(`   Nom: ${establishment.name}`);
      console.log(`   Adresse: ${establishment.address}`);
      console.log(`   Ville: ${establishment.city}`);
      console.log(`   Code postal: ${establishment.postalCode}`);
      console.log(`   Latitude: ${establishment.latitude}`);
      console.log(`   Longitude: ${establishment.longitude}`);
      console.log(`   Propriétaire: ${establishment.owner.firstName} ${establishment.owner.lastName}`);
      
      // Vérifier si les coordonnées correspondent à Dijon
      if (establishment.latitude && establishment.longitude) {
        console.log('\n📍 Vérification des coordonnées :');
        
        // Coordonnées approximatives de Dijon
        const dijonLat = 47.3220;
        const dijonLng = 5.0415;
        const tolerance = 0.1; // Tolérance de 0.1 degré (environ 11km)
        
        const latDiff = Math.abs(establishment.latitude - dijonLat);
        const lngDiff = Math.abs(establishment.longitude - dijonLng);
        
        console.log(`   Coordonnées actuelles: ${establishment.latitude}, ${establishment.longitude}`);
        console.log(`   Coordonnées Dijon: ${dijonLat}, ${dijonLng}`);
        console.log(`   Différence latitude: ${latDiff.toFixed(4)}`);
        console.log(`   Différence longitude: ${lngDiff.toFixed(4)}`);
        
        if (latDiff < tolerance && lngDiff < tolerance) {
          console.log('   ✅ Les coordonnées correspondent à Dijon');
        } else {
          console.log('   ❌ Les coordonnées ne correspondent PAS à Dijon');
          console.log('   🔧 Correction nécessaire');
        }
      } else {
        console.log('   ❌ Aucune coordonnée GPS définie');
      }
    } else {
      console.log('❌ Établissement Bodega non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBodegaCoordinates();
