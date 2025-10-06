import { smartEnrichmentService, EnrichmentData } from '@/lib/smart-enrichment-service';

describe('SmartEnrichmentService', () => {
  const mockGoogleData: EnrichmentData = {
    name: 'Restaurant Test',
    establishmentType: 'restaurant',
    priceLevel: 2,
    rating: 4.2,
    website: 'https://restaurant-test.com',
    phone: '01 23 45 67 89',
    address: '123 Rue de la Paix, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    description: 'Restaurant de qualité',
    openingHours: ['Lundi: 12:00-14:00, 19:00-22:00'],
    hours: {},
    practicalInfo: ['WiFi gratuit', 'Terrasse'],
    envieTags: ['convivial', 'familial'],
    specialties: ['Cuisine française'],
    atmosphere: ['Chaleureux'],
    servicesArray: ['WiFi', 'Terrasse'],
    ambianceArray: ['Convivial'],
    activities: ['Déjeuner', 'Dîner'],
    paymentMethodsArray: ['Carte bancaire'],
    informationsPratiques: ['WiFi gratuit'],
    googlePlaceId: 'ChIJTest123',
    googleBusinessUrl: 'https://maps.google.com/test',
    googleRating: 4.2,
    googleReviewCount: 150,
    theForkLink: 'https://thefork.fr/test',
    uberEatsLink: 'https://ubereats.com/test',
    accessibilityInfo: ['Accessible PMR'],
    servicesAvailableInfo: ['WiFi', 'Terrasse'],
    pointsForts: ['Cuisine de qualité'],
    populairePour: ['Déjeuner', 'Dîner'],
    offres: ['Menu du jour'],
    servicesRestauration: ['Service de traiteur'],
    servicesGeneraux: ['WiFi'],
    paymentMethodsInfo: ['Carte bancaire'],
    accessibilityDetails: {},
    detailedServices: {},
    clienteleInfo: {},
    detailedPayments: {},
    childrenServices: {}
  };

  describe('analyzeEnrichmentGaps', () => {
    it('devrait générer des suggestions pour un restaurant', () => {
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockGoogleData, 'restaurant');
      
      expect(suggestions.recommended).toBeDefined();
      expect(suggestions.optional).toBeDefined();
      expect(suggestions.alreadyFound).toBeDefined();
      expect(suggestions.toVerify).toBeDefined();
      
      // Vérifier que les suggestions recommandées contiennent des éléments pertinents
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.length).toBeGreaterThan(0);
      
      const paymentSuggestions = suggestions.recommended.filter(s => s.category === 'payments');
      expect(paymentSuggestions.length).toBeGreaterThan(0);
    });

    it('devrait identifier les données déjà trouvées par Google', () => {
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockGoogleData, 'restaurant');
      
      // Vérifier que les données Google existantes sont marquées comme déjà trouvées
      expect(suggestions.alreadyFound.length).toBeGreaterThan(0);
    });

    it('devrait générer des suggestions différentes selon le type d\'établissement', () => {
      const restaurantSuggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockGoogleData, 'restaurant');
      const barSuggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockGoogleData, 'bar');
      
      expect(restaurantSuggestions.recommended).not.toEqual(barSuggestions.recommended);
    });
  });

  describe('combineEnrichmentData', () => {
    const mockManualData = {
      accessibilityDetails: { 'wheelchairAccessibleEntrance': true },
      detailedServices: { 'Service de traiteur': true, 'Réservations': true },
      clienteleInfo: { 'Clientèle familiale': true },
      detailedPayments: { 'Carte bancaire': true, 'Espèces': true },
      childrenServices: { 'Menu enfants': true, 'Chaise haute': true },
      parkingInfo: { 'Parking gratuit': true }
    };

    it('devrait combiner les données Google et manuelles', () => {
      const result = smartEnrichmentService.combineEnrichmentData(mockGoogleData, mockManualData, 'restaurant');
      
      expect(result).toBeDefined();
      expect(result.prioritizedData).toBeDefined();
      expect(result.enrichmentMetadata).toBeDefined();
      
      // Vérifier que les données manuelles ont la priorité
      expect(result.prioritizedData.services.some(p => p.source === 'manual')).toBe(true);
      expect(result.prioritizedData.payments.some(p => p.source === 'manual')).toBe(true);
    });

    it('devrait calculer correctement les métadonnées', () => {
      const result = smartEnrichmentService.combineEnrichmentData(mockGoogleData, mockManualData, 'restaurant');
      
      expect(result.enrichmentMetadata.googleConfidence).toBeGreaterThan(0);
      expect(result.enrichmentMetadata.manualCompleteness).toBeGreaterThan(0);
      expect(result.enrichmentMetadata.totalSuggestions).toBeGreaterThan(0);
      expect(result.enrichmentMetadata.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('validateEnrichmentConsistency', () => {
    it('devrait valider des données cohérentes', () => {
      const mockSmartData = {
        ...mockGoogleData,
        prioritizedData: {
          accessibility: [],
          services: [],
          payments: [{ source: 'manual', confidence: 1.0, category: 'payments', value: 'Carte bancaire' }],
          clientele: [],
          children: [],
          parking: []
        },
        enrichmentMetadata: {
          googleConfidence: 0.8,
          manualCompleteness: 0.5,
          totalSuggestions: 5,
          lastUpdated: new Date()
        }
      };

      const validation = smartEnrichmentService.validateEnrichmentConsistency(mockSmartData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('devrait détecter des incohérences', () => {
      const mockSmartData = {
        ...mockGoogleData,
        establishmentType: 'restaurant',
        prioritizedData: {
          accessibility: [],
          services: [],
          payments: [], // Pas de moyens de paiement
          clientele: [],
          children: [],
          parking: []
        },
        enrichmentMetadata: {
          googleConfidence: 0.8,
          manualCompleteness: 0.5,
          totalSuggestions: 5,
          lastUpdated: new Date()
        }
      };

      const validation = smartEnrichmentService.validateEnrichmentConsistency(mockSmartData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });
  });
});
