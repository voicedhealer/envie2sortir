/**
 * Script de test pour la navigation admin avec mesure des temps de chargement
 * Teste le flux complet : connexion -> navigation sur tous les onglets -> déconnexion
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'envie2sortir.fr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!Secure';

let sessionCookie = null;
const results = {
  login: { success: false, time: 0 },
  pages: [],
  logout: { success: false, time: 0 },
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

function logPage(message) {
  log(`📄 ${message}`, 'magenta');
}

function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Pages admin à tester
const adminPages = [
  { path: '/admin', name: 'Dashboard Principal' },
  { path: '/admin/etablissements', name: 'Établissements' },
  { path: '/admin/modifications', name: 'Modifications' },
  { path: '/admin/messagerie', name: 'Messagerie' },
  { path: '/admin/historique', name: 'Historique' },
  { path: '/admin/analytics', name: 'Analytics' },
  { path: '/admin/learning', name: 'Learning' },
  { path: '/admin/newsletter', name: 'Newsletter' },
  { path: '/admin/recherches', name: 'Recherches' },
  { path: '/admin/images', name: 'Images' },
  { path: '/admin/test-metrics', name: 'Test Metrics' },
];

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
  const startTime = Date.now();
  
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
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Extraire les cookies de la réponse
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      sessionCookie = setCookieHeader.split(';')[0];
    }

    if (response.ok && data.success) {
      results.login = { success: true, time: duration };
      logSuccess(`Connexion réussie pour ${ADMIN_EMAIL} (${formatTime(duration)})`);
      logInfo(`Rôle détecté: ${data.user?.role || 'non défini'}`);
      return true;
    } else {
      results.login = { success: false, time: duration };
      logError(`Échec de la connexion: ${data.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    results.login = { success: false, time: duration };
    logError(`Erreur lors de la connexion: ${error.message}`);
    return false;
  }
}

async function testPageLoad(path, name) {
  logPage(`Test de chargement: ${name} (${path})`);
  const startTime = Date.now();
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      redirect: 'manual',
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Mesurer aussi le temps de chargement du contenu
    let contentLoadTime = duration;
    if (response.ok || response.status === 200) {
      const contentStartTime = Date.now();
      await response.text(); // Charger le contenu
      const contentEndTime = Date.now();
      contentLoadTime = contentEndTime - contentStartTime;
    }

    const pageResult = {
      path,
      name,
      success: response.ok || response.status === 200,
      status: response.status,
      time: duration,
      contentTime: contentLoadTime,
      redirected: response.status >= 300 && response.status < 400,
      redirectLocation: response.status >= 300 && response.status < 400 
        ? response.headers.get('location') 
        : null,
    };

    results.pages.push(pageResult);

    if (pageResult.success) {
      logSuccess(`${name}: ${formatTime(duration)} (contenu: ${formatTime(contentLoadTime)})`);
    } else if (pageResult.redirected) {
      logWarning(`${name}: Redirection vers ${pageResult.redirectLocation} (${formatTime(duration)})`);
    } else {
      logError(`${name}: Échec (${response.status}) - ${formatTime(duration)}`);
    }

    return pageResult;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const pageResult = {
      path,
      name,
      success: false,
      status: 0,
      time: duration,
      contentTime: duration,
      error: error.message,
    };
    results.pages.push(pageResult);
    logError(`${name}: Erreur - ${error.message} (${formatTime(duration)})`);
    return pageResult;
  }
}

async function testAdminLogout() {
  logInfo('Test de déconnexion admin...');
  const startTime = Date.now();
  
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
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.ok && data.success) {
      results.logout = { success: true, time: duration };
      logSuccess(`Déconnexion réussie (${formatTime(duration)})`);
      sessionCookie = null;
      return true;
    } else {
      results.logout = { success: false, time: duration };
      logError(`Échec de la déconnexion: ${data.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    results.logout = { success: false, time: duration };
    logError(`Erreur lors de la déconnexion: ${error.message}`);
    return false;
  }
}

function generateReport() {
  log('\n' + '='.repeat(80), 'blue');
  log('📊 RAPPORT DE PERFORMANCE - NAVIGATION ADMIN', 'blue');
  log('='.repeat(80) + '\n', 'blue');

  // Résumé de la connexion
  log('🔐 CONNEXION', 'cyan');
  if (results.login.success) {
    logSuccess(`Connexion réussie en ${formatTime(results.login.time)}`);
  } else {
    logError(`Échec de la connexion (${formatTime(results.login.time)})`);
  }

  // Statistiques des pages
  log('\n📄 PAGES TESTÉES', 'cyan');
  const successfulPages = results.pages.filter(p => p.success);
  const failedPages = results.pages.filter(p => !p.success);
  const redirectedPages = results.pages.filter(p => p.redirected);

  log(`Total: ${results.pages.length} pages`);
  logSuccess(`Réussies: ${successfulPages.length}`);
  if (redirectedPages.length > 0) {
    logWarning(`Redirigées: ${redirectedPages.length}`);
  }
  if (failedPages.length > 0) {
    logError(`Échouées: ${failedPages.length}`);
  }

  // Temps de chargement
  if (successfulPages.length > 0) {
    const times = successfulPages.map(p => p.time);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    log('\n⏱️  TEMPS DE CHARGEMENT', 'cyan');
    log(`Moyenne: ${formatTime(avgTime)}`);
    log(`Minimum: ${formatTime(minTime)} (${successfulPages.find(p => p.time === minTime)?.name})`);
    log(`Maximum: ${formatTime(maxTime)} (${successfulPages.find(p => p.time === maxTime)?.name})`);

    // Pages les plus lentes
    const slowPages = successfulPages
      .sort((a, b) => b.time - a.time)
      .slice(0, 3);
    
    if (slowPages.length > 0) {
      log('\n🐌 PAGES LES PLUS LENTES', 'yellow');
      slowPages.forEach((page, index) => {
        log(`${index + 1}. ${page.name}: ${formatTime(page.time)}`);
      });
    }

    // Pages les plus rapides
    const fastPages = successfulPages
      .sort((a, b) => a.time - b.time)
      .slice(0, 3);
    
    if (fastPages.length > 0) {
      log('\n⚡ PAGES LES PLUS RAPIDES', 'green');
      fastPages.forEach((page, index) => {
        log(`${index + 1}. ${page.name}: ${formatTime(page.time)}`);
      });
    }
  }

  // Détails par page
  log('\n📋 DÉTAILS PAR PAGE', 'cyan');
  results.pages.forEach((page, index) => {
    const status = page.success ? '✅' : page.redirected ? '⚠️' : '❌';
    const color = page.success ? 'green' : page.redirected ? 'yellow' : 'red';
    log(`${status} ${page.name.padEnd(25)} ${formatTime(page.time).padStart(10)} (${page.status})`, color);
  });

  // Résumé de la déconnexion
  log('\n🚪 DÉCONNEXION', 'cyan');
  if (results.logout.success) {
    logSuccess(`Déconnexion réussie en ${formatTime(results.logout.time)}`);
  } else {
    logError(`Échec de la déconnexion (${formatTime(results.logout.time)})`);
  }

  // Résumé global
  log('\n' + '='.repeat(80), 'blue');
  const totalTests = 1 + results.pages.length + 1; // login + pages + logout
  const passedTests = (results.login.success ? 1 : 0) + 
                      successfulPages.length + 
                      (results.logout.success ? 1 : 0);
  
  log(`\nTotal: ${passedTests}/${totalTests} tests réussis\n`, 
      passedTests === totalTests ? 'green' : 'yellow');

  if (passedTests === totalTests) {
    logSuccess('🎉 Tous les tests sont passés avec succès !');
  } else {
    logWarning('⚠️  Certains tests ont échoué');
  }

  log('='.repeat(80) + '\n', 'blue');
}

async function runTests() {
  log('\n' + '='.repeat(80), 'blue');
  log('🧪 TESTS DE NAVIGATION ADMIN AVEC MESURE DE PERFORMANCE', 'blue');
  log('='.repeat(80) + '\n', 'blue');

  // Test 1: Connexion au serveur
  log('\n📡 Test 1: Connexion au serveur', 'cyan');
  const serverConnected = await testConnection();
  if (!serverConnected) {
    logError('Impossible de continuer sans connexion au serveur');
    process.exit(1);
  }

  // Test 2: Connexion admin
  log('\n🔐 Test 2: Connexion admin', 'cyan');
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    logError('Impossible de continuer sans connexion admin');
    process.exit(1);
  }

  // Attendre un peu pour laisser la session se synchroniser
  logInfo('Attente de 2 secondes pour la synchronisation de la session...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Navigation sur toutes les pages
  log('\n📄 Test 3: Navigation sur les pages admin', 'cyan');
  log(`Test de ${adminPages.length} pages...\n`);
  
  for (let i = 0; i < adminPages.length; i++) {
    const page = adminPages[i];
    await testPageLoad(page.path, page.name);
    
    // Petit délai entre les pages pour éviter de surcharger le serveur
    if (i < adminPages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Test 4: Déconnexion
  log('\n🚪 Test 4: Déconnexion admin', 'cyan');
  await testAdminLogout();

  // Générer le rapport
  generateReport();

  // Code de sortie
  const totalTests = 1 + results.pages.length + 1;
  const passedTests = (results.login.success ? 1 : 0) + 
                      results.pages.filter(p => p.success).length + 
                      (results.logout.success ? 1 : 0);
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Exécuter les tests
runTests().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

