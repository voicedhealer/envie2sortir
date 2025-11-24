#!/usr/bin/env node

/**
 * Script de test pour le service Recherche d'Entreprises
 * Usage: node scripts/test-service.js [SIRET]
 */

const { getRechercheEntreprisesService } = require('../src/lib/insee-service.ts');

async function testService() {
  const siret = process.argv[2] || '44306184100047';
  
  console.log('🧪 Test du service Recherche d\'Entreprises');
  console.log('===========================================\n');
  
  try {
    const service = getRechercheEntreprisesService();
    const result = await service.verifySiret(siret);
    
    console.log('📋 Résultat:');
    console.log('============');
    console.log('Valide:', result.isValid);
    
    if (result.isValid && result.data) {
      console.log('Nom:', result.data.companyName);
      console.log('SIREN:', result.data.siren);
      console.log('SIRET:', result.data.siret);
      console.log('Adresse:', result.data.address);
      console.log('Code activité:', result.data.activityCode);
    } else {
      console.log('Erreur:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testService();
