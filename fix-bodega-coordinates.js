const { PrismaClient } = require('@prisma/client');

async function fixBodegaCoordinates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Correction des coordonnées de Bodega Les Halles Dijon...\n');
    
    // Coordonnées correctes pour Dijon (centre-ville)
    const dijonLat = 47.3220;
    const dijonLng = 5.0415;
    
    console.log(`📍 Nouvelles coordonnées Dijon: ${dijonLat}, ${dijonLng}`);
    
    // Mettre à jour l'établissement Bodega
    const updatedEstablishment = await prisma.establishment.updateMany({
      where: {
        name: {
          contains: 'Bodega'
        }
      },
      data: {
        latitude: dijonLat,
        longitude: dijonLng,
        city: 'Dijon',
        postalCode: '21000'
      }
    });
    
    console.log(`✅ ${updatedEstablishment.count} établissement(s) mis à jour`);
    
    // Vérifier la mise à jour
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'Bodega'
        }
      },
      select: {
        name: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true
      }
    });
    
    if (establishment) {
      console.log('\n🏢 Établissement mis à jour :');
      console.log(`   Nom: ${establishment.name}`);
      console.log(`   Adresse: ${establishment.address}`);
      console.log(`   Ville: ${establishment.city}`);
      console.log(`   Code postal: ${establishment.postalCode}`);
      console.log(`   Latitude: ${establishment.latitude}`);
      console.log(`   Longitude: ${establishment.longitude}`);
      
      // Vérifier que les coordonnées sont maintenant correctes
      const latDiff = Math.abs(establishment.latitude - dijonLat);
      const lngDiff = Math.abs(establishment.longitude - dijonLng);
      
      if (latDiff < 0.01 && lngDiff < 0.01) {
        console.log('\n✅ Coordonnées corrigées avec succès !');
        console.log('📍 La carte devrait maintenant afficher Dijon au lieu de Paris');
      } else {
        console.log('\n❌ Problème lors de la correction des coordonnées');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBodegaCoordinates();
