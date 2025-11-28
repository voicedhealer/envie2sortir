/**
 * Script de test d'intégration pour le tracking des clics
 * À exécuter manuellement pour vérifier que tous les éléments sont trackés
 * 
 * Usage: 
 * 1. Ouvrir la console du navigateur sur une page de détails d'établissement
 * 2. Copier-coller ce script
 * 3. Exécuter testTrackingIntegration()
 */

interface TrackingResult {
  element: string;
  tracked: boolean;
  error?: string;
}

async function testTrackingIntegration(): Promise<void> {
  console.log('🧪 Démarrage des tests de tracking d\'intégration...\n');

  const results: TrackingResult[] = [];
  const establishmentId = prompt('Entrez l\'ID de l\'établissement à tester:') || '';

  if (!establishmentId) {
    console.error('❌ ID d\'établissement requis');
    return;
  }

  // Liste des éléments à tester
  const elementsToTest = [
    { type: 'button', id: 'directions', name: 'Itinéraire', context: 'actions_rapides' },
    { type: 'button', id: 'menu', name: 'Consulter le menu', context: 'actions_rapides' },
    { type: 'button', id: 'contact', name: 'Contacter', context: 'actions_rapides' },
    { type: 'button', id: 'favorite', name: 'Ajouter aux favoris', context: 'actions_rapides' },
    { type: 'button', id: 'share', name: 'Partager', context: 'actions_rapides' },
    { type: 'button', id: 'review', name: 'Laisser un avis', context: 'actions_rapides' },
    { type: 'contact', id: 'phone-dropdown', name: 'Appeler', context: 'actions_rapides' },
    { type: 'contact', id: 'whatsapp', name: 'WhatsApp', context: 'actions_rapides' },
    { type: 'contact', id: 'email', name: 'Email', context: 'actions_rapides' },
    { type: 'section', id: 'horaires', name: 'Horaires', context: 'sections', action: 'open' },
    { type: 'link', id: 'instagram', name: 'Instagram', context: 'info' },
  ];

  // Tester chaque élément
  for (const element of elementsToTest) {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: element.type,
          elementId: element.id,
          elementName: element.name,
          action: element.action || 'click',
          sectionContext: element.context,
        }),
      });

      if (response.ok) {
        results.push({ element: `${element.name} (${element.id})`, tracked: true });
        console.log(`✅ ${element.name} - Tracké avec succès`);
      } else {
        const error = await response.json();
        results.push({ 
          element: `${element.name} (${element.id})`, 
          tracked: false, 
          error: error.error || 'Erreur inconnue' 
        });
        console.error(`❌ ${element.name} - Erreur:`, error);
      }
    } catch (error) {
      results.push({ 
        element: `${element.name} (${element.id})`, 
        tracked: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      });
      console.error(`❌ ${element.name} - Exception:`, error);
    }

    // Petit délai entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Résumé
  console.log('\n📊 Résumé des tests:');
  console.log('===================');
  const tracked = results.filter(r => r.tracked).length;
  const failed = results.filter(r => !r.tracked).length;
  
  console.log(`✅ Trackés avec succès: ${tracked}/${results.length}`);
  console.log(`❌ Échecs: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Éléments non trackés:');
    results.filter(r => !r.tracked).forEach(r => {
      console.log(`  - ${r.element}: ${r.error || 'Erreur inconnue'}`);
    });
  }

  // Vérifier les données dans le dashboard
  console.log('\n🔍 Vérification des données dans le dashboard...');
  try {
    const analyticsResponse = await fetch(`/api/analytics/track?establishmentId=${establishmentId}&period=30d`);
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log(`✅ Total des interactions: ${analyticsData.totalClicks}`);
      console.log(`✅ Top éléments: ${analyticsData.topElements.length}`);
      console.log(`✅ Types trackés: ${analyticsData.statsByType.length}`);
      
      if (analyticsData.topElements.length > 0) {
        console.log('\n📈 Top 5 éléments:');
        analyticsData.topElements.slice(0, 5).forEach((el: any, index: number) => {
          console.log(`  ${index + 1}. ${el.elementName} (${el.elementType}): ${el._count.id} clics`);
        });
      }
    } else {
      console.error('❌ Impossible de récupérer les analytics');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }

  console.log('\n✨ Tests terminés !');
}

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).testTrackingIntegration = testTrackingIntegration;
  console.log('💡 Pour lancer les tests, exécutez: testTrackingIntegration()');
}

export { testTrackingIntegration };

