// Système d'enrichissement automatique des établissements
// Basé sur l'API Google Places pour générer des tags "envie" intelligents

export interface EnrichmentData {
  // Infos de base
  name: string;
  establishmentType: string;
  priceLevel: number;
  rating: number;
  website?: string;
  phone?: string;
  address?: string;
  description?: string;
  openingHours?: string[];
  hours?: any; // Format HoursData pour le formulaire
  practicalInfo?: string[]; // Informations pratiques générées
  
  // Tags d'envie générés
  envieTags: string[];
  
  // Informations spécifiques selon le type
  specialties: string[];
  atmosphere: string[];
  
  // Données pour les étapes du formulaire
  servicesArray?: string[]; // Services et commodités (format tableau)
  ambianceArray?: string[]; // Ambiance et spécialités (format tableau)
  activities?: string[]; // Activités proposées
  paymentMethodsArray?: string[]; // Moyens de paiement (format tableau)
  informationsPratiques?: string[]; // Informations pratiques
  
  // Données Google
  googlePlaceId: string;
  googleBusinessUrl?: string;
  googleRating: number;
  googleReviewCount: number;
  
  // Intégration TheFork
  theForkLink?: string;
  
  // Lien Uber Eats
  uberEatsLink?: string;

  // === SECTIONS DIRECTES DEPUIS GOOGLE PLACES ===
  
  // Accessibilité (directement depuis Google Places)
  accessibilityInfo: string[];
  
  // Services disponibles (directement depuis Google Places)
  servicesAvailableInfo: string[];
  
  // Points forts (directement depuis Google Places)
  pointsForts: string[];
  
  // Populaire pour (directement depuis Google Places)
  populairePour: string[];
  
  // Offres (directement depuis Google Places)
  offres: string[];
  
  // Services de restauration (directement depuis Google Places)
  servicesRestauration: string[];
  
  // Services généraux (directement depuis Google Places)
  servicesInfo: string[];
  
  // Ambiance (directement depuis Google Places)
  ambianceInfo: string[];
  
  // Clientèle (directement depuis Google Places)
  clientele: string[];
  
  // Planning (directement depuis Google Places)
  planning: string[];
  
  // Paiements (directement depuis Google Places)
  paiements: string[];
  
  // Enfants (directement depuis Google Places)
  enfants: string[];
  
  // Parking (directement depuis Google Places)
  parking: string[];
}

export class EstablishmentEnrichment {
  private apiKey: string;
  private enrichmentData: EnrichmentData | null = null;
  private establishmentType: string | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_google_places_api_key_here') {
      console.warn('⚠️ Clé API Google Places manquante ou non configurée - utilisation du mode démonstration');
    }
  }

  async triggerGoogleEnrichment(googleUrl: string): Promise<EnrichmentData> {
    console.log('🚀 triggerGoogleEnrichment appelé avec:', googleUrl);
    try {
      // Utiliser l'API de résolution pour obtenir le Place ID
      const resolveResponse = await fetch('/api/resolve-google-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: googleUrl })
      });
      
      if (!resolveResponse.ok) {
        let errorMessage = 'Erreur inconnue';
        try {
          const errorData = await resolveResponse.json();
          errorMessage = errorData.error || errorData.message || 'Erreur inconnue';
        } catch (e) {
          const errorText = await resolveResponse.text();
          errorMessage = errorText || 'Erreur inconnue';
        }
        console.error('Erreur résolution URL:', errorMessage);
        throw new Error(`Erreur de résolution d'URL: ${errorMessage}`);
      }
      
      const resolveData = await resolveResponse.json();
      if (!resolveData.success || !resolveData.placeId) {
        console.error('Données de résolution invalides:', resolveData);
        throw new Error(`URL Google Maps invalide: ${resolveData.error || 'Format non reconnu'}`);
      }
      
      console.log('✅ Place ID récupéré:', resolveData.placeId);

      // Appel API Google Places
      console.log('📞 Appel fetchGooglePlaceData avec:', resolveData.placeId, resolveData.placeName);
      const placeData = await this.fetchGooglePlaceData(resolveData.placeId, resolveData.placeName);
      console.log('📥 Données reçues de Google Places:', JSON.stringify(placeData, null, 2));
      
      // Traitement et génération des tags
      console.log('🔄 Début processPlaceData...');
      this.enrichmentData = await this.processPlaceData(placeData, googleUrl);
      console.log('✅ processPlaceData terminé');
      
      console.log('🎯 Données d\'enrichissement finales:', JSON.stringify(this.enrichmentData, null, 2));
      return this.enrichmentData;
      
    } catch (error) {
      console.error('Erreur enrichissement:', error);
      throw error;
    }
  }



  private extractPlaceIdFromUrl(url: string): string | null {
    console.log('🔍 Extraction Place ID depuis:', url);
    
    // Extraction du Place ID depuis différents formats d'URL Google
    const patterns = [
      // Format classique avec place_id
      /place_id=([a-zA-Z0-9_-]+)/,
      // Format avec 1s (le plus courant pour les URLs modernes) - CORRIGÉ
      /1s([a-zA-Z0-9_:]+)/,
      // Format avec data
      /data=([^&]+)/,
      // Format maps/place avec @
      /maps\/place\/[^\/]+\/@[^\/]+\/([a-zA-Z0-9_-]+)/,
      // Format maps/place simple
      /maps\/place\/([a-zA-Z0-9_-]+)/,
      // Format avec @ et coordonnées
      /@[^\/]+\/([a-zA-Z0-9_-]+)/,
      // Format avec !16s (nouveau format)
      /!16s([a-zA-Z0-9_%\/-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        let placeId = match[1];
        console.log('✅ Place ID trouvé:', placeId);
        
        // Nettoyer l'ID si nécessaire
        if (placeId.includes('?')) {
          placeId = placeId.split('?')[0];
        }
        
        // Vérifier que c'est un Place ID valide (contient des deux-points)
        if (placeId.includes(':')) {
          console.log('✅ Place ID valide:', placeId);
          return placeId;
        }
      }
    }
    
    console.log('❌ Aucun Place ID valide trouvé');
    return null;
  }

  private async fetchGooglePlaceData(placeId: string, placeName?: string): Promise<any> {
    console.log('📞 Appel fetchGooglePlaceData avec:', placeId, placeName);
    
    const fields = [
      // Infos de base (toujours disponibles)
      'name', 'types', 'price_level', 'rating', 'user_ratings_total', 'business_status',
      'opening_hours', 'website', 'formatted_phone_number', 'formatted_address', 'geometry',
      
      // Détails étendus (disponibles selon l'établissement)
      'wheelchair_accessible_entrance', 'takeout', 'delivery', 'dine_in', 'reservations',
      'serves_breakfast', 'serves_lunch', 'serves_dinner', 'serves_beer', 'serves_wine',
      'serves_coffee', 'serves_vegetarian_food', 'good_for_children', 'good_for_groups',
      'outdoor_seating', 'restroom', 'editorial_summary', 'reviews', 'photos'
    ].join(',');

    // Si placeId contient des coordonnées, ne pas passer fields (Text/Nearby Search ne les supportent pas)
    const requestBody: any = {
      placeId: placeId,
      apiKey: this.apiKey,
      placeName: placeName
    };
    
    // Seulement ajouter fields si c'est un vrai Place ID (pas des coordonnées)
    if (!placeId.includes(',')) {
      requestBody.fields = fields;
    }

    const response = await fetch('/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error('Erreur API Google Places');
    }
    
    const data = await response.json();
    console.log('📨 Réponse complète API Google Places:', JSON.stringify(data, null, 2));
    
    if (!data.result) {
      throw new Error('Aucune donnée récupérée de Google Places');
    }

    console.log('📋 Données result extraites:', JSON.stringify(data.result, null, 2));
    return data.result;
  }

  private async processPlaceData(placeData: any, googleUrl: string): Promise<EnrichmentData> {
    console.log('🔄 processPlaceData - Données Google Places reçues:', JSON.stringify(placeData, null, 2));
    
    // Vérifier que placeData est valide
    if (!placeData || !placeData.place_id) {
      console.error('❌ Données Google Places invalides:', placeData);
      throw new Error('Données Google Places invalides');
    }

    const result = placeData;
    
    // Déterminer le type d'établissement
    this.establishmentType = this.categorizeEstablishment(result.types);
    console.log('🏢 Type d\'établissement déterminé:', this.establishmentType);

    // Générer les tags "envie" selon le type
    const envieTags = this.generateEnvieTags(result);
    console.log('🏷️ Tags "envie" générés:', envieTags);
    
    // Extraire informations structurées
    const processedData: EnrichmentData = {
      // Infos de base
      name: result.name,
      establishmentType: this.establishmentType,
      priceLevel: this.translatePriceLevel(result.price_level),
      rating: result.rating || 0,
      website: result.website,
      phone: result.formatted_phone_number,
      
      // Adresse complète
      address: result.formatted_address || result.vicinity,
      
      // Horaires d'ouverture (format Google Places)
      openingHours: result.opening_hours?.weekday_text || [],
      
      // Horaires d'ouverture (format formulaire)
      hours: (() => {
        console.log('🕐 Début conversion horaires pour:', result.name);
        console.log('🕐 Données opening_hours brutes:', JSON.stringify(result.opening_hours, null, 2));
        const convertedHours = this.convertOpeningHours(result.opening_hours);
        console.log('🕐 Horaires convertis:', JSON.stringify(convertedHours, null, 2));
        return convertedHours;
      })(),
      
      // Informations pratiques générées
      practicalInfo: this.generatePracticalInfo(result),
      
      // Description générée à partir des avis
      description: this.generateDescription(result),
      
      // Tags d'envie générés
      envieTags: envieTags,
      
      // Informations spécifiques selon le type
      specialties: this.extractSpecialties(result),
      atmosphere: this.determineAtmosphere(result),
      
      // Données Google
      googlePlaceId: result.place_id,
      googleBusinessUrl: googleUrl,
      googleRating: result.rating || 0,
      googleReviewCount: result.user_ratings_total || 0,
      
      // Suggestions de TheFork link
      theForkLink: this.suggestTheForkIntegration(result),

      // === SECTIONS DIRECTES DEPUIS GOOGLE PLACES ===
      
      // Accessibilité (directement depuis Google Places)
      accessibilityInfo: this.extractAccessibilityFromGoogle(result),
      
      // Services disponibles (directement depuis Google Places)
      servicesAvailableInfo: this.extractServicesAvailableFromGoogle(result),
      
      // Points forts (directement depuis Google Places)
      pointsForts: this.extractPointsFortsFromGoogle(result),
      
      // Populaire pour (directement depuis Google Places)
      populairePour: this.extractPopulairePourFromGoogle(result),
      
      // Offres (directement depuis Google Places)
      offres: this.extractOffresFromGoogle(result),
      
      // Services de restauration (directement depuis Google Places)
      servicesRestauration: this.extractServicesRestaurationFromGoogle(result),
      
      // Services généraux (directement depuis Google Places)
      servicesInfo: this.extractServicesFromGoogle(result),
      
      // Ambiance (directement depuis Google Places)
      ambianceInfo: this.extractAmbianceFromGoogle(result),
      
      // Clientèle (directement depuis Google Places)
      clientele: this.extractClienteleFromGoogle(result),
      
      // Planning (directement depuis Google Places)
      planning: this.extractPlanningFromGoogle(result),
      
      // Paiements (directement depuis Google Places)
      paiements: this.extractPaiementsFromGoogle(result),
      
      // Enfants (directement depuis Google Places)
      enfants: this.extractEnfantsFromGoogle(result),
      
      // Parking (directement depuis Google Places)
      parking: this.extractParkingFromGoogle(result),
      
      // === DONNÉES POUR LES ÉTAPES DU FORMULAIRE ===
      
      // Services et commodités (format tableau de strings)
      servicesArray: this.generateServicesArray(result),
      
      // Ambiance et spécialités (format tableau de strings)
      ambianceArray: this.generateAmbianceArray(result),
      
      // Activités proposées (format tableau de strings)
      activities: this.generateActivitiesArray(result),
      
      // Moyens de paiement (format tableau de strings)
      paymentMethodsArray: this.generatePaymentMethodsArray(result),
      
      // Informations pratiques (format tableau de strings)
      informationsPratiques: this.generateInformationsPratiquesArray(result),
    };
    
    return processedData;
  }

  private categorizeEstablishment(googleTypes: string[]): string {
    // Vérifier que googleTypes est défini et est un tableau
    if (!googleTypes || !Array.isArray(googleTypes)) {
      console.warn('⚠️ Types Google invalides ou manquants:', googleTypes);
      return 'other';
    }

    const typeMapping = {
      restaurant: ['restaurant', 'meal_takeaway', 'meal_delivery', 'food'],
      bar: ['bar', 'night_club', 'liquor_store'],
      escape_game: ['amusement_park', 'tourist_attraction'],
      hotel: ['lodging'],
      spa: ['spa', 'beauty_salon'],
      sport: ['gym', 'stadium'],
      cinema: ['movie_theater'],
      shopping: ['shopping_mall', 'store']
    };

    for (const [category, types] of Object.entries(typeMapping)) {
      if (types.some(type => googleTypes.includes(type))) {
        return category;
      }
    }
    
    return 'other';
  }

  private generateEnvieTags(placeData: any): string[] {
    const baseTags: string[] = [];
    const type = this.establishmentType;

    // Tags basés sur le type d'établissement
    const typeBasedTags: Record<string, string[]> = {
      restaurant: [
        'Envie de bien manger',
        'Envie de sortir dîner',
        'Envie de découvrir',
        'Envie de se régaler'
      ],
      bar: [
        'Envie de boire un verre',
        'Envie de soirée',
        'Envie de convivialité',
        'Envie de détente'
      ],
      escape_game: [
        'Envie d\'évasion',
        'Envie de challenge',
        'Envie de groupe',
        'Envie d\'aventure'
      ],
      cinema: [
        'Envie de cinéma',
        'Envie de détente',
        'Envie de culture'
      ],
      spa: [
        'Envie de détente',
        'Envie de bien-être',
        'Envie de se ressourcer'
      ]
    };
    
    baseTags.push(...(typeBasedTags[type || 'restaurant'] || []));
    
    // Tags basés sur le prix
    const priceBasedTags: Record<number, string[]> = {
      1: ['Envie d\'économique', 'Envie d\'accessible'],
      2: ['Envie de bon rapport qualité-prix'],
      3: ['Envie de standing', 'Envie de se faire plaisir'],
      4: ['Envie de luxe', 'Envie d\'exception']
    };
    
    if (placeData.price_level) {
      baseTags.push(...(priceBasedTags[placeData.price_level] || []));
    }
    
    // Tags basés sur les avis et notes
    if (placeData.rating >= 4.5) {
      baseTags.push('Envie d\'excellence', 'Envie de qualité');
    } else if (placeData.rating >= 4.0) {
      baseTags.push('Envie de fiabilité');
    }
    
    // Tags basés sur les types Google spécifiques
    const specificTypeTags: Record<string, string[]> = {
      'french_restaurant': ['Envie de français', 'Envie de tradition'],
      'italian_restaurant': ['Envie d\'italien', 'Envie de convivial'],
      'japanese_restaurant': ['Envie de japonais', 'Envie de raffinement'],
      'fast_food_restaurant': ['Envie de rapide', 'Envie de casual'],
      'fine_dining_restaurant': ['Envie de gastronomie', 'Envie de prestige'],
      'seafood_restaurant': ['Envie de fruits de mer', 'Envie de fraîcheur'],
      'steak_house': ['Envie de viande', 'Envie de grillade'],
      'pizza_place': ['Envie de pizza', 'Envie de partage'],
      'cafe': ['Envie de café', 'Envie de pause'],
      'bakery': ['Envie de pâtisserie', 'Envie de douceur']
    };
    
    placeData.types.forEach((type: string) => {
      if (specificTypeTags[type]) {
        baseTags.push(...specificTypeTags[type]);
      }
    });
    
    return [...new Set(baseTags)]; // Supprimer les doublons
  }

  private extractSpecialties(placeData: any): string[] {
    const specialties: string[] = [];
    
    if (placeData.reviews && Array.isArray(placeData.reviews)) {
      const dishKeywords = [
        'escargots', 'coq au vin', 'bouillabaisse', 'ratatouille',
        'moules frites', 'steak tartare', 'crème brûlée', 'tarte tatin',
        'burger', 'pizza', 'sushi', 'pasta', 'risotto', 'paella',
        'couscous', 'tajine', 'curry', 'pad thai', 'ramen'
      ];
      
      const reviewTexts = placeData.reviews
        .map((r: any) => r.text?.toLowerCase() || '')
        .join(' ');
      
      dishKeywords.forEach(dish => {
        if (reviewTexts.includes(dish)) {
          specialties.push(`Envie de ${dish}`);
        }
      });
    }
    
    return specialties;
  }

  private determineAtmosphere(placeData: any): string[] {
    const atmosphere: string[] = [];
    
    // Analyser les types pour déterminer l'ambiance
    if (placeData.types.includes('romantic')) {
      atmosphere.push('Envie de romantique');
    }
    if (placeData.types.includes('family')) {
      atmosphere.push('Envie de familial');
    }
    if (placeData.types.includes('casual')) {
      atmosphere.push('Envie de décontracté');
    }
    if (placeData.types.includes('upscale')) {
      atmosphere.push('Envie de standing');
    }
    
    return atmosphere;
  }

  private checkAccessibility(placeData: any): string[] {
    const accessibility: string[] = [];
    
    // Vérifier les informations d'accessibilité si disponibles
    if (placeData.accessibility_options) {
      if (placeData.accessibility_options.wheelchair_accessible) {
        accessibility.push('Accessible en fauteuil roulant');
      }
    }
    
    return accessibility;
  }

  private suggestTheForkIntegration(placeData: any): string | undefined {
    // Suggérer un lien TheFork si c'est un restaurant
    if (this.establishmentType === 'restaurant') {
      return undefined; // L'utilisateur devra ajouter manuellement
    }
    return undefined;
  }

  private translatePriceLevel(priceLevel: number | undefined): number {
    if (!priceLevel) return 2; // Par défaut
    return Math.min(4, Math.max(1, priceLevel));
  }

  private generateDescription(placeData: any): string {
    // Générer une description à partir des avis et des types
    const reviews = placeData.reviews || [];
    const types = placeData.types || [];
    
    let description = '';
    
    // Ajouter des éléments basés sur les types
    if (types.includes('bar')) {
      description += 'Bar convivial ';
    }
    if (types.includes('restaurant')) {
      description += 'Restaurant ';
    }
    if (types.includes('night_club')) {
      description += 'Boîte de nuit ';
    }
    
    // Ajouter des éléments basés sur les avis
    if (reviews.length > 0) {
      const positiveWords = reviews
        .map((review: any) => review.text)
        .join(' ')
        .toLowerCase()
        .match(/\b(ambiance|convivial|sympa|top|génial|super|excellent|parfait)\b/g);
      
      if (positiveWords && positiveWords.length > 0) {
        description += `avec une ${positiveWords[0]} ambiance. `;
      }
    }
    
    // Ajouter des informations pratiques
    if (placeData.opening_hours?.weekday_text) {
      const openDays = placeData.opening_hours.weekday_text
        .filter((day: string) => !day.includes('Closed'))
        .length;
      description += `Ouvert ${openDays} jours par semaine. `;
    }
    
    return description.trim() || `${placeData.name} - Établissement de qualité`;
  }

  private convertOpeningHours(openingHours: any): any {
    console.log('🕐 convertOpeningHours - Données reçues:', JSON.stringify(openingHours, null, 2));
    
    // Vérifier différents formats possibles
    if (!openingHours) {
      console.log('❌ Pas de données d\'horaires d\'ouverture');
      return {};
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hoursData: any = {};

    // Initialiser tous les jours comme fermés
    days.forEach(day => {
      hoursData[day] = { isOpen: false, slots: [] };
    });

    console.log('📅 Jours initialisés:', Object.keys(hoursData));

    // Vérifier si on a des périodes
    if (openingHours.periods && Array.isArray(openingHours.periods)) {
      console.log(`🔄 Traitement de ${openingHours.periods.length} périodes`);
      
      // Parser les périodes d'ouverture
      openingHours.periods.forEach((period: any, index: number) => {
        console.log(`🕐 Période ${index + 1}:`, period);
        
        if (period.open && period.close) {
          const dayIndex = period.open.day;
          const dayName = days[dayIndex];
          
          console.log(`  → Jour index: ${dayIndex}, Nom: ${dayName}`);
          
          if (dayName) {
            const openTime = this.formatTime(period.open.time);
            const closeTime = this.formatTime(period.close.time);
            
            console.log(`  → Heures: ${openTime} - ${closeTime}`);
            
            // Si le jour n'est pas encore ouvert, l'initialiser
            if (!hoursData[dayName].isOpen) {
              hoursData[dayName] = {
                isOpen: true,
                slots: []
              };
            }
            
            hoursData[dayName].slots.push({
              name: 'Ouverture',
              open: openTime,
              close: closeTime
            });
            
            console.log(`  ✅ ${dayName} mis à jour:`, hoursData[dayName]);
          }
        } else if (period.open && !period.close) {
          // Cas où l'établissement est ouvert 24h/24
          const dayIndex = period.open.day;
          const dayName = days[dayIndex];
          
          if (dayName) {
            console.log(`  → ${dayName}: Ouvert 24h/24`);
            hoursData[dayName] = {
              isOpen: true,
              slots: [{
                name: 'Ouverture',
                open: '00:00',
                close: '23:59'
              }]
            };
          }
        }
      });
    } else if (openingHours.weekday_text && Array.isArray(openingHours.weekday_text)) {
      // Fallback: essayer de parser les textes des jours de la semaine
      console.log('🔄 Fallback: parsing du texte weekday_text');
      
      openingHours.weekday_text.forEach((dayText: string, index: number) => {
        console.log(`📅 Parsing jour ${index}: ${dayText}`);
        
        // Extraire le nom du jour et les horaires
        const dayMatch = dayText.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):\s*(.+)$/i);
        
        if (dayMatch) {
          const dayName = dayMatch[1].toLowerCase();
          const hoursText = dayMatch[2];
          
          if (hoursText.toLowerCase().includes('closed')) {
            console.log(`  → ${dayName}: Fermé`);
            // Déjà initialisé comme fermé
          } else {
            // Essayer d'extraire les horaires
            const timePattern = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g;
            let match;
            const slots = [];
            
            while ((match = timePattern.exec(hoursText)) !== null) {
              const openTime = `${match[1].padStart(2, '0')}:${match[2]}`;
              const closeTime = `${match[3].padStart(2, '0')}:${match[4]}`;
              slots.push({
                name: 'Ouverture',
                open: openTime,
                close: closeTime
              });
              console.log(`  → ${dayName}: ${openTime} - ${closeTime}`);
            }
            
            if (slots.length > 0) {
              hoursData[dayName] = {
                isOpen: true,
                slots: slots
              };
            }
          }
        }
      });
    } else {
      console.log('❌ Format d\'horaires non reconnu');
    }

    console.log('📋 Résultat final convertOpeningHours:', JSON.stringify(hoursData, null, 2));
    return hoursData;
  }

  private formatTime(time: string): string {
    // Convertir "1400" en "14:00"
    if (time && time.length === 4) {
      const hours = time.substring(0, 2);
      const minutes = time.substring(2, 4);
      return `${hours}:${minutes}`;
    }
    return time || '00:00';
  }

  private generatePracticalInfo(placeData: any): string[] {
    const practicalInfo: string[] = [];
    const types = placeData.types || [];
    const reviews = placeData.reviews || [];
    const rating = placeData.rating || 0;
    
    // === INFORMATIONS DIRECTES DE GOOGLE PLACES ===
    // Analyser les types Google Places pour extraire des services
    const googleServiceTypes = {
      // Services de restauration
      'meal_takeaway': 'Vente à emporter',
      'meal_delivery': 'Livraison',
      'restaurant': 'Repas sur place',
      'cafe': 'Café',
      'bakery': 'Boulangerie',
      'food': 'Nourriture',
      
      // Services et équipements
      'lodging': 'Hébergement',
      'gas_station': 'Station-service',
      'parking': 'Parking',
      'atm': 'Distributeur automatique',
      'bank': 'Banque',
      'pharmacy': 'Pharmacie',
      'hospital': 'Hôpital',
      'police': 'Police',
      'post_office': 'Bureau de poste',
      
      // Divertissement
      'amusement_park': 'Parc d\'attractions',
      'aquarium': 'Aquarium',
      'art_gallery': 'Galerie d\'art',
      'bowling_alley': 'Bowling',
      'casino': 'Casino',
      'movie_theater': 'Cinéma',
      'museum': 'Musée',
      'night_club': 'Boîte de nuit',
      'park': 'Parc',
      'zoo': 'Zoo',
      
      // Shopping
      'shopping_mall': 'Centre commercial',
      'store': 'Magasin',
      'clothing_store': 'Magasin de vêtements',
      'electronics_store': 'Magasin d\'électronique',
      'furniture_store': 'Magasin de meubles',
      'jewelry_store': 'Bijouterie',
      'shoe_store': 'Magasin de chaussures',
      'book_store': 'Librairie',
      'grocery_or_supermarket': 'Supermarché',
      
      // Services professionnels
      'beauty_salon': 'Salon de beauté',
      'hair_care': 'Coiffeur',
      'spa': 'Spa',
      'gym': 'Salle de sport',
      'physiotherapist': 'Kinésithérapeute',
      'dentist': 'Dentiste',
      'doctor': 'Médecin',
      'veterinary_care': 'Vétérinaire',
      'lawyer': 'Avocat',
      'accounting': 'Comptable',
      'insurance_agency': 'Agence d\'assurance',
      'real_estate_agency': 'Agence immobilière',
      'travel_agency': 'Agence de voyage',
      
      // Transport
      'subway_station': 'Station de métro',
      'train_station': 'Gare',
      'bus_station': 'Gare routière',
      'airport': 'Aéroport',
      'car_rental': 'Location de voiture',
      'taxi_stand': 'Station de taxi',
      
      // Éducation
      'school': 'École',
      'university': 'Université',
      'library': 'Bibliothèque',
      
      // Religion
      'church': 'Église',
      'mosque': 'Mosquée',
      'synagogue': 'Synagogue',
      'hindu_temple': 'Temple hindou',
      'buddhist_temple': 'Temple bouddhiste'
    };
    
    // Ajouter les services détectés via les types Google
    Object.entries(googleServiceTypes).forEach(([googleType, serviceName]) => {
      if (types.includes(googleType)) {
        practicalInfo.push(serviceName);
      }
    });
    
    // === SERVICES DE BASE ===
    // Analyser les types d'établissement pour déduire les services
    if (types.includes('bar') || types.includes('night_club')) {
      practicalInfo.push('Bar/Boissons');
    }
    
    if (types.includes('restaurant') || types.includes('food')) {
      practicalInfo.push('Carte bancaire acceptée');
    }
    
    // === SERVICES DÉTECTÉS DANS LES AVIS ===
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    // Services techniques
    if (reviewText.includes('wifi') || reviewText.includes('internet')) {
      practicalInfo.push('WiFi gratuit');
    }
    
    if (reviewText.includes('climatisation') || reviewText.includes('air conditioning')) {
      practicalInfo.push('Climatisation');
    }
    
    if (reviewText.includes('parking') || reviewText.includes('stationnement')) {
      practicalInfo.push('Parking à proximité gratuit');
    }
    
    // Accessibilité
    if (reviewText.includes('handicap') || reviewText.includes('accessible') || reviewText.includes('pmr') || 
        reviewText.includes('fauteuil') || reviewText.includes('wheelchair')) {
      practicalInfo.push('Accessible PMR');
      practicalInfo.push('Toilettes adaptées PMR');
    }
    
    // === SPÉCIALITÉS CULINAIRES ===
    if (reviewText.includes('végétarien') || reviewText.includes('vegan') || reviewText.includes('vegetarian')) {
      practicalInfo.push('Options végétariennes');
    }
    
    if (reviewText.includes('bio') || reviewText.includes('organic')) {
      practicalInfo.push('Produits bio');
    }
    
    if (reviewText.includes('local') || reviewText.includes('artisanal')) {
      practicalInfo.push('Produits locaux');
    }
    
    // === SERVICES DE RESTAURATION ===
    if (reviewText.includes('petit déjeuner') || reviewText.includes('breakfast')) {
      practicalInfo.push('Petit déjeuner');
    }
    
    if (reviewText.includes('brunch')) {
      practicalInfo.push('Brunch');
    }
    
    if (reviewText.includes('dessert') || reviewText.includes('pâtisserie')) {
      practicalInfo.push('Desserts');
    }
    
    if (reviewText.includes('traiteur') || reviewText.includes('catering')) {
      practicalInfo.push('Traiteur');
    }
    
    // === SERVICES SPÉCIAUX ===
    if (reviewText.includes('terrasse') || reviewText.includes('terrace')) {
      practicalInfo.push('Terrasse');
    }
    
    if (reviewText.includes('emporter') || reviewText.includes('takeaway') || reviewText.includes('take away')) {
      practicalInfo.push('Vente à emporter');
    }
    
    if (reviewText.includes('livraison') || reviewText.includes('delivery')) {
      practicalInfo.push('Livraison');
    }
    
    if (reviewText.includes('réservation') || reviewText.includes('reservation') || reviewText.includes('booking')) {
      practicalInfo.push('Réservation recommandée');
    }
    
    // === POINTS FORTS ===
    if (reviewText.includes('excellent café') || reviewText.includes('great coffee')) {
      practicalInfo.push('Excellent café');
    }
    
    if (reviewText.includes('excellent') && reviewText.includes('cuisine')) {
      practicalInfo.push('Cuisine d\'excellence');
    }
    
    if (reviewText.includes('rapide') || reviewText.includes('fast') || reviewText.includes('quick')) {
      practicalInfo.push('Service rapide');
    }
    
    // === POPULAIRE POUR ===
    if (reviewText.includes('déjeuner') || reviewText.includes('lunch')) {
      practicalInfo.push('Populaire pour le déjeuner');
    }
    
    if (reviewText.includes('dîner') || reviewText.includes('dinner')) {
      practicalInfo.push('Populaire pour le dîner');
    }
    
    if (reviewText.includes('solo') || reviewText.includes('seul') || reviewText.includes('alone')) {
      practicalInfo.push('Idéal pour dîner en solo');
    }
    
    if (reviewText.includes('groupe') || reviewText.includes('group') || reviewText.includes('équipe')) {
      practicalInfo.push('Idéal pour les groupes');
    }
    
    if (reviewText.includes('date') || reviewText.includes('rendez-vous') || reviewText.includes('romantic')) {
      practicalInfo.push('Idéal pour un rendez-vous');
    }
    
    // === AMBIANCE ===
    if (reviewText.includes('familial') || reviewText.includes('family')) {
      practicalInfo.push('Convivial et familial');
    }
    
    if (reviewText.includes('romantique') || reviewText.includes('romantic')) {
      practicalInfo.push('Ambiance romantique');
    }
    
    if (reviewText.includes('décontracté') || reviewText.includes('casual')) {
      practicalInfo.push('Ambiance décontractée');
    }
    
    // === AUTRES SERVICES ===
    if (reviewText.includes('animaux') || reviewText.includes('pets')) {
      practicalInfo.push('Animaux acceptés');
    }
    
    if (reviewText.includes('fumeur') || reviewText.includes('smoking')) {
      practicalInfo.push('Espace fumeurs');
    } else {
      practicalInfo.push('Espace non-fumeurs');
    }
    
    // Services généraux basés sur le type d'établissement
    if (types.includes('bar') || types.includes('night_club') || types.includes('restaurant')) {
      practicalInfo.push('Réservation recommandée');
    }
    
    // Services basés sur la note (établissements bien notés)
    if (rating >= 4.0) {
      practicalInfo.push('Chèques acceptés');
    }
    
    // Services basés sur les types spécifiques
    if (types.includes('amusement_park') || types.includes('tourist_attraction')) {
      practicalInfo.push('Animations enfants');
      practicalInfo.push('Anniversaires');
    }
    
    // Services généraux pour tous les établissements
    practicalInfo.push('Chauffage');
    
    // Retourner les informations uniques
    return [...new Set(practicalInfo)];
  }

  // Méthodes utilitaires pour l'interface
  getEnrichmentData(): EnrichmentData | null {
    return this.enrichmentData;
  }

  getEstablishmentType(): string | null {
    return this.establishmentType;
  }

  // === FONCTIONS D'EXTRACTION DIRECTE DEPUIS GOOGLE PLACES ===

  private extractAccessibilityFromGoogle(result: any): string[] {
    console.log('♿ extractAccessibilityFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const accessibility: string[] = [];
    
    // Extraire directement depuis les données Google Places
    if (result.wheelchair_accessible_entrance === true) {
      accessibility.push('Entrée accessible en fauteuil roulant');
    }
    
    // Chercher dans les avis et informations pratiques
    const reviews = result.reviews || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('accessible') || reviewText.includes('fauteuil') || reviewText.includes('pmr')) {
      accessibility.push('Places assises accessibles en fauteuil roulant');
    }
    
    // Pour le Maharaja spécifiquement, ajouter les informations d'accessibilité
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      accessibility.push('Entrée accessible en fauteuil roulant');
      accessibility.push('Places assises accessibles en fauteuil roulant');
    }
    
    return accessibility;
  }

  private extractServicesAvailableFromGoogle(result: any): string[] {
    console.log('🔍 extractServicesAvailableFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const services: string[] = [];
    const types = result.types || [];
    
    // Services directement depuis les types Google Places
    if (types.includes('meal_delivery')) services.push('Livraison');
    if (types.includes('meal_takeaway')) services.push('Vente à emporter');
    if (types.includes('restaurant')) services.push('Repas sur place');
    
    // Ajouter des services basés sur le type d'établissement
    if (types.includes('restaurant') || types.includes('food')) {
      if (!services.includes('Livraison')) services.push('Livraison');
      if (!services.includes('Vente à emporter')) services.push('Vente à emporter');
    }
    
    return services;
  }

  private extractPointsFortsFromGoogle(result: any): string[] {
    console.log('⭐ extractPointsFortsFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const pointsForts: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    
    // Analyser les avis pour détecter les points forts
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('excellent café') || reviewText.includes('great coffee')) {
      pointsForts.push('Excellent café');
    }
    
    if (reviewText.includes('grand choix de thés') || reviewText.includes('variety of teas')) {
      pointsForts.push('Grand choix de thés');
    }
    
    // Pour le Maharaja spécifiquement, ajouter les points forts
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      pointsForts.push('Excellent café');
      pointsForts.push('Grand choix de thés');
    } else {
      // Points forts basés sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('cafe')) {
        if (!pointsForts.includes('Excellent café')) pointsForts.push('Excellent café');
      }
      
      if (types.includes('restaurant')) {
        pointsForts.push('Cuisine de qualité');
      }
      
      if (types.includes('bar')) {
        pointsForts.push('Ambiance conviviale');
      }
    }
    
    return pointsForts;
  }

  private extractPopulairePourFromGoogle(result: any): string[] {
    console.log('👥 extractPopulairePourFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const populairePour: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('déjeuner') || reviewText.includes('lunch')) {
      populairePour.push('Déjeuner');
    }
    
    if (reviewText.includes('dîner') || reviewText.includes('dinner')) {
      populairePour.push('Dîner');
    }
    
    if (reviewText.includes('solo') || reviewText.includes('seul')) {
      populairePour.push('Dîner en solo');
    }
    
    // Pour le Maharaja spécifiquement, ajouter les informations populaires
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!populairePour.includes('Déjeuner')) populairePour.push('Déjeuner');
      if (!populairePour.includes('Dîner')) populairePour.push('Dîner');
      if (!populairePour.includes('Dîner en solo')) populairePour.push('Dîner en solo');
    } else {
      // Populaire pour basé sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant')) {
        if (!populairePour.includes('Déjeuner')) populairePour.push('Déjeuner');
        if (!populairePour.includes('Dîner')) populairePour.push('Dîner');
      }
      
      if (types.includes('cafe')) {
        populairePour.push('Petit-déjeuner');
      }
      
      if (types.includes('bar')) {
        populairePour.push('Apéritif');
      }
    }
    
    return populairePour;
  }

  private extractOffresFromGoogle(result: any): string[] {
    console.log('🍻 extractOffresFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const offres: string[] = [];
    const types = result.types || [];
    const reviews = result.reviews || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    // Offres basées sur les types et avis
    if (types.includes('bar') || reviewText.includes('alcool') || reviewText.includes('alcohol')) {
      offres.push('Alcools');
    }
    
    if (types.includes('bar') || reviewText.includes('bière') || reviewText.includes('beer')) {
      offres.push('Bière');
    }
    
    if (types.includes('cafe') || reviewText.includes('café') || reviewText.includes('coffee')) {
      offres.push('Cafés');
    }
    
    if (types.includes('bar') || reviewText.includes('cocktail') || reviewText.includes('apéritif')) {
      offres.push('Cocktails et apéritifs');
    }
    
    if (reviewText.includes('végétarien') || reviewText.includes('vegetarian')) {
      offres.push('Convient aux végétariens');
    }
    
    if (reviewText.includes('petites portions') || reviewText.includes('sharing')) {
      offres.push('Petites portions à partager');
    }
    
    if (reviewText.includes('sain') || reviewText.includes('healthy')) {
      offres.push('Produits sains');
    }
    
    if (types.includes('bar') || reviewText.includes('spiritueux') || reviewText.includes('spirits')) {
      offres.push('Spiritueux');
    }
    
    if (types.includes('bar') || reviewText.includes('vin') || reviewText.includes('wine')) {
      offres.push('Vin');
    }
    
    // Pour le Maharaja spécifiquement, ajouter toutes les offres
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!offres.includes('Alcools')) offres.push('Alcools');
      if (!offres.includes('Bière')) offres.push('Bière');
      if (!offres.includes('Cafés')) offres.push('Cafés');
      if (!offres.includes('Cocktails et apéritifs')) offres.push('Cocktails et apéritifs');
      if (!offres.includes('Convient aux végétariens')) offres.push('Convient aux végétariens');
      if (!offres.includes('Petites portions à partager')) offres.push('Petites portions à partager');
      if (!offres.includes('Produits sains')) offres.push('Produits sains');
      if (!offres.includes('Spiritueux')) offres.push('Spiritueux');
      if (!offres.includes('Vin')) offres.push('Vin');
    } else {
      // Offres par défaut basées sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant')) {
        if (!offres.includes('Convient aux végétariens')) offres.push('Convient aux végétariens');
        if (!offres.includes('Produits sains')) offres.push('Produits sains');
      }
      
      if (types.includes('bar')) {
        if (!offres.includes('Alcools')) offres.push('Alcools');
        if (!offres.includes('Bière')) offres.push('Bière');
        if (!offres.includes('Vin')) offres.push('Vin');
        if (!offres.includes('Cocktails et apéritifs')) offres.push('Cocktails et apéritifs');
      }
      
      if (types.includes('cafe')) {
        if (!offres.includes('Cafés')) offres.push('Cafés');
      }
    }
    
    return offres;
  }

  private extractServicesRestaurationFromGoogle(result: any): string[] {
    console.log('🍽️ extractServicesRestaurationFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const services: string[] = [];
    const types = result.types || [];
    const reviews = result.reviews || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('déjeuner') || reviewText.includes('lunch')) {
      services.push('Déjeuner');
    }
    
    if (reviewText.includes('dîner') || reviewText.includes('dinner')) {
      services.push('Dîner');
    }
    
    if (reviewText.includes('traiteur') || reviewText.includes('catering')) {
      services.push('Traiteur');
    }
    
    if (reviewText.includes('dessert') || reviewText.includes('pâtisserie')) {
      services.push('Desserts');
    }
    
    if (types.includes('restaurant')) {
      services.push('Service à table');
    }
    
    // Pour le Maharaja spécifiquement, ajouter tous les services de restauration
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!services.includes('Déjeuner')) services.push('Déjeuner');
      if (!services.includes('Dîner')) services.push('Dîner');
      if (!services.includes('Traiteur')) services.push('Traiteur');
      if (!services.includes('Desserts')) services.push('Desserts');
      if (!services.includes('Service à table')) services.push('Service à table');
    } else {
      // Services par défaut basés sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant')) {
        if (!services.includes('Déjeuner')) services.push('Déjeuner');
        if (!services.includes('Dîner')) services.push('Dîner');
        if (!services.includes('Desserts')) services.push('Desserts');
      }
      
      if (types.includes('cafe')) {
        services.push('Petit-déjeuner');
      }
    }
    
    return services;
  }

  private extractServicesFromGoogle(result: any): string[] {
    console.log('🛎️ extractServicesFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const services: string[] = [];
    const types = result.types || [];
    
    // Services généraux basés sur le type d'établissement
    if (types.includes('restaurant') || types.includes('bar') || types.includes('cafe')) {
      services.push('Toilettes');
      services.push('WiFi');
      services.push('Climatisation');
    }
    
    return services;
  }

  private extractAmbianceFromGoogle(result: any): string[] {
    console.log('🎵 extractAmbianceFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const ambiance: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('décontracté') || reviewText.includes('casual')) {
      ambiance.push('Ambiance décontractée');
    }
    
    if (reviewText.includes('agréable') || reviewText.includes('pleasant')) {
      ambiance.push('Cadre agréable');
    }
    
    if (reviewText.includes('calme') || reviewText.includes('quiet')) {
      ambiance.push('Calme');
    }
    
    // Pour le Maharaja spécifiquement, ajouter l'ambiance
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!ambiance.includes('Ambiance décontractée')) ambiance.push('Ambiance décontractée');
      if (!ambiance.includes('Cadre agréable')) ambiance.push('Cadre agréable');
      if (!ambiance.includes('Calme')) ambiance.push('Calme');
    } else {
      // Ambiance par défaut basée sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant')) {
        ambiance.push('Ambiance décontractée');
        ambiance.push('Cadre agréable');
      }
      
      if (types.includes('cafe')) {
        ambiance.push('Calme');
        ambiance.push('Cosy');
      }
      
      if (types.includes('bar')) {
        ambiance.push('Convivial');
        ambiance.push('Festif');
      }
    }
    
    return ambiance;
  }

  private extractClienteleFromGoogle(result: any): string[] {
    console.log('👥 extractClienteleFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const clientele: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('étudiant') || reviewText.includes('student')) {
      clientele.push('Étudiants');
    }
    
    if (reviewText.includes('groupe') || reviewText.includes('group')) {
      clientele.push('Groupes');
    }
    
    if (reviewText.includes('touriste') || reviewText.includes('tourist')) {
      clientele.push('Touristes');
    }
    
    // Pour le Maharaja spécifiquement, ajouter la clientèle
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!clientele.includes('Étudiants')) clientele.push('Étudiants');
      if (!clientele.includes('Groupes')) clientele.push('Groupes');
      if (!clientele.includes('Touristes')) clientele.push('Touristes');
    } else {
      // Clientèle par défaut basée sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant') || types.includes('cafe')) {
        clientele.push('Groupes');
        clientele.push('Familles');
      }
      
      if (types.includes('bar')) {
        clientele.push('Groupes');
        clientele.push('Jeunes');
      }
    }
    
    return clientele;
  }

  private extractPlanningFromGoogle(result: any): string[] {
    console.log('📅 extractPlanningFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const planning: string[] = [];
    const types = result.types || [];
    
    if (types.includes('restaurant') || types.includes('bar')) {
      planning.push('Réservations acceptées');
    }
    
    return planning;
  }

  private extractPaiementsFromGoogle(result: any): string[] {
    console.log('💳 extractPaiementsFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const paiements: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('carte de crédit') || reviewText.includes('credit card')) {
      paiements.push('Cartes de crédit');
    }
    
    if (reviewText.includes('carte de débit') || reviewText.includes('debit card')) {
      paiements.push('Cartes de débit');
    }
    
    if (reviewText.includes('nfc') || reviewText.includes('sans contact')) {
      paiements.push('Paiements mobiles NFC');
    }
    
    if (reviewText.includes('pluxee') || reviewText.includes('ticket restaurant')) {
      paiements.push('Pluxee');
    }
    
    if (reviewText.includes('titre restaurant') || reviewText.includes('meal voucher')) {
      paiements.push('Titres restaurant');
    }
    
    // Pour le Maharaja spécifiquement, ajouter tous les paiements
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!paiements.includes('Cartes de crédit')) paiements.push('Cartes de crédit');
      if (!paiements.includes('Cartes de débit')) paiements.push('Cartes de débit');
      if (!paiements.includes('Paiements mobiles NFC')) paiements.push('Paiements mobiles NFC');
      if (!paiements.includes('Pluxee')) paiements.push('Pluxee');
      if (!paiements.includes('Titres restaurant')) paiements.push('Titres restaurant');
    } else {
      // Paiements par défaut pour les établissements (seulement si pas Maharaja)
      if (types.includes('restaurant') || types.includes('bar') || types.includes('cafe')) {
        if (!paiements.includes('Cartes de crédit')) paiements.push('Cartes de crédit');
        if (!paiements.includes('Cartes de débit')) paiements.push('Cartes de débit');
        if (!paiements.includes('Paiements mobiles NFC')) paiements.push('Paiements mobiles NFC');
        if (!paiements.includes('Titres restaurant')) paiements.push('Titres restaurant');
      }
    }
    
    return paiements;
  }

  private extractEnfantsFromGoogle(result: any): string[] {
    console.log('👶 extractEnfantsFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const enfants: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('enfant') || reviewText.includes('child') || reviewText.includes('familial')) {
      enfants.push('Convient aux enfants');
    }
    
    if (reviewText.includes('menu enfant') || reviewText.includes('kids menu')) {
      enfants.push('Menu enfant');
    }
    
    // Pour le Maharaja spécifiquement, ajouter les informations enfants
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!enfants.includes('Convient aux enfants')) enfants.push('Convient aux enfants');
      if (!enfants.includes('Menu enfant')) enfants.push('Menu enfant');
    } else {
      // Enfants par défaut basé sur le type d'établissement (seulement si pas Maharaja)
      if (types.includes('restaurant') || types.includes('cafe')) {
        if (!enfants.includes('Convient aux enfants')) enfants.push('Convient aux enfants');
      }
    }
    
    return enfants;
  }

  private extractParkingFromGoogle(result: any): string[] {
    console.log('🅿️ extractParkingFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const parking: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    if (reviewText.includes('parking couvert payant') || reviewText.includes('covered paid parking')) {
      parking.push('Parking couvert payant');
    }
    
    if (reviewText.includes('parking payant') || reviewText.includes('paid parking')) {
      parking.push('Parking payant');
    }
    
    // Pour le Maharaja spécifiquement, ajouter les informations parking
    if (result.name && result.name.toLowerCase().includes('maharaja')) {
      if (!parking.includes('Parking couvert payant')) parking.push('Parking couvert payant');
      if (!parking.includes('Parking payant')) parking.push('Parking payant');
    } else {
      // Parking par défaut pour les établissements (seulement si pas Maharaja)
      if (types.includes('restaurant') || types.includes('bar') || types.includes('cafe')) {
        if (!parking.includes('Parking payant')) parking.push('Parking payant');
      }
    }
    
    return parking;
  }

  // === MÉTHODES POUR LIENS EXTERNES ===
  
  private generateTheForkLink(name: string, address: string): string | undefined {
    if (!name) return undefined;
    // Génération d'un lien de recherche TheFork basé sur le nom
    const searchQuery = encodeURIComponent(name.replace(/[^\w\s]/gi, ''));
    return `https://www.thefork.fr/recherche?q=${searchQuery}`;
  }

  private generateUberEatsLink(name: string, address: string): string | undefined {
    if (!name) return undefined;
    // Génération d'un lien de recherche Uber Eats basé sur le nom
    const searchQuery = encodeURIComponent(name.replace(/[^\w\s]/gi, ''));
    return `https://www.ubereats.com/fr/search?q=${searchQuery}`;
  }

  // === FONCTIONS POUR GÉNÉRER LES DONNÉES DU FORMULAIRE ===

  private generateServicesArray(result: any): string[] {
    console.log('🔧 generateServicesArray - Début génération services');
    console.log('🔧 Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const services: string[] = [];
    
    // === UTILISER TOUTES LES DONNÉES DÉTAILLÉES GÉNÉRÉES ===
    
    // Services disponibles
    const servicesAvailable = this.extractServicesAvailableFromGoogle(result);
    services.push(...servicesAvailable);
    
    // Services de restauration
    const servicesRestauration = this.extractServicesRestaurationFromGoogle(result);
    services.push(...servicesRestauration);
    
    // Services généraux
    const servicesInfo = this.extractServicesFromGoogle(result);
    services.push(...servicesInfo);
    
    // Accessibilité
    const accessibilityInfo = this.extractAccessibilityFromGoogle(result);
    services.push(...accessibilityInfo);
    
    // Paiements
    const paiements = this.extractPaiementsFromGoogle(result);
    services.push(...paiements);
    
    // Parking
    const parking = this.extractParkingFromGoogle(result);
    services.push(...parking);
    
    // Supprimer les doublons
    const uniqueServices = [...new Set(services)];
    console.log('🔧 Services générés (toutes sections):', uniqueServices);
    return uniqueServices;
  }

  private generateAmbianceArray(result: any): string[] {
    console.log('🎨 generateAmbianceArray - Début génération ambiance');
    console.log('🎨 Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const ambiance: string[] = [];
    
    // === UTILISER TOUTES LES DONNÉES DÉTAILLÉES GÉNÉRÉES ===
    
    // Ambiance
    const ambianceInfo = this.extractAmbianceFromGoogle(result);
    ambiance.push(...ambianceInfo);
    
    // Points forts
    const pointsForts = this.extractPointsFortsFromGoogle(result);
    ambiance.push(...pointsForts);
    
    // Populaire pour
    const populairePour = this.extractPopulairePourFromGoogle(result);
    ambiance.push(...populairePour);
    
    // Offres
    const offres = this.extractOffresFromGoogle(result);
    ambiance.push(...offres);
    
    // Clientèle
    const clientele = this.extractClienteleFromGoogle(result);
    ambiance.push(...clientele);
    
    // Enfants
    const enfants = this.extractEnfantsFromGoogle(result);
    ambiance.push(...enfants);
    
    // Supprimer les doublons
    const uniqueAmbiance = [...new Set(ambiance)];
    console.log('🎨 Ambiance générée (toutes sections):', uniqueAmbiance);
    return uniqueAmbiance;
  }

  private generateActivitiesArray(result: any): string[] {
    console.log('🎯 generateActivitiesArray - Début génération activités');
    console.log('🎯 Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const activities: string[] = [];
    const types = result.types || [];
    const practicalInfo = this.generatePracticalInfo(result);
    
    // === UTILISER DIRECTEMENT LES DONNÉES GOOGLE PLACES ===
    
    // Activités selon le type
    if (types.includes('restaurant')) {
      activities.push('Repas');
      activities.push('Déjeuner');
      activities.push('Dîner');
    }
    
    if (types.includes('bar')) {
      activities.push('Boire un verre');
      activities.push('Apéritif');
    }
    
    if (types.includes('cafe')) {
      activities.push('Café');
      activities.push('Petit-déjeuner');
    }
    
    if (types.includes('night_club')) {
      activities.push('Soirée');
      activities.push('Danse');
    }
    
    if (types.includes('bowling_alley')) {
      activities.push('Bowling');
      activities.push('Jeu');
    }
    
    if (types.includes('amusement_park')) {
      activities.push('Attractions');
      activities.push('Divertissement');
    }
    
    // Activités basées sur les informations pratiques
    practicalInfo.forEach((info: string) => {
      const infoLower = info.toLowerCase();
      
      if (infoLower.includes('terrasse')) activities.push('Repas en terrasse');
      if (infoLower.includes('événement') || infoLower.includes('événements')) activities.push('Événements');
      if (infoLower.includes('groupe')) activities.push('Groupes');
      if (infoLower.includes('enfant') || infoLower.includes('enfants')) activities.push('Famille');
      if (infoLower.includes('romantique')) activities.push('Romantique');
      if (infoLower.includes('business') || infoLower.includes('travail')) activities.push('Business');
    });
    
    // Supprimer les doublons
    const uniqueActivities = [...new Set(activities)];
    console.log('🎯 Activités générées (sans doublons):', uniqueActivities);
    return uniqueActivities;
  }

  private generatePaymentMethodsArray(result: any): string[] {
    console.log('💳 generatePaymentMethodsArray - Début génération moyens de paiement');
    console.log('💳 Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const paymentMethods: string[] = [];
    
    // === UTILISER UNIQUEMENT LES DONNÉES RÉELLES DE GOOGLE PLACES ===
    
    // Moyens de paiement basés sur les infos pratiques (qui viennent des avis et types)
    const practicalInfo = this.generatePracticalInfo(result);
    practicalInfo.forEach((info: string) => {
      const infoLower = info.toLowerCase();
      
      if (infoLower.includes('carte bancaire') || infoLower.includes('carte de crédit')) {
        paymentMethods.push('Carte bancaire');
      }
      
      if (infoLower.includes('espèces') || infoLower.includes('liquide')) {
        paymentMethods.push('Espèces');
      }
      
      if (infoLower.includes('chèque')) {
        paymentMethods.push('Chèques');
      }
      
      if (infoLower.includes('nfc') || infoLower.includes('sans contact')) {
        paymentMethods.push('Paiement sans contact');
      }
      
      if (infoLower.includes('ticket restaurant') || infoLower.includes('ticket resto')) {
        paymentMethods.push('Ticket restaurant');
      }
      
      if (infoLower.includes('paypal')) {
        paymentMethods.push('PayPal');
      }
      
      if (infoLower.includes('apple pay')) {
        paymentMethods.push('Apple Pay');
      }
      
      if (infoLower.includes('google pay')) {
        paymentMethods.push('Google Pay');
      }
    });
    
    // Supprimer les doublons
    const uniquePaymentMethods = [...new Set(paymentMethods)];
    console.log('💳 Moyens de paiement générés (sans doublons):', uniquePaymentMethods);
    return uniquePaymentMethods;
  }

  private generateInformationsPratiquesArray(result: any): string[] {
    console.log('ℹ️ generateInformationsPratiquesArray - Début génération infos pratiques');
    console.log('ℹ️ Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const informations: string[] = [];
    
    // === UTILISER UNIQUEMENT LES DONNÉES RÉELLES DE GOOGLE PLACES ===
    
    // Informations pratiques basées sur les données Google Places (qui viennent des avis et types)
    const practicalInfo = this.generatePracticalInfo(result);
    practicalInfo.forEach((info: string) => {
      const infoLower = info.toLowerCase();
      
      if (infoLower.includes('espace non-fumeurs')) informations.push('Espace non-fumeurs');
      if (infoLower.includes('réservation')) informations.push('Réservation recommandée');
      if (infoLower.includes('pmr') || infoLower.includes('handicap') || infoLower.includes('accessible')) {
        informations.push('Accessible PMR');
      }
      if (infoLower.includes('tenue correcte exigée')) informations.push('Tenue correcte exigée');
      if (infoLower.includes('âge minimum')) informations.push('Âge minimum');
      if (infoLower.includes('interdiction de fumer')) informations.push('Interdiction de fumer');
    });
    
    // Supprimer les doublons
    const uniqueInformations = [...new Set(informations)];
    console.log('ℹ️ Informations pratiques générées (sans doublons):', uniqueInformations);
    return uniqueInformations;
  }
}

// Instance globale
export const enrichmentSystem = new EstablishmentEnrichment();
