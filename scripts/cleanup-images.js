#!/usr/bin/env node

/**
 * Script de nettoyage des images orphelines
 * Usage: node scripts/cleanup-images.js [--dry-run] [--type=orphaned|old] [--days=30]
 */

const { cleanupOrphanedFiles, cleanupOldFiles } = require('../src/lib/image-cleanup.ts');

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const daysArg = args.find(arg => arg.startsWith('--days='));
  
  const type = typeArg ? typeArg.split('=')[1] : 'orphaned';
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 30;

  console.log('🧹 Début du nettoyage des images...');
  console.log(`📋 Type: ${type}`);
  console.log(`📅 Jours: ${days}`);
  console.log(`🔍 Mode: ${isDryRun ? 'Simulation (dry-run)' : 'Exécution réelle'}`);
  console.log('');

  if (isDryRun) {
    console.log('⚠️  Mode simulation activé - aucun fichier ne sera supprimé');
    console.log('');
  }

  try {
    let result;

    if (type === 'orphaned') {
      result = await cleanupOrphanedFiles();
    } else if (type === 'old') {
      result = await cleanupOldFiles(days);
    } else {
      console.error('❌ Type de nettoyage invalide. Utilisez "orphaned" ou "old"');
      process.exit(1);
    }

    if (result.success) {
      console.log('✅ Nettoyage terminé avec succès !');
      console.log(`📊 Fichiers supprimés: ${result.deletedCount}`);
      console.log(`💾 Espace libéré: ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.error('❌ Erreur lors du nettoyage:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
  console.log('\n⚠️  Arrêt demandé par l\'utilisateur');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Arrêt demandé par le système');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Erreur inattendue:', error);
  process.exit(1);
});


