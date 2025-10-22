#!/usr/bin/env node

/**
 * Test simple d'optimisation d'image avec Sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testImageOptimization(imagePath) {
  console.log('🧪 Test d\'optimisation d\'image...');
  console.log(`📁 Image source: ${imagePath}`);
  console.log('');

  try {
    // Créer le dossier de test
    const testDir = './temp-test';
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

    // Test 1: Image d'établissement (hero)
    console.log('🏢 Test image d\'établissement (hero):');
    const heroPath = path.join(testDir, 'hero.webp');
    await sharp(imagePath)
      .resize(1200, 800, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 90 })
      .toFile(heroPath);
    
    const heroStats = fs.statSync(heroPath);
    const heroSavings = ((originalSize - heroStats.size) / originalSize * 100);
    console.log(`  📸 Hero: ${heroStats.size / 1024} KB (${heroSavings.toFixed(1)}% d'économie)`);

    // Test 2: Image de carte
    console.log('🎯 Test image de carte:');
    const cardPath = path.join(testDir, 'card.webp');
    await sharp(imagePath)
      .resize(400, 300, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 85 })
      .toFile(cardPath);
    
    const cardStats = fs.statSync(cardPath);
    const cardSavings = ((originalSize - cardStats.size) / originalSize * 100);
    console.log(`  📸 Card: ${cardStats.size / 1024} KB (${cardSavings.toFixed(1)}% d'économie)`);

    // Test 3: Miniature
    console.log('🔍 Test miniature:');
    const thumbPath = path.join(testDir, 'thumbnail.webp');
    await sharp(imagePath)
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 80 })
      .toFile(thumbPath);
    
    const thumbStats = fs.statSync(thumbPath);
    const thumbSavings = ((originalSize - thumbStats.size) / originalSize * 100);
    console.log(`  📸 Thumb: ${thumbStats.size / 1024} KB (${thumbSavings.toFixed(1)}% d'économie)`);

    // Test 4: Image de bon plan
    console.log('🎁 Test image de bon plan:');
    const dealPath = path.join(testDir, 'deal.webp');
    await sharp(imagePath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 85 })
      .toFile(dealPath);
    
    const dealStats = fs.statSync(dealPath);
    const dealSavings = ((originalSize - dealStats.size) / originalSize * 100);
    console.log(`  📸 Deal: ${dealStats.size / 1024} KB (${dealSavings.toFixed(1)}% d'économie)`);

    console.log('');
    console.log('📊 Résumé:');
    console.log(`  💾 Taille originale: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`  📸 Hero: ${(heroStats.size / 1024).toFixed(1)} KB`);
    console.log(`  📸 Card: ${(cardStats.size / 1024).toFixed(1)} KB`);
    console.log(`  📸 Thumb: ${(thumbStats.size / 1024).toFixed(1)} KB`);
    console.log(`  📸 Deal: ${(dealStats.size / 1024).toFixed(1)} KB`);
    
    const totalOptimized = heroStats.size + cardStats.size + thumbStats.size + dealStats.size;
    const totalSavings = ((originalSize * 4 - totalOptimized) / (originalSize * 4) * 100);
    console.log(`  💡 Économie moyenne: ${totalSavings.toFixed(1)}%`);

    console.log('');
    console.log('✅ Test terminé ! Vérifiez les fichiers dans ./temp-test/');
    console.log('🔍 Vous pouvez ouvrir les images pour voir la qualité !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Récupérer l'argument de ligne de commande
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Veuillez fournir un chemin d\'image');
  console.log('Usage: node scripts/simple-image-test.js /path/to/image.jpg');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error('❌ Le fichier n\'existe pas:', imagePath);
  process.exit(1);
}

testImageOptimization(imagePath);


