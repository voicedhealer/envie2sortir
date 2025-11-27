/**
 * Script de test direct de l'API professional-inquiry
 * Usage: node scripts/test-api-professional-inquiry.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Test de l\'API /api/wait/professional-inquiry\n');
  console.log(`📡 URL: ${API_URL}/api/wait/professional-inquiry\n`);

  const testData = {
    firstName: 'Test',
    lastName: 'User',
    establishmentName: 'Restaurant Test API',
    city: 'Dijon',
    description: 'Test automatique de l\'API - ' + new Date().toISOString()
  };

  console.log('📝 Données à envoyer:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    const response = await fetch(`${API_URL}/api/wait/professional-inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log('📊 Réponse:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Success: ${data.success}`);
    
    if (data.success) {
      console.log('   ✅ Message:', data.message);
      console.log('\n✅ Test réussi! La demande a été enregistrée.');
      console.log('\n📋 Prochaines étapes:');
      console.log('   1. Vérifiez dans Supabase Dashboard que la demande apparaît dans la table professional_inquiries');
      console.log('   2. Connectez-vous en tant qu\'admin et allez sur /admin/modifications');
      console.log('   3. Cliquez sur l\'onglet "Demandes Pro"');
      console.log('   4. Vérifiez que la demande apparaît dans la liste');
    } else {
      console.log('   ❌ Erreur:', data.error);
      console.log('\n❌ Test échoué!');
    }

    console.log('\n📄 Réponse complète:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('   Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Le serveur n\'est pas démarré. Lancez: npm run dev');
    }
  }
}

// Exécuter le test
testAPI();

