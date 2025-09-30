const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEstablishmentIssue() {
  console.log('🔍 Debug de l\'établissement "m beer"...\n');
  
  try {
    // 1. Lister tous les établissements
    console.log('📋 Tous les établissements:');
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        status: true,
        imageUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    establishments.forEach(est => {
      console.log(`  - ${est.name} (${est.slug}) - Owner: ${est.ownerId} - Status: ${est.status}`);
    });
    
    // 2. Chercher spécifiquement "m beer"
    console.log('\n🍺 Recherche de "m beer":');
    const mBeer = await prisma.establishment.findFirst({
      where: {
        OR: [
          { name: { contains: 'm beer' } },
          { slug: { contains: 'm-beer' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        status: true,
        imageUrl: true,
        createdAt: true
      }
    });
    
    if (mBeer) {
      console.log('✅ Trouvé:', mBeer);
      
      // 3. Vérifier le propriétaire
      console.log('\n👤 Propriétaire de "m beer":');
      const owner = await prisma.professional.findUnique({
        where: { id: mBeer.ownerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true
        }
      });
      
      if (owner) {
        console.log('✅ Propriétaire trouvé:', owner);
      } else {
        console.log('❌ Propriétaire non trouvé pour ownerId:', mBeer.ownerId);
      }
      
      // 4. Vérifier les images
      console.log('\n🖼️ Images de "m beer":');
      const images = await prisma.image.findMany({
        where: { establishmentId: mBeer.id },
        select: {
          id: true,
          url: true,
          isPrimary: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`Images trouvées: ${images.length}`);
      images.forEach(img => {
        console.log(`  - ${img.url} (Primary: ${img.isPrimary})`);
      });
      
    } else {
      console.log('❌ "m beer" non trouvé');
    }
    
    // 5. Lister tous les professionnels
    console.log('\n👥 Tous les professionnels:');
    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyName: true
      }
    });
    
    professionals.forEach(prof => {
      console.log(`  - ${prof.firstName} ${prof.lastName} (${prof.email}) - Company: ${prof.companyName}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEstablishmentIssue();
