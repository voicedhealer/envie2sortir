const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEstablishment() {
  try {
    console.log('🔍 Debug des établissements...\n');
    
    // 1. Vérifier l'utilisateur Paul Pokba
    const user = await prisma.user.findUnique({
      where: { id: 'cmfbjh5jh00028znuy2w2dv5e' },
      include: { establishments: true }
    });
    
    console.log('👤 Utilisateur Paul Pokba:');
    console.log('- ID:', user?.id);
    console.log('- Email:', user?.email);
    console.log('- Role:', user?.role);
    console.log('- EstablishmentId (dans session):', user?.establishmentId);
    console.log('- Établissements liés:', user?.establishments?.length || 0);
    
    if (user?.establishments?.length > 0) {
      console.log('\n🏢 Établissements de Paul:');
      user.establishments.forEach((est, index) => {
        console.log(`- ${index + 1}. ${est.name} (ID: ${est.id})`);
        console.log(`  - OwnerId: ${est.ownerId}`);
        console.log(`  - Slug: ${est.slug}`);
      });
    }
    
    // 2. Vérifier l'établissement par ID de session
    if (user?.establishmentId) {
      const establishment = await prisma.establishment.findUnique({
        where: { id: user.establishmentId }
      });
      
      console.log('\n🏢 Établissement par establishmentId:');
      console.log('- Trouvé:', !!establishment);
      if (establishment) {
        console.log('- Nom:', establishment.name);
        console.log('- OwnerId:', establishment.ownerId);
      }
    }
    
    // 3. Vérifier la requête actuelle
    const existingEstablishment = await prisma.establishment.findFirst({
      where: {
        ownerId: 'cmfbjh5jh00028znuy2w2dv5e'
      }
    });
    
    console.log('\n🔍 Requête actuelle (ownerId):');
    console.log('- Trouvé:', !!existingEstablishment);
    if (existingEstablishment) {
      console.log('- Nom:', existingEstablishment.name);
      console.log('- ID:', existingEstablishment.id);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEstablishment();
