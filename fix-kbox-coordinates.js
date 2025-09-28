const { PrismaClient } = require('@prisma/client');

async function fixKboxCoordinates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Correction des coordonnées de KBOX Karaoké...\n');
    
    // Coordonnées correctes pour Lyon (69007 - 7ème arrondissement)
    const lyonLat = 45.7640;
    const lyonLng = 4.8357;
    
    console.log(`📍 Nouvelles coordonnées Lyon: ${lyonLat}, ${lyonLng}`);
    
    // Mettre à jour l'établissement KBOX
    const updatedEstablishment = await prisma.establishment.updateMany({
      where: {
        name: {
          contains: 'KBOX'
        }
      },
      data: {
        latitude: lyonLat,
        longitude: lyonLng,
        city: 'Lyon',
        postalCode: '69007'
      }
    });
    
    console.log(`✅ ${updatedEstablishment.count} établissement(s) mis à jour`);
    
    // Vérifier la mise à jour
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'KBOX'
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
      
      console.log('\n✅ Coordonnées KBOX corrigées avec succès !');
      console.log('📍 La carte devrait maintenant afficher Lyon au lieu de Paris');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKboxCoordinates();
