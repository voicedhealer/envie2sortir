const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnalyticsDetailed() {
  console.log('🧪 Test détaillé du système d\'analytics...\n');

  try {
    // 1. Lister tous les établissements avec leurs analytics
    console.log('📊 1. Liste des établissements avec analytics...');
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        clickAnalytics: {
          select: {
            id: true,
            elementType: true,
            elementId: true,
            elementName: true,
            action: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 5,
        },
      },
      take: 10,
    });

    console.log(`✅ ${establishments.length} établissements trouvés\n`);

    establishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name} (${est.slug})`);
      console.log(`   ID: ${est.id}`);
      console.log(`   Analytics: ${est.clickAnalytics.length} interactions récentes`);
      
      if (est.clickAnalytics.length > 0) {
        console.log(`   Dernières interactions:`);
        est.clickAnalytics.forEach((click, i) => {
          console.log(`      ${i + 1}. ${click.elementName || click.elementId} (${click.elementType}) - ${click.action}`);
        });
      }
      console.log('');
    });

    // 2. Statistiques globales
    console.log('📊 2. Statistiques globales...');
    const totalClicks = await prisma.clickAnalytics.count();
    const totalEstablishments = await prisma.establishment.count();
    
    console.log(`   - Total interactions: ${totalClicks}`);
    console.log(`   - Total établissements: ${totalEstablishments}`);
    console.log(`   - Moyenne par établissement: ${Math.round(totalClicks / totalEstablishments)}`);
    console.log('');

    // 3. Distribution par type d'action
    console.log('📊 3. Distribution par type d\'action...');
    const actionStats = await prisma.clickAnalytics.groupBy({
      by: ['action'],
      _count: {
        id: true,
      },
    });

    actionStats.forEach(stat => {
      console.log(`   - ${stat.action}: ${stat._count.id} fois`);
    });
    console.log('');

    // 4. Distribution par type d'élément
    console.log('📊 4. Distribution par type d\'élément...');
    const elementTypeStats = await prisma.clickAnalytics.groupBy({
      by: ['elementType'],
      _count: {
        id: true,
      },
    });

    elementTypeStats.forEach(stat => {
      console.log(`   - ${stat.elementType}: ${stat._count.id} interactions`);
    });
    console.log('');

    // 5. Éléments les plus populaires (tous établissements confondus)
    console.log('📊 5. Top 10 des éléments les plus populaires (global)...');
    const topGlobal = await prisma.clickAnalytics.groupBy({
      by: ['elementName', 'elementType'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    topGlobal.forEach((element, index) => {
      console.log(`   ${index + 1}. ${element.elementName || 'N/A'} (${element.elementType}): ${element._count.id} clics`);
    });
    console.log('');

    // 6. Activité récente
    console.log('📊 6. 10 dernières interactions...');
    const recentClicks = await prisma.clickAnalytics.findMany({
      select: {
        elementName: true,
        elementType: true,
        action: true,
        timestamp: true,
        establishment: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    });

    recentClicks.forEach((click, index) => {
      const date = new Date(click.timestamp).toLocaleString('fr-FR');
      console.log(`   ${index + 1}. ${click.establishment.name} - ${click.elementName} (${click.action}) - ${date}`);
    });
    console.log('');

    // 7. Test de structure des données
    console.log('📊 7. Validation de la structure des données...');
    const sampleClick = await prisma.clickAnalytics.findFirst({
      include: {
        establishment: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (sampleClick) {
      console.log('   ✅ Structure validée:');
      console.log(`      - ID: ${sampleClick.id}`);
      console.log(`      - Établissement: ${sampleClick.establishment.name}`);
      console.log(`      - Type: ${sampleClick.elementType}`);
      console.log(`      - Élément: ${sampleClick.elementName || sampleClick.elementId}`);
      console.log(`      - Action: ${sampleClick.action}`);
      console.log(`      - UserAgent: ${sampleClick.userAgent?.substring(0, 50)}...`);
      console.log(`      - Timestamp: ${new Date(sampleClick.timestamp).toLocaleString('fr-FR')}`);
    }
    console.log('');

    // 8. Résumé et recommandations
    console.log('✅ Test détaillé terminé!\n');
    console.log('📌 Résumé:');
    console.log(`   - ${totalClicks} interactions enregistrées`);
    console.log(`   - ${totalEstablishments} établissements`);
    console.log(`   - ${actionStats.length} types d'actions différentes`);
    console.log(`   - ${elementTypeStats.length} types d'éléments trackés`);
    console.log('');
    console.log('🎯 Le système est opérationnel!');
    console.log('   Vous pouvez maintenant:');
    console.log('   - Visiter les pages publiques et interagir');
    console.log('   - Consulter les dashboards analytics');
    console.log('   - Analyser le comportement des utilisateurs');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsDetailed();

