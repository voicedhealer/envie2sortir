import { smartEnrichmentService } from '@/lib/smart-enrichment-service';
import { enrichmentSystem } from '@/lib/enrichment-system';

// Mock de l'API Google Places
jest.mock('@/lib/enrichment-system', () => ({
  enrichmentSystem: {
    triggerGoogleEnrichment: jest.fn()
  }
}));

describe('Smart Enrichment Integration', () => {
  const mockGoogleUrl = 'https://maps.google.com/test-restaurant';
  
  const mockGoogleResponse = {
    name: 'Restaurant Le Bistrot',
    establishmentType: 'restaurant',
    priceLevel: 2,
    rating: 4.3,
    website: 'https://lebistrot.com',
    phone: '01 42 36 78 90',
    address: '15 Rue de Rivoli, 75001 Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    description: 'Restaurant français traditionnel',
    openingHours: ['Lundi: 12:00-14:00, 19:00-22:00', 'Mardi: 12:00-14:00, 19:00-22:00'],
    hours: {
      monday: { isOpen: true, slots: [{ name: 'Déjeuner', open: '12:00', close: '14:00' }, { name: 'Dîner', open: '19:00', close: '22:00' }] },
      tuesday: { isOpen: true, slots: [{ name: 'Déjeuner', open: '12:00', close: '14:00' }, { name: 'Dîner', open: '19:00', close: '22:00' }] }
    },
    practicalInfo: ['WiFi gratuit', 'Terrasse'],
    envieTags: ['convivial', 'traditionnel', 'familial'],
    specialties: ['Cuisine française'],
    atmosphere: ['Chaleureux', 'Authentique'],
    servicesArray: ['WiFi', 'Terrasse', 'Réservations'],
    ambianceArray: ['Convivial', 'Traditionnel'],
    activities: ['Déjeuner', 'Dîner'],
    paymentMethodsArray: ['Carte bancaire', 'Espèces'],
    informationsPratiques: ['WiFi gratuit', 'Terrasse'],
    googlePlaceId: 'ChIJTest123456',
    googleBusinessUrl: 'https://maps.google.com/test',
    googleRating: 4.3,
    googleReviewCount: 127,
    theForkLink: 'https://thefork.fr/restaurant-le-bistrot',
    uberEatsLink: 'https://ubereats.com/restaurant-le-bistrot',
    accessibilityInfo: ['Accessible PMR'],
    servicesAvailableInfo: ['WiFi', 'Terrasse', 'Réservations'],
    pointsForts: ['Cuisine de qualité', 'Ambiance chaleureuse'],
    populairePour: ['Déjeuner', 'Dîner', 'Événements'],
    offres: ['Menu du jour', 'Carte des vins'],
    servicesRestauration: ['Service de traiteur'],
    servicesGeneraux: ['WiFi', 'Réservations'],
    paymentMethodsInfo: ['Carte bancaire', 'Espèces'],
    accessibilityDetails: {},
    detailedServices: {},
    clienteleInfo: {},
    detailedPayments: {},
    childrenServices: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workflow complet d\'enrichissement intelligent', () => {
    it('devrait traiter un restaurant de bout en bout', async () => {
      // Mock de l'enrichissement Google
      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockResolvedValue(mockGoogleResponse);

      // 1. Déclencher l'enrichissement Google
      const googleData = await enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl);
      expect(googleData).toEqual(mockGoogleResponse);

      // 2. Analyser les lacunes d'enrichissement
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(googleData, 'restaurant');
      
      expect(suggestions.recommended).toBeDefined();
      expect(suggestions.optional).toBeDefined();
      expect(suggestions.alreadyFound).toBeDefined();
      expect(suggestions.toVerify).toBeDefined();

      // Vérifier que les suggestions sont pertinentes pour un restaurant
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.length).toBeGreaterThan(0);
      
      const paymentSuggestions = suggestions.recommended.filter(s => s.category === 'payments');
      expect(paymentSuggestions.length).toBeGreaterThan(0);

      // 3. Simuler la sélection manuelle de suggestions
      const selectedSuggestions = {
        'services-Service de traiteur': true,
        'services-Réservations': true,
        'payments-Carte bancaire': true,
        'payments-Espèces': true,
        'children-Menu enfants': true,
        'children-Chaise haute': true,
        'accessibility-Accessible PMR': true,
        'parking-Parking gratuit': true
      };

      // 4. Créer les données manuelles à partir des suggestions sélectionnées
      const manualData = createManualDataFromSuggestions(selectedSuggestions, suggestions);

      // 5. Combiner les données Google et manuelles
      const smartData = smartEnrichmentService.combineEnrichmentData(googleData, manualData, 'restaurant');
      
      expect(smartData).toBeDefined();
      expect(smartData.prioritizedData).toBeDefined();
      expect(smartData.enrichmentMetadata).toBeDefined();

      // Vérifier que les données manuelles ont la priorité
      expect(smartData.prioritizedData.services.some(p => p.source === 'manual')).toBe(true);
      expect(smartData.prioritizedData.payments.some(p => p.source === 'manual')).toBe(true);

      // 6. Valider la cohérence des données
      const validation = smartEnrichmentService.validateEnrichmentConsistency(smartData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);

      // 7. Vérifier les métadonnées
      expect(smartData.enrichmentMetadata.googleConfidence).toBeGreaterThan(0);
      expect(smartData.enrichmentMetadata.manualCompleteness).toBeGreaterThanOrEqual(0);
      expect(smartData.enrichmentMetadata.totalSuggestions).toBeGreaterThan(0);
    });

    it('devrait traiter un bar de bout en bout', async () => {
      const mockBarData = {
        ...mockGoogleResponse,
        establishmentType: 'bar',
        name: 'Bar Le Comptoir',
        description: 'Bar à cocktails et tapas'
      };

      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockResolvedValue(mockBarData);

      const googleData = await enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl);
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(googleData, 'bar');
      
      // Vérifier que les suggestions sont adaptées à un bar
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Happy hour'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Concerts'))).toBe(true);

      const smartData = smartEnrichmentService.combineEnrichmentData(googleData, {}, 'bar');
      expect(smartData.establishmentType).toBe('bar');
    });

    it('devrait traiter un spa de bout en bout', async () => {
      const mockSpaData = {
        ...mockGoogleResponse,
        establishmentType: 'spa',
        name: 'Spa Relaxation',
        description: 'Centre de bien-être et relaxation'
      };

      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockResolvedValue(mockSpaData);

      const googleData = await enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl);
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(googleData, 'spa');
      
      // Vérifier que les suggestions sont adaptées à un spa
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Massages'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Soins du visage'))).toBe(true);

      const smartData = smartEnrichmentService.combineEnrichmentData(googleData, {}, 'spa');
      expect(smartData.establishmentType).toBe('spa');
    });

    it('devrait détecter et signaler des incohérences', async () => {
      const mockInconsistentData = {
        ...mockGoogleResponse,
        establishmentType: 'restaurant',
        // Pas de moyens de paiement spécifiés
        paymentMethodsArray: []
      };

      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockResolvedValue(mockInconsistentData);

      const googleData = await enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl);
      const smartData = smartEnrichmentService.combineEnrichmentData(googleData, {}, 'restaurant');
      
      // Créer des données incohérentes en supprimant les moyens de paiement
      const inconsistentSmartData = {
        ...smartData,
        prioritizedData: {
          ...smartData.prioritizedData,
          payments: [] // Pas de moyens de paiement
        }
      };
      
      const validation = smartEnrichmentService.validateEnrichmentConsistency(inconsistentSmartData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Performance et robustesse', () => {
    it('devrait gérer les données Google incomplètes', async () => {
      const mockIncompleteData = {
        name: 'Restaurant Test',
        establishmentType: 'restaurant',
        priceLevel: 1,
        rating: 3.0,
        // Données minimales
        googlePlaceId: 'ChIJTest123',
        googleRating: 3.0,
        googleReviewCount: 5
      };

      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockResolvedValue(mockIncompleteData);

      const googleData = await enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl);
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(googleData, 'restaurant');
      
      // Devrait générer plus de suggestions pour compenser les données manquantes
      expect(suggestions.recommended.length).toBeGreaterThan(0);
      expect(suggestions.toVerify.length).toBeGreaterThan(0);
    });

    it('devrait gérer les erreurs d\'enrichissement', async () => {
      (enrichmentSystem.triggerGoogleEnrichment as jest.Mock).mockRejectedValue(new Error('API Google indisponible'));

      await expect(enrichmentSystem.triggerGoogleEnrichment(mockGoogleUrl)).rejects.toThrow('API Google indisponible');
    });
  });
});

// Fonction utilitaire pour créer les données manuelles
function createManualDataFromSuggestions(
  selectedSuggestions: Record<string, boolean>, 
  suggestions: any
): any {
  const manualData: any = {
    accessibilityDetails: {},
    detailedServices: {},
    clienteleInfo: {},
    detailedPayments: {},
    childrenServices: {},
    parkingInfo: {}
  };

  const allSuggestions = [...suggestions.recommended, ...suggestions.optional];
  
  allSuggestions.forEach(suggestion => {
    const suggestionKey = `${suggestion.category}-${suggestion.value}`;
    if (selectedSuggestions[suggestionKey]) {
      const category = suggestion.category;
      if (manualData[category]) {
        manualData[category][suggestion.value] = true;
      }
    }
  });

  return manualData;
}
