#!/usr/bin/env node

/**
 * Script de nettoyage immédiat des images orphelines
 */

const fs = require('fs');
const path = require('path');

async function analyzeImages() {
  console.log('🔍 Analyse des images existantes (MODE SÉCURISÉ)');
  console.log('⚠️  AUCUNE suppression ne sera effectuée');
  console.log('');

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  let totalImages = 0;
  let totalSize = 0;

  try {
    // Analyser les images d'établissements
    console.log('🏢 Images d\'établissements:');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp|gif)$/i));
      
      console.log(`  📊 Images trouvées: ${imageFiles.length}`);
      for (const file of imageFiles) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        totalImages++;
        totalSize += stats.size;
      }
    }

    // Analyser les images de bons plans
    console.log('');
    console.log('🎯 Images de bons plans:');
    const dealsDir = path.join(uploadsDir, 'deals');
    if (fs.existsSync(dealsDir)) {
      const files = fs.readdirSync(dealsDir);
      const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp|gif)$/i));
      
      console.log(`  📊 Images trouvées: ${imageFiles.length}`);
      for (const file of imageFiles) {
        const filePath = path.join(dealsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        totalImages++;
        totalSize += stats.size;
      }
    }

    // Analyser les images de menus
    console.log('');
    console.log('📋 Images de menus:');
    const menusDir = path.join(uploadsDir, 'menus');
    if (fs.existsSync(menusDir)) {
      const files = fs.readdirSync(menusDir);
      const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp|gif)$/i));
      
      console.log(`  📊 Images trouvées: ${imageFiles.length}`);
      for (const file of imageFiles) {
        const filePath = path.join(menusDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        totalImages++;
        totalSize += stats.size;
      }
    }

    console.log('');
    console.log('📊 RÉSUMÉ:');
    console.log(`  📸 Total images: ${totalImages}`);
    console.log(`  💾 Espace total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    console.log('✅ Analyse terminée - AUCUNE suppression effectuée');
    console.log('💡 Vos images actuelles sont préservées');
    console.log('🚀 L\'optimisation s\'appliquera seulement aux nouvelles images');

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécuter l'analyse sécurisée
analyzeImages();
