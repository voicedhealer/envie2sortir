/**
 * Script de vérification des données de test E2E
 * Compare ce qui a été créé avec ce qui devrait être affiché
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function verify() {
  console.log('\n🔍 Vérification des données de test E2E\n');
  console.log('='.repeat(80));
  
  try {
    // Charger les IDs depuis le fichier
    const testIdsPath = '/Users/vivien/envie2sortir/test-e2e-ids.json';
    
    if (!fs.existsSync(testIdsPath)) {
      console.log('❌ Fichier test-e2e-ids.json introuvable');
      console.log('   Veuillez d\'abord exécuter: node scripts/test-e2e-setup.js');
      return;
    }
    
    const testIds = JSON.parse(fs.readFileSync(testIdsPath, 'utf8'));
    console.log('📋 IDs de test:');
    console.log(`   - Establishment ID: ${testIds.establishmentId}\n`);
    
    // Récupérer l'établissement depuis la BD
    const establishment = await prisma.establishment.findUnique({
      where: { id: testIds.establishmentId },
      include: {
        owner: true
      }
    });
    
    if (!establishment) {
      console.log('❌ Établissement introuvable dans la base de données');
      return;
    }
    
    console.log('✅ Établissement trouvé dans la base de données\n');
    console.log('='.repeat(80));
    console.log('📊 RAPPORT DE VÉRIFICATION');
    console.log('='.repeat(80));
    
    // Données attendues
    const expectedData = {
      'Nom': 'Le Bistrot Test E2E',
      'Description': 'Un restaurant convivial pour tester l\'intégralité du système. Cuisine française traditionnelle avec une touche moderne.',
      'Catégorie': 'Restaurant',
      'Adresse': '15 Rue de la République, 75001 Paris, France',
      'Ville': 'Paris',
      'Code Postal': '75001',
      'Téléphone': '+33145678901',
      'WhatsApp': '+33645678901',
      'Email': 'contact@bistrot-test.com',
      'Site Web': 'https://bistrot-test.com',
      'Instagram': 'https://instagram.com/bistrottest',
      'Facebook': 'https://facebook.com/bistrottest',
      'TikTok': 'https://tiktok.com/@bistrottest',
      'YouTube': 'https://youtube.com/@bistrottest',
      'Statut': 'approved'
    };
    
    const actualData = {
      'Nom': establishment.name,
      'Description': establishment.description,
      'Catégorie': establishment.category,
      'Adresse': establishment.address,
      'Ville': establishment.city,
      'Code Postal': establishment.postalCode,
      'Téléphone': establishment.phone,
      'WhatsApp': establishment.whatsappPhone,
      'Email': establishment.email,
      'Site Web': establishment.website,
      'Instagram': establishment.instagram,
      'Facebook': establishment.facebook,
      'TikTok': establishment.tiktok,
      'YouTube': establishment.youtube,
      'Statut': establishment.status
    };
    
    // Comparaison des champs simples
    console.log('\n📝 CHAMPS PRINCIPAUX:');
    console.log('-'.repeat(80));
    
    let matching = 0;
    let total = 0;
    const issues = [];
    
    for (const [field, expectedValue] of Object.entries(expectedData)) {
      total++;
      const actualValue = actualData[field];
      const matches = expectedValue === actualValue;
      
      if (matches) {
        matching++;
        console.log(`   ✅ ${field.padEnd(20)} : ${actualValue || '(vide)'}`);
      } else {
        console.log(`   ❌ ${field.padEnd(20)} : Attendu "${expectedValue}" | Reçu "${actualValue}"`);
        issues.push({ field, expected: expectedValue, actual: actualValue });
      }
    }
    
    // Vérification des données JSON
    console.log('\n📅 HORAIRES:');
    console.log('-'.repeat(80));
    
    const hours = establishment.horairesOuverture;
    if (hours && typeof hours === 'object') {
      console.log('   ✅ Horaires présents');
      Object.entries(hours).forEach(([day, data]) => {
        console.log(`      ${day}: ${data.ouvert ? data.heures : 'Fermé'}`);
      });
    } else {
      console.log('   ❌ Horaires manquants ou invalides');
      issues.push({ field: 'Horaires (horairesOuverture)', expected: 'Object', actual: typeof hours });
    }
    
    console.log('\n🛠️  SERVICES:');
    console.log('-'.repeat(80));
    
    const services = establishment.services;
    if (Array.isArray(services) && services.length > 0) {
      console.log(`   ✅ ${services.length} service(s) présent(s):`);
      services.forEach(s => console.log(`      - ${s}`));
    } else {
      console.log('   ❌ Services manquants');
      issues.push({ field: 'Services', expected: 'Array[3]', actual: services });
    }
    
    console.log('\n🎨 AMBIANCES:');
    console.log('-'.repeat(80));
    
    const ambiance = establishment.ambiance;
    if (Array.isArray(ambiance) && ambiance.length > 0) {
      console.log(`   ✅ ${ambiance.length} ambiance(s) présente(s):`);
      ambiance.forEach(a => console.log(`      - ${a}`));
    } else {
      console.log('   ❌ Ambiances manquantes');
      issues.push({ field: 'Ambiance', expected: 'Array[2]', actual: ambiance });
    }
    
    console.log('\n🏷️  TAGS (envieTags):');
    console.log('-'.repeat(80));
    
    const envieTags = establishment.envieTags;
    if (envieTags && typeof envieTags === 'object') {
      console.log('   ✅ envieTags présents:');
      if (envieTags.tags && Array.isArray(envieTags.tags)) {
        console.log(`      Tags: ${envieTags.tags.join(', ')}`);
      }
      if (envieTags.enviesAutomatiques && Array.isArray(envieTags.enviesAutomatiques)) {
        console.log(`      Envies: ${envieTags.enviesAutomatiques.join(', ')}`);
      }
      if (envieTags.envsocialesAutomatiques && Array.isArray(envieTags.envsocialesAutomatiques)) {
        console.log(`      Env. sociales: ${envieTags.envsocialesAutomatiques.join(', ')}`);
      }
    } else {
      console.log('   ❌ Tags (envieTags) manquants');
      issues.push({ field: 'envieTags', expected: 'Object', actual: typeof envieTags });
    }
    
    console.log('\n💳 MOYENS DE PAIEMENT (detailedPayments):');
    console.log('-'.repeat(80));
    
    const payments = establishment.detailedPayments;
    if (payments && typeof payments === 'object') {
      console.log('   ✅ Moyens de paiement présents:');
      Object.entries(payments).forEach(([key, value]) => {
        if (value === true) {
          console.log(`      ✓ ${key}`);
        }
      });
    } else {
      console.log('   ❌ Moyens de paiement manquants');
      issues.push({ field: 'detailedPayments', expected: 'Object', actual: typeof payments });
    }
    
    console.log('\n♿ ACCESSIBILITÉ (accessibilityDetails):');
    console.log('-'.repeat(80));
    
    const accessibility = establishment.accessibilityDetails;
    if (accessibility && typeof accessibility === 'object') {
      console.log('   ✅ Informations d\'accessibilité présentes:');
      Object.entries(accessibility).forEach(([key, value]) => {
        if (value === true) {
          console.log(`      ✓ ${key}`);
        }
      });
    } else {
      console.log('   ❌ Accessibilité manquante');
      issues.push({ field: 'accessibilityDetails', expected: 'Object', actual: typeof accessibility });
    }
    
    console.log('\n🏢 SERVICES DÉTAILLÉS (detailedServices):');
    console.log('-'.repeat(80));
    
    const detailedServices = establishment.detailedServices;
    if (detailedServices && typeof detailedServices === 'object') {
      console.log('   ✅ Services détaillés présents:');
      Object.entries(detailedServices).forEach(([key, value]) => {
        if (value === true) {
          console.log(`      ✓ ${key}`);
        }
      });
    } else {
      console.log('   ❌ Services détaillés manquants');
      issues.push({ field: 'detailedServices', expected: 'Object', actual: typeof detailedServices });
    }
    
    console.log('\n👥 CLIENTÈLE (clienteleInfo):');
    console.log('-'.repeat(80));
    
    const clienteleInfo = establishment.clienteleInfo;
    if (clienteleInfo && typeof clienteleInfo === 'object') {
      console.log('   ✅ Informations clientèle présentes:');
      Object.entries(clienteleInfo).forEach(([key, value]) => {
        if (value === true) {
          console.log(`      ✓ ${key}`);
        }
      });
    } else {
      console.log('   ❌ Informations clientèle manquantes');
      issues.push({ field: 'clienteleInfo', expected: 'Object', actual: typeof clienteleInfo });
    }
    
    console.log('\n👶 SERVICES ENFANTS (childrenServices):');
    console.log('-'.repeat(80));
    
    const childrenServices = establishment.childrenServices;
    if (childrenServices && typeof childrenServices === 'object') {
      console.log('   ✅ Services enfants présents:');
      Object.entries(childrenServices).forEach(([key, value]) => {
        if (value === true) {
          console.log(`      ✓ ${key}`);
        }
      });
    } else {
      console.log('   ❌ Services enfants manquants');
      issues.push({ field: 'childrenServices', expected: 'Object', actual: typeof childrenServices });
    }
    
    // Résumé final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE VÉRIFICATION');
    console.log('='.repeat(80));
    console.log(`\n   Champs principaux: ${matching}/${total} OK (${Math.round(matching/total*100)}%)`);
    
    if (issues.length === 0) {
      console.log('\n   ✅ AUCUN PROBLÈME DÉTECTÉ - Toutes les données sont correctes!');
    } else {
      console.log(`\n   ⚠️  ${issues.length} PROBLÈME(S) DÉTECTÉ(S):`);
      issues.forEach((issue, i) => {
        console.log(`\n   ${i + 1}. ${issue.field}:`);
        console.log(`      Attendu: ${JSON.stringify(issue.expected)}`);
        console.log(`      Reçu: ${JSON.stringify(issue.actual)}`);
      });
    }
    
    console.log('\n🔗 URL de visualisation publique:');
    console.log(`   → http://localhost:3000/etablissements/${establishment.id}`);
    
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifier la page publique dans le navigateur');
    console.log('   2. Comparer l\'affichage avec les données ci-dessus');
    console.log('   3. Noter les différences/problèmes rencontrés');
    console.log('   4. Exécuter le cleanup: node scripts/test-e2e-cleanup.js\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verify();

