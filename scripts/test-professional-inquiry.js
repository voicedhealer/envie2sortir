/**
 * Script de test pour vérifier le formulaire de demande professionnelle
 * Usage: node scripts/test-professional-inquiry.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testProfessionalInquiry() {
  console.log('🧪 Test du formulaire de demande professionnelle\n');
  console.log('📋 Configuration:');
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Supabase URL: ${SUPABASE_URL}\n`);

  // Données de test
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    establishmentName: 'Restaurant Test',
    city: 'Dijon',
    description: 'Ceci est un test automatique du formulaire de demande professionnelle'
  };

  console.log('📝 Données de test:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    // Test 1: Envoyer la demande via l'API
    console.log('1️⃣ Test d\'envoi de la demande via API...');
    const response = await fetch(`${API_URL}/api/wait/professional-inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Demande envoyée avec succès!');
      console.log('   Réponse:', result);
    } else {
      console.log('❌ Erreur lors de l\'envoi:');
      console.log('   Status:', response.status);
      console.log('   Erreur:', result.error || result);
      return;
    }

    console.log('\n');

    // Test 2: Vérifier que les données sont dans Supabase
    console.log('2️⃣ Vérification dans Supabase...');
    console.log('   ⚠️  Pour vérifier manuellement:');
    console.log('   1. Allez dans Supabase Dashboard');
    console.log('   2. Ouvrez la table "professional_inquiries"');
    console.log('   3. Cherchez une entrée avec:');
    console.log(`      - first_name: "${testData.firstName}"`);
    console.log(`      - last_name: "${testData.lastName}"`);
    console.log(`      - establishment_name: "${testData.establishmentName}"`);
    console.log(`      - city: "${testData.city}"`);

    console.log('\n');

    // Test 3: Vérifier via l'API admin (si disponible)
    console.log('3️⃣ Test de récupération via page admin...');
    console.log('   ⚠️  Pour tester:');
    console.log('   1. Connectez-vous en tant qu\'admin');
    console.log('   2. Allez sur /admin/modifications');
    console.log('   3. Cliquez sur l\'onglet "Demandes Pro"');
    console.log('   4. Vérifiez que la demande apparaît');

    console.log('\n✅ Tests terminés!');
    console.log('\n📊 Résumé:');
    console.log('   - Envoi API: ✅');
    console.log('   - Vérification Supabase: ⚠️  (manuelle requise)');
    console.log('   - Vérification Admin: ⚠️  (manuelle requise)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Exécuter le test
testProfessionalInquiry();



