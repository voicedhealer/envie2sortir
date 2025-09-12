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
}

export class EstablishmentEnrichment {
  private apiKey: string;
  private enrichmentData: EnrichmentData | null = null;
  private establishmentType: string | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
  }

  async triggerGoogleEnrichment(googleUrl: string): Promise<EnrichmentData> {
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
      const placeData = await this.fetchGooglePlaceData(resolveData.placeId, resolveData.placeName);
      
      // Traitement et génération des tags
      this.enrichmentData = await this.processPlaceData(placeData, googleUrl);
      
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
    const fields = [
      'name', 'types', 'price_level', 'rating',
      'user_ratings_total', 'business_status',
      'opening_hours', 'website', 'formatted_phone_number',
      'reviews', 'photos', 'formatted_address', 'geometry'
    ].join(',');

    const response = await fetch('/api/google-places-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: placeId,
        fields: fields,
        apiKey: this.apiKey,
        placeName: placeName
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur API Google Places');
    }
    
    return response.json();
  }

  private async processPlaceData(placeData: any, googleUrl: string): Promise<EnrichmentData> {
    console.log('🔄 processPlaceData - Données Google Places reçues:', JSON.stringify(placeData, null, 2));
    
    // Vérifier que placeData est valide
    if (!placeData || !placeData.result) {
      console.error('❌ Données Google Places invalides:', placeData);
      throw new Error('Données Google Places invalides');
    }

    const result = placeData.result;
    
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
      hours: this.convertOpeningHours(result.opening_hours),
      
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
      theForkLink: this.suggestTheForkIntegration(result)
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
    
    baseTags.push(...(typeBasedTags[type] || []));
    
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
    
    if (!openingHours || !openingHours.periods) {
      console.log('❌ Pas de périodes d\'ouverture disponibles');
      return {};
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hoursData: any = {};

    // Initialiser tous les jours comme fermés
    days.forEach(day => {
      hoursData[day] = { isOpen: false, slots: [] };
    });

    console.log('📅 Jours initialisés:', Object.keys(hoursData));

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
      }
    });

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
}

// Instance globale
export const enrichmentSystem = new EstablishmentEnrichment();
