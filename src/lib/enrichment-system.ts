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
  accessibility: string[];
  
  // Données Google
  googlePlaceId: string;
  googleBusinessUrl?: string;
  googleRating: number;
  googleReviewCount: number;
  
  // Intégration TheFork
  theForkLink?: string;
  
  // Lien Uber Eats
  uberEatsLink?: string;

  // === NOUVELLES SECTIONS DÉTAILLÉES ===
  
  // Accessibilité
  accessibilityInfo: {
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  
  // Services disponibles
  servicesAvailable: {
    delivery?: boolean;
    takeout?: boolean;
    dineIn?: boolean;
    curbsidePickup?: boolean;
    reservations?: boolean;
  };
  
  // Services de restauration
  diningServices: {
    breakfast?: boolean;
    brunch?: boolean;
    lunch?: boolean;
    dinner?: boolean;
    dessert?: boolean;
    lateNightFood?: boolean;
  };
  
  // Offres alimentaires et boissons
  offerings: {
    beer?: boolean;
    wine?: boolean;
    cocktails?: boolean;
    coffee?: boolean;
    vegetarianFood?: boolean;
    happyHourFood?: boolean;
  };
  
  // Moyens de paiement
  paymentMethods: {
    creditCards?: boolean;
    debitCards?: boolean;
    nfc?: boolean;
    cashOnly?: boolean;
  };
  
  // Ambiance et caractéristiques
  atmosphereFeatures: {
    goodForChildren?: boolean;
    goodForGroups?: boolean;
    goodForWatchingSports?: boolean;
    liveMusic?: boolean;
    outdoorSeating?: boolean;
  };
  
  // Services généraux
  generalServices: {
    wifi?: boolean;
    restroom?: boolean;
    parking?: boolean;
    valetParking?: boolean;
    paidParking?: boolean;
    freeParking?: boolean;
  };
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
      accessibility: this.checkAccessibility(result),
      
      // Données Google
      googlePlaceId: result.place_id,
      googleBusinessUrl: googleUrl,
      googleRating: result.rating || 0,
      googleReviewCount: result.user_ratings_total || 0,
      
      // Suggestions de TheFork link
      theForkLink: this.suggestTheForkIntegration(result),

      // === NOUVELLES SECTIONS DÉTAILLÉES (GÉNÉRÉES INTELLIGEMMENT) ===
      
      // Accessibilité (basée sur les types et infos pratiques)
      accessibilityInfo: this.generateAccessibilityInfo(result),
      
      // Services disponibles (basés sur le type d'établissement et infos pratiques)
      servicesAvailable: this.generateServicesAvailable(result),
      
      // Services de restauration (basés sur le type et les horaires)
      diningServices: this.generateDiningServices(result),
      
      // Offres alimentaires et boissons (basées sur le type d'établissement)
      offerings: this.generateOfferings(result),
      
      // Moyens de paiement (basés sur les infos pratiques)
      paymentMethods: this.generatePaymentMethods(result),
      
      // Ambiance et caractéristiques (basées sur les types et avis)
      atmosphereFeatures: this.generateAtmosphereFeatures(result),
      
      // Services généraux (basés sur les infos pratiques)
      generalServices: this.generateGeneralServices(result),
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

  // === NOUVELLES FONCTIONS DE GÉNÉRATION INTELLIGENTE ===

  private generateAccessibilityInfo(result: any) {
    // Utiliser les données directes s'il y en a, sinon faire des suppositions basées sur le type
    return {
      wheelchairAccessibleEntrance: result.wheelchair_accessible_entrance || true, // Par défaut accessible
      wheelchairAccessibleParking: result.wheelchair_accessible_parking || undefined,
      wheelchairAccessibleRestroom: result.wheelchair_accessible_restroom || undefined,
      wheelchairAccessibleSeating: result.wheelchair_accessible_seating || true, // Par défaut accessible
    };
  }

  private generateServicesAvailable(result: any) {
    const types = result.types || [];
    const practicalInfo = this.generatePracticalInfo(result);
    
    return {
      delivery: result.delivery || types.includes('meal_delivery') || practicalInfo.includes('Livraison'),
      takeout: result.takeout || types.includes('meal_takeaway') || practicalInfo.includes('Vente à emporter'),
      dineIn: result.dine_in || types.includes('restaurant') || practicalInfo.includes('Repas sur place'),
      curbsidePickup: result.curbside_pickup || false,
      reservations: result.accepts_reservations || result.reservations || practicalInfo.includes('Réservation recommandée'),
    };
  }

  private generateDiningServices(result: any) {
    const types = result.types || [];
    const openingHours = result.opening_hours?.weekday_text || [];
    
    // Analyser les horaires pour déterminer les services
    const hasEarlyHours = openingHours.some((h: string) => h.includes('7:') || h.includes('8:') || h.includes('9:'));
    const hasLateHours = openingHours.some((h: string) => h.includes('22:') || h.includes('23:') || h.includes('0:'));
    const isRestaurant = types.includes('restaurant');
    
    return {
      breakfast: result.serves_breakfast || hasEarlyHours,
      brunch: result.serves_brunch || (hasEarlyHours && isRestaurant),
      lunch: result.serves_lunch || isRestaurant || true,
      dinner: result.serves_dinner || isRestaurant || true,
      dessert: result.serves_dessert || isRestaurant || true,
      lateNightFood: result.serves_late_night_food || hasLateHours,
    };
  }

  private generateOfferings(result: any) {
    const types = result.types || [];
    const isBar = types.includes('bar') || types.includes('night_club');
    const isRestaurant = types.includes('restaurant');
    
    return {
      beer: result.serves_beer || isBar || isRestaurant,
      wine: result.serves_wine || isBar || isRestaurant,
      cocktails: result.serves_cocktails || isBar,
      coffee: result.serves_coffee || types.includes('cafe') || isRestaurant,
      vegetarianFood: result.serves_vegetarian_food || isRestaurant,
      happyHourFood: result.serves_happy_hour_food || isBar,
    };
  }

  private generatePaymentMethods(result: any) {
    const practicalInfo = this.generatePracticalInfo(result);
    
    return {
      creditCards: result.accepts_credit_cards || practicalInfo.includes('Carte bancaire acceptée') || true,
      debitCards: result.accepts_debit_cards || true,
      nfc: result.accepts_nfc || true, // La plupart acceptent maintenant
      cashOnly: result.accepts_cash_only || false,
    };
  }

  private generateAtmosphereFeatures(result: any) {
    const types = result.types || [];
    const practicalInfo = this.generatePracticalInfo(result);
    
    return {
      goodForChildren: result.good_for_children || types.includes('restaurant') || true,
      goodForGroups: result.good_for_groups || types.includes('restaurant') || true,
      goodForWatchingSports: result.good_for_watching_sports || types.includes('bar'),
      liveMusic: result.live_music || types.includes('night_club'),
      outdoorSeating: result.outdoor_seating || practicalInfo.includes('Terrasse') || undefined,
    };
  }

  private generateGeneralServices(result: any) {
    const practicalInfo = this.generatePracticalInfo(result);
    
    return {
      wifi: result.wifi ?? true, // La plupart ont le Wi-Fi maintenant
      restroom: result.restroom ?? true, // Supposer que les restaurants ont des toilettes
      parking: result.parking ?? undefined,
      valetParking: result.valet_parking ?? false,
      paidParking: result.paid_parking_lot ?? practicalInfo.includes('Parking payant'),
      freeParking: result.free_parking_lot ?? false,
    };
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
}

// Instance globale
export const enrichmentSystem = new EstablishmentEnrichment();
