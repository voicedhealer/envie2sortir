const { PrismaClient } = require('@prisma/client');

async function updateEstablishmentsCoordinates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Mise à jour des coordonnées des établissements avec le vrai géocodage...\n');
    
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true
      }
    });
    
    for (const establishment of establishments) {
      console.log(`🏢 Mise à jour: ${establishment.name}`);
      console.log(`   Adresse: ${establishment.address}`);
      
      try {
        // Géocoder l'adresse
        const response = await fetch(`http://localhost:3001/api/geocode?address=${encodeURIComponent(establishment.address)}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const newLat = result.data.latitude;
          const newLng = result.data.longitude;
          
          console.log(`   📍 Nouvelles coordonnées: ${newLat}, ${newLng}`);
          
          // Mettre à jour en base
          await prisma.establishment.update({
            where: { id: establishment.id },
            data: {
              latitude: newLat,
              longitude: newLng,
              city: result.additionalInfo?.city || establishment.city,
              postalCode: result.additionalInfo?.postcode || establishment.postalCode
            }
          });
          
          console.log(`   ✅ Mis à jour avec succès`);
        } else {
          console.log(`   ❌ Erreur géocodage: ${result.error || 'Inconnue'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Mise à jour terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEstablishmentsCoordinates();
