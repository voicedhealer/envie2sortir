#!/usr/bin/env node

/**
 * Script pour attendre que le serveur soit disponible avant de lancer les tests
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const MAX_ATTEMPTS = 30; // 30 tentatives = 30 secondes max
const DELAY = 1000; // 1 seconde entre chaque tentative

function checkServer() {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function waitForServer() {
  console.log(`⏳ Attente que le serveur soit disponible sur ${BASE_URL}...`);
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const isAvailable = await checkServer();
    
    if (isAvailable) {
      console.log(`✅ Serveur disponible après ${i + 1} tentative(s)`);
      return true;
    }
    
    if (i < MAX_ATTEMPTS - 1) {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }
  
  console.log(`\n❌ Le serveur n'est pas disponible après ${MAX_ATTEMPTS} tentatives`);
  console.log('   Assurez-vous que "npm run dev" est lancé sur le port 3001');
  return false;
}

if (require.main === module) {
  waitForServer()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { waitForServer };




