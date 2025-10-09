#!/usr/bin/env node

/**
 * Script pour standardiser les moyens de paiement dans la base de données
 * 
 * Ce script :
 * 1. Nettoie les doublons existants
 * 2. Applique des moyens de paiement standardisés pour tous les établissements
 * 3. Évite les conflits avec les données existantes
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Moyens de paiement standardisés (comme sur votre capture)
const STANDARD_PAYMENT_METHODS = {
  creditCards: true,
  debitCards: true,
  nfc: true,
  restaurantVouchers: true,
  cash: true
};

// Fonction pour nettoyer les doublons dans un array
function removeDuplicates(array) {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
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

async function standardizePaymentMethods() {
  console.log('🔍 Recherche des établissements à standardiser...');
  
  try {
    // Récupérer tous les établissements
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        paymentMethods: true
      }
    });
    
    console.log(`📊 Trouvé ${establishments.length} établissements au total`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const establishment of establishments) {
      console.log(`\n🔍 Traitement de "${establishment.name}" (ID: ${establishment.id})`);
      
      let shouldUpdate = false;
      let newPaymentMethods = {};
      
      // Vérifier si les moyens de paiement sont vides ou mal formatés
      if (isPaymentMethodsEmptyOrMalformed(establishment.paymentMethods)) {
        console.log('   📝 Moyens de paiement vides/mal formatés, application des standards');
        newPaymentMethods = { ...STANDARD_PAYMENT_METHODS };
        shouldUpdate = true;
      } else {
        // Analyser les moyens de paiement existants
        const existingMethods = establishment.paymentMethods;
        
        if (typeof existingMethods === 'object' && !Array.isArray(existingMethods)) {
          // C'est un objet JSON - vérifier s'il contient les standards
          const hasStandardMethods = Object.keys(STANDARD_PAYMENT_METHODS).some(key => existingMethods[key] === true);
          
          if (!hasStandardMethods) {
            console.log('   📝 Moyens de paiement incomplets, ajout des standards manquants');
            newPaymentMethods = { ...existingMethods, ...STANDARD_PAYMENT_METHODS };
            shouldUpdate = true;
          } else {
            console.log('   ✅ Moyens de paiement déjà complets');
          }
        } else if (Array.isArray(existingMethods)) {
          // C'est un array - le convertir en objet standardisé
          console.log('   📝 Conversion d\'array vers objet standardisé');
          newPaymentMethods = { ...STANDARD_PAYMENT_METHODS };
          shouldUpdate = true;
        } else {
          console.log('   ✅ Moyens de paiement déjà au bon format');
        }
      }
      
      if (shouldUpdate) {
        try {
          // Mettre à jour l'établissement
          await prisma.establishment.update({
            where: { id: establishment.id },
            data: {
              paymentMethods: newPaymentMethods
            }
          });
          
          console.log(`   ✅ Mis à jour avec succès`);
          updatedCount++;
          
        } catch (error) {
          console.log(`   ❌ Erreur lors de la mise à jour:`, error.message);
          skippedCount++;
        }
      } else {
        console.log(`   ⏭️  Aucune mise à jour nécessaire`);
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${updatedCount} établissements mis à jour`);
    console.log(`   ⏭️  ${establishments.length - updatedCount - skippedCount} établissements déjà à jour`);
    console.log(`   ❌ ${skippedCount} établissements ignorés (erreurs)`);
    console.log(`   📝 Total traité: ${updatedCount + skippedCount}/${establishments.length}`);
    
    // Afficher les moyens de paiement standardisés
    console.log(`\n🎯 Moyens de paiement standardisés appliqués:`);
    Object.entries(STANDARD_PAYMENT_METHODS).forEach(([key, value]) => {
      if (value) {
        const labels = {
          creditCards: 'Cartes de crédit',
          debitCards: 'Cartes de débit', 
          nfc: 'Paiements mobiles NFC',
          restaurantVouchers: 'Titres restaurant',
          cash: 'Espèces'
        };
        console.log(`   • ${labels[key] || key}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  standardizePaymentMethods()
    .then(() => {
      console.log('\n🎉 Script terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { standardizePaymentMethods };


