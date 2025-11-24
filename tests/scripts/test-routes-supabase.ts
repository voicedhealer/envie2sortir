#!/usr/bin/env tsx
/**
 * Script de test pour les routes migrées vers Supabase
 * 
 * Usage: npm run test:routes
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const result = config({ path: resolve(process.cwd(), file) });
  if (!result.error) {
    console.log(`📄 Variables chargées depuis ${file}\n`);
    break;
  }
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface TestResult {
  route: string;
  method: string;
  status: 'success' | 'error' | 'skipped';
  statusCode?: number;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

// Fonction pour tester une route
async function testRoute(
  route: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}${route}`;
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    return {
      route,
      method,
      status: response.ok ? 'success' : 'error',
      statusCode: response.status,
      message: response.ok 
        ? `✅ OK (${response.status})` 
        : `❌ Erreur: ${data.error || response.statusText} (${response.status})`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      route,
      method,
      status: 'error',
      message: `❌ Erreur réseau: ${error.message}`,
      duration,
    };
  }
}

// Tests des routes publiques
async function testPublicRoutes() {
  console.log('🔍 Test des routes publiques...\n');

  // Test de santé
  results.push(await testRoute('/api/monitoring/health'));
  results.push(await testRoute('/api/monitoring/liveness'));
  results.push(await testRoute('/api/monitoring/readiness'));

  // Test des catégories
  results.push(await testRoute('/api/categories'));
  results.push(await testRoute('/api/categories?q=restaurant'));

  // Test des établissements
  results.push(await testRoute('/api/establishments/all?limit=5'));
  results.push(await testRoute('/api/establishments/random?limit=3'));

  // Test des événements
  results.push(await testRoute('/api/events/upcoming?limit=5'));

  // Test des deals
  results.push(await testRoute('/api/deals/all?limit=5'));

  console.log('✅ Tests des routes publiques terminés\n');
}

// Tests des routes d'authentification
async function testAuthRoutes() {
  console.log('🔐 Test des routes d\'authentification...\n');

  // Test de vérification d'établissement (nécessite auth)
  results.push(await testRoute('/api/auth/verify-establishment'));

  console.log('✅ Tests des routes d\'authentification terminés\n');
}

// Tests des routes admin (nécessitent auth)
async function testAdminRoutes() {
  console.log('👑 Test des routes admin...\n');

  // Ces routes nécessitent une authentification admin
  // On teste juste que la route existe et retourne 401 si non authentifié
  results.push(await testRoute('/api/admin/stats'));
  results.push(await testRoute('/api/admin/pending-count'));
  results.push(await testRoute('/api/admin/metrics'));
  results.push(await testRoute('/api/admin/professionals'));

  console.log('✅ Tests des routes admin terminés\n');
}

// Tests des routes de recherche
async function testSearchRoutes() {
  console.log('🔍 Test des routes de recherche...\n');

  results.push(await testRoute('/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5'));
  results.push(await testRoute('/api/recherche/filtered?limit=5'));

  console.log('✅ Tests des routes de recherche terminés\n');
}

// Tests des routes newsletter
async function testNewsletterRoutes() {
  console.log('📧 Test des routes newsletter...\n');

  // Test d'inscription newsletter (publique)
  results.push(await testRoute('/api/newsletter/subscribe', 'POST', {
    email: 'test@example.com',
    firstName: 'Test',
    preferences: {}
  }));

  console.log('✅ Tests des routes newsletter terminés\n');
}

// Tests des routes analytics
async function testAnalyticsRoutes() {
  console.log('📊 Test des routes analytics...\n');

  // Test de tracking (publique)
  results.push(await testRoute('/api/analytics/search/track', 'POST', {
    search_term: 'restaurant',
    result_count: 10
  }));

  // Test de récupération des analytics de recherche
  results.push(await testRoute('/api/analytics/search'));

  // Test de tracking de clics (nécessite auth)
  results.push(await testRoute('/api/analytics/track', 'POST', {
    establishment_id: 'test-id',
    element_type: 'button',
    element_name: 'test-button'
  }));

  console.log('✅ Tests des routes analytics terminés\n');
}

// Tests des routes utilisateur
async function testUserRoutes() {
  console.log('👤 Test des routes utilisateur...\n');

  // Ces routes nécessitent une authentification
  // On teste juste que la route existe et retourne 401 si non authentifié
  results.push(await testRoute('/api/user/favorites'));
  results.push(await testRoute('/api/user/comments'));
  results.push(await testRoute('/api/user/location-preferences'));
  results.push(await testRoute('/api/user/gamification'));

  console.log('✅ Tests des routes utilisateur terminés\n');
}

// Tests des routes professionnelles
async function testProfessionalRoutes() {
  console.log('💼 Test des routes professionnelles...\n');

  // Ces routes nécessitent une authentification professionnelle
  // Note: /api/professional/profile et /api/professional/events n'ont pas de GET, seulement PUT/POST
  results.push(await testRoute('/api/professional/dashboard'));
  results.push(await testRoute('/api/professional/establishment'));
  results.push(await testRoute('/api/professional/pricing', 'GET'));
  results.push(await testRoute('/api/professional/update-requests'));

  console.log('✅ Tests des routes professionnelles terminés\n');
}

// Tests des routes deals
async function testDealsRoutes() {
  console.log('🎁 Test des routes deals...\n');

  // Routes publiques
  results.push(await testRoute('/api/deals/engagement?dealId=test-id'));

  // Routes nécessitant auth
  results.push(await testRoute('/api/deals', 'POST', {
    title: 'Test Deal',
    description: 'Test',
    establishmentId: 'test-id'
  }));

  console.log('✅ Tests des routes deals terminés\n');
}

// Tests des routes établissements
async function testEstablishmentsRoutes() {
  console.log('🏢 Test des routes établissements...\n');

  // Routes publiques
  results.push(await testRoute('/api/public/establishments/test-slug/comments'));
  results.push(await testRoute('/api/public/establishments/test-slug/menus'));

  // Routes nécessitant auth
  results.push(await testRoute('/api/establishments/test-id/stats', 'POST', {
    type: 'view'
  }));
  results.push(await testRoute('/api/establishments/test-id/menus'));
  results.push(await testRoute('/api/etablissements/test-slug/images'));
  results.push(await testRoute('/api/etablissements/test-slug/events'));

  console.log('✅ Tests des routes établissements terminés\n');
}

// Tests des routes dashboard
async function testDashboardRoutes() {
  console.log('📊 Test des routes dashboard...\n');

  // Routes nécessitant auth professionnelle
  results.push(await testRoute('/api/dashboard/events'));
  results.push(await testRoute('/api/dashboard/images'));
  results.push(await testRoute('/api/dashboard/change-password', 'POST', {
    currentPassword: 'test',
    newPassword: 'test123'
  }));

  console.log('✅ Tests des routes dashboard terminés\n');
}

// Tests des routes messaging
async function testMessagingRoutes() {
  console.log('💬 Test des routes messaging...\n');

  // Routes nécessitant auth
  results.push(await testRoute('/api/messaging/conversations'));
  results.push(await testRoute('/api/messaging/unread-count'));

  console.log('✅ Tests des routes messaging terminés\n');
}

// Tests des routes admin supplémentaires
async function testAdminAdditionalRoutes() {
  console.log('👑 Test des routes admin supplémentaires...\n');

  // Routes admin nécessitant auth
  results.push(await testRoute('/api/admin/establishments'));
  results.push(await testRoute('/api/admin/actions'));
  results.push(await testRoute('/api/admin/learning/stats'));
  results.push(await testRoute('/api/admin/learning/patterns'));
  results.push(await testRoute('/api/admin/analytics/establishments'));
  results.push(await testRoute('/api/admin/newsletter/subscribers'));
  results.push(await testRoute('/api/admin/newsletter/stats'));

  console.log('✅ Tests des routes admin supplémentaires terminés\n');
}

// Tests des routes vérification
async function testVerificationRoutes() {
  console.log('✅ Test des routes de vérification...\n');

  // Routes de vérification
  results.push(await testRoute('/api/check-email', 'POST', {
    email: 'test@example.com'
  }));
  results.push(await testRoute('/api/check-siret', 'POST', {
    siret: '12345678901234'
  }));

  console.log('✅ Tests des routes de vérification terminés\n');
}

// Tests des routes établissements par slug
async function testEstablishmentsBySlugRoutes() {
  console.log('🔗 Test des routes établissements par slug...\n');

  // Test avec un slug fictif (retournera probablement 404, mais teste la route)
  results.push(await testRoute('/api/etablissements/test-establishment-slug'));

  console.log('✅ Tests des routes établissements par slug terminés\n');
}

// Vérifier la connexion Supabase
async function checkSupabaseConnection() {
  console.log('🔌 Vérification de la connexion Supabase...\n');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️  Variables Supabase non configurées\n');
    return false;
  }

  console.log(`✅ URL Supabase: ${SUPABASE_URL.substring(0, 30)}...`);
  console.log(`✅ Clé anonyme configurée: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);
  return true;
}

// Vérifier que le serveur est en cours d'exécution
async function checkServer() {
  console.log('🌐 Vérification du serveur Next.js...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/monitoring/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      console.log(`✅ Serveur accessible sur ${BASE_URL}\n`);
      return true;
    } else {
      console.log(`⚠️  Serveur répond mais avec erreur: ${response.status}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Serveur non accessible sur ${BASE_URL}`);
    console.log(`   Erreur: ${error.message}`);
    console.log(`   💡 Assurez-vous que le serveur Next.js est en cours d'exécution: npm run dev\n`);
    return false;
  }
}

// Générer le rapport
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE TEST');
  console.log('='.repeat(60) + '\n');

  const success = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  console.log(`✅ Succès: ${success}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`⏭️  Ignorés: ${skipped}`);
  console.log(`📈 Total: ${results.length}`);
  console.log(`📊 Taux de succès: ${((success / results.length) * 100).toFixed(1)}%\n`);

  // Afficher les routes en erreur (sauf 401/403 qui sont normales pour les routes protégées)
  const realErrors = results.filter(r => 
    r.status === 'error' && 
    r.statusCode !== 401 && 
    r.statusCode !== 403 &&
    !r.message.includes('fetch failed')
  );

  if (realErrors.length > 0) {
    console.log('❌ Routes en erreur (hors auth):\n');
    realErrors.forEach(r => {
      console.log(`  ${r.method} ${r.route}`);
      console.log(`    ${r.message}\n`);
    });
  }

  // Afficher les routes protégées (401/403) - c'est normal
  const protectedRoutes = results.filter(r => 
    r.statusCode === 401 || r.statusCode === 403
  );

  if (protectedRoutes.length > 0) {
    console.log(`\n🔒 Routes protégées détectées (${protectedRoutes.length}) - Normal si non authentifié\n`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 Détails des tests\n');

  results.forEach((result, index) => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${index + 1}. ${icon} ${result.method} ${result.route}${duration}`);
    if (result.statusCode) {
      console.log(`   Status: ${result.statusCode}`);
    }
    if (result.message && result.status === 'error') {
      console.log(`   ${result.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage des tests des routes Supabase\n');
  console.log('='.repeat(60) + '\n');

  // Vérifications préliminaires
  const supabaseOk = await checkSupabaseConnection();
  const serverOk = await checkServer();

  if (!serverOk) {
    console.log('\n❌ Impossible de continuer sans serveur actif\n');
    process.exit(1);
  }

  // Lancer les tests
  await testPublicRoutes();
  await testAuthRoutes();
  await testAdminRoutes();
  await testAdminAdditionalRoutes();
  await testSearchRoutes();
  await testNewsletterRoutes();
  await testAnalyticsRoutes();
  await testUserRoutes();
  await testProfessionalRoutes();
  await testDealsRoutes();
  await testEstablishmentsRoutes();
  await testEstablishmentsBySlugRoutes();
  await testDashboardRoutes();
  await testMessagingRoutes();
  await testVerificationRoutes();

  // Générer le rapport
  generateReport();

  // Code de sortie
  const hasErrors = results.some(r => r.status === 'error');
  process.exit(hasErrors ? 1 : 0);
}

// Exécuter les tests
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

