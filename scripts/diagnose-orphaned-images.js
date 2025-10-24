#!/usr/bin/env node

/**
 * Script de diagnostic des images orphelines
 * Identifie les fichiers physiques non référencés en base de données
 * SÉCURISÉ : Ne supprime rien, juste analyse
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseOrphanedImages() {
  console.log('🔍 Diagnostic des images orphelines...\n');
  
  try {
    // 1. Récupérer tous les chemins d'images en base de données
    console.log('📊 Récupération des images en base de données...');
    const dbImages = await prisma.image.findMany({
      select: {
        id: true,
        url: true,
        altText: true,
        establishmentId: true
      }
    });
    
    console.log(`✅ ${dbImages.length} images trouvées en base de données`);
    
    // 2. Récupérer tous les fichiers physiques dans public/uploads
    console.log('\n📁 Analyse des fichiers physiques...');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Dossier uploads introuvable');
      return;
    }
    
    const physicalFiles = [];
    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Récursivement scanner les sous-dossiers
          scanDirectory(fullPath, relativeItemPath);
        } else if (stat.isFile()) {
          // Ajouter le fichier avec son chemin relatif
          const filePath = '/uploads/' + relativeItemPath.replace(/\\/g, '/');
          physicalFiles.push({
            path: filePath,
            fullPath: fullPath,
            size: stat.size,
            modified: stat.mtime
          });
        }
      }
    };
    
    scanDirectory(uploadsDir);
    console.log(`✅ ${physicalFiles.length} fichiers physiques trouvés`);
    
    // 3. Identifier les fichiers orphelins
    console.log('\n🔍 Identification des fichiers orphelins...');
    const dbPaths = new Set(dbImages.map(img => img.url));
    
    // Afficher quelques exemples pour debug
    console.log('📋 Exemples d\'URLs en base:');
    Array.from(dbPaths).slice(0, 3).forEach(url => console.log(`  - ${url}`));
    
    console.log('📋 Exemples de chemins physiques:');
    physicalFiles.slice(0, 3).forEach(file => console.log(`  - ${file.path}`));
    
    const orphanedFiles = physicalFiles.filter(file => {
      // Vérifier si le fichier est référencé en base
      return !dbPaths.has(file.path);
    });
    
    const referencedFiles = physicalFiles.filter(file => {
      return dbPaths.has(file.path);
    });
    
    // 4. Afficher les résultats
    console.log('\n📊 RÉSULTATS DU DIAGNOSTIC:');
    console.log('═'.repeat(50));
    console.log(`📁 Fichiers physiques: ${physicalFiles.length}`);
    console.log(`✅ Fichiers référencés: ${referencedFiles.length}`);
    console.log(`🗑️  Fichiers orphelins: ${orphanedFiles.length}`);
    
    if (orphanedFiles.length > 0) {
      console.log('\n🗑️  FICHIERS ORPHELINS DÉTECTÉS:');
      console.log('─'.repeat(50));
      
      let totalOrphanedSize = 0;
      orphanedFiles.forEach((file, index) => {
        totalOrphanedSize += file.size;
        const sizeKB = (file.size / 1024).toFixed(2);
        const modifiedDate = file.modified.toLocaleDateString('fr-FR');
        console.log(`${index + 1}. ${file.path}`);
        console.log(`   📏 Taille: ${sizeKB} KB`);
        console.log(`   📅 Modifié: ${modifiedDate}`);
        console.log('');
      });
      
      const totalSizeMB = (totalOrphanedSize / 1024 / 1024).toFixed(2);
      console.log(`💾 Espace total des orphelins: ${totalSizeMB} MB`);
    } else {
      console.log('\n✅ Aucun fichier orphelin détecté !');
    }
    
    // 5. Vérifier les images en base non trouvées physiquement
    console.log('\n🔍 Vérification des images en base...');
    const missingFiles = [];
    
    for (const dbImage of dbImages) {
      const physicalPath = path.join(process.cwd(), 'public', dbImage.url);
      if (!fs.existsSync(physicalPath)) {
        missingFiles.push({
          id: dbImage.id,
          url: dbImage.url,
          altText: dbImage.altText
        });
      }
    }
    
    if (missingFiles.length > 0) {
      console.log(`⚠️  ${missingFiles.length} images en base sans fichier physique:`);
      missingFiles.forEach(file => {
        console.log(`   - ${file.url} (ID: ${file.id})`);
      });
    } else {
      console.log('✅ Toutes les images en base ont leur fichier physique');
    }
    
    // 6. Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('─'.repeat(50));
    
    if (orphanedFiles.length > 0) {
      console.log('🧹 Vous pouvez nettoyer les fichiers orphelins avec:');
      console.log('   node scripts/cleanup-images.js --dry-run');
      console.log('   node scripts/cleanup-images.js');
    }
    
    if (missingFiles.length > 0) {
      console.log('⚠️  Certaines images en base n\'ont pas de fichier physique');
      console.log('   Vérifiez l\'intégrité de votre base de données');
    }
    
    console.log('\n✅ Diagnostic terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le diagnostic
diagnoseOrphanedImages().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
