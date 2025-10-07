/**
 * Mappeur intelligent des champs d'établissement selon le type d'activité
 * Supporte tous types d'établissements : restaurants, bars, activités, événements, etc.
 */

export interface EstablishmentType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  fieldMapping: {
    services: string;
    ambiance: string;
    specialties: string;
    atmosphere: string;
    detailedServices: string;
    clienteleInfo: string;
    informationsPratiques: string;
    activities: string;
  };
}

// Types d'établissements supportés
export const ESTABLISHMENT_TYPES: EstablishmentType[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    color: 'orange',
    description: 'Restaurants, brasseries, cafés',
    fieldMapping: {
      services: 'Services de restauration',
      ambiance: 'Ambiance & Spécialités',
      specialties: 'Cuisine & Boissons',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Services',
      clienteleInfo: 'Clientèle cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Activités & Événements'
    }
  },
  {
    id: 'bar',
    name: 'Bar & Boissons',
    icon: '🍻',
    color: 'blue',
    description: 'Bars, pubs, lounges',
    fieldMapping: {
      services: 'Services & Boissons',
      ambiance: 'Ambiance & Spécialités',
      specialties: 'Cocktails & Boissons',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Services',
      clienteleInfo: 'Clientèle cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Animations & Événements'
    }
  },
  {
    id: 'activity',
    name: 'Activités & Loisirs',
    icon: '🎯',
    color: 'green',
    description: 'Bowling, escape game, karting',
    fieldMapping: {
      services: 'Services & Activités',
      ambiance: 'Ambiance & Thèmes',
      specialties: 'Spécialités & Équipements',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Installations',
      clienteleInfo: 'Public cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Activités & Événements'
    }
  },
  {
    id: 'entertainment',
    name: 'Divertissement',
    icon: '🎪',
    color: 'purple',
    description: 'Théâtre, concerts, spectacles',
    fieldMapping: {
      services: 'Services & Programmation',
      ambiance: 'Ambiance & Thèmes',
      specialties: 'Spécialités & Styles',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Installations',
      clienteleInfo: 'Public cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Programmation & Événements'
    }
  },
  {
    id: 'wellness',
    name: 'Bien-être & Santé',
    icon: '🧘',
    color: 'pink',
    description: 'Spa, fitness, yoga',
    fieldMapping: {
      services: 'Services & Soins',
      ambiance: 'Ambiance & Détente',
      specialties: 'Spécialités & Techniques',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Installations',
      clienteleInfo: 'Clientèle cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Activités & Cours'
    }
  },
  {
    id: 'shopping',
    name: 'Shopping & Commerce',
    icon: '🛍️',
    color: 'indigo',
    description: 'Boutiques, centres commerciaux',
    fieldMapping: {
      services: 'Services & Vente',
      ambiance: 'Ambiance & Style',
      specialties: 'Produits & Marques',
      atmosphere: 'Atmosphère',
      detailedServices: 'Équipements & Services',
      clienteleInfo: 'Clientèle cible',
      informationsPratiques: 'Informations pratiques',
      activities: 'Événements & Promotions'
    }
  }
];

/**
 * Détecte le type d'établissement basé sur les activités
 */
export function detectEstablishmentType(activities: any[]): EstablishmentType {
  if (!activities || activities.length === 0) {
    return ESTABLISHMENT_TYPES[0]; // Restaurant par défaut
  }

  const activityStrings = activities.map(a => a.toString().toLowerCase());
  
  // Détection basée sur les mots-clés
  if (activityStrings.some(a => 
    a.includes('restaurant') || a.includes('brasserie') || a.includes('café') || a.includes('pizzeria')
  )) {
    return ESTABLISHMENT_TYPES[0]; // Restaurant
  }
  
  if (activityStrings.some(a => 
    a.includes('bar') || a.includes('pub') || a.includes('lounge') || a.includes('cocktail')
  )) {
    return ESTABLISHMENT_TYPES[1]; // Bar
  }
  
  if (activityStrings.some(a => 
    a.includes('bowling') || a.includes('escape') || a.includes('karting') || a.includes('laser')
  )) {
    return ESTABLISHMENT_TYPES[2]; // Activités
  }
  
  if (activityStrings.some(a => 
    a.includes('théâtre') || a.includes('concert') || a.includes('spectacle') || a.includes('cinéma')
  )) {
    return ESTABLISHMENT_TYPES[3]; // Divertissement
  }
  
  if (activityStrings.some(a => 
    a.includes('spa') || a.includes('fitness') || a.includes('yoga') || a.includes('massage')
  )) {
    return ESTABLISHMENT_TYPES[4]; // Bien-être
  }
  
  if (activityStrings.some(a => 
    a.includes('boutique') || a.includes('magasin') || a.includes('shopping') || a.includes('commerce')
  )) {
    return ESTABLISHMENT_TYPES[5]; // Shopping
  }
  
  return ESTABLISHMENT_TYPES[0]; // Restaurant par défaut
}

/**
 * Obtient la configuration de mapping pour un type d'établissement
 */
export function getFieldMapping(establishmentType: EstablishmentType) {
  return establishmentType.fieldMapping;
}

/**
 * Génère des suggestions de tags basées sur le type d'établissement
 */
export function getSuggestedTagsForType(establishmentType: EstablishmentType): Record<string, string[]> {
  const suggestions: Record<string, Record<string, string[]>> = {
    restaurant: {
      services: ['Déjeuner', 'Dîner', 'Service à table', 'Livraison', 'Vente à emporter'],
      ambiance: ['Ambiance décontractée', 'Romantique', 'Familial', 'Chic'],
      specialties: ['Pizza', 'Italien', 'Français', 'Cocktails', 'Vins'],
      atmosphere: ['Cosy', 'Moderne', 'Traditionnel', 'Intimiste'],
      detailedServices: ['WiFi', 'Terrasse', 'Parking', 'Climatisation'],
      clienteleInfo: ['Groupes', 'Familles', 'Couples', 'Étudiants'],
      informationsPratiques: ['Réservation recommandée', 'Espace non-fumeurs', 'Accessible PMR'],
      activities: ['Anniversaire', 'Mariage', 'Événements privés']
    },
    bar: {
      services: ['Cocktails', 'Boissons', 'Snacks', 'Happy Hour'],
      ambiance: ['Ambiance décontractée', 'Festif', 'Branché', 'Intimiste'],
      specialties: ['Cocktails', 'Bières', 'Whisky', 'Champagne'],
      atmosphere: ['Cosy', 'Moderne', 'Vintage', 'Industriel'],
      detailedServices: ['WiFi', 'Terrasse', 'Parking', 'Climatisation'],
      clienteleInfo: ['Groupes', 'Couples', 'Étudiants', 'Professionnels'],
      informationsPratiques: ['Réservation recommandée', 'Espace non-fumeurs', 'Animaux acceptés'],
      activities: ['Concerts', 'DJ', 'Karaoké', 'Soirées à thème']
    },
    activity: {
      services: ['Activités', 'Équipements', 'Encadrement', 'Matériel'],
      ambiance: ['Ambiance décontractée', 'Festif', 'Compétitif', 'Familial'],
      specialties: ['Bowling', 'Escape Game', 'Karting', 'Laser Game'],
      atmosphere: ['Moderne', 'Coloré', 'Énergique', 'Convivial'],
      detailedServices: ['Parking', 'Vestiaires', 'Snack-bar', 'WiFi'],
      clienteleInfo: ['Groupes', 'Familles', 'Enfants', 'Adolescents'],
      informationsPratiques: ['Réservation obligatoire', 'Équipements fournis', 'Accessible PMR'],
      activities: ['Anniversaire', 'Team Building', 'Événements privés', 'Compétitions']
    },
    entertainment: {
      services: ['Spectacles', 'Concerts', 'Projections', 'Animations'],
      ambiance: ['Ambiance culturelle', 'Artistique', 'Sophistiquée', 'Dynamique'],
      specialties: ['Théâtre', 'Musique', 'Danse', 'Comédie'],
      atmosphere: ['Élégant', 'Moderne', 'Vintage', 'Intimiste'],
      detailedServices: ['Parking', 'Vestiaires', 'Bar', 'WiFi'],
      clienteleInfo: ['Adultes', 'Familles', 'Groupes', 'Passionnés'],
      informationsPratiques: ['Réservation recommandée', 'Tenue correcte', 'Accessible PMR'],
      activities: ['Saison', 'Festivals', 'Événements spéciaux', 'Ateliers']
    },
    wellness: {
      services: ['Soins', 'Massages', 'Thérapies', 'Consultations'],
      ambiance: ['Ambiance zen', 'Détente', 'Relaxante', 'Professionnelle'],
      specialties: ['Massage', 'Facial', 'Corporel', 'Thérapies'],
      atmosphere: ['Calme', 'Serein', 'Luxueux', 'Minimaliste'],
      detailedServices: ['Parking', 'Vestiaires', 'Douches', 'Sauna'],
      clienteleInfo: ['Adultes', 'Femmes', 'Hommes', 'Couples'],
      informationsPratiques: ['Réservation obligatoire', 'Tenue de bain', 'Accessible PMR'],
      activities: ['Cours', 'Ateliers', 'Retraites', 'Événements bien-être']
    },
    shopping: {
      services: ['Vente', 'Conseil', 'Personnalisation', 'Livraison'],
      ambiance: ['Ambiance moderne', 'Chic', 'Décontractée', 'Professionnelle'],
      specialties: ['Mode', 'Accessoires', 'Décoration', 'Technologie'],
      atmosphere: ['Élégant', 'Moderne', 'Minimaliste', 'Coloré'],
      detailedServices: ['Parking', 'WiFi', 'Essayage', 'Caisse'],
      clienteleInfo: ['Femmes', 'Hommes', 'Familles', 'Professionnels'],
      informationsPratiques: ['Paiement par carte', 'Retour possible', 'Accessible PMR'],
      activities: ['Défilés', 'Lancements', 'Soldes', 'Événements VIP']
    }
  };

  return suggestions[establishmentType.id] || suggestions.restaurant;
}
