/**
 * Script de nettoyage des données de test E2E
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('\n🧹 Nettoyage des données de test E2E...\n');
  console.log('='.repeat(60));
  
  try {
    // Charger les IDs depuis le fichier
    let testIds = null;
    const testIdsPath = '/Users/vivien/envie2sortir/test-e2e-ids.json';
    
    if (fs.existsSync(testIdsPath)) {
      testIds = JSON.parse(fs.readFileSync(testIdsPath, 'utf8'));
      console.log('📋 IDs de test chargés:');
      console.log(`   - User ID: ${testIds.userId}`);
      console.log(`   - Professional ID: ${testIds.professionalId}`);
      console.log(`   - Establishment ID: ${testIds.establishmentId}\n`);
    }
    
    // Supprimer par email de test (sécurité supplémentaire)
    const TEST_EMAIL = 'test-e2e-etablissement@test.com';
    
    console.log('🗑️  Suppression en cours...\n');
    
    // 1. Supprimer l'établissement
    let deletedEstablishments = 0;
    if (testIds?.establishmentId) {
      const result = await prisma.establishment.deleteMany({
        where: { id: testIds.establishmentId }
      });
      deletedEstablishments = result.count;
    } else {
      const result = await prisma.establishment.deleteMany({
        where: { email: 'contact@bistrot-test.com' }
      });
      deletedEstablishments = result.count;
    }
    console.log(`   ${deletedEstablishments > 0 ? '✅' : '⚠️'}  Établissement(s): ${deletedEstablishments} supprimé(s)`);
    
    // 2. Supprimer le professionnel
    let deletedProfessionals = 0;
    if (testIds?.professionalId) {
      const result = await prisma.professional.deleteMany({
        where: { id: testIds.professionalId }
      });
      deletedProfessionals = result.count;
    } else {
      const result = await prisma.professional.deleteMany({
        where: { siret: '12345678901234' }
      });
      deletedProfessionals = result.count;
    }
    console.log(`   ${deletedProfessionals > 0 ? '✅' : '⚠️'}  Professionnel(s): ${deletedProfessionals} supprimé(s)`);
    
    // 3. Supprimer l'utilisateur
    let deletedUsers = 0;
    if (testIds?.userId) {
      const result = await prisma.user.deleteMany({
        where: { id: testIds.userId }
      });
      deletedUsers = result.count;
    } else {
      const result = await prisma.user.deleteMany({
        where: { email: TEST_EMAIL }
      });
      deletedUsers = result.count;
    }
    console.log(`   ${deletedUsers > 0 ? '✅' : '⚠️'}  Utilisateur(s): ${deletedUsers} supprimé(s)`);
    
    // Supprimer le fichier d'IDs
    if (fs.existsSync(testIdsPath)) {
      fs.unlinkSync(testIdsPath);
      console.log('\n   ✅ Fichier test-e2e-ids.json supprimé');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ NETTOYAGE TERMINÉ\n');
    
    const total = deletedEstablishments + deletedProfessionals + deletedUsers;
    if (total === 0) {
      console.log('⚠️  Aucune donnée de test trouvée à supprimer');
    } else {
      console.log(`✨ ${total} enregistrement(s) supprimé(s) au total`);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

