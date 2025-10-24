// Script de diagnostic pour la soumission d'établissement
// À exécuter dans la console du navigateur

console.log('🔍 Diagnostic de la soumission d\'établissement');

// Fonction pour surveiller les requêtes réseau
window.monitorSubmission = function() {
  console.log('📡 Surveillance des requêtes réseau activée');
  
  // Intercepter fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    console.log(`🌐 Requête: ${options.method || 'GET'} ${url}`);
    
    const startTime = Date.now();
    
    return originalFetch.apply(this, args)
      .then(response => {
        const duration = Date.now() - startTime;
        console.log(`✅ Réponse: ${response.status} (${duration}ms) - ${url}`);
        return response;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        console.log(`❌ Erreur: ${error.message} (${duration}ms) - ${url}`);
        throw error;
      });
  };
};

// Fonction pour vérifier l'état du formulaire
window.checkFormState = function() {
  const submitButton = document.querySelector('button[type="button"]:contains("Créer l\'établissement")');
  if (submitButton) {
    const isDisabled = submitButton.disabled;
    const text = submitButton.textContent;
    console.log('🔘 Bouton de soumission:', {
      disabled: isDisabled,
      text: text,
      className: submitButton.className
    });
  }
  
  // Vérifier les erreurs
  const errors = document.querySelectorAll('.text-red-500, .text-red-600, .bg-red-50');
  if (errors.length > 0) {
    console.log('❌ Erreurs détectées:', errors.length);
    errors.forEach((error, index) => {
      console.log(`  Erreur ${index + 1}:`, error.textContent);
    });
  }
};

// Fonction pour forcer la soumission (test)
window.forceSubmit = function() {
  const submitButton = document.querySelector('button[type="button"]:contains("Créer l\'établissement")');
  if (submitButton && !submitButton.disabled) {
    console.log('🚀 Forçage de la soumission...');
    submitButton.click();
  } else {
    console.log('❌ Bouton de soumission non disponible');
  }
};

// Fonction pour surveiller les changements d'état
window.watchSubmission = function() {
  let lastState = null;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        const submitButton = document.querySelector('button[type="button"]:contains("Créer l\'établissement")');
        if (submitButton) {
          const currentState = {
            disabled: submitButton.disabled,
            text: submitButton.textContent,
            className: submitButton.className
          };
          
          if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
            console.log('🔄 État du bouton changé:', currentState);
            lastState = currentState;
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'class']
  });
  
  console.log('👀 Surveillance des changements d\'état activée');
};

console.log('💡 Commandes disponibles:');
console.log('- monitorSubmission() : Surveiller les requêtes réseau');
console.log('- checkFormState() : Vérifier l\'état du formulaire');
console.log('- forceSubmit() : Forcer la soumission (test)');
console.log('- watchSubmission() : Surveiller les changements d\'état');
