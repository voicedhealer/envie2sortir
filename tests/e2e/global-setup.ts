import { execSync } from 'child_process';

async function globalSetup() {
  console.log('🚀 Démarrage du global setup pour Playwright...');
  
  // Exécuter le script de seeding
  try {
    execSync('node scripts/seed-test-db.js', { stdio: 'inherit' });
    console.log('✅ Base de données de test initialisée.');
  } catch (error) {
    console.error('❌ Erreur lors du seeding de la base de données :', error);
    process.exit(1);
  }
}

export default globalSetup;
