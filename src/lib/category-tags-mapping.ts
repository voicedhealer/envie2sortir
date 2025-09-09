/**
 * MAPPING CATÉGORIES → TAGS DE RECHERCHE
 * Convertit automatiquement les catégories sélectionnées en tags pour améliorer la recherche
 */

export interface CategoryTagsMapping {
  [categoryKey: string]: {
    primaryTags: string[];    // Tags principaux (poids élevé)
    secondaryTags: string[];  // Tags secondaires (poids moyen)
    relatedTags: string[];    // Tags liés (poids faible)
  };
}

export interface ActivityInfo {
  label: string;
  services: string[];
  ambiance: string[];
  primaryTags: string[];
  secondaryTags: string[];
  relatedTags: string[];
}

export const CATEGORY_TAGS_MAPPING: CategoryTagsMapping = {
  // 🍹 Bars & Boissons
  bar_ambiance: {
    primaryTags: ["bar", "ambiance", "cocktails", "lounge"],
    secondaryTags: ["apéro", "terrasse", "musique", "chic", "élégant"],
    relatedTags: ["soirée", "romantique", "after-work", "sophistiqué"]
  },
  pub_traditionnel: {
    primaryTags: ["pub", "bière", "traditionnel", "sport"],
    secondaryTags: ["pression", "fish", "chips", "écrans", "convivial"],
    relatedTags: ["anglaise", "décontracté", "entre potes", "sportif"]
  },
  brasserie_artisanale: {
    primaryTags: ["brasserie", "artisanale", "bière", "craft"],
    secondaryTags: ["dégustation", "locale", "visite", "produits"],
    relatedTags: ["authentique", "découverte", "artisanal", "terroir"]
  },
  bar_cocktails: {
    primaryTags: ["bar", "cocktails", "mixologie", "spécialisé"],
    secondaryTags: ["signature", "bartender", "happy hour", "expert"],
    relatedTags: ["sophistiqué", "créatif", "festif", "trendy"]
  },
  bar_vins: {
    primaryTags: ["bar", "vins", "cave", "œnologie"],
    secondaryTags: ["dégustation", "accords", "mets-vins", "sommelier"],
    relatedTags: ["raffiné", "culturel", "conviviale", "sélection"]
  },
  bar_sports: {
    primaryTags: ["bar", "sport", "match", "écrans"],
    secondaryTags: ["géants", "retransmission", "pression", "supporters"],
    relatedTags: ["sportive", "conviviale", "animée", "passion"]
  },
  rooftop_bar: {
    primaryTags: ["rooftop", "terrasse", "panoramique", "bar"],
    secondaryTags: ["vue", "coucher", "soleil", "premium"],
    relatedTags: ["romantique", "exclusive", "instagram", "haut"]
  },
  bar_karaoke: {
    primaryTags: ["karaoké", "bar", "chanson", "cabines"],
    secondaryTags: ["privées", "playlist", "festive", "musique"],
    relatedTags: ["amusant", "décontracté", "entre amis", "divertissement"]
  },
  bar_bières: {
    primaryTags: ["bar", "bières", "pression", "belge"],
    secondaryTags: ["tapas", "planches", "happy hour", "terrasse"],
    relatedTags: ["amusant", "décontracté", "festif", "entre amis", "dj", "live", "sport"]
  },

  // 🍽️ Restaurants
  restaurant_gastronomique: {
    primaryTags: ["restaurant", "gastronomique", "chef", "étoilé"],
    secondaryTags: ["menu", "dégustation", "premium", "exceptionnel"],
    relatedTags: ["raffiné", "étoilée", "exceptionnelle", "haute cuisine"]
  },
  restaurant_traditionnel: {
    primaryTags: ["restaurant", "traditionnel", "français", "terroir"],
    secondaryTags: ["cuisine", "traditionnelle", "produits", "régionaux"],
    relatedTags: ["authentique", "familiale", "terroir", "classique"]
  },
  restaurant_familial: {
    primaryTags: ["restaurant", "familial", "enfant", "convivial"],
    secondaryTags: ["menu", "chaises", "hautes", "animations"],
    relatedTags: ["générations", "décontracté", "abordable", "chaleureux"]
  },
  bistrot: {
    primaryTags: ["bistrot", "quartier", "plat", "jour"],
    secondaryTags: ["ardoise", "prix", "doux", "locale"],
    relatedTags: ["authentique", "simplicité", "traditionnel", "convivial"]
  },

  // 🌍 Cuisines du monde
  restaurant_italien: {
    primaryTags: ["restaurant", "italien", "pizza", "pâtes"],
    secondaryTags: ["fraîches", "feu", "bois", "antipasti"],
    relatedTags: ["famiglia", "méditerranéenne", "conviviale", "italienne"]
  },
  restaurant_asiatique: {
    primaryTags: ["restaurant", "asiatique", "sushi", "wok"],
    secondaryTags: ["frais", "dim sum", "thé", "premium"],
    relatedTags: ["zen", "exotique", "moderne", "épurée"]
  },
  restaurant_oriental: {
    primaryTags: ["restaurant", "oriental", "couscous", "tajines"],
    secondaryTags: ["menthe", "pâtisseries", "orientales", "épices"],
    relatedTags: ["chaleureuse", "conviviale", "orientale", "traditionnel"]
  },

  // 🥙 Fast Food & Street Food
  kebab: {
    primaryTags: ["kebab", "sandwich", "viande", "grillée"],
    secondaryTags: ["livraison", "accessible", "rapide", "pratique"],
    relatedTags: ["décontracté", "entre potes", "street food", "turc"]
  },
  tacos_mexicain: {
    primaryTags: ["tacos", "mexicain", "guacamole", "sauces"],
    secondaryTags: ["piquantes", "emporter", "authentiques", "épicé"],
    relatedTags: ["street food", "décontracté", "mexicaine", "rapide"]
  },
  burger: {
    primaryTags: ["burger", "house", "frites", "artisanales"],
    secondaryTags: ["maison", "milkshakes", "ingrédients", "frais"],
    relatedTags: ["américaine", "gourmande", "moderne", "trendy"]
  },
  pizzeria: {
    primaryTags: ["pizzeria", "pizza", "feu", "bois"],
    secondaryTags: ["pâte", "maison", "livraison", "emporter"],
    relatedTags: ["italienne", "conviviale", "rapide", "familiale"]
  },

  // 🎉 Sorties nocturnes
  discotheque: {
    primaryTags: ["discothèque", "danse", "dj", "piste"],
    secondaryTags: ["bar", "vestiaire", "nocturne", "énergique"],
    relatedTags: ["festive", "dansante", "club", "musique"]
  },
  club_techno: {
    primaryTags: ["club", "techno", "électro", "sound"],
    secondaryTags: ["system", "dj", "internationaux", "lights"],
    relatedTags: ["underground", "intense", "rave", "électronique"]
  },
  boite_nuit_mainstream: {
    primaryTags: ["boîte", "nuit", "mainstream", "hits"],
    secondaryTags: ["moment", "jeune", "cocktails", "thématiques"],
    relatedTags: ["commerciale", "accessible", "populaire", "festive"]
  },

  // 🎯 Sports & Activités
  bowling: {
    primaryTags: ["bowling", "pistes", "chaussures", "location"],
    secondaryTags: ["snack", "anniversaires", "compétition", "famille"],
    relatedTags: ["amusant", "décontracté", "sport", "loisir"]
  },
  billard_americain: {
    primaryTags: ["billard", "américain", "billes", "queue"],
    secondaryTags: ["tables", "tournois", "compétition", "sport"],
    relatedTags: ["précision", "stratégie", "décontracté", "loisir"]
  },
  billard_francais: {
    primaryTags: ["billard", "français", "carambole", "blanche"],
    secondaryTags: ["tables", "tournois", "compétition", "sport"],
    relatedTags: ["précision", "stratégie", "traditionnel", "loisir"]
  },
  escape_game_horreur: {
    primaryTags: ["escape game", "horreur", "salles", "thématiques"],
    secondaryTags: ["frissons", "team building", "réservation", "challenge"],
    relatedTags: ["adrénaline", "immersive", "énigme", "groupe"]
  },
  futsal: {
    primaryTags: ["futsal", "football", "terrain", "couvert"],
    secondaryTags: ["équipement", "matchs", "tournois", "sport"],
    relatedTags: ["compétitif", "équipe", "technique", "football"]
  },
  karting: {
    primaryTags: ["karting", "circuit", "vitesse", "course"],
    secondaryTags: ["karts", "chronométrage", "compétition", "adrénaline"],
    relatedTags: ["sport", "mécanique", "vitesse", "loisir"]
  },
  laser_game: {
    primaryTags: ["laser game", "laser", "tactique", "équipe"],
    secondaryTags: ["salles", "thématiques", "réservation", "challenge"],
    relatedTags: ["stratégie", "groupe", "amusant", "compétitif"]
  },
  vr_experience: {
    primaryTags: ["vr", "réalité", "virtuelle", "casque"],
    secondaryTags: ["expérience", "immersive", "technologie", "nouveau"],
    relatedTags: ["futuriste", "découverte", "original", "innovant"]
  },

  // ❓ Autres
  autre: {
    primaryTags: ["autre", "activité", "spécialité", "unique"],
    secondaryTags: ["définir", "original", "insolite", "créatif"],
    relatedTags: ["surprenant", "différent", "nouveau", "découverte"]
  }
};

/**
 * Fonction pour obtenir tous les tags d'une catégorie
 */
export function getCategoryTags(categoryKey: string): string[] {
  const mapping = CATEGORY_TAGS_MAPPING[categoryKey];
  if (!mapping) return [];
  
  return [
    ...mapping.primaryTags,
    ...mapping.secondaryTags,
    ...mapping.relatedTags
  ];
}

/**
 * Fonction pour obtenir les tags avec leurs poids
 */
export function getCategoryTagsWithWeights(categoryKey: string): Array<{tag: string, weight: number}> {
  const mapping = CATEGORY_TAGS_MAPPING[categoryKey];
  if (!mapping) return [];
  
  const tagsWithWeights: Array<{tag: string, weight: number}> = [];
  
  // Tags principaux (poids 10)
  mapping.primaryTags.forEach(tag => {
    tagsWithWeights.push({ tag, weight: 10 });
  });
  
  // Tags secondaires (poids 7)
  mapping.secondaryTags.forEach(tag => {
    tagsWithWeights.push({ tag, weight: 7 });
  });
  
  // Tags liés (poids 5)
  mapping.relatedTags.forEach(tag => {
    tagsWithWeights.push({ tag, weight: 5 });
  });
  
  return tagsWithWeights;
}

/**
 * Fonction pour créer les données de tags pour Prisma
 */
export function createTagsData(establishmentId: string, categoryKey: string) {
  const tagsWithWeights = getCategoryTagsWithWeights(categoryKey);
  
  return tagsWithWeights.map(({ tag, weight }) => ({
    etablissementId: establishmentId,
    tag: tag.toLowerCase(),
    typeTag: 'activite', // Type par défaut pour les tags générés automatiquement
    poids: weight
  }));
}

/**
 * Informations complètes des activités pour l'interface utilisateur
 */
export const ACTIVITY_INFO: Record<string, ActivityInfo> = {
  // 🍹 Bars & Boissons
  bar_ambiance: {
    label: "Bar d'ambiance / Lounge",
    services: ["Cocktails maison", "Apéros", "Terrasse", "Musique douce", "Sofas"],
    ambiance: ["Chic", "Élégant", "Romantique", "After-work"],
    primaryTags: ["bar", "ambiance", "cocktails", "lounge"],
    secondaryTags: ["apéro", "terrasse", "musique", "chic", "élégant"],
    relatedTags: ["soirée", "romantique", "after-work", "sophistiqué"]
  },
  pub_traditionnel: {
    label: "Pub traditionnel",
    services: ["Bières pression", "Fish & chips", "Écrans sport", "Ambiance conviviale"],
    ambiance: ["Décontractée", "Entre potes", "Sportive", "Anglaise"],
    primaryTags: ["pub", "bière", "traditionnel", "sport"],
    secondaryTags: ["pression", "fish", "chips", "écrans", "convivial"],
    relatedTags: ["anglaise", "décontracté", "entre potes", "sportif"]
  },
  brasserie_artisanale: {
    label: "Brasserie artisanale",
    services: ["Bières craft", "Dégustation", "Visite brasserie", "Produits locaux"],
    ambiance: ["Artisanale", "Locale", "Découverte", "Authentique"],
    primaryTags: ["brasserie", "artisanale", "bière", "craft"],
    secondaryTags: ["dégustation", "locale", "visite", "produits"],
    relatedTags: ["authentique", "découverte", "artisanal", "terroir"]
  },
  bar_cocktails: {
    label: "Bar à cocktails spécialisé",
    services: ["Cocktails signature", "Mixologie", "Happy Hour", "Bartender expert"],
    ambiance: ["Sophistiqué", "Créatif", "Festive", "Trendy"],
    primaryTags: ["bar", "cocktails", "mixologie", "spécialisé"],
    secondaryTags: ["signature", "bartender", "happy hour", "expert"],
    relatedTags: ["sophistiqué", "créatif", "festif", "trendy"]
  },
  bar_vins: {
    label: "Bar à vins / Cave à vin",
    services: ["Dégustation vins", "Accords mets-vins", "Cave sélectionnée", "Conseil sommelier"],
    ambiance: ["Œnologique", "Raffinée", "Culturelle", "Conviviale"],
    primaryTags: ["bar", "vins", "cave", "œnologie"],
    secondaryTags: ["dégustation", "accords", "mets-vins", "sommelier"],
    relatedTags: ["raffiné", "culturel", "conviviale", "sélection"]
  },
  bar_sports: {
    label: "Bar sportif",
    services: ["Écrans géants", "Retransmissions", "Bières pression", "Ambiance supporters"],
    ambiance: ["Sportive", "Conviviale", "Animée", "Passion"],
    primaryTags: ["bar", "sport", "match", "écrans"],
    secondaryTags: ["géants", "retransmission", "pression", "supporters"],
    relatedTags: ["sportive", "conviviale", "animée", "passion"]
  },
  rooftop_bar: {
    label: "Rooftop / Bar panoramique",
    services: ["Vue panoramique", "Cocktails premium", "Terrasse", "Coucher de soleil"],
    ambiance: ["Romantique", "Exclusive", "Instagram", "Haut de gamme"],
    primaryTags: ["rooftop", "terrasse", "panoramique", "bar"],
    secondaryTags: ["vue", "coucher", "soleil", "premium"],
    relatedTags: ["romantique", "exclusive", "instagram", "haut"]
  },
  bar_karaoke: {
    label: "Bar karaoké",
    services: ["Cabines privées", "Playlist variée", "Micros", "Ambiance festive"],
    ambiance: ["Amusante", "Décontractée", "Entre amis", "Divertissement"],
    primaryTags: ["karaoké", "bar", "chanson", "cabines"],
    secondaryTags: ["privées", "playlist", "festive", "musique"],
    relatedTags: ["amusant", "décontracté", "entre amis", "divertissement"]
  },
  bar_bières: {
    label: "Bar à bières",
    services: ["Bières pression", "Tapas", "Planches", "Happy Hour"],
    ambiance: ["Décontractée", "Festive", "Entre amis", "Convivial"],
    primaryTags: ["bar", "bières", "pression", "belge"],
    secondaryTags: ["tapas", "planches", "happy hour", "terrasse"],
    relatedTags: ["amusant", "décontracté", "festif", "entre amis", "dj", "live", "sport"]
  },

  // 🍽️ Restaurants
  restaurant_gastronomique: {
    label: "Restaurant gastronomique",
    services: ["Menu dégustation", "Chef étoilé", "Accords mets-vins", "Service premium"],
    ambiance: ["Raffinée", "Exceptionnelle", "Haute cuisine", "Étoilée"],
    primaryTags: ["restaurant", "gastronomique", "chef", "étoilé"],
    secondaryTags: ["menu", "dégustation", "premium", "exceptionnel"],
    relatedTags: ["raffiné", "étoilée", "exceptionnelle", "haute cuisine"]
  },
  restaurant_traditionnel: {
    label: "Restaurant traditionnel",
    services: ["Cuisine française", "Produits régionaux", "Recettes familiales", "Terroir"],
    ambiance: ["Authentique", "Familiale", "Traditionnelle", "Chaleureuse"],
    primaryTags: ["restaurant", "traditionnel", "français", "terroir"],
    secondaryTags: ["cuisine", "traditionnelle", "produits", "régionaux"],
    relatedTags: ["authentique", "familiale", "terroir", "classique"]
  },
  restaurant_familial: {
    label: "Restaurant familial",
    services: ["Menu enfants", "Chaises hautes", "Animations", "Espace famille"],
    ambiance: ["Conviviale", "Décontractée", "Générations", "Chaleureuse"],
    primaryTags: ["restaurant", "familial", "enfant", "convivial"],
    secondaryTags: ["menu", "chaises", "hautes", "animations"],
    relatedTags: ["générations", "décontracté", "abordable", "chaleureux"]
  },
  bistrot: {
    label: "Bistrot de quartier",
    services: ["Plat du jour", "Prix doux", "Ambiance locale", "Ardoise"],
    ambiance: ["Authentique", "Simplicité", "Traditionnelle", "Conviviale"],
    primaryTags: ["bistrot", "quartier", "plat", "jour"],
    secondaryTags: ["ardoise", "prix", "doux", "locale"],
    relatedTags: ["authentique", "simplicité", "traditionnel", "convivial"]
  },

  // 🌍 Cuisines du monde
  restaurant_italien: {
    label: "Restaurant italien",
    services: ["Pizza au feu de bois", "Pâtes fraîches", "Antipasti", "Vins italiens"],
    ambiance: ["Méditerranéenne", "Conviviale", "Famiglia", "Italienne"],
    primaryTags: ["restaurant", "italien", "pizza", "pâtes"],
    secondaryTags: ["fraîches", "feu", "bois", "antipasti"],
    relatedTags: ["famiglia", "méditerranéenne", "conviviale", "italienne"]
  },
  restaurant_asiatique: {
    label: "Restaurant asiatique",
    services: ["Sushi frais", "Wok", "Dim sum", "Thé premium"],
    ambiance: ["Zen", "Exotique", "Moderne", "Épurée"],
    primaryTags: ["restaurant", "asiatique", "sushi", "wok"],
    secondaryTags: ["frais", "dim sum", "thé", "premium"],
    relatedTags: ["zen", "exotique", "moderne", "épurée"]
  },
  restaurant_oriental: {
    label: "Restaurant oriental",
    services: ["Couscous", "Tajines", "Thé à la menthe", "Pâtisseries orientales"],
    ambiance: ["Chaleureuse", "Conviviale", "Orientale", "Traditionnelle"],
    primaryTags: ["restaurant", "oriental", "couscous", "tajines"],
    secondaryTags: ["menthe", "pâtisseries", "orientales", "épices"],
    relatedTags: ["chaleureuse", "conviviale", "orientale", "traditionnel"]
  },

  // 🥙 Fast Food & Street Food
  kebab: {
    label: "Kebab",
    services: ["Viande grillée", "Sandwich", "Livraison", "Accessible"],
    ambiance: ["Décontractée", "Entre potes", "Street food", "Turque"],
    primaryTags: ["kebab", "sandwich", "viande", "grillée"],
    secondaryTags: ["livraison", "accessible", "rapide", "pratique"],
    relatedTags: ["décontracté", "entre potes", "street food", "turc"]
  },
  tacos_mexicain: {
    label: "Tacos mexicain",
    services: ["Guacamole", "Sauces piquantes", "Emporter", "Authentiques"],
    ambiance: ["Street food", "Décontractée", "Mexicaine", "Rapide"],
    primaryTags: ["tacos", "mexicain", "guacamole", "sauces"],
    secondaryTags: ["piquantes", "emporter", "authentiques", "épicé"],
    relatedTags: ["street food", "décontracté", "mexicaine", "rapide"]
  },
  burger: {
    label: "Burger house",
    services: ["Frites artisanales", "Milkshakes", "Ingrédients frais", "Maison"],
    ambiance: ["Américaine", "Gourmande", "Moderne", "Trendy"],
    primaryTags: ["burger", "house", "frites", "artisanales"],
    secondaryTags: ["maison", "milkshakes", "ingrédients", "frais"],
    relatedTags: ["américaine", "gourmande", "moderne", "trendy"]
  },
  pizzeria: {
    label: "Pizzeria",
    services: ["Pizza au feu de bois", "Pâte maison", "Livraison", "Emporter"],
    ambiance: ["Italienne", "Conviviale", "Rapide", "Familiale"],
    primaryTags: ["pizzeria", "pizza", "feu", "bois"],
    secondaryTags: ["pâte", "maison", "livraison", "emporter"],
    relatedTags: ["italienne", "conviviale", "rapide", "familiale"]
  },

  // 🎉 Sorties nocturnes
  discotheque: {
    label: "Discothèque",
    services: ["Piste de danse", "DJ", "Bar", "Vestiaire"],
    ambiance: ["Festive", "Dansante", "Club", "Musique"],
    primaryTags: ["discothèque", "danse", "dj", "piste"],
    secondaryTags: ["bar", "vestiaire", "nocturne", "énergique"],
    relatedTags: ["festive", "dansante", "club", "musique"]
  },
  club_techno: {
    label: "Club techno",
    services: ["Sound system", "DJ internationaux", "Lights show", "Électro"],
    ambiance: ["Underground", "Intense", "Rave", "Électronique"],
    primaryTags: ["club", "techno", "électro", "sound"],
    secondaryTags: ["system", "dj", "internationaux", "lights"],
    relatedTags: ["underground", "intense", "rave", "électronique"]
  },
  boite_nuit_mainstream: {
    label: "Boîte de nuit mainstream",
    services: ["Hits du moment", "Cocktails thématiques", "Jeune", "Commerciale"],
    ambiance: ["Commerciale", "Accessible", "Populaire", "Festive"],
    primaryTags: ["boîte", "nuit", "mainstream", "hits"],
    secondaryTags: ["moment", "jeune", "cocktails", "thématiques"],
    relatedTags: ["commerciale", "accessible", "populaire", "festive"]
  },

  // 🎯 Sports & Activités
  bowling: {
    label: "Bowling",
    services: ["Pistes", "Chaussures location", "Snack", "Anniversaires"],
    ambiance: ["Amusante", "Décontractée", "Sport", "Loisir"],
    primaryTags: ["bowling", "pistes", "chaussures", "location"],
    secondaryTags: ["snack", "anniversaires", "compétition", "famille"],
    relatedTags: ["amusant", "décontracté", "sport", "loisir"]
  },
  billard_americain: {
    label: "Billard américain",
    services: ["Tables", "Queues", "Billes", "Tournois"],
    ambiance: ["Précision", "Stratégie", "Décontractée", "Loisir"],
    primaryTags: ["billard", "américain", "billes", "queue"],
    secondaryTags: ["tables", "tournois", "compétition", "sport"],
    relatedTags: ["précision", "stratégie", "décontracté", "loisir"]
  },
  billard_francais: {
    label: "Billard français",
    services: ["Tables", "Queues", "Carambole", "Tournois"],
    ambiance: ["Précision", "Stratégie", "Traditionnelle", "Loisir"],
    primaryTags: ["billard", "français", "carambole", "blanche"],
    secondaryTags: ["tables", "tournois", "compétition", "sport"],
    relatedTags: ["précision", "stratégie", "traditionnel", "loisir"]
  },
  escape_game_horreur: {
    label: "Escape game horreur",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Adrénaline", "Immersive", "Énigme", "Groupe"],
    primaryTags: ["escape game", "horreur", "salles", "thématiques"],
    secondaryTags: ["frissons", "team building", "réservation", "challenge"],
    relatedTags: ["adrénaline", "immersive", "énigme", "groupe"]
  },
  futsal: {
    label: "Futsal",
    services: ["Terrain couvert", "Équipement", "Matchs", "Tournois"],
    ambiance: ["Compétitive", "Équipe", "Technique", "Football"],
    primaryTags: ["futsal", "football", "terrain", "couvert"],
    secondaryTags: ["équipement", "matchs", "tournois", "sport"],
    relatedTags: ["compétitif", "équipe", "technique", "football"]
  },
  karting: {
    label: "Karting",
    services: ["Circuit", "Karts", "Chronométrage", "Compétition"],
    ambiance: ["Adrénaline", "Vitesse", "Mécanique", "Loisir"],
    primaryTags: ["karting", "circuit", "vitesse", "course"],
    secondaryTags: ["karts", "chronométrage", "compétition", "adrénaline"],
    relatedTags: ["sport", "mécanique", "vitesse", "loisir"]
  },
  laser_game: {
    label: "Laser game",
    services: ["Salles thématiques", "Équipement laser", "Réservation", "Challenge"],
    ambiance: ["Stratégie", "Groupe", "Amusante", "Compétitive"],
    primaryTags: ["laser game", "laser", "tactique", "équipe"],
    secondaryTags: ["salles", "thématiques", "réservation", "challenge"],
    relatedTags: ["stratégie", "groupe", "amusant", "compétitif"]
  },
  vr_experience: {
    label: "VR Experience",
    services: ["Casques VR", "Expériences immersives", "Technologie", "Nouveau"],
    ambiance: ["Futuriste", "Découverte", "Originale", "Innovante"],
    primaryTags: ["vr", "réalité", "virtuelle", "casque"],
    secondaryTags: ["expérience", "immersive", "technologie", "nouveau"],
    relatedTags: ["futuriste", "découverte", "original", "innovant"]
  },

  // ❓ Autres
  autre: {
    label: "Autre activité",
    services: ["Spécialité unique", "Original", "Insolite", "Créatif"],
    ambiance: ["Surprenante", "Différente", "Nouvelle", "Découverte"],
    primaryTags: ["autre", "activité", "spécialité", "unique"],
    secondaryTags: ["définir", "original", "insolite", "créatif"],
    relatedTags: ["surprenant", "différent", "nouveau", "découverte"]
  }
};

/**
 * Fonction pour obtenir les informations complètes d'une activité
 */
export function getActivityInfo(activityKey: string): ActivityInfo | null {
  return ACTIVITY_INFO[activityKey] || null;
}

/**
 * Fonction pour obtenir toutes les activités groupées
 */
export function getGroupedActivities() {
  const groups = {
    "🍹 Bars & Boissons": [
      "bar_ambiance", "pub_traditionnel", "brasserie_artisanale", "bar_cocktails",
      "bar_vins", "bar_sports", "rooftop_bar", "bar_karaoke", "bar_bières"
    ],
    "🍽️ Restaurants": [
      "restaurant_gastronomique", "restaurant_traditionnel", "restaurant_familial", "bistrot"
    ],
    "🌍 Cuisines du monde": [
      "restaurant_italien", "restaurant_asiatique", "restaurant_oriental"
    ],
    "🥙 Fast Food & Street Food": [
      "kebab", "tacos_mexicain", "burger", "pizzeria"
    ],
    "🎉 Sorties nocturnes": [
      "discotheque", "club_techno", "boite_nuit_mainstream"
    ],
    "🎯 Sports & Activités": [
      "bowling", "billard_americain", "billard_francais", "escape_game_horreur",
      "futsal", "karting", "laser_game", "vr_experience"
    ],
    "❓ Autres": [
      "autre"
    ]
  };

  return groups;
}
