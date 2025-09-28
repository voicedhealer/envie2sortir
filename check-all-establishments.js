const { PrismaClient } = require('@prisma/client');

async function checkAllEstablishments() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🏢 Vérification de tous les établissements...\n');
    
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
    
    console.log(`📊 ${establishments.length} établissement(s) trouvé(s)\n`);
    
    establishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name}`);
      console.log(`   Adresse: ${est.address}`);
      console.log(`   Ville: ${est.city || 'Non définie'}`);
      console.log(`   Code postal: ${est.postalCode || 'Non défini'}`);
      console.log(`   Coordonnées: ${est.latitude || 'N/A'}, ${est.longitude || 'N/A'}`);
      
      // Vérifier si les coordonnées semblent correctes
      if (est.latitude && est.longitude) {
        // Coordonnées approximatives de la France
        const isInFrance = est.latitude >= 41.0 && est.latitude <= 51.5 && 
                          est.longitude >= -5.5 && est.longitude <= 9.5;
        
        if (isInFrance) {
          console.log(`   ✅ Coordonnées dans les limites de la France`);
        } else {
          console.log(`   ❌ Coordonnées en dehors de la France`);
        }
      } else {
        console.log(`   ⚠️  Coordonnées manquantes`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllEstablishments();
