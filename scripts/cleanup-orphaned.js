#!/usr/bin/env node

/**
 * Script de nettoyage des images orphelines
 * Usage: node scripts/cleanup-orphaned.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedFiles(isDryRun = false) {
  console.log('🧹 Début du nettoyage des fichiers orphelins...');
  console.log(`🔍 Mode: ${isDryRun ? 'Simulation (dry-run)' : 'Exécution réelle'}`);
  console.log('');
  
  if (isDryRun) {
    console.log('⚠️  Mode simulation activé - aucun fichier ne sera supprimé');
    console.log('');
  }

  let deletedCount = 0;
  let freedSpace = 0;
  const errors = [];
  const deletedFiles = [];

  try {
    // 1. Récupérer tous les chemins d'images en base de données
    console.log('📊 Récupération des images en base de données...');
    const dbImages = await prisma.image.findMany({
      select: { url: true }
    });
    
    const dbPaths = new Set(dbImages.map(img => img.url));
    console.log(`✅ ${dbPaths.size} images référencées en base`);
    
    // 2. Scanner les fichiers physiques
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Dossier uploads introuvable');
      return { success: false, error: 'Dossier uploads introuvable' };
    }
    
    const physicalFiles = [];
    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath, relativeItemPath);
        } else if (stat.isFile()) {
          const filePath = '/uploads/' + relativeItemPath.replace(/\\/g, '/');
          physicalFiles.push({
            path: filePath,
            fullPath: fullPath,
            size: stat.size
          });
        }
      }
    };
    
    scanDirectory(uploadsDir);
    console.log(`📁 ${physicalFiles.length} fichiers physiques trouvés`);
    
    // 3. Identifier les fichiers orphelins
    const orphanedFiles = physicalFiles.filter(file => !dbPaths.has(file.path));
    
    console.log(`🗑️  ${orphanedFiles.length} fichiers orphelins identifiés`);
    
    if (orphanedFiles.length === 0) {
      console.log('✅ Aucun fichier orphelin à nettoyer !');
      return { success: true, deletedCount: 0, freedSpace: 0, deletedFiles: [] };
    }
    
    // 4. Supprimer les fichiers orphelins
    for (const file of orphanedFiles) {
      try {
        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Serait supprimé: ${file.path}`);
        } else {
          await fs.promises.unlink(file.fullPath);
          console.log(`✅ Supprimé: ${file.path}`);
        }
        
        deletedCount++;
        freedSpace += file.size;
        deletedFiles.push(file.path);
        
      } catch (error) {
        const errorMsg = `Erreur suppression ${file.path}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${deletedCount} fichiers ${isDryRun ? 'seraient' : ''} supprimés`);
    console.log(`💾 Espace ${isDryRun ? 'qui serait' : ''} libéré: ${(freedSpace / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      success: errors.length === 0,
      deletedCount,
      freedSpace,
      errors,
      deletedFiles
    };
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  
  try {
    const result = await cleanupOrphanedFiles(isDryRun);
    
    if (result.success) {
      console.log('\n✅ Nettoyage terminé avec succès !');
      console.log(`📊 Fichiers ${isDryRun ? 'qui seraient' : ''} supprimés: ${result.deletedCount}`);
      console.log(`💾 Espace ${isDryRun ? 'qui serait' : ''} libéré: ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.error('\n❌ Erreur lors du nettoyage:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
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
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
