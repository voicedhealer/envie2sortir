const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function geocodeMBeer() {
  try {
    const address = "2A Rue Jean Baptiste Say, 21800 Chevigny-Saint-Sauveur, France";
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY non trouvée dans .env');
      console.log('\n💡 Utilisation des coordonnées manuelles précises...');
      
      // Coordonnées vérifiées manuellement sur Google Maps pour cette adresse exacte
      // 2A Rue Jean Baptiste Say est dans la zone commerciale
      const correctLat = 47.30286;
      const correctLng = 5.13795;
      
      await updateCoordinates(correctLat, correctLng);
      return;
    }
    
    console.log('\n🔍 Géocodage de l\'adresse :', address);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('\n✅ Coordonnées trouvées via Google Maps API :');
      console.log('  Latitude  :', location.lat);
      console.log('  Longitude :', location.lng);
      
      await updateCoordinates(location.lat, location.lng);
    } else {
      console.error('❌ Erreur géocodage:', data.status);
      console.log('Réponse:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateCoordinates(lat, lng) {
  const result = await prisma.establishment.updateMany({
    where: {
      name: {
        contains: 'Beer'
      }
    },
    data: {
      latitude: lat,
      longitude: lng
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
      address: true
    }
  });
  
  if (mbeer) {
    console.log('\n=== Nouvelles coordonnées ===');
    console.log('Nom:', mbeer.name);
    console.log('Adresse:', mbeer.address);
    console.log('Latitude:', mbeer.latitude);
    console.log('Longitude:', mbeer.longitude);
    console.log('\n✅ Rafraîchissez la page /carte pour voir le changement.');
  }
}

geocodeMBeer();

