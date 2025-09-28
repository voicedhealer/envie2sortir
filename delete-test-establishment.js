const { PrismaClient } = require('@prisma/client');

async function deleteTestEstablishment() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Suppression de l\'établissement de test...\n');
    
    // Trouver l'établissement de test
    const testEstablishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'SARL EXEMPLE'
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        ownerId: true
      }
    });
    
    if (testEstablishment) {
      console.log('🏢 Établissement de test trouvé :');
      console.log(`   ID: ${testEstablishment.id}`);
      console.log(`   Nom: ${testEstablishment.name}`);
      console.log(`   Adresse: ${testEstablishment.address}`);
      console.log(`   Propriétaire ID: ${testEstablishment.ownerId}`);
      
      // Supprimer l'établissement
      const deletedEstablishment = await prisma.establishment.delete({
        where: { id: testEstablishment.id }
      });
      
      console.log('\n✅ Établissement de test supprimé avec succès !');
      console.log(`   Supprimé: ${deletedEstablishment.name}`);
      
    } else {
      console.log('❌ Aucun établissement de test trouvé');
    }
    
    // Vérifier les établissements restants
    console.log('\n📊 Établissements restants :');
    const remainingEstablishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true
      }
    });
    
    remainingEstablishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name}`);
      console.log(`   Adresse: ${est.address}`);
      console.log(`   Ville: ${est.city || 'Non définie'}`);
      console.log('');
    });
    
    console.log(`✅ ${remainingEstablishments.length} établissement(s) légitime(s) conservé(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestEstablishment();
