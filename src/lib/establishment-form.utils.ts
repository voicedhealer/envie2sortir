import { AddressData } from '@/components/forms/AdresseStep';
import { EnrichmentData } from '@/lib/enrichment-system';
import { CATEGORIES } from '@/types/establishment-form.types';

// Fonction pour parser l'adresse Google en format formulaire
export function parseAddressFromGoogle(googleAddress: string): AddressData {
  console.log('🏠 Parsing adresse Google:', googleAddress);
  
  // Format typique: "44 Rue Monge, 21000 Dijon, France"
  const parts = googleAddress.split(',').map(part => part.trim());
  
  let street = '';
  let postalCode = '';
  let city = '';
  
  if (parts.length >= 3) {
    // Premier élément = rue
    street = parts[0];
    
    // Deuxième élément = code postal + ville
    const cityPart = parts[1];
    const postalMatch = cityPart.match(/(\d{5})\s+(.+)/);
    if (postalMatch) {
      postalCode = postalMatch[1];
      city = postalMatch[2];
    } else {
      city = cityPart;
    }
  } else if (parts.length === 2) {
    street = parts[0];
    city = parts[1];
  } else {
    street = googleAddress;
  }
  
  const result = { street, postalCode, city };
  console.log('✅ Adresse parsée:', result);
  return result;
}

// Fonction pour obtenir les suggestions basées sur les activités
export function getSuggestedTags(activities: string[]): string[] {
  const suggestions: string[] = [];
  
  activities.forEach(activity => {
    // Mapping des activités vers des tags suggérés
    const activitySuggestions: { [key: string]: string[] } = {
      'pizzeria': ['pizza', 'italien', 'pâtes', 'livraison', 'emporter', 'familial'],
      'restaurant_italien': ['pizza', 'italien', 'pâtes', 'antipasti', 'vins', 'familial'],
      'restaurant_français': ['français', 'traditionnel', 'terroir', 'gastronomique', 'vins'],
      'restaurant_asiatique': ['asiatique', 'sushi', 'wok', 'japonais', 'chinois', 'thé'],
      'kebab': ['kebab', 'turc', 'sandwich', 'livraison', 'rapide', 'budget'],
      'burger': ['burger', 'américain', 'frites', 'rapide', 'familial', 'budget'],
      'bar_ambiance': ['cocktails', 'ambiance', 'lounge', 'chic', 'soirée', 'romantique'],
      'pub_traditionnel': ['bières', 'pub', 'sport', 'décontracté', 'groupe', 'happy-hour'],
      'brasserie_artisanale': ['bières', 'artisanal', 'local', 'dégustation', 'authentique'],
      'bar_cocktails': ['cocktails', 'mixologie', 'sophistiqué', 'premium', 'chic'],
      'bar_vins': ['vins', 'œnologie', 'dégustation', 'raffiné', 'culturel'],
      'bar_sports': ['sport', 'bières', 'écrans', 'groupe', 'festif', 'happy-hour'],
      'discotheque': ['danse', 'dj', 'musique', 'festif', 'nuit', 'groupe'],
      'club_techno': ['électro', 'techno', 'danse', 'underground', 'nuit'],
      'bowling': ['bowling', 'famille', 'groupe', 'compétition', 'amusant'],
      'escape_game_horreur': ['escape-game', 'aventure', 'équipe', 'défi', 'énigme', 'groupe'],
      'futsal': ['football', 'sport', 'équipe', 'compétition', 'groupe']
    };
    
    if (activitySuggestions[activity]) {
      suggestions.push(...activitySuggestions[activity]);
    }
  });
  
  // Supprimer les doublons et retourner les 15 premiers
  return [...new Set(suggestions)].slice(0, 15);
}

// Fonctions de conversion des tableaux en objets pour compatibilité avec ProfessionalData
export function convertAccessibilityArrayToObject(accessibilityArray: string[] = []): any {
  return {
    wheelchairAccessibleEntrance: accessibilityArray.includes('Entrée accessible en fauteuil roulant'),
    wheelchairAccessibleParking: accessibilityArray.includes('Parking accessible en fauteuil roulant'),
    wheelchairAccessibleRestroom: accessibilityArray.includes('Toilettes accessibles en fauteuil roulant'),
    wheelchairAccessibleSeating: accessibilityArray.includes('Places assises accessibles en fauteuil roulant')
  };
}

export function convertServicesAvailableArrayToObject(servicesArray: string[] = []): any {
  return {
    delivery: servicesArray.includes('Livraison'),
    takeout: servicesArray.includes('Vente à emporter'),
    dineIn: servicesArray.includes('Repas sur place')
  };
}

export function convertDiningServicesArrayToObject(diningArray: string[] = []): any {
  return {
    lunch: diningArray.includes('Déjeuner'),
    dinner: diningArray.includes('Dîner'),
    catering: diningArray.includes('Traiteur'),
    desserts: diningArray.includes('Desserts'),
    tableService: diningArray.includes('Service à table')
  };
}

export function convertOfferingsArrayToObject(offeringsArray: string[] = []): any {
  return {
    alcohol: offeringsArray.includes('Alcools'),
    beer: offeringsArray.includes('Bière'),
    coffee: offeringsArray.includes('Cafés'),
    cocktails: offeringsArray.includes('Cocktails et apéritifs'),
    vegetarian: offeringsArray.includes('Convient aux végétariens'),
    healthyOptions: offeringsArray.includes('Produits sains'),
    spirits: offeringsArray.includes('Spiritueux'),
    wine: offeringsArray.includes('Vin')
  };
}

export function convertAtmosphereArrayToObject(atmosphereArray: string[] = []): any {
  return {
    casual: atmosphereArray.includes('Ambiance décontractée'),
    cozy: atmosphereArray.includes('Cadre agréable'),
    quiet: atmosphereArray.includes('Calme'),
    romantic: atmosphereArray.includes('Romantique'),
    festive: atmosphereArray.includes('Festif')
  };
}

export function convertGeneralServicesArrayToObject(servicesArray: string[] = []): any {
  return {
    wifi: servicesArray.includes('WiFi'),
    airConditioning: servicesArray.includes('Climatisation'),
    restrooms: servicesArray.includes('Toilettes'),
    parking: servicesArray.includes('Parking')
  };
}

// Fonction pour récupérer les services et ambiances basés sur les activités sélectionnées
export const getActivitiesServicesAndAmbiance = (activities: string[]) => {
  if (!activities || activities.length === 0) return null;
  
  // Mapping des activités vers les catégories de services/ambiances
  const activityMappings: Record<string, keyof typeof CATEGORIES> = {
    // Bars
    'bar_ambiance': 'bar',
    'pub_traditionnel': 'bar',
    'brasserie_artisanale': 'bar',
    'bar_cocktails': 'bar',
    'bar_vins': 'bar',
    'bar_sports': 'bar',
    'rooftop_bar': 'bar',
    'bar_karaoke': 'bar',
    'bar_bières': 'bar',
    
    // Restaurants
    'restaurant_gastronomique': 'restaurant',
    'restaurant_traditionnel': 'restaurant',
    'restaurant_familial': 'restaurant',
    'bistrot': 'restaurant',
    'restaurant_italien': 'restaurant',
    'restaurant_asiatique': 'restaurant',
    'restaurant_oriental': 'restaurant',
    'pizzeria': 'restaurant',
    
    // Fast food → restaurant pour l'instant
    'kebab': 'restaurant',
    'burger': 'restaurant',
    'tacos_mexicain': 'restaurant',
    
    // Sorties nocturnes
    'discotheque': 'nightclub',
    'club_techno': 'nightclub',
    'boite_nuit_mainstream': 'nightclub',
    
    // Activités
    'escape_game_horreur': 'escape_game',
    'escape_game_aventure': 'escape_game',
    'bowling': 'escape_game', // Temporaire
    
    // Cinéma
    'cinema_mainstream': 'cinema',
    
    // Fallback vers les anciennes catégories
    'bar': 'bar',
    'restaurant': 'restaurant',
    'nightclub': 'nightclub',
    'escape_game': 'escape_game',
    'cinema': 'cinema'
  };
  
  // Récupérer la première activité mappée pour déterminer les services/ambiances
  // TODO: Améliorer pour fusionner les services de plusieurs activités
  const firstMappedCategory = activityMappings[activities[0]];
  return firstMappedCategory ? CATEGORIES[firstMappedCategory] : null;
};

// Fonction pour convertir un objet de moyens de paiement en tableau
export function convertPaymentMethodsObjectToArray(paymentMethodsObj: any) {
  if (!paymentMethodsObj || typeof paymentMethodsObj !== 'object') return [];
  
  const methods: string[] = [];
  
  if (paymentMethodsObj.creditCards) methods.push('Cartes de crédit');
  if (paymentMethodsObj.debitCards) methods.push('Cartes de débit');
  if (paymentMethodsObj.nfc) methods.push('Paiement mobile NFC');
  if (paymentMethodsObj.cashOnly) methods.push('Espèces uniquement');
  if (paymentMethodsObj.restaurantVouchers) methods.push('Titres restaurant');
  if (paymentMethodsObj.pluxee) methods.push('Pluxee');
  
  return methods;
}

// Fonction pour convertir un tableau de moyens de paiement en objet
export function convertPaymentMethodsArrayToObject(paymentMethodsArray: string[]) {
  const paymentMethodsObj: any = {};
  
  paymentMethodsArray.forEach(method => {
    const methodLower = method.toLowerCase();
    
    // Cartes bancaires
    if (methodLower.includes('carte') && (methodLower.includes('crédit') || methodLower.includes('credit'))) {
      paymentMethodsObj.creditCards = true;
    }
    if (methodLower.includes('carte') && methodLower.includes('débit')) {
      paymentMethodsObj.debitCards = true;
    }
    
    // Paiements mobiles
    if (methodLower.includes('nfc') || methodLower.includes('mobile')) {
      paymentMethodsObj.nfc = true;
    }
    
    // Espèces
    if (methodLower.includes('espèces') || methodLower.includes('cash')) {
      paymentMethodsObj.cashOnly = true;
    }
    
    // Titres restaurant
    if (methodLower.includes('titre') || methodLower.includes('restaurant')) {
      paymentMethodsObj.restaurantVouchers = true;
    }
    
    // Pluxee
    if (methodLower.includes('pluxee')) {
      paymentMethodsObj.pluxee = true;
    }
    
    // Pour les autres moyens non reconnus, on les ajoute comme propriétés booléennes
    if (!paymentMethodsObj.creditCards && !paymentMethodsObj.debitCards && 
        !paymentMethodsObj.nfc && !paymentMethodsObj.cashOnly && 
        !paymentMethodsObj.restaurantVouchers && !paymentMethodsObj.pluxee) {
      paymentMethodsObj[methodLower.replace(/\s+/g, '')] = true;
    }
  });
  
  return paymentMethodsObj;
}

// Fonction pour parser l'adresse complète en mode édition
export function parseAddress(fullAddress: string) {
  if (!fullAddress) return { street: "", postalCode: "", city: "" };
  
  // Pattern pour extraire : "8 Pl. Raspail, 69007 Lyon"
  const match = fullAddress.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
  if (match) {
    return {
      street: match[1].trim(),
      postalCode: match[2].trim(),
      city: match[3].trim()
    };
  }
  
  // Si le pattern ne correspond pas, essayer de séparer par virgule
  const parts = fullAddress.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    return {
      street: parts[0],
      postalCode: parts[1],
      city: parts[2]
    };
  }
  
  // Fallback : tout dans street
  return {
    street: fullAddress,
    postalCode: "",
    city: ""
  };
}

// Fonction pour valider un numéro de téléphone mobile français (06 ou 07)
export function isValidFrenchPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  // Accepter seulement les numéros mobiles : 06, 07, +336, +337
  return /^(0[67]|\+33[67])[0-9]{8}$/.test(cleanPhone);
}

// Fonction pour déterminer l'état visuel du champ téléphone
export function getPhoneFieldState(phone: string, isVerified: boolean): {
  state: 'empty' | 'invalid' | 'valid' | 'verified';
  className: string;
  message: string;
  disabled: boolean;
} {
  const cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // Si vérifié, état final
  if (isVerified && phone) {
    return {
      state: 'verified',
      className: 'border-green-500 bg-green-50',
      message: '✓ Numéro de téléphone vérifié',
      disabled: true
    };
  }
  
  // Si vide, état initial
  if (!phone || cleanPhone.length === 0) {
    return {
      state: 'empty',
      className: 'border-gray-300',
      message: '📱 Un SMS de vérification sera envoyé à ce numéro mobile (06 ou 07 uniquement)',
      disabled: false
    };
  }
  
  // Vérifier si c'est un numéro mobile valide (06 ou 07 + 10 chiffres)
  const isValidMobile = /^(0[67]|\+33[67])[0-9]{8}$/.test(cleanPhone);
  
  if (isValidMobile) {
    return {
      state: 'valid',
      className: 'border-green-500 bg-green-50',
      message: '📱 Envoi automatique du SMS en cours...',
      disabled: true
    };
  }
  
  // Vérifier si le numéro commence par des préfixes invalides (01-05, 08-09)
  const startsWithInvalidPrefix = /^(0[1-5]|0[8-9])/.test(cleanPhone);
  
  if (startsWithInvalidPrefix) {
    return {
      state: 'invalid',
      className: 'border-red-300 bg-red-50',
      message: '⚠️ Numéro invalide : Le numéro doit commencer par 06 ou 07 et contenir 10 chiffres',
      disabled: false
    };
  }
  
  // Si commence par 06 ou 07 mais n'a pas encore 10 chiffres, état neutre
  const startsWithValidPrefix = /^(0[67]|\+33[67])/.test(cleanPhone);
  
  if (startsWithValidPrefix) {
    return {
      state: 'empty',
      className: 'border-gray-300',
      message: '📱 Un SMS de vérification sera envoyé à ce numéro mobile (06 ou 07 uniquement)',
      disabled: false
    };
  }
  
  // Sinon, invalide (autres cas)
  return {
    state: 'invalid',
    className: 'border-red-300 bg-red-50',
    message: '⚠️ Numéro invalide : Le numéro doit commencer par 06 ou 07 et contenir 10 chiffres',
    disabled: false
  };
}

// Fonction pour valider un email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fonction pour valider un mot de passe sécurisé
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Vérifier la longueur minimale
  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }
  
  // Vérifier au moins 2 chiffres
  const digitCount = (password.match(/\d/g) || []).length;
  if (digitCount < 2) {
    errors.push("Au moins 2 chiffres");
  }
  
  // Vérifier au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins une majuscule");
  }
  
  // Vérifier au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Au moins un caractère spécial (!@#$%^&*...)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Fonction pour valider un SIRET
export function isValidSiret(siret: string): boolean {
  return siret.length === 14 && /^\d{14}$/.test(siret);
}
