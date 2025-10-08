const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMBeerExact() {
  try {
    // Coordonnées exactes fournies par Google Maps
    const exactLat = 47.304611;
    const exactLng = 5.115203;
    
    console.log('\n=== Mise à jour avec les coordonnées EXACTES de Google Maps ===');
    console.log('Code Plus: 8437+QW Chevigny-Saint-Sauveur');
    console.log('Latitude  :', exactLat);
    console.log('Longitude :', exactLng);
    
    const result = await prisma.establishment.updateMany({
      where: {
        name: {
          contains: 'Beer'
        }
      },
      data: {
        latitude: exactLat,
        longitude: exactLng
      }
    });
    
    console.log('\n✅ Mise à jour effectuée !');
    console.log('Nombre d\'établissements mis à jour :', result.count);
    
    // Vérification finale
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
      console.log('\n=== Vérification finale ===');
      console.log('Nom:', mbeer.name);
      console.log('Adresse:', mbeer.address);
      console.log('Ville:', mbeer.city);
      console.log('Latitude:', mbeer.latitude);
      console.log('Longitude:', mbeer.longitude);
      console.log('\n🎯 Le marqueur devrait maintenant être EXACTEMENT au bon endroit !');
      console.log('Rafraîchissez la page /carte (F5) pour voir le changement.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMBeerExact();

