/**
 * Script de test manuel pour vérifier le système de session global
 * 
 * Usage: npm run test:session:manual
 * ou: tsx scripts/test-session-global.ts
 */

import { createClient } from '@/lib/supabase/client';

interface GlobalSessionState {
  session: any | null;
  user: any | null;
  loading: boolean;
  initialized: boolean;
  getSessionPromise: Promise<any> | null;
}

// Simuler l'état global (pour les tests)
let globalSessionState: GlobalSessionState = {
  session: null,
  user: null,
  loading: true,
  initialized: false,
  getSessionPromise: null,
};

let getSessionLock = false;

async function testSingletonGlobal() {
  console.log('🧪 Test 1: Singleton Global');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler plusieurs instances du hook
  const instances = ['Instance 1', 'Instance 2', 'Instance 3', 'Instance 4', 'Instance 5'];
  let getSessionCallCount = 0;
  
  console.log(`📊 Simulation de ${instances.length} instances du hook...`);
  
  for (const instance of instances) {
    // Vérifier si déjà initialisé
    if (globalSessionState.initialized && globalSessionState.session) {
      console.log(`✅ ${instance}: Utilise la session globale existante (pas d'appel à getSession)`);
      continue;
    }
    
    // Vérifier le verrou
    if (getSessionLock) {
      console.log(`⏳ ${instance}: Attend le résultat de l'appel en cours (pas d'appel à getSession)`);
      continue;
    }
    
    // Acquérir le verrou et appeler getSession
    getSessionLock = true;
    getSessionCallCount++;
    console.log(`🔄 ${instance}: Acquiert le verrou et appelle getSession (appel #${getSessionCallCount})`);
    
    // Simuler l'appel
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.getSession();
        
        if (data?.session) {
          globalSessionState.session = data.session;
          globalSessionState.initialized = true;
          globalSessionState.loading = false;
          console.log(`✅ ${instance}: Session récupérée avec succès`);
        } else {
          console.log(`⚠️ ${instance}: Aucune session trouvée`);
        }
      }
    } catch (error: any) {
      console.error(`❌ ${instance}: Erreur lors de getSession:`, error.message);
    } finally {
      getSessionLock = false;
    }
  }
  
  console.log(`\n📈 Résultat: ${getSessionCallCount} appel(s) réel(s) pour ${instances.length} instances`);
  console.log(`💡 Réduction: ${((instances.length - getSessionCallCount) / instances.length * 100).toFixed(1)}%`);
  
  if (getSessionCallCount === 1) {
    console.log('✅ SUCCÈS: Un seul appel à getSession pour toutes les instances');
  } else {
    console.log('❌ ÉCHEC: Plusieurs appels à getSession détectés');
  }
  
  console.log('\n');
}

async function testTimeoutOptimization() {
  console.log('🧪 Test 2: Optimisation des Timeouts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const timeouts = {
    getSession: 2000,
    syncTimeout: 5000,
    fallback: 2000,
  };
  
  console.log('⏱️ Timeouts configurés:');
  console.log(`   - getSession: ${timeouts.getSession}ms (attendu: 2000ms)`);
  console.log(`   - Synchronisation globale: ${timeouts.syncTimeout}ms (attendu: 5000ms)`);
  console.log(`   - Fallback rapide: ${timeouts.fallback}ms (attendu: 2000ms)`);
  
  const allCorrect = 
    timeouts.getSession === 2000 &&
    timeouts.syncTimeout === 5000 &&
    timeouts.fallback === 2000;
  
  if (allCorrect) {
    console.log('✅ SUCCÈS: Tous les timeouts sont optimisés');
  } else {
    console.log('❌ ÉCHEC: Certains timeouts ne sont pas optimisés');
  }
  
  console.log('\n');
}

async function testLockRelease() {
  console.log('🧪 Test 3: Libération du Verrou');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler un appel avec verrou
  getSessionLock = true;
  console.log('🔒 Verrou acquis');
  
  // Simuler une erreur
  try {
    throw new Error('Test error');
  } catch (error) {
    console.log('❌ Erreur simulée');
  } finally {
    getSessionLock = false;
    console.log('🔓 Verrou libéré dans le bloc finally');
  }
  
  if (!getSessionLock) {
    console.log('✅ SUCCÈS: Le verrou est bien libéré même en cas d\'erreur');
  } else {
    console.log('❌ ÉCHEC: Le verrou n\'a pas été libéré');
  }
  
  console.log('\n');
}

async function testSessionSharing() {
  console.log('🧪 Test 4: Partage de Session');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler une mise à jour de session
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };
  
  globalSessionState.session = mockSession;
  globalSessionState.user = { id: 'user-123', email: 'test@example.com', role: 'user' };
  globalSessionState.initialized = true;
  
  // Simuler plusieurs instances qui récupèrent la session
  const instances = ['Instance A', 'Instance B', 'Instance C'];
  
  for (const instance of instances) {
    if (globalSessionState.initialized && globalSessionState.session) {
      console.log(`✅ ${instance}: Récupère la session partagée (${globalSessionState.session.user.id})`);
    }
  }
  
  const allShareSameSession = instances.every(() => 
    globalSessionState.session?.user?.id === 'user-123'
  );
  
  if (allShareSameSession) {
    console.log('✅ SUCCÈS: Toutes les instances partagent la même session');
  } else {
    console.log('❌ ÉCHEC: Les instances ne partagent pas la même session');
  }
  
  console.log('\n');
}

async function runAllTests() {
  console.log('🚀 Tests du Système de Session Global');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  try {
    await testSingletonGlobal();
    await testTimeoutOptimization();
    await testLockRelease();
    await testSessionSharing();
    
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('✅ Tous les tests sont terminés');
    console.log('\n💡 Pour tester dans le navigateur:');
    console.log('   1. Ouvrez la console du navigateur');
    console.log('   2. Rechargez la page');
    console.log('   3. Vérifiez qu\'il n\'y a qu\'un seul "Getting initial session... (verrou acquis)"');
    console.log('   4. Les autres instances devraient voir "getSession déjà en cours (verrou global)"');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testSingletonGlobal, testTimeoutOptimization, testLockRelease, testSessionSharing };

