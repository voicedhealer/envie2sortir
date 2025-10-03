// Service d'enrichissement intelligent v2 - Cohérent avec les activités de la plateforme
// Priorise et combine intelligemment les données automatiques et manuelles

import { EnrichmentData } from './enrichment-system';

export interface EnrichmentPriority {
  source: 'google' | 'manual' | 'suggested';
  confidence: number; // 0-1
  category: string;
  value: any;
  reason?: string; // Pourquoi cette priorité
}

export interface EnrichmentSuggestions {
  recommended: EnrichmentPriority[];
  optional: EnrichmentPriority[];
  toVerify: EnrichmentPriority[];
  alreadyFound: EnrichmentPriority[];
}

export interface SmartEnrichmentData extends EnrichmentData {
  // Données priorisées
  prioritizedData: {
    accessibility: EnrichmentPriority[];
    services: EnrichmentPriority[];
    payments: EnrichmentPriority[];
    clientele: EnrichmentPriority[];
    children: EnrichmentPriority[];
    parking: EnrichmentPriority[];
  };
  
  // Métadonnées
  enrichmentMetadata: {
    googleConfidence: number;
    manualCompleteness: number;
    totalSuggestions: number;
    lastUpdated: Date;
  };
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export class SmartEnrichmentServiceV2 {
  // Commodités obligatoires (toujours proposées)
  private mandatoryAmenities = {
    payments: [
      { value: 'Carte bancaire', confidence: 0.95 },
      { value: 'Espèces', confidence: 0.9 },
      { value: 'Tickets restaurant', confidence: 0.8 }
    ],
    accessibility: [
      { value: 'Accessible PMR', confidence: 0.7 },
      { value: 'Toilettes handicapées', confidence: 0.6 }
    ],
    infrastructure: [
      { value: 'Toilettes homme/femme', confidence: 0.9 },
      { value: 'Climatisation', confidence: 0.8 },
      { value: 'Chauffage', confidence: 0.8 }
    ],
    services: [
      { value: 'WiFi gratuit', confidence: 0.9 },
      { value: 'Parking', confidence: 0.7 }
    ]
  };

  // Commodités spécifiques par activité de la plateforme
  private activitySpecificAmenities = {
    vr_experience: {
      recommended: [
        { category: 'services', value: 'Casques VR', confidence: 0.95 },
        { category: 'services', value: 'Sessions privées', confidence: 0.9 },
        { category: 'services', value: 'Équipements dernier cri', confidence: 0.85 },
        { category: 'services', value: 'Réservations obligatoires', confidence: 0.9 },
        { category: 'services', value: 'Événements d\'entreprise', confidence: 0.8 },
        { category: 'children', value: 'Sessions enfants', confidence: 0.8 }
      ],
      optional: [
        { category: 'services', value: 'Formation VR', confidence: 0.7 },
        { category: 'services', value: 'Location d\'équipements', confidence: 0.6 },
        { category: 'accessibility', value: 'Casques adaptés', confidence: 0.6 }
      ]
    },
    escape_game: {
      recommended: [
        { category: 'services', value: 'Réservations obligatoires', confidence: 0.95 },
        { category: 'services', value: 'Sessions d\'équipe', confidence: 0.9 },
        { category: 'services', value: 'Thèmes variés', confidence: 0.85 },
        { category: 'services', value: 'Événements d\'entreprise', confidence: 0.8 },
        { category: 'children', value: 'Sessions enfants', confidence: 0.8 }
      ],
      optional: [
        { category: 'services', value: 'Sessions privées', confidence: 0.7 },
        { category: 'services', value: 'Anniversaires', confidence: 0.75 },
        { category: 'services', value: 'Team building', confidence: 0.8 }
      ]
    },
    laser_game: {
      recommended: [
        { category: 'services', value: 'Équipements laser', confidence: 0.95 },
        { category: 'services', value: 'Sessions tactiques', confidence: 0.9 },
        { category: 'services', value: 'Équipes', confidence: 0.85 },
        { category: 'services', value: 'Réservations obligatoires', confidence: 0.9 }
      ],
      optional: [
        { category: 'services', value: 'Événements d\'entreprise', confidence: 0.7 },
        { category: 'services', value: 'Anniversaires', confidence: 0.75 }
      ]
    },
    bowling: {
      recommended: [
        { category: 'services', value: 'Pistes de bowling', confidence: 0.95 },
        { category: 'services', value: 'Chaussures', confidence: 0.9 },
        { category: 'services', value: 'Snacks', confidence: 0.8 },
        { category: 'services', value: 'Réservations', confidence: 0.85 }
      ],
      optional: [
        { category: 'services', value: 'Événements privés', confidence: 0.7 },
        { category: 'services', value: 'Anniversaires', confidence: 0.75 }
      ]
    },
    billard_americain: {
      recommended: [
        { category: 'services', value: 'Tables de billard', confidence: 0.95 },
        { category: 'services', value: 'Queues', confidence: 0.9 },
        { category: 'services', value: 'Snacks', confidence: 0.8 }
      ],
      optional: [
        { category: 'services', value: 'Tournois', confidence: 0.7 },
        { category: 'services', value: 'Cours', confidence: 0.6 }
      ]
    },
    karting: {
      recommended: [
        { category: 'services', value: 'Karts', confidence: 0.95 },
        { category: 'services', value: 'Casques', confidence: 0.9 },
        { category: 'services', value: 'Réservations obligatoires', confidence: 0.9 }
      ],
      optional: [
        { category: 'services', value: 'Événements d\'entreprise', confidence: 0.7 },
        { category: 'services', value: 'Anniversaires', confidence: 0.75 }
      ]
    }
  };

  /**
   * Détecte intelligemment l'activité de l'établissement basé sur les données Google
   */
  detectActivity(googleData: EnrichmentData): string {
    const name = googleData.name?.toLowerCase() || '';
    const description = googleData.description?.toLowerCase() || '';
    const activities = googleData.activities?.join(' ').toLowerCase() || '';
    const specialties = googleData.specialties?.join(' ').toLowerCase() || '';
    
    const fullText = `${name} ${description} ${activities} ${specialties}`;
    
    // Détection VR Experience
    const vrKeywords = ['réalité virtuelle', 'virtual reality', 'vr experience', 'casque vr', 'immersion vr'];
    if (vrKeywords.some(keyword => fullText.includes(keyword))) {
      return 'vr_experience';
    }
    
    // Détection Escape Game
    const escapeKeywords = ['escape game', 'escape room', 'énigmes', 'salles thématiques'];
    if (escapeKeywords.some(keyword => fullText.includes(keyword))) {
      return 'escape_game';
    }
    
    // Détection Laser Game
    const laserKeywords = ['laser game', 'laser tag', 'laser', 'tactique'];
    if (laserKeywords.some(keyword => fullText.includes(keyword))) {
      return 'laser_game';
    }
    
    // Détection Bowling
    const bowlingKeywords = ['bowling', 'piste', 'quilles'];
    if (bowlingKeywords.some(keyword => fullText.includes(keyword))) {
      return 'bowling';
    }
    
    // Détection Billard
    const billardKeywords = ['billard', 'pool', 'snooker'];
    if (billardKeywords.some(keyword => fullText.includes(keyword))) {
      return 'billard_americain';
    }
    
    // Détection Karting
    const kartingKeywords = ['karting', 'kart', 'course', 'piste'];
    if (kartingKeywords.some(keyword => fullText.includes(keyword))) {
      return 'karting';
    }
    
    // Par défaut, retourner 'autre' si aucune activité spécifique n'est détectée
    return 'autre';
  }

  /**
   * Vérifie si une commodité est déjà présente dans les données Google
   */
  private isAlreadyFound(amenity: any, googleServices: string[], googlePayments: string[], googleAccessibility: string[]): boolean {
    const value = amenity.value.toLowerCase();
    
    // Vérifier dans les services
    if (googleServices.some(service => service.toLowerCase().includes(value) || value.includes(service.toLowerCase()))) {
      return true;
    }
    
    // Vérifier dans les moyens de paiement
    if (amenity.category === 'payments' && googlePayments.some(payment => payment.toLowerCase().includes(value) || value.includes(payment.toLowerCase()))) {
      return true;
    }
    
    // Vérifier dans l'accessibilité
    if (amenity.category === 'accessibility' && googleAccessibility.some(access => access.toLowerCase().includes(value) || value.includes(access.toLowerCase()))) {
      return true;
    }
    
    return false;
  }

  /**
   * Extrait les services des données Google
   */
  private extractGoogleServices(googleData: EnrichmentData): string[] {
    const services = [];
    
    if (googleData.servicesArray) {
      services.push(...googleData.servicesArray);
    }
    
    if (googleData.servicesAvailableInfo) {
      services.push(...googleData.servicesAvailableInfo);
    }
    
    if (googleData.detailedServices) {
      services.push(...Object.values(googleData.detailedServices).flat());
    }
    
    return services;
  }

  /**
   * Extrait les moyens de paiement des données Google
   */
  private extractGooglePayments(googleData: EnrichmentData): string[] {
    const payments = [];
    
    if (googleData.paymentMethodsArray) {
      payments.push(...googleData.paymentMethodsArray);
    }
    
    if (googleData.paymentMethodsInfo) {
      payments.push(...googleData.paymentMethodsInfo);
    }
    
    if (googleData.detailedPayments) {
      payments.push(...Object.values(googleData.detailedPayments).flat());
    }
    
    return payments;
  }

  /**
   * Extrait les informations d'accessibilité des données Google
   */
  private extractGoogleAccessibility(googleData: EnrichmentData): string[] {
    const accessibility = [];
    
    if (googleData.accessibilityInfo) {
      accessibility.push(...googleData.accessibilityInfo);
    }
    
    if (googleData.accessibilityDetails) {
      accessibility.push(...Object.values(googleData.accessibilityDetails).flat());
    }
    
    return accessibility;
  }

  /**
   * Analyse les données Google et génère des suggestions intelligentes
   */
  analyzeEnrichmentGaps(googleData: EnrichmentData): EnrichmentSuggestions {
    // Détecter l'activité de l'établissement
    const detectedActivity = this.detectActivity(googleData);
    
    const suggestions: EnrichmentSuggestions = {
      recommended: [],
      optional: [],
      toVerify: [],
      alreadyFound: []
    };

    // Analyser les données Google existantes
    const googleServices = this.extractGoogleServices(googleData);
    const googlePayments = this.extractGooglePayments(googleData);
    const googleAccessibility = this.extractGoogleAccessibility(googleData);

    // 1. Ajouter les commodités obligatoires
    Object.entries(this.mandatoryAmenities).forEach(([category, amenities]) => {
      amenities.forEach(amenity => {
        const priority: EnrichmentPriority = {
          source: 'suggested',
          confidence: amenity.confidence,
          category: category,
          value: amenity.value,
          reason: 'Commodité obligatoire'
        };

        if (this.isAlreadyFound(amenity, googleServices, googlePayments, googleAccessibility)) {
          suggestions.alreadyFound.push(priority);
        } else {
          suggestions.recommended.push(priority);
        }
      });
    });

    // 2. Ajouter les commodités spécifiques à l'activité
    const activityAmenities = this.activitySpecificAmenities[detectedActivity as keyof typeof this.activitySpecificAmenities];
    if (activityAmenities) {
      // Commodités recommandées pour l'activité
      activityAmenities.recommended.forEach(amenity => {
        const priority: EnrichmentPriority = {
          source: 'suggested',
          confidence: amenity.confidence,
          category: amenity.category,
          value: amenity.value,
          reason: `Recommandé pour ${detectedActivity}`
        };

        if (this.isAlreadyFound(amenity, googleServices, googlePayments, googleAccessibility)) {
          suggestions.alreadyFound.push(priority);
        } else {
          suggestions.recommended.push(priority);
        }
      });

      // Commodités optionnelles pour l'activité
      activityAmenities.optional.forEach(amenity => {
        const priority: EnrichmentPriority = {
          source: 'suggested',
          confidence: amenity.confidence,
          category: amenity.category,
          value: amenity.value,
          reason: `Optionnel pour ${detectedActivity}`
        };

        if (!this.isAlreadyFound(amenity, googleServices, googlePayments, googleAccessibility)) {
          suggestions.optional.push(priority);
        }
      });
    }

    return suggestions;
  }

  /**
   * Combine intelligemment les données Google et manuelles
   */
  combineEnrichmentData(
    googleData: EnrichmentData, 
    manualData: any
  ): SmartEnrichmentData {
    // Détecter l'activité
    const detectedActivity = this.detectActivity(googleData);
    const suggestions = this.analyzeEnrichmentGaps(googleData);
    
    // Créer les données priorisées
    const prioritizedData = {
      accessibility: this.prioritizeAccessibilityData(googleData, manualData, suggestions),
      services: this.prioritizeServicesData(googleData, manualData, suggestions),
      payments: this.prioritizePaymentsData(googleData, manualData, suggestions),
      clientele: this.prioritizeClienteleData(googleData, manualData, suggestions),
      children: this.prioritizeChildrenData(googleData, manualData, suggestions),
      parking: this.prioritizeParkingData(googleData, manualData, suggestions)
    };

    // Calculer les métadonnées
    const googleConfidence = this.calculateGoogleConfidence(googleData);
    const manualCompleteness = this.calculateManualCompleteness(manualData);
    const totalSuggestions = suggestions.recommended.length + suggestions.optional.length;

    return {
      ...googleData,
      establishmentType: detectedActivity, // Mettre à jour avec l'activité détectée
      prioritizedData,
      enrichmentMetadata: {
        googleConfidence,
        manualCompleteness,
        totalSuggestions,
        lastUpdated: new Date()
      }
    };
  }

  /**
   * Valide la cohérence des données finales
   */
  validateEnrichmentConsistency(data: SmartEnrichmentData): ValidationResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Vérifications de cohérence
    if (data.establishmentType === 'vr_experience' && !this.hasReservationInfo(data)) {
      warnings.push('Établissement VR sans informations de réservation');
      suggestions.push('Ajoutez "Réservations obligatoires"');
    }

    if (data.establishmentType === 'escape_game' && !this.hasReservationInfo(data)) {
      warnings.push('Escape Game sans informations de réservation');
      suggestions.push('Ajoutez "Réservations obligatoires"');
    }

    if (data.establishmentType === 'karting' && !this.hasReservationInfo(data)) {
      warnings.push('Karting sans informations de réservation');
      suggestions.push('Ajoutez "Réservations obligatoires"');
    }

    if (!this.hasPaymentMethods(data)) {
      warnings.push('Établissement sans moyens de paiement spécifiés');
      suggestions.push('Ajoutez au moins "Carte bancaire" et "Espèces"');
    }

    if (!this.hasAccessibilityInfo(data)) {
      warnings.push('Établissement sans informations d\'accessibilité');
      suggestions.push('Ajoutez "Accessible PMR"');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  // Méthodes utilitaires pour la validation
  private hasReservationInfo(data: SmartEnrichmentData): boolean {
    const services = data.prioritizedData.services.map(s => s.value.toLowerCase());
    return services.some(service => 
      service.includes('réservation') || 
      service.includes('booking') ||
      service.includes('obligatoire')
    );
  }

  private hasPaymentMethods(data: SmartEnrichmentData): boolean {
    const payments = data.prioritizedData.payments.map(p => p.value.toLowerCase());
    return payments.some(payment => 
      payment.includes('carte') || 
      payment.includes('espèces') ||
      payment.includes('ticket')
    );
  }

  private hasAccessibilityInfo(data: SmartEnrichmentData): boolean {
    const accessibility = data.prioritizedData.accessibility.map(a => a.value.toLowerCase());
    return accessibility.some(access => 
      access.includes('pmr') || 
      access.includes('handicap') ||
      access.includes('accessible')
    );
  }

  // Méthodes de priorisation des données
  private prioritizeAccessibilityData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les données Google existantes
    if (googleData.accessibilityInfo) {
      googleData.accessibilityInfo.forEach(info => {
        priorities.push({
          source: 'google',
          confidence: 0.8,
          category: 'accessibility',
          value: info,
          reason: 'Données Google'
        });
      });
    }
    
    // Ajouter les suggestions sélectionnées
    const selectedAccessibility = suggestions.recommended.filter(s => s.category === 'accessibility');
    selectedAccessibility.forEach(suggestion => {
      priorities.push({
        ...suggestion,
        source: 'manual'
      });
    });
    
    return priorities;
  }

  private prioritizeServicesData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les données Google existantes
    if (googleData.servicesArray) {
      googleData.servicesArray.forEach(service => {
        priorities.push({
          source: 'google',
          confidence: 0.8,
          category: 'services',
          value: service,
          reason: 'Données Google'
        });
      });
    }
    
    // Ajouter les suggestions sélectionnées
    const selectedServices = suggestions.recommended.filter(s => s.category === 'services');
    selectedServices.forEach(suggestion => {
      priorities.push({
        ...suggestion,
        source: 'manual'
      });
    });
    
    return priorities;
  }

  private prioritizePaymentsData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les données Google existantes
    if (googleData.paymentMethodsArray) {
      googleData.paymentMethodsArray.forEach(payment => {
        priorities.push({
          source: 'google',
          confidence: 0.8,
          category: 'payments',
          value: payment,
          reason: 'Données Google'
        });
      });
    }
    
    // Ajouter les suggestions sélectionnées
    const selectedPayments = suggestions.recommended.filter(s => s.category === 'payments');
    selectedPayments.forEach(suggestion => {
      priorities.push({
        ...suggestion,
        source: 'manual'
      });
    });
    
    return priorities;
  }

  private prioritizeClienteleData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les données Google existantes
    if (googleData.populairePour) {
      googleData.populairePour.forEach(clientele => {
        priorities.push({
          source: 'google',
          confidence: 0.8,
          category: 'clientele',
          value: clientele,
          reason: 'Données Google'
        });
      });
    }
    
    return priorities;
  }

  private prioritizeChildrenData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les suggestions sélectionnées
    const selectedChildren = suggestions.recommended.filter(s => s.category === 'children');
    selectedChildren.forEach(suggestion => {
      priorities.push({
        ...suggestion,
        source: 'manual'
      });
    });
    
    return priorities;
  }

  private prioritizeParkingData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];
    
    // Ajouter les suggestions sélectionnées
    const selectedParking = suggestions.recommended.filter(s => s.category === 'services' && s.value.toLowerCase().includes('parking'));
    selectedParking.forEach(suggestion => {
      priorities.push({
        ...suggestion,
        category: 'parking',
        source: 'manual'
      });
    });
    
    return priorities;
  }

  private calculateGoogleConfidence(googleData: EnrichmentData): number {
    // Calculer la confiance des données Google
    return 0.8;
  }

  private calculateManualCompleteness(manualData: any): number {
    // Calculer la complétude des données manuelles
    return 0.5;
  }
}

// Instance singleton
export const smartEnrichmentServiceV2 = new SmartEnrichmentServiceV2();
