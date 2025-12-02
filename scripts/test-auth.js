/**
 * Script de test pour l'authentification
 * 
 * Ce script teste les différents scénarios d'authentification :
 * - Connexion admin
 * - Vérification des cookies
 * - Redirection après connexion
 * 
 * Usage: node scripts/test-auth.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'envie2sortir.fr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!Secure';

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
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testLogin() {
  log('\n🧪 TEST 1: Connexion Admin', 'cyan');
  log('─'.repeat(50), 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      },
    });

    if (response.status === 200) {
      const data = JSON.parse(response.body);
      
      if (data.success && data.user) {
        log('✅ Connexion réussie', 'green');
        log(`   - User ID: ${data.user.id}`, 'green');
        log(`   - Email: ${data.user.email}`, 'green');
        log(`   - Role: ${data.user.role}`, 'green');
        
        // Vérifier les cookies
        const cookies = response.headers['set-cookie'] || [];
        const supabaseCookies = cookies.filter(c => c.includes('sb-'));
        
        if (supabaseCookies.length > 0) {
          log(`✅ Cookies Supabase détectés: ${supabaseCookies.length}`, 'green');
          supabaseCookies.forEach((cookie, index) => {
            const cookieName = cookie.split('=')[0];
            log(`   - Cookie ${index + 1}: ${cookieName}`, 'green');
          });
        } else {
          log('⚠️  Aucun cookie Supabase détecté dans la réponse', 'yellow');
        }
        
        return { success: true, cookies: supabaseCookies, user: data.user };
      } else {
        log('❌ Connexion échouée: réponse invalide', 'red');
        log(`   Réponse: ${response.body}`, 'red');
        return { success: false };
      }
    } else {
      log(`❌ Connexion échouée: Status ${response.status}`, 'red');
      log(`   Réponse: ${response.body}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erreur lors de la connexion: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSession(cookies) {
  log('\n🧪 TEST 2: Vérification de la session', 'cyan');
  log('─'.repeat(50), 'cyan');
  
  if (!cookies || cookies.length === 0) {
    log('⚠️  Pas de cookies disponibles pour tester la session', 'yellow');
    return { success: false };
  }

  try {
    // Créer un header Cookie avec les cookies reçus
    const cookieHeader = cookies.map(c => {
      const cookieStr = Array.isArray(c) ? c[0] : c;
      return cookieStr.split(';')[0]; // Prendre seulement la partie name=value
    }).join('; ');

    const response = await makeRequest(`${BASE_URL}/api/user/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });

    if (response.status === 200) {
      log('✅ Session valide', 'green');
      const data = JSON.parse(response.body);
      log(`   - User ID: ${data.id || data.user?.id}`, 'green');
      return { success: true };
    } else {
      log(`⚠️  Session non valide: Status ${response.status}`, 'yellow');
      return { success: false };
    }
  } catch (error) {
    log(`⚠️  Erreur lors de la vérification de session: ${error.message}`, 'yellow');
    return { success: false };
  }
}

async function testMiddleware(cookies) {
  log('\n🧪 TEST 3: Vérification du middleware', 'cyan');
  log('─'.repeat(50), 'cyan');
  
  if (!cookies || cookies.length === 0) {
    log('⚠️  Pas de cookies disponibles pour tester le middleware', 'yellow');
    return { success: false };
  }

  try {
    const cookieHeader = cookies.map(c => {
      const cookieStr = Array.isArray(c) ? c[0] : c;
      return cookieStr.split(';')[0];
    }).join('; ');

    // Tester l'accès à /admin avec les cookies
    const response = await makeRequest(`${BASE_URL}/admin`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });

    if (response.status === 200 || response.status === 307 || response.status === 308) {
      log('✅ Middleware fonctionne correctement', 'green');
      log(`   - Status: ${response.status}`, 'green');
      return { success: true };
    } else if (response.status === 401 || response.status === 403) {
      log('⚠️  Accès refusé par le middleware', 'yellow');
      log(`   - Status: ${response.status}`, 'yellow');
      return { success: false };
    } else {
      log(`⚠️  Réponse inattendue: Status ${response.status}`, 'yellow');
      return { success: false };
    }
  } catch (error) {
    log(`⚠️  Erreur lors du test du middleware: ${error.message}`, 'yellow');
    return { success: false };
  }
}

async function testCookieConfiguration() {
  log('\n🧪 TEST 4: Vérification de la configuration des cookies', 'cyan');
  log('─'.repeat(50), 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      },
    });

    if (response.status === 200) {
      const cookies = response.headers['set-cookie'] || [];
      const supabaseCookies = cookies.filter(c => c.includes('sb-'));
      
      if (supabaseCookies.length > 0) {
        log('✅ Cookies Supabase présents', 'green');
        
        supabaseCookies.forEach((cookie, index) => {
          log(`\n   Cookie ${index + 1}:`, 'blue');
          
          // Vérifier Secure
          if (cookie.includes('Secure')) {
            log('   ✅ Secure: activé', 'green');
          } else {
            log('   ⚠️  Secure: désactivé (normal en dev)', 'yellow');
          }
          
          // Vérifier HttpOnly
          if (cookie.includes('HttpOnly')) {
            log('   ⚠️  HttpOnly: activé (peut bloquer le client JS)', 'yellow');
          } else {
            log('   ✅ HttpOnly: désactivé (correct pour Supabase)', 'green');
          }
          
          // Vérifier SameSite
          if (cookie.includes('SameSite=Lax')) {
            log('   ✅ SameSite: Lax', 'green');
          } else if (cookie.includes('SameSite=Strict')) {
            log('   ⚠️  SameSite: Strict (peut causer des problèmes)', 'yellow');
          } else if (cookie.includes('SameSite=None')) {
            log('   ⚠️  SameSite: None (nécessite Secure)', 'yellow');
          } else {
            log('   ⚠️  SameSite: non spécifié', 'yellow');
          }
          
          // Vérifier Path
          if (cookie.includes('Path=/')) {
            log('   ✅ Path: /', 'green');
          } else {
            log('   ⚠️  Path: autre valeur', 'yellow');
          }
        });
        
        return { success: true };
      } else {
        log('❌ Aucun cookie Supabase trouvé', 'red');
        return { success: false };
      }
    } else {
      log(`❌ Impossible de tester: Status ${response.status}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return { success: false };
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(50), 'cyan');
  log('🧪 TESTS D\'AUTHENTIFICATION', 'cyan');
  log('='.repeat(50), 'cyan');
  
  log(`\n📍 URL de test: ${BASE_URL}`, 'blue');
  log(`📧 Email admin: ${ADMIN_EMAIL}`, 'blue');
  
  const results = {
    login: false,
    session: false,
    middleware: false,
    cookies: false,
  };
  
  // Test 1: Login
  const loginResult = await testLogin();
  results.login = loginResult.success;
  
  if (loginResult.success && loginResult.cookies) {
    // Test 2: Session
    const sessionResult = await testSession(loginResult.cookies);
    results.session = sessionResult.success;
    
    // Test 3: Middleware
    const middlewareResult = await testMiddleware(loginResult.cookies);
    results.middleware = middlewareResult.success;
  }
  
  // Test 4: Configuration des cookies
  const cookieResult = await testCookieConfiguration();
  results.cookies = cookieResult.success;
  
  // Résumé
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  log('='.repeat(50), 'cyan');
  
  log(`\n✅ Connexion: ${results.login ? 'PASSÉ' : 'ÉCHOUÉ'}`, results.login ? 'green' : 'red');
  log(`✅ Session: ${results.session ? 'PASSÉ' : 'ÉCHOUÉ'}`, results.session ? 'green' : 'red');
  log(`✅ Middleware: ${results.middleware ? 'PASSÉ' : 'ÉCHOUÉ'}`, results.middleware ? 'green' : 'red');
  log(`✅ Cookies: ${results.cookies ? 'PASSÉ' : 'ÉCHOUÉ'}`, results.cookies ? 'green' : 'red');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n🎉 Tous les tests sont passés !', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Certains tests ont échoué', 'yellow');
    process.exit(1);
  }
}

// Exécuter les tests
runAllTests().catch((error) => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});




