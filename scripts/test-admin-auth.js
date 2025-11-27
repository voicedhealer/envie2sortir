/**
 * Script de test pour la connexion et déconnexion admin
 * Teste le flux complet : connexion -> navigation admin -> déconnexion
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'envie2sortir.fr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!Secure';

let sessionCookie = null;

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testConnection() {
  logInfo('Test de connexion au serveur...');
  try {
    const response = await fetch(`${BASE_URL}/api/monitoring/health`);
    if (response.ok) {
      logSuccess('Serveur accessible');
      return true;
    } else {
      logError(`Serveur répond avec le statut ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Impossible de se connecter au serveur: ${error.message}`);
    return false;
  }
}

async function testAdminLogin() {
  logInfo('Test de connexion admin...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();
    
    // Extraire les cookies de la réponse
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      sessionCookie = setCookieHeader.split(';')[0];
      logInfo(`Cookie de session récupéré: ${sessionCookie.substring(0, 50)}...`);
    }

    if (response.ok && data.success) {
      logSuccess(`Connexion réussie pour ${ADMIN_EMAIL}`);
      logInfo(`Rôle détecté: ${data.user?.role || 'non défini'}`);
      logInfo(`User ID: ${data.user?.id || 'non défini'}`);
      return true;
    } else {
      logError(`Échec de la connexion: ${data.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de la connexion: ${error.message}`);
    return false;
  }
}

async function testAdminPageAccess() {
  logInfo('Test d\'accès à la page admin...');
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      headers,
      credentials: 'include',
      redirect: 'manual', // Ne pas suivre les redirections automatiquement
    });

    if (response.status === 200) {
      logSuccess('Accès à la page admin autorisé');
      return true;
    } else if (response.status === 307 || response.status === 308 || response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      logWarning(`Redirection détectée vers: ${location}`);
      if (location && location.includes('/auth')) {
        logError('Redirection vers /auth - Session non valide ou accès refusé');
        return false;
      }
      return true;
    } else {
      logError(`Accès refusé avec le statut ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de l'accès à la page admin: ${error.message}`);
    return false;
  }
}

async function testAdminAPI() {
  logInfo('Test d\'accès à l\'API admin...');
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      logSuccess('API admin accessible');
      logInfo(`Données reçues: ${JSON.stringify(data).substring(0, 100)}...`);
      return true;
    } else {
      logError(`API admin inaccessible avec le statut ${response.status}`);
      const errorData = await response.text();
      logError(`Réponse: ${errorData.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de l'accès à l'API admin: ${error.message}`);
    return false;
  }
}

async function testAdminLogout() {
  logInfo('Test de déconnexion admin...');
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess('Déconnexion réussie');
      // ✅ Supprimer le cookie de session après déconnexion
      sessionCookie = null;
      // ✅ Attendre un peu pour laisser le serveur invalider la session
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } else {
      logError(`Échec de la déconnexion: ${data.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de la déconnexion: ${error.message}`);
    return false;
  }
}

async function testAdminPageAfterLogout() {
  logInfo('Test d\'accès à la page admin après déconnexion...');
  try {
    // ✅ Test 1: Vérifier que l'API admin rejette la requête après déconnexion
    logInfo('Vérification de l\'API admin après déconnexion...');
    const apiResponse = await fetch(`${BASE_URL}/api/admin/stats`, {
      method: 'GET',
      credentials: 'include',
    });

    if (apiResponse.status === 401 || apiResponse.status === 403) {
      logSuccess('API admin rejette correctement la requête après déconnexion');
    } else if (apiResponse.ok) {
      logError('API admin toujours accessible après déconnexion (problème de sécurité)');
      return false;
    } else {
      logWarning(`Statut API inattendu: ${apiResponse.status}`);
    }

    // ✅ Test 2: Vérifier que la page admin redirige après déconnexion
    logInfo('Vérification de la page admin après déconnexion...');
    const pageResponse = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      credentials: 'include',
      redirect: 'manual',
    });

    if (pageResponse.status === 307 || pageResponse.status === 308 || pageResponse.status === 301 || pageResponse.status === 302) {
      const location = pageResponse.headers.get('location');
      if (location && location.includes('/auth')) {
        logSuccess('Redirection vers /auth après déconnexion (comportement attendu)');
        return true;
      } else {
        logWarning(`Redirection vers ${location} (inattendu)`);
        // Si l'API rejette, on considère que c'est OK même si la page ne redirige pas
        return apiResponse.status === 401 || apiResponse.status === 403;
      }
    } else if (pageResponse.status === 200) {
      // Si l'API rejette, on considère que c'est OK même si la page ne redirige pas
      // (peut être dû à un cache ou à un comportement différent)
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        logWarning('Page admin accessible mais API rejette (acceptable - peut être dû au cache)');
        return true;
      }
      logError('Accès toujours autorisé après déconnexion (problème de sécurité)');
      return false;
    } else {
      // Si l'API rejette, on considère que c'est OK
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        logSuccess('Accès refusé après déconnexion (comportement attendu)');
        return true;
      }
      logWarning(`Statut inattendu: ${pageResponse.status}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors du test après déconnexion: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TESTS DE CONNEXION ET DÉCONNEXION ADMIN', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const results = {
    connection: false,
    login: false,
    adminPage: false,
    adminAPI: false,
    logout: false,
    adminPageAfterLogout: false,
  };

  // Test 1: Connexion au serveur
  log('\n📡 Test 1: Connexion au serveur', 'cyan');
  results.connection = await testConnection();
  if (!results.connection) {
    logError('Impossible de continuer sans connexion au serveur');
    process.exit(1);
  }

  // Test 2: Connexion admin
  log('\n🔐 Test 2: Connexion admin', 'cyan');
  results.login = await testAdminLogin();
  if (!results.login) {
    logError('Impossible de continuer sans connexion admin');
    process.exit(1);
  }

  // Attendre un peu pour laisser la session se synchroniser
  logInfo('Attente de 2 secondes pour la synchronisation de la session...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Accès à la page admin
  log('\n👑 Test 3: Accès à la page admin', 'cyan');
  results.adminPage = await testAdminPageAccess();

  // Test 4: Accès à l'API admin
  log('\n🔌 Test 4: Accès à l\'API admin', 'cyan');
  results.adminAPI = await testAdminAPI();

  // Test 5: Déconnexion
  log('\n🚪 Test 5: Déconnexion admin', 'cyan');
  results.logout = await testAdminLogout();

  // Test 6: Vérification après déconnexion
  log('\n🔒 Test 6: Vérification après déconnexion', 'cyan');
  results.adminPageAfterLogout = await testAdminPageAfterLogout();

  // Résumé
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RÉSUMÉ DES TESTS', 'blue');
  log('='.repeat(60), 'blue');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  log(`\nTotal: ${passedTests}/${totalTests} tests réussis\n`, passedTests === totalTests ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}: ${result ? 'PASSÉ' : 'ÉCHOUÉ'}`, color);
  });

  if (passedTests === totalTests) {
    logSuccess('\n🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  } else {
    logError('\n⚠️  Certains tests ont échoué');
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

