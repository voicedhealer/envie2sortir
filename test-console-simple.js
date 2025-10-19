// 🧪 TEST SIMPLE DU SYSTÈME DE LOCALISATION
// Copie-colle ce script dans la console de http://localhost:3003

console.log('🧪 TESTS DU SYSTÈME DE LOCALISATION');
console.log('=====================================');

// Test 1: Vérifier que le badge est présent
function testBadge() {
  console.log('\n📍 Test 1: Badge de localisation');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (badge) {
    console.log('✅ Badge trouvé:', badge.textContent.trim());
    return true;
  } else {
    console.log('❌ Badge non trouvé');
    return false;
  }
}

// Test 2: Tester le dropdown
function testDropdown() {
  console.log('\n🔽 Test 2: Dropdown');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) {
    console.log('❌ Badge non trouvé');
    return false;
  }
  
  console.log('🔄 Ouverture du dropdown...');
  badge.click();
  
  setTimeout(() => {
    const dropdown = document.querySelector('[class*="absolute top-full"]');
    if (dropdown) {
      console.log('✅ Dropdown ouvert');
      
      // Vérifier les éléments
      const header = dropdown.querySelector('h3');
      const tabs = dropdown.querySelectorAll('[class*="flex-1"]');
      const searchInput = dropdown.querySelector('input[placeholder*="ville"]');
      
      console.log('📋 Header:', header?.textContent);
      console.log('📑 Onglets:', tabs.length);
      console.log('🔍 Input recherche:', !!searchInput);
      
      // Fermer le dropdown
      setTimeout(() => {
        badge.click();
        console.log('✅ Dropdown fermé');
      }, 1000);
      
      return true;
    } else {
      console.log('❌ Dropdown non ouvert');
      return false;
    }
  }, 100);
}

// Test 3: Vérifier localStorage
function testLocalStorage() {
  console.log('\n💾 Test 3: LocalStorage');
  
  const data = localStorage.getItem('location-preferences');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Données localStorage:', parsed);
      return true;
    } catch (e) {
      console.log('❌ Erreur parsing localStorage:', e.message);
      return false;
    }
  } else {
    console.log('ℹ️ Aucune donnée localStorage (normal si première visite)');
    return true;
  }
}

// Test 4: Vérifier l'intégration
function testIntegration() {
  console.log('\n🔗 Test 4: Intégration');
  
  // Vérifier EventsCarousel
  const eventsSection = document.querySelector('[class*="py-16"][class*="bg-gradient-to-b"]');
  if (eventsSection) {
    console.log('✅ Section événements trouvée');
  } else {
    console.log('❌ Section événements non trouvée');
  }
  
  // Vérifier DailyDealsCarousel
  const dealsSection = document.querySelector('[class*="py-16"][class*="bg-gradient-to-br"]');
  if (dealsSection) {
    console.log('✅ Section bons plans trouvée');
  } else {
    console.log('❌ Section bons plans non trouvée');
  }
  
  return true;
}

// Exécuter tous les tests
function runAllTests() {
  console.log('🚀 Démarrage des tests...');
  
  const tests = [testBadge, testLocalStorage, testIntegration];
  let passed = 0;
  let total = tests.length;
  
  tests.forEach((test, index) => {
    try {
      if (test()) {
        passed++;
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1} a échoué:`, error.message);
    }
  });
  
  // Test du dropdown après un délai
  setTimeout(() => {
    try {
      if (testDropdown()) {
        passed++;
      }
      total++;
      
      console.log('\n📊 RÉSULTATS DES TESTS');
      console.log('======================');
      console.log(`✅ Tests réussis: ${passed}/${total}`);
      console.log(`❌ Tests échoués: ${total - passed}/${total}`);
      console.log(`📈 Taux de réussite: ${Math.round((passed / total) * 100)}%`);
      
      if (passed === total) {
        console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
      } else {
        console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
      }
    } catch (error) {
      console.log('❌ Test dropdown a échoué:', error.message);
    }
  }, 2000);
}

// Instructions
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Exécutez: runAllTests()');
console.log('2. Ou testez individuellement: testBadge(), testDropdown(), etc.');
console.log('\n🔧 Fonctions disponibles:');
console.log('- runAllTests() : Exécuter tous les tests');
console.log('- testBadge() : Test du badge');
console.log('- testDropdown() : Test du dropdown');
console.log('- testLocalStorage() : Test localStorage');
console.log('- testIntegration() : Test d\'intégration');

// Auto-exécution
console.log('\n🚀 Exécution automatique dans 3 secondes...');
setTimeout(runAllTests, 3000);
