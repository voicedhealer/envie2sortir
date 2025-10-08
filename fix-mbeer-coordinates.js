const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMBeerCoordinates() {
  try {
    // Coordonnées correctes pour 2A Rue Jean Baptiste Say, 21800 Chevigny-Saint-Sauveur
    // Vérifiées sur Google Maps
    const correctLat = 47.3028;
    const correctLng = 5.1379;
    
    console.log('\n=== Correction des coordonnées de M\'Beer ===');
    console.log('Adresse : 2A Rue Jean Baptiste Say, 21800 Chevigny-Saint-Sauveur');
    console.log('Nouvelles coordonnées :');
    console.log('  Latitude  :', correctLat);
    console.log('  Longitude :', correctLng);
    
    const result = await prisma.establishment.updateMany({
      where: {
        name: {
          contains: 'Beer'
        }
      },
      data: {
        latitude: correctLat,
        longitude: correctLng
      }
    });
    
    console.log('\n✅ Mise à jour effectuée !');
    console.log('Nombre d\'établissements mis à jour :', result.count);
    
    // Vérification
    const mbeer = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'Beer'
        }
      },
      select: {
        name: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true
      }
    });
    
    if (mbeer) {
      console.log('\n=== Vérification ===');
      console.log('Nom:', mbeer.name);
      console.log('Adresse:', mbeer.address);
      console.log('Ville:', mbeer.city);
      console.log('Latitude:', mbeer.latitude);
      console.log('Longitude:', mbeer.longitude);
      console.log('\n✅ Le marqueur devrait maintenant être au bon endroit !');
      console.log('Rafraîchissez la page /carte pour voir le changement.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMBeerCoordinates();

