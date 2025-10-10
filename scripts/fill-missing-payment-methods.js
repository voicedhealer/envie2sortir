#!/usr/bin/env node

/**
 * Script pour remplir les moyens de paiement manquants dans la base de données
 * 
 * Ce script :
 * 1. Identifie les établissements avec des paymentMethods vides ou mal formatés
 * 2. Analyse les autres champs pour détecter des mots-clés de paiement
 * 3. Met à jour la base de données avec des données structurées
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour parser les données JSON
function parseJsonField(field) {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}

// Fonction pour détecter les moyens de paiement dans un texte
function detectPaymentMethods(text) {
  if (!text || typeof text !== 'string') return {};
  
  const textLower = text.toLowerCase();
  const methods = {};
  
  // Cartes de crédit
  if (textLower.includes('carte') && (textLower.includes('crédit') || textLower.includes('credit'))) {
    methods.creditCards = true;
  }
  
  // Cartes de débit
  if (textLower.includes('carte') && (textLower.includes('débit') || textLower.includes('debit'))) {
    methods.debitCards = true;
  }
  
  // Espèces
  if (textLower.includes('espèces') || textLower.includes('liquide') || textLower.includes('cash')) {
    methods.cash = true;
  }
  
  // Espèces uniquement
  if (textLower.includes('espèces uniquement') || textLower.includes('cash only')) {
    methods.cashOnly = true;
    methods.cash = false; // Pas les deux en même temps
  }
  
  // NFC / Paiements mobiles
  if (textLower.includes('nfc') || textLower.includes('sans contact') || textLower.includes('mobile')) {
    methods.nfc = true;
  }
  
  // Pluxee
  if (textLower.includes('pluxee')) {
    methods.pluxee = true;
  }
  
  // Titres restaurant
  if (textLower.includes('titre restaurant') || textLower.includes('ticket restaurant') || textLower.includes('ticket resto')) {
    methods.restaurantVouchers = true;
  }
  
  // Chèques
  if (textLower.includes('chèque') || textLower.includes('cheque')) {
    methods.checks = true;
  }
  
  return methods;
}

// Fonction pour analyser tous les champs d'un établissement
function analyzeEstablishment(establishment) {
  const detectedMethods = {};
  
  // Analyser le champ ambiance
  const ambiance = parseJsonField(establishment.ambiance);
  ambiance.forEach(item => {
    const methods = detectPaymentMethods(item);
    Object.assign(detectedMethods, methods);
  });
  
  // Analyser le champ services
  const services = parseJsonField(establishment.services);
  services.forEach(item => {
    const methods = detectPaymentMethods(item);
    Object.assign(detectedMethods, methods);
  });
  
  // Analyser le champ informationsPratiques
  const informationsPratiques = parseJsonField(establishment.informationsPratiques);
  informationsPratiques.forEach(item => {
    const methods = detectPaymentMethods(item);
    Object.assign(detectedMethods, methods);
  });
  
  // Analyser le champ description
  if (establishment.description) {
    const methods = detectPaymentMethods(establishment.description);
    Object.assign(detectedMethods, methods);
  }
  
  return detectedMethods;
}

// Fonction pour vérifier si paymentMethods est vide ou mal formaté
function isPaymentMethodsEmptyOrMalformed(paymentMethods) {
  if (!paymentMethods) return true;
  
  // Si c'est un objet vide
  if (typeof paymentMethods === 'object' && Object.keys(paymentMethods).length === 0) {
    return true;
  }
  
  // Si c'est un array avec "[object Object]"
  if (Array.isArray(paymentMethods) && paymentMethods.includes('[object Object]')) {
    return true;
  }
  
  // Si c'est un string "[object Object]"
  if (typeof paymentMethods === 'string' && paymentMethods.includes('[object Object]')) {
    return true;
  }
  
  return false;
}

async function fillMissingPaymentMethods() {
  console.log('🔍 Recherche des établissements avec des moyens de paiement manquants...');
  
  try {
    // Récupérer tous les établissements
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        paymentMethods: true,
        ambiance: true,
        services: true,
        informationsPratiques: true,
        description: true
      }
    });
    
    console.log(`📊 Trouvé ${establishments.length} établissements au total`);
    
    // Filtrer ceux qui ont des paymentMethods vides ou mal formatés
    const establishmentsToUpdate = establishments.filter(est => 
      isPaymentMethodsEmptyOrMalformed(est.paymentMethods)
    );
    
    console.log(`⚠️  ${establishmentsToUpdate.length} établissements ont des moyens de paiement manquants ou mal formatés`);
    
    if (establishmentsToUpdate.length === 0) {
      console.log('✅ Tous les établissements ont déjà des moyens de paiement corrects !');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const establishment of establishmentsToUpdate) {
      console.log(`\n🔍 Analyse de "${establishment.name}" (ID: ${establishment.id})`);
      
      // Analyser l'établissement pour détecter les moyens de paiement
      const detectedMethods = analyzeEstablishment(establishment);
      
      // Si aucun moyen de paiement détecté, appliquer des valeurs par défaut
      if (Object.keys(detectedMethods).length === 0) {
        console.log('   📝 Aucun moyen de paiement détecté, application des valeurs par défaut');
        detectedMethods.creditCards = true;
        detectedMethods.cash = true;
      } else {
        console.log('   ✅ Moyens de paiement détectés:', Object.keys(detectedMethods).filter(key => detectedMethods[key]));
      }
      
      try {
        // Mettre à jour l'établissement
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: {
            paymentMethods: detectedMethods
          }
        });
        
        console.log(`   ✅ Mis à jour avec succès`);
        updatedCount++;
        
      } catch (error) {
        console.log(`   ❌ Erreur lors de la mise à jour:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${updatedCount} établissements mis à jour`);
    console.log(`   ❌ ${skippedCount} établissements ignorés (erreurs)`);
    console.log(`   📝 Total traité: ${updatedCount + skippedCount}/${establishmentsToUpdate.length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  fillMissingPaymentMethods()
    .then(() => {
      console.log('\n🎉 Script terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fillMissingPaymentMethods };



