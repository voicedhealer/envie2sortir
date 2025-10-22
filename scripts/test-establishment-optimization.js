#!/usr/bin/env node

/**
 * Test d'optimisation pour les images d'établissement
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testEstablishmentOptimization(imagePath) {
  console.log('🏢 Test d\'optimisation pour images d\'établissement...');
  console.log(`📁 Image source: ${imagePath}`);
  console.log('');

  try {
    // Créer le dossier de test
    const testDir = './temp-establishment-test';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Obtenir les infos de l'image originale
    const originalStats = await sharp(imagePath).metadata();
    const originalSize = fs.statSync(imagePath).size;
    
    console.log('📊 Image originale:');
    console.log(`  📐 Dimensions: ${originalStats.width}x${originalStats.height}`);
    console.log(`  💾 Taille: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`  🎨 Format: ${originalStats.format}`);
    console.log('');

    // Test 1: Image hero (principale) - 1200x800px, qualité 90%
    console.log('🏢 Test image hero (principale):');
    const heroPath = path.join(testDir, 'hero.webp');
    await sharp(imagePath)
      .resize(1200, 800, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 90 })
      .toFile(heroPath);
    
    const heroStats = fs.statSync(heroPath);
    const heroSavings = ((originalSize - heroStats.size) / originalSize * 100);
    console.log(`  📸 Hero: ${heroStats.size / 1024} KB (${heroSavings.toFixed(1)}% d'économie)`);

    // Test 2: Image card (cartes de recherche) - 400x300px, qualité 85%
    console.log('🎯 Test image card (cartes):');
    const cardPath = path.join(testDir, 'card.webp');
    await sharp(imagePath)
      .resize(400, 300, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 85 })
      .toFile(cardPath);
    
    const cardStats = fs.statSync(cardPath);
    const cardSavings = ((originalSize - cardStats.size) / originalSize * 100);
    console.log(`  📸 Card: ${cardStats.size / 1024} KB (${cardSavings.toFixed(1)}% d'économie)`);

    // Test 3: Miniature - 150x150px, qualité 80%
    console.log('🔍 Test miniature:');
    const thumbPath = path.join(testDir, 'thumbnail.webp');
    await sharp(imagePath)
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 80 })
      .toFile(thumbPath);
    
    const thumbStats = fs.statSync(thumbPath);
    const thumbSavings = ((originalSize - thumbStats.size) / originalSize * 100);
    console.log(`  📸 Thumb: ${thumbStats.size / 1024} KB (${thumbSavings.toFixed(1)}% d'économie)`);

    console.log('');
    console.log('📊 RÉSUMÉ pour établissement:');
    console.log(`  💾 Taille originale: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`  📸 Hero (page principale): ${(heroStats.size / 1024).toFixed(1)} KB`);
    console.log(`  📸 Card (cartes de recherche): ${(cardStats.size / 1024).toFixed(1)} KB`);
    console.log(`  📸 Thumb (miniatures): ${(thumbStats.size / 1024).toFixed(1)} KB`);
    
    const totalOptimized = heroStats.size + cardStats.size + thumbStats.size;
    const totalSavings = ((originalSize * 3 - totalOptimized) / (originalSize * 3) * 100);
    console.log(`  💡 Économie moyenne: ${totalSavings.toFixed(1)}%`);

    console.log('');
    console.log('✅ Test terminé ! Vérifiez les fichiers dans ./temp-establishment-test/');
    console.log('🔍 Les images sont optimisées pour:');
    console.log('  🏢 Page principale de l\'établissement (hero)');
    console.log('  🎯 Cartes de recherche (card)');
    console.log('  🔍 Miniatures et galeries (thumbnail)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Récupérer l'argument de ligne de commande
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Veuillez fournir un chemin d\'image');
  console.log('Usage: node scripts/test-establishment-optimization.js /path/to/image.jpg');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error('❌ Le fichier n\'existe pas:', imagePath);
  process.exit(1);
}

testEstablishmentOptimization(imagePath);


