import { smartEnrichmentService } from '@/lib/smart-enrichment-service';
import { EnrichmentData } from '@/lib/enrichment-system';

describe('VR Establishment Detection', () => {
  const mockVRData: EnrichmentData = {
    name: 'DreamAway Dijon - Réalité Virtuelle - VR - Escape Games VR - Jeunesse et famille VR - Action adrénaline VR - Culture VR',
    establishmentType: 'other', // Type incorrect fourni par Google
    priceLevel: 2,
    rating: 5.0,
    website: 'https://dreamaway-dijon.com',
    phone: '03 80 12 34 56',
    address: '123 Rue de la VR, Dijon',
    latitude: 47.3220,
    longitude: 5.0415,
    description: 'Centre de réalité virtuelle avec escape games et expériences immersives',
    openingHours: ['Lundi: 14:00-22:00', 'Mardi: 14:00-22:00'],
    hours: {},
    practicalInfo: ['Équipements VR dernier cri', 'Sessions privées'],
    envieTags: ['vr', 'escape game', 'immersion'],
    specialties: ['Réalité Virtuelle', 'Escape Games'],
    atmosphere: ['Moderne', 'Technologique'],
    servicesArray: ['Équipements VR', 'Sessions privées'],
    ambianceArray: ['Moderne'],
    activities: ['Réalité Virtuelle', 'Escape Games'],
    paymentMethodsArray: ['Carte bancaire'],
    informationsPratiques: ['Équipements VR'],
    googlePlaceId: 'ChIJVR123456',
    googleBusinessUrl: 'https://maps.google.com/vr-center',
    googleRating: 5.0,
    googleReviewCount: 89,
    theForkLink: undefined,
    uberEatsLink: undefined,
    accessibilityInfo: [],
    servicesAvailableInfo: ['Équipements VR'],
    pointsForts: ['Technologie VR'],
    populairePour: ['Familles', 'Groupes'],
    offres: ['Sessions privées'],
    servicesRestauration: [],
    servicesGeneraux: ['Équipements VR'],
    paymentMethodsInfo: ['Carte bancaire'],
    accessibilityDetails: {},
    detailedServices: {},
    clienteleInfo: {},
    detailedPayments: {},
    childrenServices: {}
  };

  describe('detectEstablishmentType', () => {
    it('devrait détecter un établissement VR à partir du nom', () => {
      const detectedType = smartEnrichmentService.detectEstablishmentType(mockVRData);
      expect(detectedType).toBe('vr');
    });

    it('devrait détecter un établissement VR à partir de la description', () => {
      const dataWithVRDescription = {
        ...mockVRData,
        name: 'Centre de Loisirs',
        description: 'Centre de réalité virtuelle avec escape games'
      };
      
      const detectedType = smartEnrichmentService.detectEstablishmentType(dataWithVRDescription);
      expect(detectedType).toBe('vr');
    });

    it('devrait détecter un établissement VR à partir des activités', () => {
      const dataWithVRActivities = {
        ...mockVRData,
        name: 'Centre de Loisirs',
        description: 'Centre de loisirs',
        activities: ['Réalité Virtuelle', 'Escape Games VR']
      };
      
      const detectedType = smartEnrichmentService.detectEstablishmentType(dataWithVRActivities);
      expect(detectedType).toBe('vr');
    });

    it('devrait détecter un restaurant à partir du nom', () => {
      const restaurantData = {
        ...mockVRData,
        name: 'Restaurant Le Bistrot',
        description: 'Restaurant français traditionnel',
        activities: ['Cuisine française'],
        specialties: ['Plats traditionnels']
      };
      
      const detectedType = smartEnrichmentService.detectEstablishmentType(restaurantData);
      expect(detectedType).toBe('restaurant');
    });

    it('devrait retourner le type fourni si aucun mot-clé n\'est détecté', () => {
      const unknownData = {
        ...mockVRData,
        name: 'Établissement Inconnu',
        description: 'Description générique',
        activities: [],
        specialties: []
      };
      
      const detectedType = smartEnrichmentService.detectEstablishmentType(unknownData);
      expect(detectedType).toBe('other');
    });
  });

  describe('analyzeEnrichmentGaps pour VR', () => {
    it('devrait générer des suggestions spécifiques pour un établissement VR', () => {
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockVRData);
      
      expect(suggestions.recommended).toBeDefined();
      expect(suggestions.optional).toBeDefined();
      
      // Debug: afficher les suggestions générées
      console.log('Suggestions recommandées:', suggestions.recommended.map(s => ({ category: s.category, value: s.value })));
      
      // Vérifier que les suggestions contiennent des éléments spécifiques à la VR
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Réservations obligatoires'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Événements d\'entreprise'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Anniversaires'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Team building'))).toBe(true);
      
      // Vérifier que les suggestions ne contiennent pas d'éléments de restaurant
      expect(serviceSuggestions.some(s => s.value.includes('Service de traiteur'))).toBe(false);
      expect(serviceSuggestions.some(s => s.value.includes('Menu enfants'))).toBe(false);
    });

    it('devrait identifier les données déjà trouvées par Google pour VR', () => {
      const suggestions = smartEnrichmentService.analyzeEnrichmentGaps(mockVRData);
      
      // Vérifier que les données Google existantes sont marquées comme déjà trouvées
      expect(suggestions.alreadyFound.length).toBeGreaterThan(0);
    });
  });

  describe('combineEnrichmentData pour VR', () => {
    it('devrait corriger le type d\'établissement lors de la combinaison', () => {
      const smartData = smartEnrichmentService.combineEnrichmentData(mockVRData, {});
      
      expect(smartData.establishmentType).toBe('vr');
      expect(smartData.prioritizedData).toBeDefined();
      expect(smartData.enrichmentMetadata).toBeDefined();
    });

    it('devrait calculer correctement les métadonnées pour VR', () => {
      const smartData = smartEnrichmentService.combineEnrichmentData(mockVRData, {});
      
      expect(smartData.enrichmentMetadata.googleConfidence).toBeGreaterThan(0);
      expect(smartData.enrichmentMetadata.totalSuggestions).toBeGreaterThan(0);
      expect(smartData.enrichmentMetadata.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('validateEnrichmentConsistency pour VR', () => {
    it('devrait valider des données VR cohérentes', () => {
      const smartData = smartEnrichmentService.combineEnrichmentData(mockVRData, {});
      const validation = smartEnrichmentService.validateEnrichmentConsistency(smartData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('devrait détecter des incohérences spécifiques à la VR', () => {
      const inconsistentVRData = {
        ...mockVRData,
        establishmentType: 'vr',
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
      
      const validation = smartEnrichmentService.validateEnrichmentConsistency(inconsistentVRData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });
});
