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
  latitude?: number;
  longitude?: number;
  description?: string;
  openingHours?: string[];
  hours?: Record<string, any>; // Format HoursData pour le formulaire
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

  // === DONNÉES HYBRIDES (API + MANUEL) ===
  
  // Accessibilité détaillée (complémentaire)
  accessibilityDetails?: any; // JSON des détails d'accessibilité
  
  // Services détaillés (complémentaire)
  detailedServices?: any; // JSON des services détaillés
  
  // Informations clientèle (complémentaire)
  clienteleInfo?: any; // JSON des informations clientèle
  
  // Moyens de paiement détaillés (complémentaire)
  detailedPayments?: any; // JSON des moyens de paiement détaillés
  
  // Services enfants (complémentaire)
  childrenServices?: any; // JSON des services enfants
  
  // Informations parking (complémentaire)
  parkingInfo?: any; // JSON des informations parking

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
        const errorText = await resolveResponse.text();
        console.error("Erreur résolution URL:", errorText);
        throw new Error(`Erreur de résolution d'URL: ${errorText}`);
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

  private async fetchGooglePlaceData(placeId: string, placeName?: string): Promise<Record<string, any>> {
    console.log('📞 Appel fetchGooglePlaceData avec:', placeId, placeName);
    
    const fields = [
      // Infos de base (toujours disponibles)
      'name', 'types', 'price_level', 'rating', 'user_ratings_total', 'business_status',
      'opening_hours', 'website', 'formatted_phone_number', 'formatted_address', 'geometry',
      
      // Détails étendus (disponibles selon l'établissement)
      'wheelchair_accessible_entrance', 'takeout', 'delivery', 'dine_in', 'reservations',
      'serves_breakfast', 'serves_lunch', 'serves_dinner', 'serves_beer', 'serves_wine',
      'serves_coffee', 'serves_vegetarian_food', 'good_for_children', 'good_for_groups',
      'outdoor_seating', 'restroom', 'editorial_summary', 'reviews', 'photos',
      
      // Champs supplémentaires pour plus d'informations
      'current_opening_hours', 'utc_offset', 'place_id', 'vicinity', 'address_components',
      'adr_address', 'formatted_address', 'international_phone_number', 'plus_code'
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

  private async processPlaceData(placeData: Record<string, any>, googleUrl: string): Promise<EnrichmentData> {
    console.log('🔄 processPlaceData - Données Google Places reçues:', JSON.stringify(placeData, null, 2));
    
    // Vérifier que placeData est valide
    if (!placeData || !placeData.place_id) {
      console.error('❌ Données Google Places invalides:', placeData);
      throw new Error('Données Google Places invalides');
    }

    const result = placeData;
    
    // Déterminer le type d'établissement
    this.establishmentType = await this.categorizeEstablishment(result.types, result);
    console.log('🏢 Type d\'établissement déterminé:', this.establishmentType);
    
    // Sauvegarder le pattern d'apprentissage via API
    try {
      const keywords = this.extractKeywords(`${result.name} ${result.editorial_summary?.overview || ''}`);
      await fetch('/api/establishments/save-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          detectedType: this.establishmentType,
          googleTypes: result.types || [],
          keywords,
          confidence: 0.8
        })
      });
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde pattern d\'apprentissage:', error);
    }

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
      
      // Coordonnées GPS (depuis Google Places geometry)
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
      
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

  private async categorizeEstablishment(googleTypes: string[], placeData?: any): Promise<string> {
    // Vérifier que googleTypes est défini et est un tableau
    if (!googleTypes || !Array.isArray(googleTypes)) {
      console.warn('⚠️ Types Google invalides ou manquants:', googleTypes);
      return 'other';
    }

    const name = placeData?.name || '';
    const description = placeData?.editorial_summary?.overview || '';
    
    // 1. D'abord, essayer l'apprentissage intelligent via API
    try {
      const response = await fetch('/api/establishments/suggest-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, googleTypes, description })
      });
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.suggestions || [];
        
        if (suggestions.length > 0 && suggestions[0].confidence > 0.6) {
          console.log('🧠 Type suggéré par apprentissage:', suggestions[0].type, `(${Math.round(suggestions[0].confidence * 100)}%)`);
          return suggestions[0].type;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur apprentissage, utilisation de la détection classique:', error);
    }

    // 2. Détection classique basée sur les mots-clés
    if (placeData) {
      const fullText = `${name} ${description}`.toLowerCase();
      
      // Détection des parcs de loisir indoor
      const parcLoisirKeywords = [
        'parc', 'loisir', 'indoor', 'intérieur', 'jeux', 'games', 'factory',
        'ludique', 'famille', 'enfants', 'centre', 'espace', 'salle'
      ];
      
      if (parcLoisirKeywords.some(keyword => fullText.includes(keyword))) {
        console.log('🎪 Parc de loisir indoor détecté:', name);
        return 'parc_loisir_indoor';
      }
      
      // Détection des escape games
      const escapeGameKeywords = [
        'escape', 'escape game', 'escape room', 'room escape', 'jeu d\'évasion',
        'énigme', 'mystère', 'puzzle', 'défi', 'challenge', 'aventure',
        'donjon', 'dungeon', 'mission', 'quête', 'investigation'
      ];
      
      if (escapeGameKeywords.some(keyword => fullText.includes(keyword))) {
        console.log('🎯 Escape game détecté par analyse textuelle:', name);
        return 'escape_game';
      }
      
      // Détection des centres VR
      const vrKeywords = [
        'vr', 'virtual reality', 'réalité virtuelle', 'casque vr', 'immersion',
        'simulation', 'virtuel', 'interactif', 'expérience'
      ];
      
      if (vrKeywords.some(keyword => fullText.includes(keyword))) {
        console.log('🎮 Centre VR détecté par analyse textuelle:', name);
        return 'vr_experience';
      }
      
      // Détection des karaokés
      const karaokeKeywords = [
        'karaoké', 'karaoke', 'chanson', 'micro', 'cabine', 'singing'
      ];
      
      if (karaokeKeywords.some(keyword => fullText.includes(keyword))) {
        console.log('🎤 Karaoké détecté par analyse textuelle:', name);
        return 'karaoke';
      }
    }

    const typeMapping = {
      restaurant: ['restaurant', 'meal_takeaway', 'meal_delivery', 'food'],
      bar: ['bar', 'night_club', 'liquor_store'],
      escape_game: ['amusement_park', 'tourist_attraction'],
      vr_experience: ['amusement_park', 'tourist_attraction'],
      karaoke: ['amusement_park', 'tourist_attraction'],
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
      vr_experience: [
        'Envie d\'immersion',
        'Envie de technologie',
        'Envie d\'expérience',
        'Envie de découverte'
      ],
      karaoke: [
        'Envie de chanter',
        'Envie de s\'amuser',
        'Envie de soirée',
        'Envie de convivialité'
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
      // Note: "Chèques" est déjà géré dans les moyens de paiement, pas besoin de le dupliquer ici
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
    
    // Debug: Vérifier les propriétés disponibles
    console.log('♿ Propriétés disponibles dans result:', Object.keys(result));
    console.log('♿ wheelchair_accessible_entrance:', result.wheelchair_accessible_entrance);
    console.log('♿ reviews:', result.reviews?.length || 0, 'avis');
    
    // Extraire directement depuis les données Google Places
    if (result.wheelchair_accessible_entrance === true) {
      accessibility.push('Entrée accessible en fauteuil roulant');
      console.log('♿ Ajouté: Entrée accessible en fauteuil roulant');
    }
    
    // Chercher dans les avis pour des informations d'accessibilité
    const reviews = result.reviews || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    console.log('♿ Texte des avis (200 premiers caractères):', reviewText.substring(0, 200));
    
    if (reviewText.includes('accessible') || reviewText.includes('fauteuil') || reviewText.includes('pmr')) {
      accessibility.push('Places assises accessibles en fauteuil roulant');
      console.log('♿ Ajouté: Places assises accessibles en fauteuil roulant');
    }
    
    // Logique dynamique basée sur les données Google Places
    // Analyser les avis pour détecter des informations d'accessibilité supplémentaires
    if (reviewText.includes('toilettes accessibles') || reviewText.includes('accessible toilets')) {
      accessibility.push('Toilettes accessibles en fauteuil roulant');
      console.log('♿ Ajouté: Toilettes accessibles en fauteuil roulant');
    }
    
    if (reviewText.includes('boucle magnétique') || reviewText.includes('hearing loop')) {
      accessibility.push('Boucle magnétique');
      console.log('♿ Ajouté: Boucle magnétique');
    }
    
    if (reviewText.includes('parking accessible') || reviewText.includes('accessible parking')) {
      accessibility.push('Parking accessible en fauteuil roulant');
      console.log('♿ Ajouté: Parking accessible en fauteuil roulant');
    }
    
    console.log('♿ Résultat final accessibility:', accessibility);
    return accessibility;
  }

  private extractServicesAvailableFromGoogle(result: any): string[] {
    console.log('🔍 extractServicesAvailableFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const services: string[] = [];
    const types = result.types || [];
    const reviews = result.reviews || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    // Debug: Vérifier les types et avis
    console.log('🔍 Types disponibles:', types);
    console.log('🔍 Nombre d\'avis:', reviews.length);
    console.log('🔍 Texte des avis (200 premiers caractères):', reviewText.substring(0, 200));
    
    // Services directement depuis les types Google Places
    if (types.includes('meal_delivery')) {
      services.push('Livraison');
      console.log('🔍 Ajouté: Livraison (meal_delivery)');
    }
    if (types.includes('meal_takeaway')) {
      services.push('Vente à emporter');
      console.log('🔍 Ajouté: Vente à emporter (meal_takeaway)');
    }
    if (types.includes('restaurant')) {
      services.push('Repas sur place');
      console.log('🔍 Ajouté: Repas sur place (restaurant)');
    }
    
    // Ajouter des services basés sur le type d'établissement
    if (types.includes('restaurant') || types.includes('food')) {
      if (!services.includes('Livraison')) {
        services.push('Livraison');
        console.log('🔍 Ajouté: Livraison (basé sur restaurant/food)');
      }
      if (!services.includes('Vente à emporter')) {
        services.push('Vente à emporter');
        console.log('🔍 Ajouté: Vente à emporter (basé sur restaurant/food)');
      }
    }
    
    // Logique dynamique basée sur les données Google Places
    // Analyser les avis pour détecter des services supplémentaires
    if (reviewText.includes('toilettes non genrées') || reviewText.includes('gender neutral')) {
      services.push('Toilettes non genrées');
      console.log('🔍 Ajouté: Toilettes non genrées (détecté dans avis)');
    }
    
    if (reviewText.includes('piscine') || reviewText.includes('pool')) {
      services.push('Piscine');
      console.log('🔍 Ajouté: Piscine (détecté dans avis)');
    }
    
    console.log('🔍 Résultat final services:', services);
    return services;
  }

  private extractPointsFortsFromGoogle(result: any): string[] {
    console.log('⭐ extractPointsFortsFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const pointsForts: string[] = [];
    const types = result.types || [];
    
    console.log('⭐ Types d\'établissement:', types);
    console.log('⭐ Services disponibles:', {
      wheelchair_accessible_entrance: result.wheelchair_accessible_entrance,
      takeout: result.takeout,
      delivery: result.delivery,
      dine_in: result.dine_in,
      serves_lunch: result.serves_lunch,
      serves_dinner: result.serves_dinner,
      serves_beer: result.serves_beer,
      serves_wine: result.serves_wine,
      serves_vegetarian_food: result.serves_vegetarian_food
    });
    
    // Points forts basés sur les services Google Places
    if (result.wheelchair_accessible_entrance === true) {
      pointsForts.push('Accessible aux personnes à mobilité réduite');
    }
    
    if (result.takeout === true) {
      pointsForts.push('Vente à emporter disponible');
    }
    
    if (result.delivery === true) {
      pointsForts.push('Livraison disponible');
    }
    
    if (result.serves_vegetarian_food === true) {
      pointsForts.push('Options végétariennes');
    }
    
    if (result.serves_beer === true || result.serves_wine === true) {
      pointsForts.push('Boissons alcoolisées');
    }
    
    // Points forts basés sur le type d'établissement
    if (types.includes('cafe')) {
      if (!pointsForts.includes('Excellent café')) pointsForts.push('Excellent café');
    }
    
    if (types.includes('restaurant')) {
      pointsForts.push('Cuisine de qualité');
    }
    
    if (types.includes('bar')) {
      pointsForts.push('Ambiance conviviale');
    }
    
    return pointsForts;
  }

  private extractPopulairePourFromGoogle(result: any): string[] {
    console.log('👥 extractPopulairePourFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const populairePour: string[] = [];
    const types = result.types || [];
    
    console.log('👥 Types d\'établissement:', types);
    console.log('👥 Services de restauration:', {
      serves_lunch: result.serves_lunch,
      serves_dinner: result.serves_dinner,
      dine_in: result.dine_in
    });
    
    // Populaire pour basé sur les services Google Places
    if (result.serves_lunch === true) {
      populairePour.push('Déjeuner');
    }
    
    if (result.serves_dinner === true) {
      populairePour.push('Dîner');
    }
    
    if (result.dine_in === true) {
      populairePour.push('Repas sur place');
    }
    
    if (result.takeout === true) {
      populairePour.push('Vente à emporter');
    }
    
    if (result.delivery === true) {
      populairePour.push('Livraison');
    }
    
    // Populaire pour basé sur le type d'établissement
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
    
    // Offres par défaut basées sur le type d'établissement
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
    
    // Services par défaut basés sur le type d'établissement
    if (types.includes('restaurant')) {
      if (!services.includes('Déjeuner')) services.push('Déjeuner');
      if (!services.includes('Dîner')) services.push('Dîner');
      if (!services.includes('Desserts')) services.push('Desserts');
    }
    
    if (types.includes('cafe')) {
      services.push('Petit-déjeuner');
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
    
    // Ambiance par défaut basée sur le type d'établissement
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
    
    // Logique dynamique basée sur les données Google Places
    // Analyser les avis pour détecter des informations de clientèle supplémentaires
    if (reviewText.includes('lgbtq') || reviewText.includes('lgbt') || reviewText.includes('gay friendly')) {
      clientele.push('LGBTQ+ friendly');
    }
    
    if (reviewText.includes('safe place') || reviewText.includes('transgender') || reviewText.includes('trans')) {
      clientele.push('Safe place pour les transgenres');
    }
    
    // Clientèle par défaut basée sur le type d'établissement
    if (types.includes('restaurant') || types.includes('cafe')) {
      clientele.push('Groupes');
      clientele.push('Familles');
    }
    
    if (types.includes('bar')) {
      clientele.push('Groupes');
      clientele.push('Jeunes');
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
    
    // Paiements par défaut pour les établissements
    if (types.includes('restaurant') || types.includes('bar') || types.includes('cafe')) {
      if (!paiements.includes('Cartes de crédit')) paiements.push('Cartes de crédit');
      if (!paiements.includes('Cartes de débit')) paiements.push('Cartes de débit');
      if (!paiements.includes('Paiements mobiles NFC')) paiements.push('Paiements mobiles NFC');
      if (!paiements.includes('Titres restaurant')) paiements.push('Titres restaurant');
    }
    
    return paiements;
  }

  private extractEnfantsFromGoogle(result: any): string[] {
    console.log('👶 extractEnfantsFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const enfants: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    // CORRECTION : Logique plus précise pour éviter les associations automatiques incorrectes
    // Seulement ajouter des éléments enfants si c'est explicitement mentionné
    
    // Détection explicite d'éléments pour enfants
    if (reviewText.includes('enfant') || reviewText.includes('child') || reviewText.includes('familial')) {
      enfants.push('Convient aux enfants');
    }
    
    if (reviewText.includes('menu enfant') || reviewText.includes('kids menu')) {
      enfants.push('Menu enfant');
    }
    
    // Détection d'activités spécifiquement pour enfants
    if (reviewText.includes('activités enfants') || reviewText.includes('kids activities') || 
        reviewText.includes('animation enfants') || reviewText.includes('children activities')) {
      enfants.push('Activités adaptées aux enfants');
    }
    
    // Détection d'espaces spécifiquement pour enfants
    if (reviewText.includes('espace enfant') || reviewText.includes('kids area') || 
        reviewText.includes('coin enfant') || reviewText.includes('children corner')) {
      enfants.push('Espace dédié aux enfants');
    }
    
    // SUPPRIMÉ : Logique automatique qui ajoutait "Convient aux enfants" pour tous les restaurants/cafés
    // Cela évite les associations incorrectes comme "Jeux de café" → enfants
    
    console.log('👶 Éléments enfants détectés:', enfants);
    return enfants;
  }

  private extractParkingFromGoogle(result: any): string[] {
    console.log('🅿️ extractParkingFromGoogle - Données reçues:', JSON.stringify(result, null, 2));
    
    const parking: string[] = [];
    const reviews = result.reviews || [];
    const types = result.types || [];
    const reviewText = reviews.map((review: any) => review.text).join(' ').toLowerCase();
    
    console.log('🅿️ Texte des avis analysé:', reviewText.substring(0, 500) + '...');
    
    // === DÉTECTION PARKING GRATUIT (plus flexible) ===
    if (reviewText.includes('parking gratuit') || reviewText.includes('free parking') || 
        reviewText.includes('stationnement gratuit') || 
        reviewText.includes('parking gratuit dans la rue') || reviewText.includes('free street parking') ||
        reviewText.includes('gratuit') && (reviewText.includes('parking') || reviewText.includes('stationnement'))) {
      parking.push('Parking gratuit');
      console.log('🅿️ Détecté: Parking gratuit');
    }
    
    if (reviewText.includes('stationnement facile') || reviewText.includes('easy parking') ||
        reviewText.includes('facile de se garer') || reviewText.includes('easy to park') ||
        reviewText.includes('facile') && (reviewText.includes('parking') || reviewText.includes('stationnement'))) {
      parking.push('Stationnement facile');
      console.log('🅿️ Détecté: Stationnement facile');
    }
    
    if (reviewText.includes('parking gratuit dans la rue') || reviewText.includes('free street parking') ||
        reviewText.includes('rue') && reviewText.includes('gratuit')) {
      parking.push('Parking gratuit dans la rue');
      console.log('🅿️ Détecté: Parking gratuit dans la rue');
    }
    
    // === DÉTECTION PARKING PAYANT ===
    if (reviewText.includes('parking couvert payant') || reviewText.includes('covered paid parking')) {
      parking.push('Parking couvert payant');
      console.log('🅿️ Détecté: Parking couvert payant');
    }
    
    if (reviewText.includes('parking payant') || reviewText.includes('paid parking') ||
        reviewText.includes('payant') && (reviewText.includes('parking') || reviewText.includes('stationnement'))) {
      parking.push('Parking payant');
      console.log('🅿️ Détecté: Parking payant');
    }
    
    // === DÉTECTION AUTRES TYPES DE PARKING ===
    if (reviewText.includes('parking privé') || reviewText.includes('private parking')) {
      parking.push('Parking privé');
      console.log('🅿️ Détecté: Parking privé');
    }
    
    if (reviewText.includes('parking souterrain') || reviewText.includes('underground parking')) {
      parking.push('Parking souterrain');
      console.log('🅿️ Détecté: Parking souterrain');
    }
    
    if (reviewText.includes('valet parking') || reviewText.includes('service de voiturier')) {
      parking.push('Service de voiturier');
      console.log('🅿️ Détecté: Service de voiturier');
    }
    
    // === DÉTECTION GÉNÉRALE DE PARKING ===
    if (parking.length === 0) {
      // Si aucun type spécifique n'est détecté, mais que "parking" est mentionné
      if (reviewText.includes('parking') || reviewText.includes('stationnement')) {
        parking.push('Parking disponible');
        console.log('🅿️ Détecté: Parking disponible (générique)');
      }
    }
    
    // === DÉTECTION PAR DÉFAUT (seulement si aucune mention spécifique) ===
    if (parking.length === 0) {
      console.log('🅿️ Aucune information de parking trouvée dans les avis');
    }
    
    console.log('🅿️ Parking détecté final:', parking);
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
    const types = result.types || [];
    const establishmentType = this.establishmentType;
    
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
    
    // Parking
    const parking = this.extractParkingFromGoogle(result);
    services.push(...parking);
    
    // DÉDUPLIQUER les services (sans accessibilité et paiements qui ont leurs propres sections)
    const uniqueServices = this.removeDuplicates(services);
    console.log('🔧 Services uniques après déduplication:', uniqueServices);
    
    // === GÉNÉRATION INTELLIGENTE BASÉE SUR LE TYPE ===
    // ✅ CORRECTION : Ne plus ajouter d'items génériques automatiquement
    // Seulement utiliser les données réelles de Google Places
    
    // Services généraux UNIQUEMENT si aucune donnée Google n'est trouvée
    if (services.length === 0) {
      console.log('🔧 Aucune donnée de services trouvée dans Google, ajout de services génériques');
      services.push('WiFi gratuit');
      services.push('Toilettes');
      services.push('Climatisation');
    }
    
    // Supprimer les doublons
    const finalServices = this.removeDuplicates(uniqueServices);
    console.log('🔧 Services générés (toutes sections):', finalServices);
    return finalServices;
  }

  private removeDuplicates(items: string[]): string[] {
    console.log('🔄 removeDuplicates - Suppression des doublons');
    console.log('🔄 Items avant déduplication:', items);
    
    const unique = [...new Set(items)];
    console.log('🔄 Items après déduplication:', unique);
    
    return unique;
  }

  /**
   * Extrait les mots-clés d'un texte
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Mots-clés spécifiques aux types d'établissements
    const typeKeywords = {
      'parc_loisir_indoor': ['parc', 'loisir', 'indoor', 'intérieur', 'jeux', 'games', 'factory', 'ludique', 'famille', 'enfants'],
      'escape_game': ['escape', 'room', 'énigme', 'mystère', 'puzzle', 'défi', 'challenge', 'aventure', 'donjon'],
      'vr_experience': ['vr', 'virtual', 'réalité', 'virtuelle', 'casque', 'immersion', 'simulation'],
      'karaoke': ['karaoké', 'karaoke', 'chanson', 'micro', 'cabine', 'singing'],
      'restaurant': ['restaurant', 'resto', 'cuisine', 'manger', 'repas', 'table'],
      'bar': ['bar', 'boisson', 'alcool', 'cocktail', 'bière', 'vin'],
      'cinema': ['cinéma', 'cinema', 'film', 'movie', 'salle', 'projection']
    };

    // Vérifier chaque catégorie
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        keywords.push(...keywords.filter(keyword => text.includes(keyword)));
      }
    }

    // Ajouter les mots fréquents
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Ajouter les mots qui apparaissent plus d'une fois
    Object.entries(wordCount).forEach(([word, count]) => {
      if (count > 1 && word.length > 3) {
        keywords.push(word);
      }
    });

    return [...new Set(keywords)]; // Supprimer les doublons
  }

  private generateAmbianceArray(result: any): string[] {
    console.log('🎨 generateAmbianceArray - Début génération ambiance');
    console.log('🎨 Données Google Places reçues:', JSON.stringify(result, null, 2));
    
    const ambiance: string[] = [];
    const establishmentType = this.establishmentType;
    
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
    
    // === GÉNÉRATION INTELLIGENTE BASÉE SUR LE TYPE ===
    // ✅ CORRECTION : Ne plus ajouter d'items génériques automatiquement
    // Seulement utiliser les données réelles de Google Places
    
    // Ambiance générique UNIQUEMENT si aucune donnée Google n'est trouvée
    if (ambiance.length === 0) {
      console.log('🎨 Aucune donnée d\'ambiance trouvée dans Google, ajout d\'ambiance générique');
      ambiance.push('Ambiance conviviale');
      ambiance.push('Cadre agréable');
    }
    
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
    
    // === UTILISER DIRECTEMENT LES DONNÉES BRUTES DE GOOGLE PLACES ===
    
    // 1. Vérifier les champs spécifiques de Google Places pour les moyens de paiement
    if (result.payment_options) {
      console.log('💳 payment_options trouvé:', result.payment_options);
      if (result.payment_options.credit_card) paymentMethods.push('Cartes de crédit');
      if (result.payment_options.debit_card) paymentMethods.push('Cartes de débit');
      if (result.payment_options.cash_only) paymentMethods.push('Espèces uniquement');
      if (result.payment_options.cash) paymentMethods.push('Espèces');
    }
    
    // 1.1. Vérifier les champs d'amenities pour les moyens de paiement modernes
    if (result.amenities && Array.isArray(result.amenities)) {
      console.log('💳 amenities trouvé:', result.amenities);
      result.amenities.forEach((amenity: string) => {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes('nfc') || amenityLower.includes('sans contact') || amenityLower.includes('contactless')) {
          paymentMethods.push('Paiements mobiles NFC');
        }
        if (amenityLower.includes('pluxee') || amenityLower.includes('ticket restaurant')) {
          paymentMethods.push('Pluxee');
        }
        if (amenityLower.includes('ticket restaurant') || amenityLower.includes('ticket resto')) {
          paymentMethods.push('Titres restaurant');
        }
        if (amenityLower.includes('apple pay')) {
          paymentMethods.push('Apple Pay');
        }
        if (amenityLower.includes('google pay')) {
          paymentMethods.push('Google Pay');
        }
      });
    }
    
    // 1.1. Vérifier d'autres champs possibles pour les moyens de paiement
    if (result.payment_methods) {
      console.log('💳 payment_methods trouvé:', result.payment_methods);
      if (Array.isArray(result.payment_methods)) {
        result.payment_methods.forEach((method: string) => {
          if (method.toLowerCase().includes('credit')) paymentMethods.push('Carte de crédit');
          if (method.toLowerCase().includes('debit')) paymentMethods.push('Carte de débit');
          if (method.toLowerCase().includes('cash')) paymentMethods.push('Espèces');
          if (method.toLowerCase().includes('nfc')) paymentMethods.push('Paiement sans contact');
        });
      }
    }
    
    // 1.2. Vérifier les champs d'amenities qui peuvent contenir des infos de paiement
    if (result.amenities && Array.isArray(result.amenities)) {
      console.log('💳 amenities trouvé:', result.amenities);
      result.amenities.forEach((amenity: string) => {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes('credit card') || amenityLower.includes('carte de crédit')) {
          paymentMethods.push('Carte de crédit');
        }
        if (amenityLower.includes('debit card') || amenityLower.includes('carte de débit')) {
          paymentMethods.push('Carte de débit');
        }
        if (amenityLower.includes('cash') || amenityLower.includes('espèces')) {
          paymentMethods.push('Espèces');
        }
        if (amenityLower.includes('nfc') || amenityLower.includes('sans contact')) {
          paymentMethods.push('Paiement sans contact');
        }
      });
    }
    
    // 2. Vérifier les champs d'accessibilité qui peuvent contenir des infos de paiement
    if (result.accessibility_options) {
      console.log('💳 accessibility_options trouvé:', result.accessibility_options);
      // Les options d'accessibilité peuvent contenir des infos sur les moyens de paiement
    }
    
    // 3. Vérifier les champs de services
    if (result.services) {
      console.log('💳 services trouvé:', result.services);
      // Les services peuvent contenir des infos sur les moyens de paiement
    }
    
    // 4. Vérifier les champs d'amenities
    if (result.amenities) {
      console.log('💳 amenities trouvé:', result.amenities);
      // Les amenities peuvent contenir des infos sur les moyens de paiement
    }
    
    // 5. Vérifier les champs d'editorial_summary
    if (result.editorial_summary) {
      console.log('💳 editorial_summary trouvé:', result.editorial_summary);
      // Le résumé éditorial peut contenir des infos sur les moyens de paiement
    }
    
    // 6. Vérifier les champs de current_opening_hours
    if (result.current_opening_hours) {
      console.log('💳 current_opening_hours trouvé:', result.current_opening_hours);
      // Les horaires peuvent contenir des infos sur les moyens de paiement
    }
    
    // 7. Vérifier les champs de reviews pour des mentions de moyens de paiement
    if (result.reviews && Array.isArray(result.reviews)) {
      console.log('💳 reviews trouvées:', result.reviews.length);
      const reviewText = result.reviews.map((review: any) => review.text || '').join(' ').toLowerCase();
      
      // Rechercher des mentions spécifiques de moyens de paiement dans les avis
      if (reviewText.includes('carte bancaire') || reviewText.includes('carte de crédit')) {
        paymentMethods.push('Cartes de crédit');
      }
      if (reviewText.includes('carte de débit')) {
        paymentMethods.push('Cartes de débit');
      }
      if (reviewText.includes('espèces') || reviewText.includes('liquide')) {
        paymentMethods.push('Espèces');
      }
      if (reviewText.includes('chèque')) {
        paymentMethods.push('Chèques');
      }
      if (reviewText.includes('nfc') || reviewText.includes('sans contact') || reviewText.includes('contactless')) {
        paymentMethods.push('Paiements mobiles NFC');
      }
      if (reviewText.includes('ticket restaurant') || reviewText.includes('ticket resto')) {
        paymentMethods.push('Titres restaurant');
      }
      if (reviewText.includes('pluxee')) {
        paymentMethods.push('Pluxee');
      }
      if (reviewText.includes('paypal')) {
        paymentMethods.push('PayPal');
      }
      if (reviewText.includes('apple pay')) {
        paymentMethods.push('Apple Pay');
      }
      if (reviewText.includes('google pay')) {
        paymentMethods.push('Google Pay');
      }
      if (reviewText.includes('paiements mobiles')) {
        paymentMethods.push('Paiements mobiles NFC');
      }
    }
    
    // 8. Fallback intelligent: toujours ajouter des moyens de paiement standards
    console.log('💳 Ajout de moyens de paiement standards intelligents');
    
    // D'abord essayer les infos pratiques
    const practicalInfo = this.generatePracticalInfo(result);
    practicalInfo.forEach((info: string) => {
      const infoLower = info.toLowerCase();
      
      if (infoLower.includes('carte bancaire') || infoLower.includes('carte de crédit')) {
        if (!paymentMethods.includes('Cartes de crédit')) {
          paymentMethods.push('Cartes de crédit');
        }
      }
      
      if (infoLower.includes('espèces') || infoLower.includes('liquide')) {
        if (!paymentMethods.includes('Espèces')) {
          paymentMethods.push('Espèces');
        }
      }
      
      if (infoLower.includes('chèque')) {
        if (!paymentMethods.includes('Chèques')) {
          paymentMethods.push('Chèques');
        }
      }
    });
    
    // 8.1. Vérification supplémentaire dans la description et le nom
    const description = (result.description || '').toLowerCase();
    const name = (result.name || '').toLowerCase();
    const fullText = `${description} ${name}`.toLowerCase();
    
    // Rechercher des mentions de moyens de paiement dans le texte complet
    if (fullText.includes('carte') || fullText.includes('card')) {
      if (!paymentMethods.includes('Cartes de crédit')) {
        paymentMethods.push('Cartes de crédit');
      }
      if (!paymentMethods.includes('Cartes de débit')) {
        paymentMethods.push('Cartes de débit');
      }
    }
    
    if (fullText.includes('nfc') || fullText.includes('sans contact')) {
      if (!paymentMethods.includes('Paiements mobiles NFC')) {
        paymentMethods.push('Paiements mobiles NFC');
      }
    }
    
    if (fullText.includes('ticket restaurant') || fullText.includes('ticket resto')) {
      if (!paymentMethods.includes('Titres restaurant')) {
        paymentMethods.push('Titres restaurant');
      }
    }
    
    if (fullText.includes('pluxee')) {
      if (!paymentMethods.includes('Pluxee')) {
        paymentMethods.push('Pluxee');
      }
    }
    
    // Toujours ajouter des moyens de paiement standards pour les établissements de divertissement
    const types = result.types || [];
    const isEntertainment = types.includes('amusement_park') || types.includes('tourist_attraction') || 
                           result.name?.toLowerCase().includes('vr') || result.name?.toLowerCase().includes('escape');
    
    if (isEntertainment) {
      console.log('💳 Établissement de divertissement détecté, ajout de moyens modernes');
      
      // Moyens de paiement standards pour tous les établissements
      if (!paymentMethods.includes('Cartes de crédit')) {
        paymentMethods.push('Cartes de crédit');
      }
      if (!paymentMethods.includes('Espèces')) {
        paymentMethods.push('Espèces');
      }
      
      // Moyens de paiement spécifiques pour les établissements de divertissement
      if (!paymentMethods.includes('Cartes de débit')) {
        paymentMethods.push('Cartes de débit');
      }
      if (!paymentMethods.includes('Paiements mobiles NFC')) {
        paymentMethods.push('Paiements mobiles NFC');
      }
      if (!paymentMethods.includes('Pluxee')) {
        paymentMethods.push('Pluxee');
      }
      if (!paymentMethods.includes('Titres restaurant')) {
        paymentMethods.push('Titres restaurant');
      }
    } else {
      // Pour les autres établissements, ajouter des moyens de base
      if (!paymentMethods.includes('Cartes de crédit')) {
        paymentMethods.push('Cartes de crédit');
      }
      if (!paymentMethods.includes('Espèces')) {
        paymentMethods.push('Espèces');
      }
      // Ajouter des moyens modernes pour tous les établissements
      if (!paymentMethods.includes('Cartes de débit')) {
        paymentMethods.push('Cartes de débit');
      }
      if (!paymentMethods.includes('Paiements mobiles NFC')) {
        paymentMethods.push('Paiements mobiles NFC');
      }
    }
    
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
