const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addEnrichmentData() {
  try {
    console.log('🔍 Recherche de l\'établissement DreamAway...');
    
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: 'DreamAway'
        }
      }
    });

    if (!establishment) {
      console.log('❌ Établissement non trouvé');
      return;
    }

    console.log('✅ Établissement trouvé:', establishment.name);
    console.log('📊 ID:', establishment.id);

    // Données d'enrichissement intelligent simulées
    const smartEnrichmentData = {
      establishmentType: 'vr_experience',
      servicesArray: [
        'Casques VR',
        'Sessions privées',
        'Équipements dernier cri',
        'Réservations obligatoires'
      ],
      paymentMethodsArray: [
        'Carte bancaire',
        'Espèces',
        'Paiement sans contact',
        'Carte de débit'
      ],
      accessibilityInfo: [
        'Entrée accessible en fauteuil roulant'
      ],
      specialties: [
        'Réalité virtuelle',
        'Escape games VR',
        'Jeunesse et famille'
      ],
      atmosphere: [
        'Ambiance VR',
        'Action adrénaline',
        'Culture VR'
      ],
      practicalInfo: [
        'Espace non-fumeurs',
        'Idéal pour les groupes'
      ],
      clienteleInfo: [
        'Jeunesse et famille',
        'Groupes'
      ],
      enrichmentMetadata: {
        confidence: 0.85,
        manualCompleteness: 0.7,
        googleCompleteness: 0.8,
        totalCompleteness: 0.75
      }
    };

    // Données d'enrichissement classiques
    const enrichmentData = {
      services: [
        'Parking gratuit',
        'Parking couvert',
        'WiFi gratuit',
        'Climatisation',
        'Chauffage'
      ],
      health: [
        '⚠️ Risque épileptique (lumières clignotantes)',
        '⚠️ Mal des transports virtuels possible',
        '✅ Casques désinfectés',
        '✅ Pauses recommandées'
      ],
      parking: [
        'Parking gratuit',
        'Parking couvert',
        'Parking privé'
      ]
    };

    console.log('🔄 Mise à jour des données d\'enrichissement...');

    const updated = await prisma.establishment.update({
      where: { id: establishment.id },
      data: {
        smartEnrichmentData: smartEnrichmentData,
        enrichmentData: enrichmentData,
        specialties: smartEnrichmentData.specialties,
        atmosphere: smartEnrichmentData.atmosphere,
        accessibility: smartEnrichmentData.accessibilityInfo,
        detailedServices: enrichmentData.services,
        detailedPayments: smartEnrichmentData.paymentMethodsArray,
        clienteleInfo: smartEnrichmentData.clienteleInfo,
        informationsPratiques: smartEnrichmentData.practicalInfo
      }
    });

    console.log('✅ Données d\'enrichissement ajoutées avec succès !');
    console.log('📊 smartEnrichmentData:', updated.smartEnrichmentData ? 'Présent' : 'Absent');
    console.log('📊 enrichmentData:', updated.enrichmentData ? 'Présent' : 'Absent');
    console.log('📊 specialties:', updated.specialties);
    console.log('📊 atmosphere:', updated.atmosphere);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEnrichmentData();
