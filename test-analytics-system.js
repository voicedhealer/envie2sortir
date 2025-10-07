const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnalyticsSystem() {
  console.log('🧪 Test du système d\'analytics...\n');

  try {
    // 1. Récupérer un établissement de test
    console.log('📊 1. Recherche d\'un établissement de test...');
    const establishment = await prisma.establishment.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!establishment) {
      console.log('❌ Aucun établissement trouvé. Créez d\'abord un établissement.');
      return;
    }

    console.log(`✅ Établissement trouvé: ${establishment.name} (${establishment.slug})\n`);

    // 2. Insérer des données de tracking simulées
    console.log('📊 2. Insertion de données de tracking simulées...');
    
    const trackingData = [
      // Sections
      { elementType: 'section', elementId: 'about', elementName: 'C\'est quoi ?', action: 'open' },
      { elementType: 'section', elementId: 'amenities', elementName: 'Commodités', action: 'open' },
      { elementType: 'section', elementId: 'ambiance', elementName: 'Ambiance & Spécialités', action: 'open' },
      { elementType: 'section', elementId: 'about', elementName: 'C\'est quoi ?', action: 'close' },
      
      // Sous-sections
      { elementType: 'subsection', elementId: 'atmosphere', elementName: 'Ambiance', action: 'click', sectionContext: 'ambiance' },
      { elementType: 'subsection', elementId: 'specialties', elementName: 'Spécialités', action: 'click', sectionContext: 'ambiance' },
      { elementType: 'subsection', elementId: 'equipment', elementName: 'Équipements et services', action: 'click', sectionContext: 'amenities' },
      
      // Liens externes
      { elementType: 'link', elementId: 'website', elementName: 'Site web', action: 'click', sectionContext: 'external_links' },
      { elementType: 'link', elementId: 'instagram', elementName: 'Instagram', action: 'click', sectionContext: 'external_links' },
      { elementType: 'link', elementId: 'facebook', elementName: 'Facebook', action: 'click', sectionContext: 'external_links' },
      { elementType: 'link', elementId: 'phone', elementName: 'Téléphone', action: 'click', sectionContext: 'external_links' },
      
      // Interactions supplémentaires
      { elementType: 'section', elementId: 'amenities', elementName: 'Commodités', action: 'open' },
      { elementType: 'section', elementId: 'ambiance', elementName: 'Ambiance & Spécialités', action: 'open' },
      { elementType: 'link', elementId: 'instagram', elementName: 'Instagram', action: 'click', sectionContext: 'external_links' },
      { elementType: 'link', elementId: 'instagram', elementName: 'Instagram', action: 'click', sectionContext: 'external_links' },
      { elementType: 'subsection', elementId: 'atmosphere', elementName: 'Ambiance', action: 'click', sectionContext: 'ambiance' },
      { elementType: 'subsection', elementId: 'atmosphere', elementName: 'Ambiance', action: 'click', sectionContext: 'ambiance' },
      { elementType: 'subsection', elementId: 'atmosphere', elementName: 'Ambiance', action: 'click', sectionContext: 'ambiance' },
    ];

    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Mozilla/5.0 (X11; Linux x86_64)',
    ];

    const referrers = [
      'https://www.google.com',
      'https://www.facebook.com',
      'https://www.instagram.com',
      'direct',
    ];

    for (const data of trackingData) {
      await prisma.clickAnalytics.create({
        data: {
          establishmentId: establishment.id,
          elementType: data.elementType,
          elementId: data.elementId,
          elementName: data.elementName,
          action: data.action,
          sectionContext: data.sectionContext,
          userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Derniers 30 jours
        },
      });
    }

    console.log(`✅ ${trackingData.length} entrées de tracking insérées\n`);

    // 3. Vérifier les données insérées
    console.log('📊 3. Vérification des données insérées...');
    const totalClicks = await prisma.clickAnalytics.count({
      where: { establishmentId: establishment.id },
    });

    console.log(`✅ Total des interactions enregistrées: ${totalClicks}\n`);

    // 4. Grouper par type d'élément
    console.log('📊 4. Statistiques par type d\'élément...');
    const statsByType = await prisma.clickAnalytics.groupBy({
      by: ['elementType'],
      where: { establishmentId: establishment.id },
      _count: {
        id: true,
      },
    });

    statsByType.forEach(stat => {
      console.log(`   - ${stat.elementType}: ${stat._count.id} interactions`);
    });
    console.log('');

    // 5. Top 5 des éléments les plus cliqués
    console.log('📊 5. Top 5 des éléments les plus populaires...');
    const topElements = await prisma.clickAnalytics.groupBy({
      by: ['elementId', 'elementName'],
      where: { establishmentId: establishment.id },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    topElements.forEach((element, index) => {
      console.log(`   ${index + 1}. ${element.elementName || element.elementId}: ${element._count.id} clics`);
    });
    console.log('');

    // 6. Tester l'API de récupération
    console.log('📊 6. Test de l\'API de récupération...');
    console.log(`   URL de test: http://localhost:3003/api/analytics/track?establishmentId=${establishment.id}&period=30d`);
    console.log(`   Dashboard pro: http://localhost:3003/dashboard/analytics`);
    console.log(`   Dashboard admin: http://localhost:3003/admin/analytics`);
    console.log(`   Page de test: http://localhost:3003/test-analytics`);
    console.log('');

    // 7. Résumé final
    console.log('✅ Test terminé avec succès!\n');
    console.log('📌 Résumé:');
    console.log(`   - Établissement: ${establishment.name}`);
    console.log(`   - ID: ${establishment.id}`);
    console.log(`   - Total interactions: ${totalClicks}`);
    console.log(`   - Types d'interactions: ${statsByType.length}`);
    console.log(`   - Élément le plus populaire: ${topElements[0]?.elementName || 'N/A'} (${topElements[0]?._count.id || 0} clics)`);
    console.log('');
    console.log('🎯 Prochaines étapes:');
    console.log('   1. Visitez http://localhost:3003/test-analytics');
    console.log(`   2. Entrez l'ID: ${establishment.id}`);
    console.log('   3. Visualisez les graphiques et statistiques');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsSystem();

