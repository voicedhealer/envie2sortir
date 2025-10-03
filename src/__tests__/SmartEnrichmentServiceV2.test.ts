import { smartEnrichmentServiceV2 } from '@/lib/smart-enrichment-service-v2';
import { EnrichmentData } from '@/lib/enrichment-system';

describe('SmartEnrichmentServiceV2', () => {
  const mockVRData: EnrichmentData = {
    name: 'DreamAway Dijon - Réalité Virtuelle - VR - Escape Games VR',
    establishmentType: 'other',
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

  const mockEscapeGameData: EnrichmentData = {
    ...mockVRData,
    name: 'Escape Room Dijon - Énigmes et Mystères',
    description: 'Salles d\'escape game thématiques avec énigmes',
    activities: ['Escape Game', 'Énigmes'],
    specialties: ['Escape Game', 'Mystères']
  };

  const mockBowlingData: EnrichmentData = {
    ...mockVRData,
    name: 'Bowling Dijon - Pistes et Loisirs',
    description: 'Centre de bowling avec pistes et snacks',
    activities: ['Bowling', 'Loisirs'],
    specialties: ['Bowling', 'Snacks']
  };

  describe('detectActivity', () => {
    it('devrait détecter vr_experience pour un centre VR', () => {
      const activity = smartEnrichmentServiceV2.detectActivity(mockVRData);
      expect(activity).toBe('vr_experience');
    });

    it('devrait détecter escape_game pour un escape room', () => {
      const activity = smartEnrichmentServiceV2.detectActivity(mockEscapeGameData);
      expect(activity).toBe('escape_game');
    });

    it('devrait détecter bowling pour un centre de bowling', () => {
      const activity = smartEnrichmentServiceV2.detectActivity(mockBowlingData);
      expect(activity).toBe('bowling');
    });

    it('devrait retourner autre pour un établissement non reconnu', () => {
      const unknownData = {
        ...mockVRData,
        name: 'Établissement Inconnu',
        description: 'Description générique',
        activities: [],
        specialties: []
      };
      
      const activity = smartEnrichmentServiceV2.detectActivity(unknownData);
      expect(activity).toBe('autre');
    });
  });

  describe('analyzeEnrichmentGaps', () => {
    it('devrait générer des commodités obligatoires', () => {
      const suggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(mockVRData);
      
      // Vérifier que les commodités obligatoires sont présentes
      const paymentSuggestions = suggestions.recommended.filter(s => s.category === 'payments');
      expect(paymentSuggestions.some(s => s.value.includes('Carte bancaire'))).toBe(true);
      expect(paymentSuggestions.some(s => s.value.includes('Espèces'))).toBe(true);
      expect(paymentSuggestions.some(s => s.value.includes('Tickets restaurant'))).toBe(true);
      
      const accessibilitySuggestions = suggestions.recommended.filter(s => s.category === 'accessibility');
      expect(accessibilitySuggestions.some(s => s.value.includes('Accessible PMR'))).toBe(true);
      
      const infrastructureSuggestions = suggestions.recommended.filter(s => s.category === 'infrastructure');
      expect(infrastructureSuggestions.some(s => s.value.includes('Toilettes homme/femme'))).toBe(true);
      expect(infrastructureSuggestions.some(s => s.value.includes('Climatisation'))).toBe(true);
    });

    it('devrait générer des commodités spécifiques à la VR', () => {
      const suggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(mockVRData);
      
      // Debug: afficher les suggestions générées
      console.log('Suggestions recommandées:', suggestions.recommended.map(s => ({ category: s.category, value: s.value })));
      console.log('Suggestions déjà trouvées:', suggestions.alreadyFound.map(s => ({ category: s.category, value: s.value })));
      
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Casques VR'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Équipements dernier cri'))).toBe(true);
      
      // Vérifier que "Sessions privées" est dans les données déjà trouvées
      const alreadyFoundServices = suggestions.alreadyFound.filter(s => s.category === 'services');
      expect(alreadyFoundServices.some(s => s.value.includes('Sessions privées'))).toBe(true);
    });

    it('devrait générer des commodités spécifiques à l\'escape game', () => {
      const suggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(mockEscapeGameData);
      
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Réservations obligatoires'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Sessions d\'équipe'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Thèmes variés'))).toBe(true);
    });

    it('devrait générer des commodités spécifiques au bowling', () => {
      const suggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(mockBowlingData);
      
      const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
      expect(serviceSuggestions.some(s => s.value.includes('Pistes de bowling'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Chaussures'))).toBe(true);
      expect(serviceSuggestions.some(s => s.value.includes('Snacks'))).toBe(true);
    });

    it('devrait identifier les données déjà trouvées par Google', () => {
      const suggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(mockVRData);
      
      // Debug: afficher les données déjà trouvées
      console.log('Données déjà trouvées:', suggestions.alreadyFound.map(s => ({ category: s.category, value: s.value })));
      
      // Vérifier que les données Google existantes sont marquées comme déjà trouvées
      expect(suggestions.alreadyFound.length).toBeGreaterThan(0);
      
      // Vérifier que "Sessions privées" est marquée comme déjà trouvée (dans les services)
      const alreadyFoundServices = suggestions.alreadyFound.filter(s => s.category === 'services');
      expect(alreadyFoundServices.some(s => s.value.includes('Sessions privées'))).toBe(true);
    });
  });

  describe('combineEnrichmentData', () => {
    it('devrait corriger le type d\'établissement avec l\'activité détectée', () => {
      const smartData = smartEnrichmentServiceV2.combineEnrichmentData(mockVRData, {});
      
      expect(smartData.establishmentType).toBe('vr_experience');
      expect(smartData.prioritizedData).toBeDefined();
      expect(smartData.enrichmentMetadata).toBeDefined();
    });

    it('devrait calculer correctement les métadonnées', () => {
      const smartData = smartEnrichmentServiceV2.combineEnrichmentData(mockVRData, {});
      
      expect(smartData.enrichmentMetadata.googleConfidence).toBeGreaterThan(0);
      expect(smartData.enrichmentMetadata.totalSuggestions).toBeGreaterThan(0);
      expect(smartData.enrichmentMetadata.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('validateEnrichmentConsistency', () => {
    it('devrait valider des données VR cohérentes', () => {
      const smartData = smartEnrichmentServiceV2.combineEnrichmentData(mockVRData, {});
      const validation = smartEnrichmentServiceV2.validateEnrichmentConsistency(smartData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('devrait détecter des incohérences pour les établissements VR', () => {
      const inconsistentVRData = {
        ...mockVRData,
        establishmentType: 'vr_experience',
        prioritizedData: {
          accessibility: [],
          services: [], // Pas de services
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
      
      const validation = smartEnrichmentServiceV2.validateEnrichmentConsistency(inconsistentVRData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('VR'))).toBe(true);
    });
  });
});
