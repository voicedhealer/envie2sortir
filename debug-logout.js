// Script de diagnostic pour la déconnexion admin
// À exécuter dans la console du navigateur

console.log('🔍 Diagnostic de la déconnexion admin');

// Fonction pour surveiller les requêtes de déconnexion
window.monitorLogout = function() {
  console.log('📡 Surveillance des requêtes de déconnexion activée');
  
  // Intercepter fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    if (url.includes('signout') || url.includes('logout')) {
      console.log(`🚪 Requête de déconnexion: ${options.method || 'GET'} ${url}`);
      
      const startTime = Date.now();
      
      return originalFetch.apply(this, args)
        .then(response => {
          const duration = Date.now() - startTime;
          console.log(`✅ Réponse déconnexion: ${response.status} (${duration}ms) - ${url}`);
          
          if (response.status === 200) {
            console.log('✅ Déconnexion réussie côté serveur');
            console.log('🔄 Vérification de la redirection...');
            
            // Vérifier si on est toujours sur la page admin
            setTimeout(() => {
              if (window.location.pathname.startsWith('/admin')) {
                console.log('❌ PROBLÈME: Toujours sur la page admin après déconnexion');
                console.log('🔧 Tentative de redirection manuelle...');
                window.location.href = '/';
              } else {
                console.log('✅ Redirection réussie');
              }
            }, 1000);
          }
          
          return response;
        })
        .catch(error => {
          const duration = Date.now() - startTime;
          console.log(`❌ Erreur déconnexion: ${error.message} (${duration}ms) - ${url}`);
          throw error;
        });
    }
    
    return originalFetch.apply(this, args);
  };
};

// Fonction pour forcer la déconnexion
window.forceLogout = function() {
  console.log('🚪 Forçage de la déconnexion...');
  
  // Méthode 1: signOut NextAuth
  if (window.next && window.next.auth) {
    console.log('🔄 Tentative avec NextAuth...');
    window.next.auth.signOut({ redirect: false })
      .then(() => {
        console.log('✅ NextAuth signOut réussi');
        window.location.href = '/';
      })
      .catch(error => {
        console.error('❌ NextAuth signOut échoué:', error);
        window.location.href = '/';
      });
  } else {
    // Méthode 2: Appel direct à l'API
    console.log('🔄 Tentative avec appel API direct...');
    fetch('/api/auth/signout', { method: 'POST' })
      .then(response => {
        console.log('✅ API signout appelée:', response.status);
        window.location.href = '/';
      })
      .catch(error => {
        console.error('❌ API signout échoué:', error);
        window.location.href = '/';
      });
  }
};

// Fonction pour vérifier l'état de la session
window.checkSession = function() {
  console.log('🔍 Vérification de l\'état de la session...');
  
  // Vérifier les cookies de session
  const cookies = document.cookie.split(';');
  const sessionCookies = cookies.filter(cookie => 
    cookie.includes('next-auth') || cookie.includes('session')
  );
  
  console.log('🍪 Cookies de session:', sessionCookies);
  
  // Vérifier le localStorage
  const localStorage = window.localStorage;
  const sessionKeys = Object.keys(localStorage).filter(key => 
    key.includes('next-auth') || key.includes('session')
  );
  
  console.log('💾 Clés de session dans localStorage:', sessionKeys);
  
  // Vérifier l'URL actuelle
  console.log('📍 URL actuelle:', window.location.href);
  console.log('🔒 Sur page admin:', window.location.pathname.startsWith('/admin'));
};

// Fonction pour nettoyer complètement la session
window.clearSession = function() {
  console.log('🧹 Nettoyage complet de la session...');
  
  // Supprimer les cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Supprimer le localStorage
  localStorage.clear();
  
  // Supprimer le sessionStorage
  sessionStorage.clear();
  
  console.log('✅ Session nettoyée, redirection...');
  window.location.href = '/';
};

console.log('💡 Commandes disponibles:');
console.log('- monitorLogout() : Surveiller les requêtes de déconnexion');
console.log('- forceLogout() : Forcer la déconnexion');
console.log('- checkSession() : Vérifier l\'état de la session');
console.log('- clearSession() : Nettoyer complètement la session');
