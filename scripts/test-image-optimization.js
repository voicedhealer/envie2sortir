#!/usr/bin/env node

/**
 * Script de test pour l'optimisation d'images
 * Usage: node scripts/test-image-optimization.js [image-path]
 */

const { generateAllImageVariants } = require('../src/lib/image-management');
const path = require('path');
const fs = require('fs');

async function testOptimization(imagePath) {
  if (!imagePath) {
    console.error('❌ Veuillez fournir un chemin d\'image');
    console.log('Usage: node scripts/test-image-optimization.js /path/to/image.jpg');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error('❌ Le fichier n\'existe pas:', imagePath);
    process.exit(1);
  }

  console.log('🧪 Test d\'optimisation d\'image...');
  console.log(`📁 Image source: ${imagePath}`);
  console.log('');

  try {
    // Test pour les établissements
    console.log('🏢 Test pour les images d\'établissement:');
    const establishmentResult = await generateAllImageVariants(
      imagePath,
      './temp/establishment',
      'establishment'
    );

    if (establishmentResult.success) {
      console.log('✅ Variantes générées:');
      Object.entries(establishmentResult.variants).forEach(([variant, filePath]) => {
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${variant}: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
      });
      console.log(`💾 Économie totale: ${establishmentResult.totalSavingsPercentage.toFixed(1)}%`);
    } else {
      console.log('❌ Erreur lors de la génération des variantes d\'établissement');
    }

    console.log('');

    // Test pour les bons plans
    console.log('🎯 Test pour les images de bons plans:');
    const dealsResult = await generateAllImageVariants(
      imagePath,
      './temp/deals',
      'deals'
    );

    if (dealsResult.success) {
      console.log('✅ Variantes générées:');
      Object.entries(dealsResult.variants).forEach(([variant, filePath]) => {
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${variant}: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
      });
      console.log(`💾 Économie totale: ${dealsResult.totalSavingsPercentage.toFixed(1)}%`);
    } else {
      console.log('❌ Erreur lors de la génération des variantes de bons plans');
    }

    console.log('');

    // Test pour les menus
    console.log('📋 Test pour les images de menus:');
    const menusResult = await generateAllImageVariants(
      imagePath,
      './temp/menus',
      'menus'
    );

    if (menusResult.success) {
      console.log('✅ Variantes générées:');
      Object.entries(menusResult.variants).forEach(([variant, filePath]) => {
        const stats = fs.statSync(filePath);
        console.log(`  📸 ${variant}: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
      });
      console.log(`💾 Économie totale: ${menusResult.totalSavingsPercentage.toFixed(1)}%`);
    } else {
      console.log('❌ Erreur lors de la génération des variantes de menus');
    }

    console.log('');
    console.log('🎉 Test terminé ! Vérifiez les fichiers dans ./temp/');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Récupérer l'argument de ligne de commande
const imagePath = process.argv[2];

// Créer le dossier temp s'il n'existe pas
if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp', { recursive: true });
}

testOptimization(imagePath);





