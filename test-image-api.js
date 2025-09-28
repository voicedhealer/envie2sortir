const { PrismaClient } = require('@prisma/client');

async function testImageAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Test de l\'API d\'images...\n');
    
    // Vérifier les établissements et leurs propriétaires
    const establishments = await prisma.establishment.findMany({
      include: {
        owner: true
      }
    });
    
    console.log('🏢 Établissements disponibles :');
    establishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name}`);
      console.log(`   ID: ${est.id}`);
      console.log(`   Propriétaire: ${est.owner.firstName} ${est.owner.lastName} (${est.owner.email})`);
      console.log(`   Statut: ${est.status}`);
      console.log(`   Image actuelle: ${est.imageUrl || 'Aucune'}`);
      console.log('');
    });
    
    if (establishments.length === 0) {
      console.log('❌ Aucun établissement trouvé');
      return;
    }
    
    // Tester l'API avec le premier établissement
    const testEstablishment = establishments[0];
    console.log(`🧪 Test avec l'établissement: ${testEstablishment.name}`);
    
    // Simuler une requête PUT
    const testImageUrl = '/uploads/test-image.jpg';
    
    try {
      const response = await fetch('http://localhost:3001/api/etablissements/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl
        })
      });
      
      const result = await response.json();
      
      console.log(`📡 Réponse API: ${response.status} ${response.statusText}`);
      console.log('📝 Données:', result);
      
      if (response.ok) {
        console.log('✅ API fonctionne correctement');
      } else {
        console.log('❌ Erreur API:', result.error);
      }
      
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageAPI();
