#!/usr/bin/env node

/**
 * Script qui relance les tests jusqu'à ce que 100% passent
 */

const { spawn } = require('child_process');
const { waitForServer } = require('./wait-for-server');

const MAX_RETRIES = 10;
let attempt = 0;

function runTests() {
  return new Promise((resolve, reject) => {
    attempt++;
    console.log(`\n🔄 Tentative ${attempt}/${MAX_RETRIES}...\n`);
    
    const testProcess = spawn('node', ['scripts/test-auth-stability.js'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      reject(error);
    });
  });
}

async function runUntilSuccess() {
  console.log('🚀 Démarrage des tests avec relance automatique jusqu\'à 100% de réussite\n');
  
  // Attendre que le serveur soit disponible
  const serverAvailable = await waitForServer();
  if (!serverAvailable) {
    console.error('\n❌ Le serveur n\'est pas disponible. Démarrez le serveur avec "npm run dev"');
    process.exit(1);
  }
  
  while (attempt < MAX_RETRIES) {
    const success = await runTests();
    
    if (success) {
      console.log('\n🎉 Tous les tests sont passés avec succès !');
      process.exit(0);
    }
    
    if (attempt < MAX_RETRIES) {
      console.log(`\n⏳ Attente de 3 secondes avant la prochaine tentative...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.error(`\n❌ Échec après ${MAX_RETRIES} tentatives`);
  process.exit(1);
}

if (require.main === module) {
  runUntilSuccess().catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}




