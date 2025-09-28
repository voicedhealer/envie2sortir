const { PrismaClient } = require('@prisma/client');

async function checkUserEstablishment() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👤 Vérification des comptes professionnels et leurs établissements...\n');
    
    const professionals = await prisma.professional.findMany({
      include: {
        establishment: true
      }
    });
    
    professionals.forEach((pro, index) => {
      console.log(`${index + 1}. ${pro.firstName} ${pro.lastName} (${pro.email})`);
      console.log(`   ID: ${pro.id}`);
      console.log(`   SIRET: ${pro.siret}`);
      console.log(`   Entreprise: ${pro.companyName}`);
      
      if (pro.establishment) {
        console.log(`   🏢 Établissement: ${pro.establishment.name}`);
        console.log(`   🏢 Statut: ${pro.establishment.status}`);
        console.log(`   🏢 Image: ${pro.establishment.imageUrl || 'Aucune'}`);
        console.log(`   ✅ Peut accéder au dashboard et gérer les images`);
      } else {
        console.log(`   ❌ Aucun établissement associé`);
        console.log(`   ❌ Ne peut PAS accéder au dashboard`);
      }
      console.log('');
    });
    
    console.log('💡 Pour tester la gestion d\'images, utilisez un compte qui a un établissement associé.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserEstablishment();
