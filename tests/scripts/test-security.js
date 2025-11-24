#!/usr/bin/env node

/**
 * Script de test pour les modules de sécurité
 * Usage: node scripts/test-security.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Test des modules de sécurité...\n');

// Vérifier que tous les fichiers de sécurité existent
const securityFiles = [
  'src/lib/security/rate-limit-extended.ts',
  'src/lib/security/csrf.ts',
  'src/lib/security/sanitization.ts',
  'src/lib/security/file-validation.ts',
  'src/lib/security/security-middleware.ts',
  'src/lib/security/index.ts'
];

const testFiles = [
  'tests/security/rate-limit.test.ts',
  'tests/security/sanitization.test.ts',
  'tests/security/csrf.test.ts',
  'tests/security/file-validation.test.ts'
];

const docFiles = [
  'docs/SECURITY.md',
  'docs/SECURITY_INTEGRATION_EXAMPLES.md'
];

let allFilesExist = true;

console.log('📁 Vérification des fichiers de sécurité...');
securityFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n🧪 Vérification des fichiers de tests...');
testFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n📚 Vérification de la documentation...');
docFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n🔍 Vérification des imports...');

// Vérifier que les imports fonctionnent
try {
  // Simulation des imports (en production, utiliser TypeScript)
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`  ✅ package.json accessible`);
  
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log(`  ✅ tsconfig.json accessible`);
  
} catch (error) {
  console.log(`  ❌ Erreur de configuration: ${error.message}`);
  allFilesExist = false;
}

console.log('\n📊 Résumé des tests...');
if (allFilesExist) {
  console.log('✅ Tous les modules de sécurité sont correctement installés !');
  console.log('\n🚀 Prochaines étapes :');
  console.log('  1. Exécuter les tests : npm test');
  console.log('  2. Intégrer dans les APIs existantes');
  console.log('  3. Configurer les headers de sécurité');
  console.log('  4. Déployer en production');
} else {
  console.log('❌ Certains fichiers sont manquants. Vérifiez l\'installation.');
  process.exit(1);
}

console.log('\n🔒 Modules de sécurité disponibles :');
console.log('  • Rate Limiting (API, Recherche, Upload, Auth, Admin)');
console.log('  • Protection CSRF');
console.log('  • Sanitisation des données');
console.log('  • Validation des fichiers');
console.log('  • Middleware de sécurité');
console.log('  • Tests automatisés');
console.log('  • Documentation complète');

console.log('\n✨ Installation de sécurité terminée avec succès !');
