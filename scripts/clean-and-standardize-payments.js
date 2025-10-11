#!/usr/bin/env node

/**
 * Script pour nettoyer complètement et standardiser les moyens de paiement
 * 
 * Ce script :
 * 1. Remet tous les paymentMethods à zéro
 * 2. Applique les mêmes moyens de paiement standardisés pour tous
 * 3. Évite les doublons en remplaçant complètement les données
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

async function cleanAndStandardizePayments() {
  console.log('🧹 Nettoyage et standardisation des moyens de paiement...');
  
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
    let errorCount = 0;
    
    for (const establishment of establishments) {
      console.log(`\n🔧 Traitement de "${establishment.name}" (ID: ${establishment.id})`);
      
      try {
        // Remplacer complètement les moyens de paiement par les standards
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: {
            paymentMethods: { ...STANDARD_PAYMENT_METHODS }
          }
        });
        
        console.log(`   ✅ Moyens de paiement standardisés appliqués`);
        updatedCount++;
        
      } catch (error) {
        console.log(`   ❌ Erreur lors de la mise à jour:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${updatedCount} établissements mis à jour`);
    console.log(`   ❌ ${errorCount} établissements en erreur`);
    console.log(`   📝 Total traité: ${updatedCount + errorCount}/${establishments.length}`);
    
    // Afficher les moyens de paiement standardisés
    console.log(`\n🎯 Moyens de paiement standardisés appliqués à tous:`);
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
    
    console.log(`\n🎉 Tous les établissements ont maintenant exactement les mêmes moyens de paiement !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  cleanAndStandardizePayments()
    .then(() => {
      console.log('\n✅ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { cleanAndStandardizePayments };




