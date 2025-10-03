// Service d'enrichissement intelligent pour les établissements
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

export class SmartEnrichmentService {
  private establishmentTypeSuggestions = {
    restaurant: {
      recommended: [
        { category: 'services', value: 'Service de traiteur', confidence: 0.9 },
        { category: 'services', value: 'Réservations', confidence: 0.95 },
        { category: 'services', value: 'Livraison', confidence: 0.8 },
        { category: 'children', value: 'Menu enfants', confidence: 0.85 },
        { category: 'children', value: 'Chaise haute', confidence: 0.9 },
        { category: 'payments', value: 'Carte bancaire', confidence: 0.95 },
        { category: 'payments', value: 'Espèces', confidence: 0.9 },
        { category: 'payments', value: 'Tickets restaurant', confidence: 0.8 }
      ],
      optional: [
        { category: 'services', value: 'Événements privés', confidence: 0.7 },
        { category: 'services', value: 'Cours de cuisine', confidence: 0.6 },
        { category: 'accessibility', value: 'Accessible PMR', confidence: 0.8 },
        { category: 'parking', value: 'Parking gratuit', confidence: 0.7 }
      ]
    },
    bar: {
      recommended: [
        { category: 'services', value: 'Happy hour', confidence: 0.9 },
        { category: 'services', value: 'Concerts', confidence: 0.8 },
        { category: 'services', value: 'Soirées thématiques', confidence: 0.7 },
        { category: 'payments', value: 'Carte bancaire', confidence: 0.95 },
        { category: 'payments', value: 'Espèces', confidence: 0.9 }
      ],
      optional: [
        { category: 'services', value: 'Snacks', confidence: 0.6 },
        { category: 'accessibility', value: 'Accessible PMR', confidence: 0.7 },
        { category: 'parking', value: 'Parking payant', confidence: 0.6 }
      ]
    },
    spa: {
      recommended: [
        { category: 'services', value: 'Massages', confidence: 0.95 },
        { category: 'services', value: 'Soins du visage', confidence: 0.9 },
        { category: 'services', value: 'Réservations obligatoires', confidence: 0.95 },
        { category: 'accessibility', value: 'Accessible PMR', confidence: 0.8 },
        { category: 'payments', value: 'Carte bancaire', confidence: 0.95 }
      ],
      optional: [
        { category: 'services', value: 'Packages', confidence: 0.7 },
        { category: 'services', value: 'Cadeaux', confidence: 0.6 },
        { category: 'children', value: 'Soins enfants', confidence: 0.5 }
      ]
    },
    hotel: {
      recommended: [
        { category: 'services', value: 'Réservations', confidence: 0.95 },
        { category: 'services', value: 'Petit-déjeuner', confidence: 0.9 },
        { category: 'services', value: 'WiFi gratuit', confidence: 0.95 },
        { category: 'accessibility', value: 'Accessible PMR', confidence: 0.9 },
        { category: 'parking', value: 'Parking', confidence: 0.8 },
        { category: 'payments', value: 'Carte bancaire', confidence: 0.95 }
      ],
      optional: [
        { category: 'services', value: 'Spa', confidence: 0.6 },
        { category: 'services', value: 'Restaurant', confidence: 0.7 },
        { category: 'children', value: 'Lit bébé', confidence: 0.7 }
      ]
    }
  };

  /**
   * Analyse les données Google et génère des suggestions intelligentes
   */
  analyzeEnrichmentGaps(googleData: EnrichmentData, establishmentType: string): EnrichmentSuggestions {
    const suggestions: EnrichmentSuggestions = {
      recommended: [],
      optional: [],
      toVerify: [],
      alreadyFound: []
    };

    // Récupérer les suggestions pour le type d'établissement
    const typeSuggestions = this.establishmentTypeSuggestions[establishmentType as keyof typeof this.establishmentTypeSuggestions] || 
                           this.establishmentTypeSuggestions.restaurant;

    // Analyser les données Google existantes
    const googleServices = this.extractGoogleServices(googleData);
    const googlePayments = this.extractGooglePayments(googleData);
    const googleAccessibility = this.extractGoogleAccessibility(googleData);

    // Traiter les suggestions recommandées
    typeSuggestions.recommended.forEach(suggestion => {
      const priority: EnrichmentPriority = {
        source: 'suggested',
        confidence: suggestion.confidence,
        category: suggestion.category,
        value: suggestion.value,
        reason: `Recommandé pour ${establishmentType}`
      };

      // Vérifier si déjà trouvé par Google
      if (this.isAlreadyFound(suggestion, googleServices, googlePayments, googleAccessibility)) {
        suggestions.alreadyFound.push(priority);
      } else {
        suggestions.recommended.push(priority);
      }
    });

    // Traiter les suggestions optionnelles
    typeSuggestions.optional.forEach(suggestion => {
      const priority: EnrichmentPriority = {
        source: 'suggested',
        confidence: suggestion.confidence,
        category: suggestion.category,
        value: suggestion.value,
        reason: `Optionnel pour ${establishmentType}`
      };

      if (!this.isAlreadyFound(suggestion, googleServices, googlePayments, googleAccessibility)) {
        suggestions.optional.push(priority);
      }
    });

    // Identifier les données Google à vérifier (faible confiance)
    this.identifyDataToVerify(googleData, suggestions);

    return suggestions;
  }

  /**
   * Combine intelligemment les données Google et manuelles
   */
  combineEnrichmentData(
    googleData: EnrichmentData, 
    manualData: any, 
    establishmentType: string
  ): SmartEnrichmentData {
    const suggestions = this.analyzeEnrichmentGaps(googleData, establishmentType);
    
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
  validateEnrichmentConsistency(data: SmartEnrichmentData): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Vérifications de cohérence
    if (data.establishmentType === 'restaurant' && !this.hasPaymentMethods(data)) {
      warnings.push('Restaurant sans moyens de paiement spécifiés');
      suggestions.push('Ajoutez au moins "Carte bancaire" et "Espèces"');
    }

    if (data.establishmentType === 'spa' && !this.hasReservationInfo(data)) {
      warnings.push('Spa sans informations de réservation');
      suggestions.push('Ajoutez "Réservations obligatoires"');
    }

    if (data.establishmentType === 'hotel' && !this.hasParkingInfo(data)) {
      warnings.push('Hôtel sans informations de parking');
      suggestions.push('Précisez les options de parking disponibles');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  // Méthodes privées d'analyse
  private extractGoogleServices(googleData: EnrichmentData): string[] {
    return [
      ...(googleData.servicesArray || []),
      ...(googleData.servicesAvailableInfo || []),
      ...(googleData.servicesRestauration || [])
    ];
  }

  private extractGooglePayments(googleData: EnrichmentData): string[] {
    return googleData.paymentMethodsArray || [];
  }

  private extractGoogleAccessibility(googleData: EnrichmentData): string[] {
    return googleData.accessibilityInfo || [];
  }

  private isAlreadyFound(
    suggestion: any, 
    googleServices: string[], 
    googlePayments: string[], 
    googleAccessibility: string[]
  ): boolean {
    const allGoogleData = [...googleServices, ...googlePayments, ...googleAccessibility];
    return allGoogleData.some(item => 
      item.toLowerCase().includes(suggestion.value.toLowerCase()) ||
      suggestion.value.toLowerCase().includes(item.toLowerCase())
    );
  }

  private identifyDataToVerify(googleData: EnrichmentData, suggestions: EnrichmentSuggestions): void {
    // Identifier les données Google avec faible confiance
    if (googleData.rating < 3.5) {
      suggestions.toVerify.push({
        source: 'google',
        confidence: 0.3,
        category: 'rating',
        value: `Note ${googleData.rating}/5`,
        reason: 'Note Google faible, à vérifier'
      });
    }

    if (!googleData.phone && !googleData.website) {
      suggestions.toVerify.push({
        source: 'google',
        confidence: 0.4,
        category: 'contact',
        value: 'Informations de contact manquantes',
        reason: 'Pas de téléphone ni site web trouvé'
      });
    }
  }

  // Méthodes de priorisation par catégorie
  private prioritizeAccessibilityData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données Google (priorité haute si fiables)
    if (googleData.accessibilityInfo && googleData.accessibilityInfo.length > 0) {
      priorities.push({
        source: 'google',
        confidence: 0.8,
        category: 'accessibility',
        value: googleData.accessibilityInfo,
        reason: 'Récupéré de Google'
      });
    }

    // Données manuelles (priorité absolue)
    if (manualData.accessibilityDetails) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'accessibility',
        value: manualData.accessibilityDetails,
        reason: 'Sélectionné manuellement'
      });
    }

    // Suggestions
    const accessibilitySuggestions = suggestions.recommended.filter(s => s.category === 'accessibility');
    priorities.push(...accessibilitySuggestions);

    return priorities.sort((a, b) => b.confidence - a.confidence);
  }

  private prioritizeServicesData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données Google
    const googleServices = this.extractGoogleServices(googleData);
    if (googleServices.length > 0) {
      priorities.push({
        source: 'google',
        confidence: 0.7,
        category: 'services',
        value: googleServices,
        reason: 'Récupéré de Google'
      });
    }

    // Données manuelles
    if (manualData.detailedServices) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'services',
        value: manualData.detailedServices,
        reason: 'Sélectionné manuellement'
      });
    }

    // Suggestions
    const serviceSuggestions = suggestions.recommended.filter(s => s.category === 'services');
    priorities.push(...serviceSuggestions);

    return priorities.sort((a, b) => b.confidence - a.confidence);
  }

  private prioritizePaymentsData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données Google
    const googlePayments = this.extractGooglePayments(googleData);
    if (googlePayments.length > 0) {
      priorities.push({
        source: 'google',
        confidence: 0.6,
        category: 'payments',
        value: googlePayments,
        reason: 'Récupéré de Google'
      });
    }

    // Données manuelles
    if (manualData.detailedPayments) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'payments',
        value: manualData.detailedPayments,
        reason: 'Sélectionné manuellement'
      });
    }

    // Suggestions
    const paymentSuggestions = suggestions.recommended.filter(s => s.category === 'payments');
    priorities.push(...paymentSuggestions);

    return priorities.sort((a, b) => b.confidence - a.confidence);
  }

  private prioritizeClienteleData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données manuelles uniquement (Google ne fournit pas ces infos)
    if (manualData.clienteleInfo) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'clientele',
        value: manualData.clienteleInfo,
        reason: 'Sélectionné manuellement'
      });
    }

    return priorities;
  }

  private prioritizeChildrenData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données manuelles
    if (manualData.childrenServices) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'children',
        value: manualData.childrenServices,
        reason: 'Sélectionné manuellement'
      });
    }

    // Suggestions
    const childrenSuggestions = suggestions.recommended.filter(s => s.category === 'children');
    priorities.push(...childrenSuggestions);

    return priorities.sort((a, b) => b.confidence - a.confidence);
  }

  private prioritizeParkingData(googleData: EnrichmentData, manualData: any, suggestions: EnrichmentSuggestions): EnrichmentPriority[] {
    const priorities: EnrichmentPriority[] = [];

    // Données manuelles
    if (manualData.parkingInfo) {
      priorities.push({
        source: 'manual',
        confidence: 1.0,
        category: 'parking',
        value: manualData.parkingInfo,
        reason: 'Sélectionné manuellement'
      });
    }

    // Suggestions
    const parkingSuggestions = suggestions.recommended.filter(s => s.category === 'parking');
    priorities.push(...parkingSuggestions);

    return priorities.sort((a, b) => b.confidence - a.confidence);
  }

  // Méthodes de calcul
  private calculateGoogleConfidence(googleData: EnrichmentData): number {
    let confidence = 0;
    let factors = 0;

    if (googleData.rating > 0) {
      confidence += Math.min(googleData.rating / 5, 1);
      factors++;
    }

    if (googleData.phone) {
      confidence += 0.8;
      factors++;
    }

    if (googleData.website) {
      confidence += 0.7;
      factors++;
    }

    if (googleData.address) {
      confidence += 0.9;
      factors++;
    }

    return factors > 0 ? confidence / factors : 0;
  }

  private calculateManualCompleteness(manualData: any): number {
    const fields = ['accessibilityDetails', 'detailedServices', 'clienteleInfo', 'detailedPayments', 'childrenServices', 'parkingInfo'];
    const filledFields = fields.filter(field => manualData[field] && Object.keys(manualData[field]).length > 0);
    return filledFields.length / fields.length;
  }

  // Méthodes de validation
  private hasPaymentMethods(data: SmartEnrichmentData): boolean {
    return data.prioritizedData.payments.some(p => p.confidence > 0.5);
  }

  private hasReservationInfo(data: SmartEnrichmentData): boolean {
    return data.prioritizedData.services.some(p => 
      p.value.toString().toLowerCase().includes('réservation') ||
      p.value.toString().toLowerCase().includes('reservation')
    );
  }

  private hasParkingInfo(data: SmartEnrichmentData): boolean {
    return data.prioritizedData.parking.length > 0;
  }
}

// Instance singleton
export const smartEnrichmentService = new SmartEnrichmentService();
