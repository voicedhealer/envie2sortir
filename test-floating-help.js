// Script de test pour l'image d'aide flottante
// À exécuter dans la console du navigateur

console.log('🧪 Test du bouton d\'aide flottant');

// Fonction pour vérifier que l'image flottante est présente
window.checkFloatingHelp = function() {
  const helpButton = document.querySelector('.floating-help-button');
  if (helpButton) {
    console.log('✅ Image d\'aide flottante trouvée');
    console.log('- Source:', helpButton.src);
    console.log('- Position:', window.getComputedStyle(helpButton).position);
    console.log('- Bottom:', window.getComputedStyle(helpButton).bottom);
    console.log('- Right:', window.getComputedStyle(helpButton).right);
    console.log('- Z-index:', window.getComputedStyle(helpButton).zIndex);
    return true;
  } else {
    console.log('❌ Image d\'aide flottante non trouvée');
    return false;
  }
};

// Fonction pour simuler un clic sur l'image
window.testFloatingHelpClick = function() {
  const helpButton = document.querySelector('.floating-help-button');
  if (helpButton) {
    console.log('🖱️ Simulation du clic sur l\'image d\'aide');
    helpButton.click();
    return true;
  } else {
    console.log('❌ Impossible de cliquer - image non trouvée');
    return false;
  }
};

// Fonction pour vérifier la visibilité au scroll
window.testScrollVisibility = function() {
  const helpButton = document.querySelector('.floating-help-button');
  if (helpButton) {
    const initialPosition = helpButton.getBoundingClientRect();
    console.log('📍 Position initiale:', {
      bottom: initialPosition.bottom,
      right: initialPosition.right
    });
    
    // Faire défiler la page
    window.scrollTo(0, 500);
    
    setTimeout(() => {
      const scrolledPosition = helpButton.getBoundingClientRect();
      console.log('📍 Position après scroll:', {
        bottom: scrolledPosition.bottom,
        right: scrolledPosition.right
      });
      
      // Vérifier que l'image reste visible
      const isVisible = scrolledPosition.bottom > 0 && scrolledPosition.right > 0;
      console.log(isVisible ? '✅ Image reste visible au scroll' : '❌ Image masquée au scroll');
    }, 100);
  }
};

console.log('💡 Commandes disponibles:');
console.log('- checkFloatingHelp() : Vérifier la présence de l\'image');
console.log('- testFloatingHelpClick() : Tester le clic sur l\'image');
console.log('- testScrollVisibility() : Tester la visibilité au scroll');
