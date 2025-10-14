#!/usr/bin/env node

/**
 * Script pour nettoyer le cache de géocodage
 * 
 * Usage: node scripts/clear-geocode-cache.js
 */

const { exec } = require('child_process');

console.log('🧹 Nettoyage du cache de géocodage...');

// Redémarrer le serveur pour vider le cache en mémoire
exec('pkill -f "next dev"', (error, stdout, stderr) => {
  if (error && !error.message.includes('No matching processes')) {
    console.error('❌ Erreur lors de l\'arrêt du serveur:', error);
    return;
  }
  
  console.log('✅ Cache de géocodage nettoyé (serveur redémarré)');
  console.log('💡 Vous pouvez maintenant redémarrer le serveur avec: npm run dev');
});

