const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEstablishments() {
  try {
    console.log('🔍 Recherche des établissements...');
    
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        services: true,
        ambiance: true,
        informationsPratiques: true,
        activities: true
      }
    });

    console.log(`📋 ${establishments.length} établissement(s) trouvé(s):`);
    establishments.forEach(est => {
      console.log(`- ${est.name} (${est.slug}) - ${est.city}`);
      console.log(`  Services: ${est.services ? 'Oui' : 'Non'}`);
      console.log(`  Ambiance: ${est.ambiance ? 'Oui' : 'Non'}`);
      console.log(`  Infos pratiques: ${est.informationsPratiques ? 'Oui' : 'Non'}`);
      console.log(`  Activités: ${est.activities ? 'Oui' : 'Non'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEstablishments();
