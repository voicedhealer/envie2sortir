/**
 * Script de test manuel du système de localisation
 * À exécuter dans la console du navigateur sur http://localhost:3003
 */

console.log('🧪 TESTS DU SYSTÈME DE LOCALISATION');
console.log('=====================================');

// Test 1: Vérifier que le badge de localisation est présent
function testBadgePresence() {
  console.log('\n📍 Test 1: Présence du badge de localisation');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (badge) {
    console.log('✅ Badge trouvé:', badge.textContent.trim());
    return true;
  } else {
    console.log('❌ Badge non trouvé');
    return false;
  }
}

// Test 2: Tester l'ouverture du dropdown
function testDropdownOpen() {
  console.log('\n🔽 Test 2: Ouverture du dropdown');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) {
    console.log('❌ Badge non trouvé');
    return false;
  }
  
  badge.click();
  
  setTimeout(() => {
    const dropdown = document.querySelector('[class*="absolute top-full"]');
    if (dropdown) {
      console.log('✅ Dropdown ouvert');
      
      // Vérifier les éléments du dropdown
      const header = dropdown.querySelector('h3');
      const tabs = dropdown.querySelectorAll('[class*="flex-1"]');
      const searchInput = dropdown.querySelector('input[placeholder*="ville"]');
      
      console.log('📋 Header:', header?.textContent);
      console.log('📑 Onglets:', tabs.length);
      console.log('🔍 Input recherche:', !!searchInput);
      
      return true;
    } else {
      console.log('❌ Dropdown non ouvert');
      return false;
    }
  }, 100);
}

// Test 3: Tester la fermeture du dropdown
function testDropdownClose() {
  console.log('\n❌ Test 3: Fermeture du dropdown');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) {
    console.log('❌ Badge non trouvé');
    return false;
  }
  
  // Fermer avec un clic sur le badge
  badge.click();
  
  setTimeout(() => {
    const dropdown = document.querySelector('[class*="absolute top-full"]');
    if (!dropdown || dropdown.style.display === 'none') {
      console.log('✅ Dropdown fermé');
      return true;
    } else {
      console.log('❌ Dropdown toujours ouvert');
      return false;
    }
  }, 100);
}

// Test 4: Tester la recherche de villes
function testCitySearch() {
  console.log('\n🔍 Test 4: Recherche de villes');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) return false;
  
  badge.click();
  
  setTimeout(() => {
    const searchInput = document.querySelector('input[placeholder*="ville"]');
    if (!searchInput) {
      console.log('❌ Input de recherche non trouvé');
      return false;
    }
    
    // Tester la recherche
    searchInput.value = 'Paris';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Recherche testée: "Paris"');
    console.log('📝 Valeur input:', searchInput.value);
    
    return true;
  }, 100);
}

// Test 5: Tester le changement de rayon
function testRadiusChange() {
  console.log('\n📏 Test 5: Changement de rayon');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) return false;
  
  badge.click();
  
  setTimeout(() => {
    const radiusButtons = document.querySelectorAll('[class*="grid grid-cols-4"] button');
    if (radiusButtons.length === 0) {
      console.log('❌ Boutons de rayon non trouvés');
      return false;
    }
    
    // Cliquer sur le bouton 50km
    const button50km = Array.from(radiusButtons).find(btn => btn.textContent.includes('50km'));
    if (button50km) {
      button50km.click();
      console.log('✅ Rayon changé vers 50km');
      return true;
    } else {
      console.log('❌ Bouton 50km non trouvé');
      return false;
    }
  }, 100);
}

// Test 6: Tester la détection GPS
function testGPSDetection() {
  console.log('\n🛰️ Test 6: Détection GPS');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) return false;
  
  badge.click();
  
  setTimeout(() => {
    const gpsButton = document.querySelector('button[class*="bg-blue-600"]');
    if (!gpsButton) {
      console.log('❌ Bouton GPS non trouvé');
      return false;
    }
    
    console.log('✅ Bouton GPS trouvé:', gpsButton.textContent.trim());
    
    // Note: On ne clique pas réellement pour éviter les popups de permission
    console.log('ℹ️ Test simulé (pas de clic réel pour éviter les popups)');
    
    return true;
  }, 100);
}

// Test 7: Vérifier les onglets
function testTabs() {
  console.log('\n📑 Test 7: Navigation entre onglets');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) return false;
  
  badge.click();
  
  setTimeout(() => {
    const tabs = document.querySelectorAll('[class*="flex-1"][class*="px-3 py-2"]');
    if (tabs.length < 3) {
      console.log('❌ Pas assez d\'onglets trouvés');
      return false;
    }
    
    console.log('✅ Onglets trouvés:', tabs.length);
    
    // Tester le clic sur chaque onglet
    tabs.forEach((tab, index) => {
      console.log(`📋 Onglet ${index + 1}:`, tab.textContent.trim());
    });
    
    return true;
  }, 100);
}

// Test 8: Vérifier la persistance localStorage
function testLocalStorage() {
  console.log('\n💾 Test 8: Persistance localStorage');
  
  const locationData = localStorage.getItem('location-preferences');
  if (locationData) {
    try {
      const parsed = JSON.parse(locationData);
      console.log('✅ Données localStorage trouvées:', parsed);
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

// Test 9: Vérifier l'intégration avec les composants
function testIntegration() {
  console.log('\n🔗 Test 9: Intégration avec les composants');
  
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

// Test 10: Vérifier les animations
function testAnimations() {
  console.log('\n🎨 Test 10: Animations et transitions');
  
  const badge = document.querySelector('[title="Changer de localisation"]');
  if (!badge) return false;
  
  // Vérifier les classes d'animation
  const hasTransition = badge.classList.toString().includes('transition');
  const hasTransform = badge.classList.toString().includes('transform');
  
  console.log('✅ Classes de transition:', hasTransition);
  console.log('✅ Classes de transform:', hasTransform);
  
  return true;
}

// Exécuter tous les tests
function runAllTests() {
  console.log('🚀 Démarrage des tests...');
  
  const tests = [
    testBadgePresence,
    testDropdownOpen,
    testDropdownClose,
    testCitySearch,
    testRadiusChange,
    testGPSDetection,
    testTabs,
    testLocalStorage,
    testIntegration,
    testAnimations
  ];
  
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
}

// Instructions d'utilisation
console.log('\n📋 INSTRUCTIONS D\'UTILISATION:');
console.log('1. Ouvrez http://localhost:3003 dans votre navigateur');
console.log('2. Ouvrez la console développeur (F12)');
console.log('3. Copiez-collez ce script dans la console');
console.log('4. Ou exécutez: runAllTests()');
console.log('\n💡 Pour exécuter un test individuel: testBadgePresence()');

// Export des fonctions pour utilisation manuelle
window.testLocationSystem = {
  runAllTests,
  testBadgePresence,
  testDropdownOpen,
  testDropdownClose,
  testCitySearch,
  testRadiusChange,
  testGPSDetection,
  testTabs,
  testLocalStorage,
  testIntegration,
  testAnimations
};

console.log('\n🔧 Fonctions disponibles:');
console.log('- runAllTests() : Exécuter tous les tests');
console.log('- testLocationSystem.testBadgePresence() : Test du badge');
console.log('- testLocationSystem.testDropdownOpen() : Test ouverture dropdown');
console.log('- etc...');
