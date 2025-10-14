#!/usr/bin/env node

/**
 * Script pour traiter la récurrence des bons plans
 * À exécuter quotidiennement via cron ou scheduler
 * 
 * Usage: node scripts/process-recurrence.js
 */

const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ENDPOINT = '/api/deals/recurrence/process';

async function processRecurrence() {
  console.log('🔄 Démarrage du traitement de la récurrence...');
  console.log(`📡 URL: ${API_URL}${ENDPOINT}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      console.log('✅ Traitement réussi!');
      console.log(`📊 ${data.message}`);
      console.log(`⏱️  Durée: ${duration}ms`);
      console.log(`📈 Traités: ${data.processed}, Créés: ${data.created}`);
    } else {
      console.error('❌ Erreur lors du traitement:', data.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  processRecurrence()
    .then(() => {
      console.log('🎉 Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { processRecurrence };


