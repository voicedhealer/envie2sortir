// Script d'initialisation des patterns d'apprentissage
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initLearningPatterns() {
  try {
    console.log('🧠 Initialisation des patterns d\'apprentissage...\n');

    const patterns = [
      {
        name: 'Games Factory',
        detectedType: 'autre',
        correctedType: 'parc_loisir_indoor',
        googleTypes: ['amusement_park', 'tourist_attraction'],
        keywords: ['games', 'factory', 'parc', 'loisir', 'indoor', 'jeux', 'ludique', 'famille'],
        confidence: 0.9,
        isCorrected: true
      },
      {
        name: 'Le Donjon Escape Game',
        detectedType: 'autre',
        correctedType: 'escape_game',
        googleTypes: ['amusement_park', 'tourist_attraction'],
        keywords: ['escape', 'game', 'donjon', 'énigme', 'mystère', 'puzzle', 'aventure'],
        confidence: 0.95,
        isCorrected: true
      },
      {
        name: 'EVA VR Dijon',
        detectedType: 'autre',
        correctedType: 'vr_experience',
        googleTypes: ['amusement_park', 'tourist_attraction'],
        keywords: ['vr', 'virtual', 'réalité', 'virtuelle', 'casque', 'immersion', 'expérience'],
        confidence: 0.9,
        isCorrected: true
      },
      {
        name: 'KBOX Karaoké',
        detectedType: 'autre',
        correctedType: 'karaoke',
        googleTypes: ['amusement_park', 'night_club'],
        keywords: ['karaoké', 'karaoke', 'chanson', 'micro', 'cabine', 'singing'],
        confidence: 0.85,
        isCorrected: true
      },
      {
        name: 'Le Central Bar',
        detectedType: 'restaurant',
        correctedType: 'bar',
        googleTypes: ['bar', 'restaurant'],
        keywords: ['bar', 'boisson', 'alcool', 'cocktail', 'bière', 'vin'],
        confidence: 0.8,
        isCorrected: true
      }
    ];

    for (const pattern of patterns) {
      try {
        await prisma.establishmentLearningPattern.create({
          data: {
            name: pattern.name,
            detectedType: pattern.detectedType,
            correctedType: pattern.correctedType,
            googleTypes: JSON.stringify(pattern.googleTypes),
            keywords: JSON.stringify(pattern.keywords),
            confidence: pattern.confidence,
            isCorrected: pattern.isCorrected,
            correctedBy: 'system'
          }
        });
        console.log(`✅ Pattern créé: ${pattern.name} → ${pattern.correctedType}`);
      } catch (error) {
        console.log(`⚠️ Pattern déjà existant: ${pattern.name}`);
      }
    }

    console.log('\n📊 Statistiques des patterns:');
    const stats = await prisma.establishmentLearningPattern.groupBy({
      by: ['correctedType'],
      _count: { correctedType: true },
      where: { isCorrected: true }
    });

    stats.forEach(stat => {
      console.log(`   - ${stat.correctedType}: ${stat._count.correctedType} patterns`);
    });

    console.log('\n🎉 Initialisation terminée !');

  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initLearningPatterns();

