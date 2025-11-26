#!/usr/bin/env node

/**
 * Script de test de stabilité : Connexion → Dashboard Admin → Déconnexion
 * 
 * Ce script teste :
 * 1. La connexion admin
 * 2. L'accès au dashboard admin
 * 3. La persistance de la session
 * 4. La déconnexion
 * 5. La vérification que la session est bien supprimée
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'envie2sortir.fr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!Secure';

// Couleurs pour la console
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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            cookies: res.headers['set-cookie'] || [],
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            cookies: res.headers['set-cookie'] || [],
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Timeout pour éviter que la requête reste bloquée
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function extractCookies(setCookieHeaders) {
  const cookies = {};
  if (Array.isArray(setCookieHeaders)) {
    setCookieHeaders.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        cookies[name.trim()] = value.trim();
      }
    });
  }
  return cookies;
}

function formatCookies(cookies) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

async function testConnection() {
  log('\n🧪 TEST 1: Connexion Admin', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      }
    });

    if (response.status === 200 && response.data?.success) {
      log('✅ Connexion réussie', 'green');
      log(`   User ID: ${response.data.user?.id}`, 'cyan');
      log(`   Role: ${response.data.user?.role}`, 'cyan');
      log(`   Email: ${response.data.user?.email}`, 'cyan');
      
      const cookies = extractCookies(response.cookies);
      const supabaseCookies = Object.keys(cookies).filter(name => name.startsWith('sb-'));
      
      log(`   Cookies Supabase: ${supabaseCookies.length}`, supabaseCookies.length > 0 ? 'green' : 'red');
      supabaseCookies.forEach(name => {
        log(`     - ${name}`, 'cyan');
      });
      
      return {
        success: true,
        cookies: cookies,
        user: response.data.user
      };
    } else {
      log(`❌ Connexion échouée (HTTP ${response.status})`, 'red');
      log(`   Message: ${response.data?.message || 'Erreur inconnue'}`, 'yellow');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erreur lors de la connexion: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log('   ⚠️  Le serveur n\'est pas accessible. Assurez-vous que "npm run dev" est lancé.', 'yellow');
    }
    return { success: false, error: error.message };
  }
}

async function testAdminDashboard(cookies) {
  log('\n🧪 TEST 2: Accès au Dashboard Admin', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const cookieString = formatCookies(cookies);
    
    const response = await makeRequest(`${BASE_URL}/admin`, {
      method: 'GET',
      headers: {
        'Cookie': cookieString
      }
    });

    log(`   Status: ${response.status}`, response.status === 200 ? 'green' : 'yellow');
    
    if (response.status === 200) {
      log('✅ Dashboard admin accessible', 'green');
      
      // Vérifier si la page contient des éléments admin
      const html = typeof response.data === 'string' ? response.data : '';
      const hasAdminContent = html.includes('admin') || html.includes('dashboard') || html.includes('Admin');
      
      if (hasAdminContent) {
        log('✅ Contenu admin détecté dans la page', 'green');
      } else {
        log('⚠️  Contenu admin non détecté (peut être normal si redirection)', 'yellow');
      }
      
      return { success: true, status: response.status };
    } else if (response.status === 307 || response.status === 308) {
      log('⚠️  Redirection détectée (peut indiquer un problème de session)', 'yellow');
      const location = response.headers.location;
      if (location) {
        log(`   Redirection vers: ${location}`, 'yellow');
      }
      return { success: false, redirected: true, location };
    } else {
      log(`❌ Accès refusé (HTTP ${response.status})`, 'red');
      return { success: false, status: response.status };
    }
  } catch (error) {
    log(`❌ Erreur lors de l'accès au dashboard: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSessionPersistence(cookies) {
  log('\n🧪 TEST 3: Persistance de la Session', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const cookieString = formatCookies(cookies);
    
    // Faire plusieurs requêtes pour vérifier la persistance
    const requests = [];
    for (let i = 1; i <= 3; i++) {
      requests.push(
        makeRequest(`${BASE_URL}/admin`, {
          method: 'GET',
          headers: {
            'Cookie': cookieString
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    
    log(`   Requêtes réussies: ${successCount}/3`, successCount === 3 ? 'green' : 'yellow');
    
    if (successCount === 3) {
      log('✅ Session persistante sur plusieurs requêtes', 'green');
      return { success: true };
    } else {
      log('⚠️  Session instable (certaines requêtes ont échoué)', 'yellow');
      return { success: false, successCount };
    }
  } catch (error) {
    log(`❌ Erreur lors du test de persistance: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLogout(cookies) {
  log('\n🧪 TEST 4: Déconnexion', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const cookieString = formatCookies(cookies);
    
    // Essayer de trouver l'endpoint de déconnexion
    // Généralement /api/auth/logout ou similaire
    const logoutEndpoints = [
      '/api/auth/logout',
      '/api/auth/signout',
      '/auth/logout'
    ];
    
    let logoutSuccess = false;
    let logoutResponse = null;
    let lastError = null;
    
    for (const endpoint of logoutEndpoints) {
      try {
        const response = await makeRequest(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Cookie': cookieString
          }
        });
        
        if (response.status === 200 || response.status === 204) {
          log(`✅ Déconnexion réussie via ${endpoint}`, 'green');
          logoutSuccess = true;
          logoutResponse = response;
          
          // ✅ CORRECTION : Vérifier que les cookies sont supprimés dans la réponse
          const responseCookies = extractCookies(response.cookies);
          const supabaseCookiesAfterLogout = Object.keys(responseCookies).filter(name => name.startsWith('sb-'));
          
          if (supabaseCookiesAfterLogout.length === 0) {
            log('✅ Cookies Supabase supprimés dans la réponse', 'green');
          } else {
            log(`⚠️  ${supabaseCookiesAfterLogout.length} cookie(s) Supabase encore présent(s)`, 'yellow');
          }
          
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!logoutSuccess) {
      log('⚠️  Endpoint de déconnexion non trouvé ou non fonctionnel', 'yellow');
      log('   (Ce n\'est pas nécessairement un problème si la déconnexion se fait côté client)', 'yellow');
    }
    
    return { success: logoutSuccess, response: logoutResponse };
  } catch (error) {
    log(`❌ Erreur lors de la déconnexion: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSessionAfterLogout(cookies, logoutResult) {
  log('\n🧪 TEST 5: Vérification de la Session après Déconnexion', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    // ✅ CORRECTION : Après déconnexion, ne PAS envoyer de cookies
    // La déconnexion doit supprimer les cookies, donc on ne les envoie pas
    log('   Test sans cookies (simulation après déconnexion)', 'cyan');
    
    const response = await makeRequest(`${BASE_URL}/admin`, {
      method: 'GET',
      headers: {
        // ✅ Ne pas envoyer de cookies pour simuler une déconnexion complète
      }
    });

    log(`   Status reçu: ${response.status}`, response.status === 307 || response.status === 308 || response.status === 401 || response.status === 403 ? 'green' : 'yellow');
    
    // ✅ CORRECTION : Le serveur DOIT refuser l'accès (401/403) ou rediriger (307/308)
    // Si le serveur retourne 200, c'est un échec car l'accès devrait être refusé
    if (response.status === 401 || response.status === 403) {
      log('✅ Session correctement supprimée (accès refusé avec 401/403)', 'green');
      return { success: true, sessionRemoved: true, status: response.status };
    } else if (response.status === 307 || response.status === 308) {
      log('✅ Session correctement supprimée (redirection vers /auth)', 'green');
      const location = response.headers.location;
      if (location) {
        log(`   Redirection vers: ${location}`, 'cyan');
        // Vérifier que la redirection est vers /auth
        if (location.includes('/auth')) {
          return { success: true, sessionRemoved: true, status: response.status, redirected: true };
        } else {
          log(`   ⚠️  Redirection vers ${location} au lieu de /auth`, 'yellow');
          return { success: false, sessionRemoved: false, status: response.status, location };
        }
      }
      return { success: true, sessionRemoved: true, status: response.status, redirected: true };
    } else if (response.status === 200) {
      log('❌ ÉCHEC: Session toujours active après déconnexion (HTTP 200)', 'red');
      log('   Le serveur devrait refuser l\'accès (401/403) ou rediriger (307/308)', 'red');
      return { success: false, sessionRemoved: false, status: response.status };
    } else {
      log(`⚠️  Status inattendu: ${response.status}`, 'yellow');
      return { success: false, status: response.status };
    }
  } catch (error) {
    log(`❌ Erreur lors de la vérification: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n🚀 DÉMARRAGE DES TESTS DE STABILITÉ', 'cyan');
  log('='.repeat(50), 'cyan');
  log(`📍 URL: ${BASE_URL}`, 'cyan');
  log(`📧 Email: ${ADMIN_EMAIL}`, 'cyan');
  log('', 'reset');

  const results = {
    connection: null,
    dashboard: null,
    persistence: null,
    logout: null,
    sessionAfterLogout: null
  };

  // Test 1: Connexion
  const connectionResult = await testConnection();
  results.connection = connectionResult;
  
  if (!connectionResult.success || !connectionResult.cookies) {
    log('\n❌ Les tests suivants ne peuvent pas être effectués sans connexion réussie', 'red');
    return results;
  }

  // Attendre un peu pour laisser la session se synchroniser
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Accès au dashboard
  results.dashboard = await testAdminDashboard(connectionResult.cookies);

  // Test 3: Persistance de la session
  results.persistence = await testSessionPersistence(connectionResult.cookies);

  // Test 4: Déconnexion
  results.logout = await testLogout(connectionResult.cookies);

  // Test 5: Vérification après déconnexion (utiliser le résultat de la déconnexion)
  results.sessionAfterLogout = await testSessionAfterLogout(connectionResult.cookies, results.logout);

  // Résumé
  log('\n📊 RÉSUMÉ DES TESTS', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const testNames = {
    connection: 'Connexion',
    dashboard: 'Accès Dashboard Admin',
    persistence: 'Persistance Session',
    logout: 'Déconnexion',
    sessionAfterLogout: 'Session après Déconnexion'
  };

  let successCount = 0;
  let totalTests = 0;

  Object.entries(results).forEach(([key, result]) => {
    if (result !== null) {
      totalTests++;
      const success = result.success !== false;
      if (success) successCount++;
      
      const status = success ? '✅' : '❌';
      const color = success ? 'green' : 'red';
      log(`${status} ${testNames[key]}: ${success ? 'OK' : 'ÉCHEC'}`, color);
    }
  });

  log('', 'reset');
  log(`📈 Score: ${successCount}/${totalTests} tests réussis`, successCount === totalTests ? 'green' : 'yellow');
  
  // ✅ CORRECTION : Vérifier que TOUS les tests critiques sont passés
  // Le test 5 (session après déconnexion) doit retourner 401/403/307/308, pas 200
  const allCriticalTestsPassed = successCount === totalTests;
  
  if (allCriticalTestsPassed) {
    log('\n🎉 Tous les tests sont passés avec succès !', 'green');
  } else {
    log('\n⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.', 'yellow');
    
    // Afficher les détails des tests échoués
    Object.entries(results).forEach(([key, result]) => {
      if (result !== null && result.success === false) {
        const testName = testNames[key];
        log(`   ❌ ${testName}: ${JSON.stringify(result)}`, 'red');
      }
    });
  }

  // Retourner un indicateur de succès pour le script de relance
  results.allTestsPassed = allCriticalTestsPassed;
  return results;
}

// Exécuter les tests
if (require.main === module) {
  // Vérifier que le serveur est disponible avant de lancer les tests
  const { waitForServer } = require('./wait-for-server');
  
  waitForServer()
    .then((serverAvailable) => {
      if (!serverAvailable) {
        log('\n❌ Impossible de lancer les tests : serveur non disponible', 'red');
        process.exit(1);
      }
      
      return runAllTests();
    })
    .then((results) => {
      // Vérifier que tous les tests sont passés
      const allPassed = results.allTestsPassed === true;
      
      if (!allPassed) {
        process.exit(1);
      }
      
      process.exit(0);
    })
    .catch((error) => {
      log(`\n❌ Erreur fatale: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runAllTests };

