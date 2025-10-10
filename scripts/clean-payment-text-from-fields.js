#!/usr/bin/env node

/**
 * Script pour nettoyer les moyens de paiement textuels des champs services et ambiance
 * 
 * Ce script :
 * 1. Supprime tous les moyens de paiement textuels des champs services et ambiance
 * 2. Garde seulement les moyens de paiement structurés dans paymentMethods
 * 3. Évite les doublons en supprimant les sources textuelles
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mots-clés de paiement à supprimer des champs textuels
const PAYMENT_KEYWORDS = [
  'carte de crédit',
  'cartes de crédit', 
  'carte de débit',
  'cartes de débit',
  'paiements mobiles nfc',
  'paiement mobile nfc',
  'nfc',
  'titre restaurant',
  'titres restaurant',
  'ticket restaurant',
  'espèces',
  'liquide',
  'cash',
  'pluxee',
  'chèque',
  'cheque'
];

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

// Fonction pour nettoyer un item des mots-clés de paiement
function cleanItemFromPayments(item) {
  if (!item || typeof item !== 'string') return item;
  
  const itemLower = item.toLowerCase();
  
  // Vérifier si l'item contient uniquement des moyens de paiement
  const isOnlyPayment = PAYMENT_KEYWORDS.some(keyword => 
    itemLower.includes(keyword.toLowerCase())
  );
  
  // Si c'est uniquement un moyen de paiement, le supprimer
  if (isOnlyPayment) {
    return null;
  }
  
  // Sinon, nettoyer les mentions de paiement de l'item
  let cleanedItem = item;
  PAYMENT_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    cleanedItem = cleanedItem.replace(regex, '').trim();
  });
  
  // Nettoyer les virgules et espaces multiples
  cleanedItem = cleanedItem.replace(/,\s*,/g, ',').replace(/^\s*,\s*|,\s*$/g, '').trim();
  
  return cleanedItem || null;
}

async function cleanPaymentTextFromFields() {
  console.log('🧹 Nettoyage des moyens de paiement textuels des champs services et ambiance...');
  
  try {
    // Récupérer tous les établissements
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        services: true,
        ambiance: true,
        informationsPratiques: true
      }
    });
    
    console.log(`📊 Trouvé ${establishments.length} établissements au total`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const establishment of establishments) {
      console.log(`\n🔧 Traitement de "${establishment.name}" (ID: ${establishment.id})`);
      
      try {
        // Nettoyer les services
        const services = parseJsonField(establishment.services);
        const cleanedServices = services
          .map(item => cleanItemFromPayments(item))
          .filter(item => item !== null && item.trim() !== '');
        
        // Nettoyer l'ambiance
        const ambiance = parseJsonField(establishment.ambiance);
        const cleanedAmbiance = ambiance
          .map(item => cleanItemFromPayments(item))
          .filter(item => item !== null && item.trim() !== '');
        
        // Nettoyer les informations pratiques
        const informationsPratiques = parseJsonField(establishment.informationsPratiques);
        const cleanedInformationsPratiques = informationsPratiques
          .map(item => cleanItemFromPayments(item))
          .filter(item => item !== null && item.trim() !== '');
        
        // Compter les éléments supprimés
        const removedServices = services.length - cleanedServices.length;
        const removedAmbiance = ambiance.length - cleanedAmbiance.length;
        const removedInfos = informationsPratiques.length - cleanedInformationsPratiques.length;
        
        if (removedServices > 0 || removedAmbiance > 0 || removedInfos > 0) {
          console.log(`   📝 Supprimé: ${removedServices} services, ${removedAmbiance} ambiance, ${removedInfos} infos pratiques`);
          
          // Mettre à jour l'établissement
          await prisma.establishment.update({
            where: { id: establishment.id },
            data: {
              services: cleanedServices,
              ambiance: cleanedAmbiance,
              informationsPratiques: cleanedInformationsPratiques
            }
          });
          
          console.log(`   ✅ Nettoyage appliqué`);
          updatedCount++;
        } else {
          console.log(`   ⏭️  Aucun moyen de paiement textuel trouvé`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur lors de la mise à jour:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${updatedCount} établissements mis à jour`);
    console.log(`   ❌ ${errorCount} établissements en erreur`);
    console.log(`   📝 Total traité: ${updatedCount + errorCount}/${establishments.length}`);
    
    console.log(`\n🎯 Mots-clés de paiement supprimés des champs textuels:`);
    PAYMENT_KEYWORDS.forEach(keyword => {
      console.log(`   • ${keyword}`);
    });
    
    console.log(`\n🎉 Les moyens de paiement ne seront maintenant affichés que depuis le champ structuré paymentMethods !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  cleanPaymentTextFromFields()
    .then(() => {
      console.log('\n✅ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { cleanPaymentTextFromFields };



