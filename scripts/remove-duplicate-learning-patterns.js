const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDuplicateLearningPatterns() {
  try {
    console.log('🔍 Recherche des doublons dans les patterns d\'apprentissage...');
    
    // Récupérer tous les patterns
    const allPatterns = await prisma.establishmentLearningPattern.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📊 Total de patterns trouvés: ${allPatterns.length}`);
    
    // Grouper par nom d'établissement
    const patternsByName = {};
    const duplicates = [];
    
    allPatterns.forEach(pattern => {
      if (!patternsByName[pattern.name]) {
        patternsByName[pattern.name] = [];
      }
      patternsByName[pattern.name].push(pattern);
    });
    
    // Identifier les doublons (plus d'un pattern pour le même nom)
    Object.entries(patternsByName).forEach(([name, patterns]) => {
      if (patterns.length > 1) {
        console.log(`🔄 Doublons trouvés pour "${name}": ${patterns.length} entrées`);
        
        // Garder le plus récent, supprimer les autres
        const sortedPatterns = patterns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const toKeep = sortedPatterns[0];
        const toDelete = sortedPatterns.slice(1);
        
        console.log(`✅ Garder: ${toKeep.id} (${toKeep.createdAt})`);
        toDelete.forEach(pattern => {
          console.log(`❌ Supprimer: ${pattern.id} (${pattern.createdAt})`);
          duplicates.push(pattern.id);
        });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }
    
    console.log(`\n🗑️ Suppression de ${duplicates.length} doublons...`);
    
    // Supprimer les doublons
    const deleteResult = await prisma.establishmentLearningPattern.deleteMany({
      where: {
        id: {
          in: duplicates
        }
      }
    });
    
    console.log(`✅ ${deleteResult.count} doublons supprimés avec succès !`);
    
    // Afficher les statistiques finales
    const finalCount = await prisma.establishmentLearningPattern.count();
    console.log(`📊 Nombre final de patterns: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des doublons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
removeDuplicateLearningPatterns();
