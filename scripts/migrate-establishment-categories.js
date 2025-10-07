/**
 * Script de migration pour organiser les données d'établissements selon les nouvelles catégories
 * 
 * Ce script :
 * 1. Analyse les données existantes des établissements
 * 2. Organise les tags selon les nouvelles catégories harmonisées
 * 3. Met à jour la base de données avec la nouvelle structure
 * 4. Génère un rapport de migration
 */

const { PrismaClient } = require('@prisma/client');
const { organizeTagsByCategory, categorizeTag } = require('../src/lib/establishment-categories');

const prisma = new PrismaClient();

// Fonction pour parser les données JSON
function parseJsonField(field) {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      console.warn('Erreur parsing JSON:', e.message);
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}

// Fonction pour analyser un établissement
async function analyzeEstablishment(establishment) {
  console.log(`\n🔍 Analyse de l'établissement: ${establishment.name}`);
  
  // Extraire tous les tags existants
  const allTags = [
    ...parseJsonField(establishment.services),
    ...parseJsonField(establishment.ambiance),
    ...parseJsonField(establishment.specialties),
    ...parseJsonField(establishment.atmosphere),
    ...parseJsonField(establishment.detailedServices),
    ...parseJsonField(establishment.clienteleInfo),
    ...parseJsonField(establishment.informationsPratiques)
  ];

  // Organiser par catégories
  const organizedTags = organizeTagsByCategory(allTags);
  
  console.log(`   📊 Total des tags: ${allTags.length}`);
  console.log(`   📋 Catégories trouvées: ${Object.keys(organizedTags).length}`);
  
  Object.entries(organizedTags).forEach(([categoryId, items]) => {
    console.log(`   - ${categoryId}: ${items.length} éléments`);
  });

  return {
    establishmentId: establishment.id,
    name: establishment.name,
    originalTags: allTags,
    organizedTags,
    totalTags: allTags.length,
    categoriesCount: Object.keys(organizedTags).length
  };
}

// Fonction pour mettre à jour un établissement
async function updateEstablishment(analysis) {
  try {
    const { establishmentId, organizedTags } = analysis;
    
    // Préparer les données pour la mise à jour
    const updateData = {
      // Services de restauration
      services: organizedTags['services-restauration'] || [],
      
      // Ambiance & Atmosphère (fusion ambiance + specialties + atmosphere)
      ambiance: [
        ...(organizedTags['ambiance-atmosphere'] || []),
        ...(organizedTags['ambiance-atmosphere'] || [])
      ],
      
      // Commodités & Équipements
      detailedServices: organizedTags['commodites-equipements'] || [],
      
      // Clientèle cible
      clienteleInfo: organizedTags['clientele-cible'] || [],
      
      // Activités & Événements
      activities: organizedTags['activites-evenements'] || [],
      
      // Informations pratiques
      informationsPratiques: organizedTags['informations-pratiques'] || [],
      
      // Marquer comme migré
      lastModifiedAt: new Date()
    };

    // Mettre à jour l'établissement
    await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData
    });

    console.log(`   ✅ Établissement mis à jour avec succès`);
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur lors de la mise à jour:`, error.message);
    return false;
  }
}

// Fonction principale de migration
async function migrateEstablishments() {
  console.log('🚀 Début de la migration des catégories d\'établissements\n');
  
  try {
    // Récupérer tous les établissements
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        services: true,
        ambiance: true,
        specialties: true,
        atmosphere: true,
        detailedServices: true,
        clienteleInfo: true,
        informationsPratiques: true,
        activities: true
      }
    });

    console.log(`📊 ${establishments.length} établissements trouvés\n`);

    const results = {
      total: establishments.length,
      success: 0,
      errors: 0,
      categories: {}
    };

    // Analyser et migrer chaque établissement
    for (const establishment of establishments) {
      try {
        const analysis = await analyzeEstablishment(establishment);
        const success = await updateEstablishment(analysis);
        
        if (success) {
          results.success++;
          
          // Compter les catégories
          Object.keys(analysis.organizedTags).forEach(category => {
            results.categories[category] = (results.categories[category] || 0) + 1;
          });
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${establishment.name}:`, error.message);
        results.errors++;
      }
    }

    // Afficher le rapport final
    console.log('\n📈 RAPPORT DE MIGRATION');
    console.log('========================');
    console.log(`Total d'établissements: ${results.total}`);
    console.log(`✅ Migrations réussies: ${results.success}`);
    console.log(`❌ Erreurs: ${results.errors}`);
    console.log('\n📊 Répartition par catégories:');
    
    Object.entries(results.categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} établissements`);
    });

    console.log('\n🎉 Migration terminée !');
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour créer un backup avant migration
async function createBackup() {
  console.log('💾 Création d\'un backup des données...');
  
  try {
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        services: true,
        ambiance: true,
        specialties: true,
        atmosphere: true,
        detailedServices: true,
        clienteleInfo: true,
        informationsPratiques: true,
        activities: true
      }
    });

    const fs = require('fs');
    const path = require('path');
    
    const backupPath = path.join(__dirname, `backup-establishments-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(establishments, null, 2));
    
    console.log(`✅ Backup créé: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Erreur lors de la création du backup:', error.message);
    return null;
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--backup')) {
    await createBackup();
  }
  
  if (args.includes('--migrate')) {
    await migrateEstablishments();
  }
  
  if (args.length === 0) {
    console.log('🔧 Script de migration des catégories d\'établissements');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/migrate-establishment-categories.js --backup    # Créer un backup');
    console.log('  node scripts/migrate-establishment-categories.js --migrate   # Exécuter la migration');
    console.log('  node scripts/migrate-establishment-categories.js --backup --migrate  # Les deux');
    console.log('');
  }
}

main().catch(console.error);
