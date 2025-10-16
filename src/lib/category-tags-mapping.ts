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
  
  // 🍹 NOUVEAUX TYPES DE BARS - Système hiérarchique amélioré
  bar_jus_smoothies: {
    primaryTags: ["bar", "jus", "smoothies", "fruits", "healthy"],
    secondaryTags: ["frais", "naturel", "vitamines", "détox", "boisson"],
    relatedTags: ["santé", "léger", "rafraîchissant", "matin", "après-sport"]
  },
  bar_tapas: {
    primaryTags: ["bar", "tapas", "espagnol", "petites", "assiettes"],
    secondaryTags: ["partage", "convivial", "sangria", "jambon", "fromage"],
    relatedTags: ["apéro", "entre amis", "dégustation", "méditerranéen", "chaleureux"]
  },
  bar_lounge: {
    primaryTags: ["bar", "lounge", "détente", "confortable", "sofa"],
    secondaryTags: ["musique", "douce", "intimiste", "chic", "élégant"],
    relatedTags: ["relaxation", "sophistiqué", "rendez-vous", "calme", "premium"]
  },
  bar_plage: {
    primaryTags: ["bar", "plage", "bord", "mer", "sable"],
    secondaryTags: ["cocktails", "tropical", "été", "vue", "mer"],
    relatedTags: ["vacances", "détente", "soleil", "pieds", "nus", "relax"]
  },
  bar_rooftop: {
    primaryTags: ["bar", "rooftop", "terrasse", "hauteur", "vue"],
    secondaryTags: ["panoramique", "coucher", "soleil", "premium", "exclusif"],
    relatedTags: ["romantique", "instagram", "haut", "vue", "ville", "élégant"]
  },
  bar_brasserie: {
    primaryTags: ["bar", "brasserie", "bière", "artisanale", "locale"],
    secondaryTags: ["dégustation", "houblon", "malt", "craft", "traditionnel"],
    relatedTags: ["authentique", "terroir", "découverte", "artisanal", "convivial"]
  },
  bar_whisky: {
    primaryTags: ["bar", "whisky", "scotch", "bourbon", "spécialisé"],
    secondaryTags: ["dégustation", "collection", "expert", "premium", "raffiné"],
    relatedTags: ["sophistiqué", "connaisseur", "intimiste", "élégant", "traditionnel"]
  },
  bar_rhum: {
    primaryTags: ["bar", "rhum", "caraïbes", "tropical", "cocktails"],
    secondaryTags: ["mojito", "daiquiri", "coco", "exotique", "chaud"],
    relatedTags: ["vacances", "détente", "tropical", "festif", "coloré"]
  },
  bar_gin: {
    primaryTags: ["bar", "gin", "tonic", "botaniques", "spécialisé"],
    secondaryTags: ["cocktails", "signature", "premium", "rafraîchissant", "sophistiqué"],
    relatedTags: ["élégant", "moderne", "créatif", "délicat", "trendy"]
  },
  bar_tequila: {
    primaryTags: ["bar", "tequila", "mexicain", "margarita", "agave"],
    secondaryTags: ["cocktails", "épicé", "chaud", "festif", "authentique"],
    relatedTags: ["mexicain", "coloré", "amusant", "entre amis", "décontracté"]
  },
  bar_champagne: {
    primaryTags: ["bar", "champagne", "bulles", "mousseux", "célébration"],
    secondaryTags: ["premium", "élégant", "sophistiqué", "fête", "spécial"],
    relatedTags: ["luxe", "romantique", "anniversaire", "réussite", "raffiné"]
  },
  bar_apéritif: {
    primaryTags: ["bar", "apéritif", "apéro", "avant", "repas"],
    secondaryTags: ["convivial", "partage", "petites", "assiettes", "détente"],
    relatedTags: ["entre amis", "chaleureux", "décontracté", "traditionnel", "famille"]
  },
  bar_afterwork: {
    primaryTags: ["bar", "afterwork", "travail", "bureau", "soirée"],
    secondaryTags: ["collègues", "détente", "happy hour", "convivial", "professionnel"],
    relatedTags: ["réseautage", "décompression", "collaboration", "moderne", "urbain"]
  },
  bar_brunch: {
    primaryTags: ["bar", "brunch", "weekend", "matin", "déjeuner"],
    secondaryTags: ["œufs", "benedict", "pancakes", "mimosa", "détente"],
    relatedTags: ["famille", "paresseux", "gourmand", "chaleureux", "dominical"]
  },
  bar_glacé: {
    primaryTags: ["bar", "glacé", "glace", "dessert", "sucré"],
    secondaryTags: ["parfums", "cônes", "sundae", "milkshake", "gourmandise"],
    relatedTags: ["enfants", "famille", "été", "rafraîchissant", "amusant"]
  },
  bar_healthy: {
    primaryTags: ["bar", "healthy", "santé", "bio", "naturel"],
    secondaryTags: ["smoothies", "détox", "vitamines", "légumes", "fruits"],
    relatedTags: ["bien-être", "sport", "léger", "pur", "équilibré"]
  },
  bar_vegan: {
    primaryTags: ["bar", "vegan", "végétal", "sans", "animal"],
    secondaryTags: ["bio", "naturel", "éthique", "responsable", "alternatif"],
    relatedTags: ["écologique", "conscient", "moderne", "sain", "engagé"]
  },
  bar_gluten_free: {
    primaryTags: ["bar", "sans", "gluten", "intolérance", "allergie"],
    secondaryTags: ["sans", "blé", "alternatif", "santé", "spécialisé"],
    relatedTags: ["précaution", "inclusif", "attention", "soin", "adapté"]
  },
  bar_halal: {
    primaryTags: ["bar", "halal", "musulman", "islamique", "religieux"],
    secondaryTags: ["sans", "alcool", "respectueux", "traditionnel", "culturel"],
    relatedTags: ["communauté", "respect", "diversité", "inclusif", "culturel"]
  },
  bar_kosher: {
    primaryTags: ["bar", "kosher", "juif", "religieux", "traditionnel"],
    secondaryTags: ["respectueux", "culturel", "communauté", "tradition", "spirituel"],
    relatedTags: ["religieux", "respect", "diversité", "inclusif", "culturel"]
  },
  bar_jeux: {
    primaryTags: ["bar", "jeux", "pétanque", "fléchettes", "billard", "arcade"],
    secondaryTags: ["baby-foot", "ping-pong", "intérieur", "divertissement", "ludique"],
    relatedTags: ["amis", "famille", "soirée", "détente", "compétition", "boissons", "snacks", "ambiance", "convivialité", "loisirs"]
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

  // 🌏 CUISINES ASIATIQUES SPÉCIFIQUES
  restaurant_chinois: {
    primaryTags: ["restaurant", "chinois", "cantonais", "dim sum"],
    secondaryTags: ["wok", "nems", "canard", "laqué", "riz"],
    relatedTags: ["traditionnel", "familial", "convivial", "authentique"]
  },
  restaurant_japonais: {
    primaryTags: ["restaurant", "japonais", "sushi", "sashimi"],
    secondaryTags: ["maki", "tempura", "ramen", "yakitori", "saké"],
    relatedTags: ["zen", "raffiné", "frais", "traditionnel", "artisanal"]
  },
  restaurant_thai: {
    primaryTags: ["restaurant", "thaïlandais", "thaï", "pad", "thai"],
    secondaryTags: ["curry", "coco", "épicé", "basilic", "citronnelle"],
    relatedTags: ["exotique", "épicé", "parfumé", "équilibré", "coloré"]
  },
  restaurant_vietnamien: {
    primaryTags: ["restaurant", "vietnamien", "pho", "nems", "vietnam"],
    secondaryTags: ["bouillon", "herbes", "frais", "baguette", "vietnamienne"],
    relatedTags: ["frais", "léger", "herbacé", "authentique", "sain"]
  },
  restaurant_coreen: {
    primaryTags: ["restaurant", "coréen", "corée", "kimchi", "bulgogi"],
    secondaryTags: ["barbecue", "coréen", "fermenté", "épicé", "traditionnel"],
    relatedTags: ["fermenté", "épicé", "traditionnel", "unique", "découverte"]
  },

  // 🕌 CUISINES DU MOYEN-ORIENT
  restaurant_indien: {
    primaryTags: ["restaurant", "indien", "curry", "tandoor", "indien"],
    secondaryTags: ["naan", "biryani", "épices", "végétarien", "tikka"],
    relatedTags: ["épicé", "parfumé", "végétarien", "traditionnel", "coloré"]
  },
  restaurant_libanais: {
    primaryTags: ["restaurant", "libanais", "mezze", "houmous", "liban"],
    secondaryTags: ["falafel", "taboulé", "kebab", "moutabal", "pita"],
    relatedTags: ["partage", "convivial", "méditerranéen", "frais", "authentique"]
  },
  restaurant_turc: {
    primaryTags: ["restaurant", "turc", "kebab", "döner", "turquie"],
    secondaryTags: ["pide", "lahmacun", "ayran", "baklava", "turkish"],
    relatedTags: ["oriental", "épicé", "traditionnel", "convivial", "authentique"]
  },
  restaurant_grec: {
    primaryTags: ["restaurant", "grec", "moussaka", "souvlaki", "grèce"],
    secondaryTags: ["tzatziki", "feta", "olives", "ouzo", "grecque"],
    relatedTags: ["méditerranéen", "frais", "convivial", "traditionnel", "familial"]
  },

  // 🇪🇺 CUISINES EUROPÉENNES
  restaurant_espagnol: {
    primaryTags: ["restaurant", "espagnol", "paella", "tapas", "espagne"],
    secondaryTags: ["jambon", "chorizo", "sangria", "gazpacho", "espagnole"],
    relatedTags: ["méditerranéen", "convivial", "partage", "chaleureux", "festif"]
  },
  restaurant_portugais: {
    primaryTags: ["restaurant", "portugais", "bacalhau", "pasteis", "portugal"],
    secondaryTags: ["porto", "sardines", "portugaise", "traditionnel", "océan"],
    relatedTags: ["océan", "traditionnel", "authentique", "familial", "découverte"]
  },
  restaurant_allemand: {
    primaryTags: ["restaurant", "allemand", "choucroute", "wurst", "allemagne"],
    secondaryTags: ["bière", "pretzel", "schnitzel", "allemande", "traditionnel"],
    relatedTags: ["traditionnel", "copieux", "convivial", "authentique", "familial"]
  },
  restaurant_russe: {
    primaryTags: ["restaurant", "russe", "borsch", "vodka", "russie"],
    secondaryTags: ["caviar", "blinis", "russe", "traditionnel", "festif"],
    relatedTags: ["traditionnel", "festif", "authentique", "découverte", "unique"]
  },

  // 🌍 CUISINES AFRICAINES
  restaurant_marocain: {
    primaryTags: ["restaurant", "marocain", "tajine", "couscous", "maroc"],
    secondaryTags: ["menthe", "épices", "marocaine", "traditionnel", "oriental"],
    relatedTags: ["épicé", "parfumé", "traditionnel", "chaleureux", "exotique"]
  },
  restaurant_ethiopien: {
    primaryTags: ["restaurant", "éthiopien", "injera", "wot", "éthiopie"],
    secondaryTags: ["épicé", "fermenté", "éthiopienne", "traditionnel", "unique"],
    relatedTags: ["unique", "épicé", "traditionnel", "découverte", "authentique"]
  },

  // 🌎 CUISINES AMÉRICAINES
  restaurant_brasilien: {
    primaryTags: ["restaurant", "brésilien", "feijoada", "caipirinha", "brésil"],
    secondaryTags: ["churrasco", "brésilienne", "tropical", "festif", "convivial"],
    relatedTags: ["tropical", "festif", "convivial", "coloré", "découverte"]
  },
  restaurant_peruvien: {
    primaryTags: ["restaurant", "péruvien", "ceviche", "pisco", "pérou"],
    secondaryTags: ["quinoa", "péruvienne", "andine", "traditionnel", "unique"],
    relatedTags: ["unique", "traditionnel", "découverte", "authentique", "exotique"]
  },
  restaurant_mexicain: {
    primaryTags: ["restaurant", "mexicain", "tacos", "burritos", "mexique"],
    secondaryTags: ["guacamole", "jalapeños", "tequila", "mexicaine", "épicé"],
    relatedTags: ["épicé", "coloré", "festif", "convivial", "authentique"]
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
  roller_indoor: {
    primaryTags: ["roller", "patin", "piste", "indoor"],
    secondaryTags: ["anniversaires", "location", "équipements", "famille"],
    relatedTags: ["urbain", "fun", "sport", "glisse"]
  },
  moto_electrique_indoor: {
    primaryTags: ["moto", "électrique", "circuit", "indoor"],
    secondaryTags: ["sensations", "karting", "piste", "location"],
    relatedTags: ["adrénaline", "innovant", "protection", "activité"]
  },
  // 🎯 ESCAPE GAMES - Système hiérarchique amélioré
  escape_game: {
    primaryTags: ["escape game", "énigmes", "salles", "thématiques"],
    secondaryTags: ["team building", "réservation", "challenge", "groupe"],
    relatedTags: ["immersive", "énigme", "aventure", "mystère", "famille"]
  },
  escape_game_horreur: {
    primaryTags: ["escape game", "horreur", "frissons", "adrénaline"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["effrayant", "immersive", "énigme", "groupe", "adultes"]
  },
  escape_game_aventure: {
    primaryTags: ["escape game", "aventure", "pirate", "trésor"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["exploration", "immersive", "énigme", "famille", "enfants"]
  },
  escape_game_mystere: {
    primaryTags: ["escape game", "mystère", "enquête", "détective"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["logique", "immersive", "énigme", "groupe", "intellectuel"]
  },
  escape_game_sf: {
    primaryTags: ["escape game", "science-fiction", "futuriste", "technologie"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["space", "immersive", "énigme", "groupe", "innovant"]
  },
  escape_game_fantasy: {
    primaryTags: ["escape game", "fantasy", "magie", "médiéval"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["sorcier", "immersive", "énigme", "famille", "imaginaire"]
  },
  escape_game_familial: {
    primaryTags: ["escape game", "familial", "enfant", "doux"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["éducatif", "immersive", "énigme", "famille", "tous âges"]
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

  // 👶 ENFANTS & FAMILLE - Activités et établissements pour enfants
  trampoline_parc: {
    primaryTags: ["trampoline", "parc", "enfants", "saut", "rebond"],
    secondaryTags: ["famille", "loisir", "sport", "fun", "activité"],
    relatedTags: ["enfants", "amusant", "énergique", "défoulement", "groupe"]
  },
  parc_loisirs_enfants: {
    primaryTags: ["parc", "loisirs", "enfants", "jeux", "famille"],
    secondaryTags: ["attractions", "manèges", "animations", "anniversaires", "groupe"],
    relatedTags: ["enfants", "famille", "amusant", "coloré", "diversion"]
  },
  centre_aquatique: {
    primaryTags: ["centre", "aquatique", "piscine", "enfants", "eau"],
    secondaryTags: ["toboggans", "jeux", "eau", "apprentissage", "natation"],
    relatedTags: ["rafraîchissant", "famille", "sport", "détente", "sécurisé"]
  },
  parc_aventure_enfants: {
    primaryTags: ["parc", "aventure", "enfants", "accrobranche", "tyrolienne"],
    secondaryTags: ["nature", "défi", "sécurisé", "moniteur", "famille"],
    relatedTags: ["nature", "défi", "enfants", "sécurisé", "moniteur"]
  },
  ludotheque: {
    primaryTags: ["ludothèque", "jeux", "enfants", "jouets", "bibliothèque"],
    secondaryTags: ["prêt", "jeux", "société", "éducatif", "famille"],
    relatedTags: ["éducatif", "calme", "intellectuel", "famille", "découverte"]
  },
  centre_loisirs_enfants: {
    primaryTags: ["centre", "loisirs", "enfants", "activités", "garde"],
    secondaryTags: ["mercredi", "vacances", "ateliers", "animations", "groupe"],
    relatedTags: ["garde", "éducatif", "social", "divers", "encadré"]
  },
  ferme_pedagogique: {
    primaryTags: ["ferme", "pédagogique", "animaux", "enfants", "nature"],
    secondaryTags: ["découverte", "éducatif", "contact", "animaux", "famille"],
    relatedTags: ["nature", "éducatif", "découverte", "famille", "authentique"]
  },
  musee_enfants: {
    primaryTags: ["musée", "enfants", "interactif", "découverte", "éducatif"],
    secondaryTags: ["ateliers", "expositions", "jeux", "apprentissage", "famille"],
    relatedTags: ["culturel", "éducatif", "interactif", "découverte", "intellectuel"]
  },
  parc_theme_enfants: {
    primaryTags: ["parc", "thème", "enfants", "attractions", "spectacles"],
    secondaryTags: ["personnages", "magie", "fantaisie", "anniversaires", "famille"],
    relatedTags: ["magique", "fantaisie", "enfants", "spectacle", "mémorable"]
  },
  centre_sportif_enfants: {
    primaryTags: ["centre", "sportif", "enfants", "gymnastique", "sport"],
    secondaryTags: ["cours", "compétition", "entraînement", "moniteur", "groupe"],
    relatedTags: ["sport", "discipline", "groupe", "entraînement", "compétition"]
  },
  atelier_creatif_enfants: {
    primaryTags: ["atelier", "créatif", "enfants", "art", "manuel"],
    secondaryTags: ["peinture", "bricolage", "création", "artistique", "groupe"],
    relatedTags: ["créatif", "artistique", "manuel", "expression", "découverte"]
  },
  parc_jeux_interieur: {
    primaryTags: ["parc", "jeux", "intérieur", "enfants", "aire"],
    secondaryTags: ["toboggans", "tunnels", "balles", "sécurisé", "famille"],
    relatedTags: ["intérieur", "sécurisé", "amusant", "famille", "défoulement"]
  },
  mini_golf: {
    primaryTags: ["mini", "golf", "enfants", "famille", "loisir"],
    secondaryTags: ["parcours", "balle", "club", "score", "compétition"],
    relatedTags: ["précision", "famille", "calme", "technique", "loisir"]
  },
  parc_attractions_familial: {
    primaryTags: ["parc", "attractions", "familial", "manèges", "loisir"],
    secondaryTags: ["tous", "âges", "famille", "divers", "amusant"],
    relatedTags: ["universel", "famille", "divers", "amusant", "mémorable"]
  },
  centre_anniversaires: {
    primaryTags: ["centre", "anniversaires", "enfants", "fête", "organisation"],
    secondaryTags: ["animation", "gâteau", "cadeaux", "groupe", "mémorable"],
    relatedTags: ["fête", "célébration", "groupe", "mémorable", "spécial"]
  },
  parc_animalier: {
    primaryTags: ["parc", "animalier", "animaux", "enfants", "nature"],
    secondaryTags: ["découverte", "sauvage", "domestique", "famille", "éducatif"],
    relatedTags: ["nature", "découverte", "éducatif", "famille", "authentique"]
  },
  parc_plage_enfants: {
    primaryTags: ["parc", "plage", "enfants", "sable", "eau"],
    secondaryTags: ["châteaux", "sable", "jeux", "eau", "famille"],
    relatedTags: ["plage", "sable", "eau", "famille", "été"]
  },
  centre_equitation_enfants: {
    primaryTags: ["centre", "équitation", "enfants", "cheval", "poney"],
    secondaryTags: ["monte", "soins", "nature", "responsabilité", "famille"],
    relatedTags: ["nature", "responsabilité", "sport", "animal", "découverte"]
  },
  parc_skate_enfants: {
    primaryTags: ["parc", "skate", "enfants", "planche", "roues"],
    secondaryTags: ["rampes", "tricks", "sécurité", "groupe", "sport"],
    relatedTags: ["sport", "adrénaline", "groupe", "technique", "urbain"]
  },
  centre_cirque_enfants: {
    primaryTags: ["centre", "cirque", "enfants", "acrobatie", "art"],
    secondaryTags: ["jonglage", "équilibre", "souplesse", "spectacle", "groupe"],
    relatedTags: ["artistique", "acrobatie", "spectacle", "groupe", "créatif"]
  },

  // 🎪 Parcs de loisir indoor
  parc_loisir_indoor: {
    primaryTags: ["parc", "loisir", "indoor", "jeux", "famille", "enfants"],
    secondaryTags: ["ludique", "intérieur", "centre", "espace", "salle", "factory"],
    relatedTags: ["divertissement", "amusement", "convivial", "groupe", "fun"]
  },

  // 🎵 Blind Test & Quiz
  blind_test: {
    primaryTags: ["blind test", "musique", "quiz", "salle", "entre amis"],
    secondaryTags: ["chanson", "deviner", "équipe", "compétition", "amusant"],
    relatedTags: ["musical", "décontracté", "groupe", "festif", "interactif"]
  },
  
  // 🏢 TYPES GÉNÉRIQUES AMÉLIORÉS (pour l'interface admin)
  restaurant_general: {
    primaryTags: ["restaurant", "cuisine", "manger", "repas"],
    secondaryTags: ["gastronomique", "traditionnel", "familial", "bistrot"],
    relatedTags: ["général", "non-spécifique", "à-préciser"]
  },
  bar_general: {
    primaryTags: ["bar", "boisson", "alcool", "convivial"],
    secondaryTags: ["cocktails", "bière", "vin", "apéritif"],
    relatedTags: ["général", "non-spécifique", "à-préciser"]
  },
  quiz_room: {
    primaryTags: ["quiz", "room", "questions", "culture", "général"],
    secondaryTags: ["salle", "équipe", "compétition", "savoir", "amusant"],
    relatedTags: ["intellectuel", "groupe", "défi", "connaissance", "interactif"]
  },
  salle_jeux_amis: {
    primaryTags: ["salle", "jeux", "amis", "groupe", "multiactivité"],
    secondaryTags: ["blind test", "quiz", "karaoké", "jeux société", "divertissement"],
    relatedTags: ["convivial", "entre amis", "festif", "décontracté", "amusant"]
  },
  complexe_multiactivites: {
    primaryTags: ["centre", "multiactivité", "salles", "jeux", "groupe"],
    secondaryTags: ["blind test", "quiz", "escape game", "karaoké", "bowling"],
    relatedTags: ["diversifié", "entre amis", "famille", "entreprise", "anniversaire"]
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

  // 🍹 NOUVEAUX TYPES DE BARS - Informations complètes
  bar_jus_smoothies: {
    label: "Bar à jus et smoothies",
    services: ["Jus frais", "Smoothies", "Boissons healthy", "Détox"],
    ambiance: ["Saine", "Rafraîchissante", "Légère", "Énergisante"],
    primaryTags: ["bar", "jus", "smoothies", "fruits", "healthy"],
    secondaryTags: ["frais", "naturel", "vitamines", "détox", "boisson"],
    relatedTags: ["santé", "léger", "rafraîchissant", "matin", "après-sport"]
  },
  bar_tapas: {
    label: "Bar tapas",
    services: ["Petites assiettes", "Sangria", "Partage", "Apéritifs"],
    ambiance: ["Conviviale", "Méditerranéenne", "Chaleureuse", "Partage"],
    primaryTags: ["bar", "tapas", "espagnol", "petites", "assiettes"],
    secondaryTags: ["partage", "convivial", "sangria", "jambon", "fromage"],
    relatedTags: ["apéro", "entre amis", "dégustation", "méditerranéen", "chaleureux"]
  },
  bar_lounge: {
    label: "Bar lounge",
    services: ["Cocktails", "Sofas", "Musique douce", "Ambiance intimiste"],
    ambiance: ["Détendue", "Sophistiquée", "Intimiste", "Élégante"],
    primaryTags: ["bar", "lounge", "détente", "confortable", "sofa"],
    secondaryTags: ["musique", "douce", "intimiste", "chic", "élégant"],
    relatedTags: ["relaxation", "sophistiqué", "rendez-vous", "calme", "premium"]
  },
  bar_plage: {
    label: "Bar de plage",
    services: ["Cocktails tropicaux", "Vue sur mer", "Pieds dans le sable", "Détente"],
    ambiance: ["Tropicale", "Détendue", "Vacances", "Soleil"],
    primaryTags: ["bar", "plage", "bord", "mer", "sable"],
    secondaryTags: ["cocktails", "tropical", "été", "vue", "mer"],
    relatedTags: ["vacances", "détente", "soleil", "pieds", "nus", "relax"]
  },
  bar_rooftop: {
    label: "Bar rooftop",
    services: ["Vue panoramique", "Cocktails premium", "Terrasse", "Coucher de soleil"],
    ambiance: ["Exclusive", "Romantique", "Élégante", "Panoramique"],
    primaryTags: ["bar", "rooftop", "terrasse", "hauteur", "vue"],
    secondaryTags: ["panoramique", "coucher", "soleil", "premium", "exclusif"],
    relatedTags: ["romantique", "instagram", "haut", "vue", "ville", "élégant"]
  },
  bar_brasserie: {
    label: "Bar brasserie",
    services: ["Bières artisanales", "Dégustation", "Produits locaux", "Visite"],
    ambiance: ["Authentique", "Traditionnelle", "Conviviale", "Artisanale"],
    primaryTags: ["bar", "brasserie", "bière", "artisanale", "locale"],
    secondaryTags: ["dégustation", "houblon", "malt", "craft", "traditionnel"],
    relatedTags: ["authentique", "terroir", "découverte", "artisanal", "convivial"]
  },
  bar_whisky: {
    label: "Bar à whisky",
    services: ["Collection whisky", "Dégustation", "Expert conseil", "Premium"],
    ambiance: ["Sophistiquée", "Intimiste", "Élégante", "Traditionnelle"],
    primaryTags: ["bar", "whisky", "scotch", "bourbon", "spécialisé"],
    secondaryTags: ["dégustation", "collection", "expert", "premium", "raffiné"],
    relatedTags: ["sophistiqué", "connaisseur", "intimiste", "élégant", "traditionnel"]
  },
  bar_rhum: {
    label: "Bar à rhum",
    services: ["Cocktails tropicaux", "Rhum premium", "Ambiance caraïbes", "Exotique"],
    ambiance: ["Tropicale", "Festive", "Colorée", "Exotique"],
    primaryTags: ["bar", "rhum", "caraïbes", "tropical", "cocktails"],
    secondaryTags: ["mojito", "daiquiri", "coco", "exotique", "chaud"],
    relatedTags: ["vacances", "détente", "tropical", "festif", "coloré"]
  },
  bar_gin: {
    label: "Bar à gin",
    services: ["Gin premium", "Tonic", "Cocktails signature", "Botaniques"],
    ambiance: ["Élégante", "Moderne", "Créative", "Sophistiquée"],
    primaryTags: ["bar", "gin", "tonic", "botaniques", "spécialisé"],
    secondaryTags: ["cocktails", "signature", "premium", "rafraîchissant", "sophistiqué"],
    relatedTags: ["élégant", "moderne", "créatif", "délicat", "trendy"]
  },
  bar_tequila: {
    label: "Bar à tequila",
    services: ["Tequila premium", "Margaritas", "Cocktails mexicains", "Authentique"],
    ambiance: ["Mexicaine", "Colorée", "Festive", "Décontractée"],
    primaryTags: ["bar", "tequila", "mexicain", "margarita", "agave"],
    secondaryTags: ["cocktails", "épicé", "chaud", "festif", "authentique"],
    relatedTags: ["mexicain", "coloré", "amusant", "entre amis", "décontracté"]
  },
  bar_champagne: {
    label: "Bar à champagne",
    services: ["Champagne premium", "Bulles", "Célébrations", "Élégance"],
    ambiance: ["Luxueuse", "Sophistiquée", "Romantique", "Exclusive"],
    primaryTags: ["bar", "champagne", "bulles", "mousseux", "célébration"],
    secondaryTags: ["premium", "élégant", "sophistiqué", "fête", "spécial"],
    relatedTags: ["luxe", "romantique", "anniversaire", "réussite", "raffiné"]
  },
  bar_apéritif: {
    label: "Bar apéritif",
    services: ["Apéritifs", "Petites assiettes", "Partage", "Convivialité"],
    ambiance: ["Conviviale", "Chaleureuse", "Décontractée", "Traditionnelle"],
    primaryTags: ["bar", "apéritif", "apéro", "avant", "repas"],
    secondaryTags: ["convivial", "partage", "petites", "assiettes", "détente"],
    relatedTags: ["entre amis", "chaleureux", "décontracté", "traditionnel", "famille"]
  },
  bar_afterwork: {
    label: "Bar afterwork",
    services: ["Happy hour", "Réseautage", "Détente", "Professionnel"],
    ambiance: ["Moderne", "Urbaine", "Conviviale", "Professionnelle"],
    primaryTags: ["bar", "afterwork", "travail", "bureau", "soirée"],
    secondaryTags: ["collègues", "détente", "happy hour", "convivial", "professionnel"],
    relatedTags: ["réseautage", "décompression", "collaboration", "moderne", "urbain"]
  },
  bar_brunch: {
    label: "Bar brunch",
    services: ["Brunch weekend", "Œufs Benedict", "Pancakes", "Mimosa"],
    ambiance: ["Chaleureuse", "Familiale", "Détendue", "Dominicale"],
    primaryTags: ["bar", "brunch", "weekend", "matin", "déjeuner"],
    secondaryTags: ["œufs", "benedict", "pancakes", "mimosa", "détente"],
    relatedTags: ["famille", "paresseux", "gourmand", "chaleureux", "dominical"]
  },
  bar_glacé: {
    label: "Bar glacé",
    services: ["Glaces artisanales", "Sundae", "Milkshakes", "Desserts"],
    ambiance: ["Amusante", "Familiale", "Rafraîchissante", "Gourmande"],
    primaryTags: ["bar", "glacé", "glace", "dessert", "sucré"],
    secondaryTags: ["parfums", "cônes", "sundae", "milkshake", "gourmandise"],
    relatedTags: ["enfants", "famille", "été", "rafraîchissant", "amusant"]
  },
  bar_healthy: {
    label: "Bar healthy",
    services: ["Smoothies", "Jus détox", "Boissons naturelles", "Bien-être"],
    ambiance: ["Saine", "Énergisante", "Pure", "Équilibrée"],
    primaryTags: ["bar", "healthy", "santé", "bio", "naturel"],
    secondaryTags: ["smoothies", "détox", "vitamines", "légumes", "fruits"],
    relatedTags: ["bien-être", "sport", "léger", "pur", "équilibré"]
  },
  bar_vegan: {
    label: "Bar vegan",
    services: ["Boissons végétales", "Alternatives", "Bio", "Éthique"],
    ambiance: ["Consciente", "Moderne", "Engagée", "Responsable"],
    primaryTags: ["bar", "vegan", "végétal", "sans", "animal"],
    secondaryTags: ["bio", "naturel", "éthique", "responsable", "alternatif"],
    relatedTags: ["écologique", "conscient", "moderne", "sain", "engagé"]
  },
  bar_gluten_free: {
    label: "Bar sans gluten",
    services: ["Boissons sans gluten", "Alternatives", "Précaution", "Spécialisé"],
    ambiance: ["Attentionnée", "Inclusive", "Soignée", "Adaptée"],
    primaryTags: ["bar", "sans", "gluten", "intolérance", "allergie"],
    secondaryTags: ["sans", "blé", "alternatif", "santé", "spécialisé"],
    relatedTags: ["précaution", "inclusif", "attention", "soin", "adapté"]
  },
  bar_halal: {
    label: "Bar halal",
    services: ["Boissons halal", "Sans alcool", "Respectueux", "Culturel"],
    ambiance: ["Respectueuse", "Culturelle", "Inclusive", "Communautaire"],
    primaryTags: ["bar", "halal", "musulman", "islamique", "religieux"],
    secondaryTags: ["sans", "alcool", "respectueux", "traditionnel", "culturel"],
    relatedTags: ["communauté", "respect", "diversité", "inclusif", "culturel"]
  },
  bar_kosher: {
    label: "Bar kosher",
    services: ["Boissons kosher", "Respectueux", "Traditionnel", "Culturel"],
    ambiance: ["Respectueuse", "Traditionnelle", "Culturelle", "Spirituelle"],
    primaryTags: ["bar", "kosher", "juif", "religieux", "traditionnel"],
    secondaryTags: ["respectueux", "culturel", "communauté", "tradition", "spirituel"],
    relatedTags: ["religieux", "respect", "diversité", "inclusif", "culturel"]
  },
  bar_jeux: {
    label: "Bar à jeux",
    services: ["Pétanque intérieure", "Fléchettes", "Billard", "Baby-foot", "Ping-pong", "Jeux d'arcade", "Boissons", "Snacks"],
    ambiance: ["Ludique", "Conviviale", "Décontractée", "Compétitive", "Amusante"],
    primaryTags: ["bar", "jeux", "pétanque", "fléchettes", "billard", "arcade"],
    secondaryTags: ["baby-foot", "ping-pong", "intérieur", "divertissement", "ludique"],
    relatedTags: ["amis", "famille", "soirée", "détente", "compétition", "boissons", "snacks", "ambiance", "convivialité", "loisirs"]
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

  // 🌏 CUISINES ASIATIQUES SPÉCIFIQUES
  restaurant_chinois: {
    label: "Restaurant chinois",
    services: ["Cuisine cantonaise", "Dim sum", "Wok", "Canard laqué"],
    ambiance: ["Traditionnelle", "Familiale", "Conviviale", "Authentique"],
    primaryTags: ["restaurant", "chinois", "cantonais", "dim sum"],
    secondaryTags: ["wok", "nems", "canard", "laqué", "riz"],
    relatedTags: ["traditionnel", "familial", "convivial", "authentique"]
  },
  restaurant_japonais: {
    label: "Restaurant japonais",
    services: ["Sushi frais", "Sashimi", "Ramen", "Tempura", "Saké"],
    ambiance: ["Zen", "Raffinée", "Traditionnelle", "Artisanale"],
    primaryTags: ["restaurant", "japonais", "sushi", "sashimi"],
    secondaryTags: ["maki", "tempura", "ramen", "yakitori", "saké"],
    relatedTags: ["zen", "raffiné", "frais", "traditionnel", "artisanal"]
  },
  restaurant_thai: {
    label: "Restaurant thaïlandais",
    services: ["Curry thaï", "Pad thaï", "Tom yam", "Cuisine épicée"],
    ambiance: ["Exotique", "Épicée", "Parfumée", "Colorée"],
    primaryTags: ["restaurant", "thaïlandais", "thaï", "pad", "thai"],
    secondaryTags: ["curry", "coco", "épicé", "basilic", "citronnelle"],
    relatedTags: ["exotique", "épicé", "parfumé", "équilibré", "coloré"]
  },
  restaurant_vietnamien: {
    label: "Restaurant vietnamien",
    services: ["Pho", "Nems", "Bun bo", "Cuisine fraîche"],
    ambiance: ["Fraîche", "Légère", "Herbacée", "Authentique"],
    primaryTags: ["restaurant", "vietnamien", "pho", "nems", "vietnam"],
    secondaryTags: ["bouillon", "herbes", "frais", "baguette", "vietnamienne"],
    relatedTags: ["frais", "léger", "herbacé", "authentique", "sain"]
  },
  restaurant_coreen: {
    label: "Restaurant coréen",
    services: ["Bulgogi", "Kimchi", "Bibimbap", "Barbecue coréen"],
    ambiance: ["Traditionnelle", "Unique", "Épicée", "Authentique"],
    primaryTags: ["restaurant", "coréen", "corée", "kimchi", "bulgogi"],
    secondaryTags: ["barbecue", "coréen", "fermenté", "épicé", "traditionnel"],
    relatedTags: ["fermenté", "épicé", "traditionnel", "unique", "découverte"]
  },

  // 🕌 CUISINES DU MOYEN-ORIENT
  restaurant_indien: {
    label: "Restaurant indien",
    services: ["Curry", "Tandoor", "Naan", "Biryani", "Cuisine végétarienne"],
    ambiance: ["Épicée", "Parfumée", "Colorée", "Traditionnelle"],
    primaryTags: ["restaurant", "indien", "curry", "tandoor", "indien"],
    secondaryTags: ["naan", "biryani", "épices", "végétarien", "tikka"],
    relatedTags: ["épicé", "parfumé", "végétarien", "traditionnel", "coloré"]
  },
  restaurant_libanais: {
    label: "Restaurant libanais",
    services: ["Mezze", "Houmous", "Falafel", "Taboulé", "Kebab"],
    ambiance: ["Conviviale", "Méditerranéenne", "Partage", "Authentique"],
    primaryTags: ["restaurant", "libanais", "mezze", "houmous", "liban"],
    secondaryTags: ["falafel", "taboulé", "kebab", "moutabal", "pita"],
    relatedTags: ["partage", "convivial", "méditerranéen", "frais", "authentique"]
  },
  restaurant_turc: {
    label: "Restaurant turc",
    services: ["Kebab", "Döner", "Pide", "Baklava", "Ayran"],
    ambiance: ["Orientale", "Conviviale", "Traditionnelle", "Authentique"],
    primaryTags: ["restaurant", "turc", "kebab", "döner", "turquie"],
    secondaryTags: ["pide", "lahmacun", "ayran", "baklava", "turkish"],
    relatedTags: ["oriental", "épicé", "traditionnel", "convivial", "authentique"]
  },
  restaurant_grec: {
    label: "Restaurant grec",
    services: ["Moussaka", "Souvlaki", "Tzatziki", "Feta", "Ouzo"],
    ambiance: ["Méditerranéenne", "Conviviale", "Familiale", "Traditionnelle"],
    primaryTags: ["restaurant", "grec", "moussaka", "souvlaki", "grèce"],
    secondaryTags: ["tzatziki", "feta", "olives", "ouzo", "grecque"],
    relatedTags: ["méditerranéen", "frais", "convivial", "traditionnel", "familial"]
  },

  // 🇪🇺 CUISINES EUROPÉENNES
  restaurant_espagnol: {
    label: "Restaurant espagnol",
    services: ["Paella", "Tapas", "Jambon ibérique", "Sangria", "Gazpacho"],
    ambiance: ["Méditerranéenne", "Conviviale", "Festive", "Chaleureuse"],
    primaryTags: ["restaurant", "espagnol", "paella", "tapas", "espagne"],
    secondaryTags: ["jambon", "chorizo", "sangria", "gazpacho", "espagnole"],
    relatedTags: ["méditerranéen", "convivial", "partage", "chaleureux", "festif"]
  },
  restaurant_portugais: {
    label: "Restaurant portugais",
    services: ["Bacalhau", "Pasteis de nata", "Porto", "Sardines", "Cuisine océane"],
    ambiance: ["Océane", "Traditionnelle", "Familiale", "Authentique"],
    primaryTags: ["restaurant", "portugais", "bacalhau", "pasteis", "portugal"],
    secondaryTags: ["porto", "sardines", "portugaise", "traditionnel", "océan"],
    relatedTags: ["océan", "traditionnel", "authentique", "familial", "découverte"]
  },
  restaurant_allemand: {
    label: "Restaurant allemand",
    services: ["Choucroute", "Wurst", "Bière", "Pretzel", "Schnitzel"],
    ambiance: ["Traditionnelle", "Conviviale", "Copieuse", "Familiale"],
    primaryTags: ["restaurant", "allemand", "choucroute", "wurst", "allemagne"],
    secondaryTags: ["bière", "pretzel", "schnitzel", "allemande", "traditionnel"],
    relatedTags: ["traditionnel", "copieux", "convivial", "authentique", "familial"]
  },
  restaurant_russe: {
    label: "Restaurant russe",
    services: ["Borsch", "Caviar", "Blinis", "Vodka", "Cuisine traditionnelle"],
    ambiance: ["Traditionnelle", "Festive", "Authentique", "Unique"],
    primaryTags: ["restaurant", "russe", "borsch", "vodka", "russie"],
    secondaryTags: ["caviar", "blinis", "russe", "traditionnel", "festif"],
    relatedTags: ["traditionnel", "festif", "authentique", "découverte", "unique"]
  },

  // 🌍 CUISINES AFRICAINES
  restaurant_marocain: {
    label: "Restaurant marocain",
    services: ["Tajine", "Couscous", "Thé à la menthe", "Pâtisseries orientales"],
    ambiance: ["Orientale", "Épicée", "Chaleureuse", "Exotique"],
    primaryTags: ["restaurant", "marocain", "tajine", "couscous", "maroc"],
    secondaryTags: ["menthe", "épices", "marocaine", "traditionnel", "oriental"],
    relatedTags: ["épicé", "parfumé", "traditionnel", "chaleureux", "exotique"]
  },
  restaurant_ethiopien: {
    label: "Restaurant éthiopien",
    services: ["Injera", "Wot", "Cuisine fermentée", "Café éthiopien"],
    ambiance: ["Unique", "Traditionnelle", "Authentique", "Découverte"],
    primaryTags: ["restaurant", "éthiopien", "injera", "wot", "éthiopie"],
    secondaryTags: ["épicé", "fermenté", "éthiopienne", "traditionnel", "unique"],
    relatedTags: ["unique", "épicé", "traditionnel", "découverte", "authentique"]
  },

  // 🌎 CUISINES AMÉRICAINES
  restaurant_brasilien: {
    label: "Restaurant brésilien",
    services: ["Feijoada", "Churrasco", "Caipirinha", "Cuisine tropicale"],
    ambiance: ["Tropicale", "Festive", "Conviviale", "Colorée"],
    primaryTags: ["restaurant", "brésilien", "feijoada", "caipirinha", "brésil"],
    secondaryTags: ["churrasco", "brésilienne", "tropical", "festif", "convivial"],
    relatedTags: ["tropical", "festif", "convivial", "coloré", "découverte"]
  },
  restaurant_peruvien: {
    label: "Restaurant péruvien",
    services: ["Ceviche", "Quinoa", "Pisco sour", "Cuisine andine"],
    ambiance: ["Unique", "Traditionnelle", "Authentique", "Exotique"],
    primaryTags: ["restaurant", "péruvien", "ceviche", "pisco", "pérou"],
    secondaryTags: ["quinoa", "péruvienne", "andine", "traditionnel", "unique"],
    relatedTags: ["unique", "traditionnel", "découverte", "authentique", "exotique"]
  },
  restaurant_mexicain: {
    label: "Restaurant mexicain",
    services: ["Tacos", "Burritos", "Guacamole", "Tequila", "Cuisine épicée"],
    ambiance: ["Épicée", "Colorée", "Festive", "Conviviale"],
    primaryTags: ["restaurant", "mexicain", "tacos", "burritos", "mexique"],
    secondaryTags: ["guacamole", "jalapeños", "tequila", "mexicaine", "épicé"],
    relatedTags: ["épicé", "coloré", "festif", "convivial", "authentique"]
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
  roller_indoor: {
    label: "Roller indoor",
    services: ["Piste indoor", "Location patins", "Cours", "Anniversaires"],
    ambiance: ["Urbain", "Fun", "Sportif", "Famille"],
    primaryTags: ["roller", "patin", "piste", "indoor"],
    secondaryTags: ["anniversaires", "location", "équipements", "famille"],
    relatedTags: ["urbain", "fun", "sport", "glisse"]
  },
  moto_electrique_indoor: {
    label: "Moto électrique indoor",
    services: ["Circuits indoor", "Motos électriques", "Sessions", "Sensations"],
    ambiance: ["Innovant", "Adrénaline", "Sécurisé", "Sportif"],
    primaryTags: ["moto", "électrique", "circuit", "indoor"],
    secondaryTags: ["sensations", "karting", "piste", "location"],
    relatedTags: ["adrénaline", "innovant", "protection", "activité"]
  },
  // 🎯 ESCAPE GAMES - Informations complètes
  escape_game: {
    label: "Escape Game (général)",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Immersive", "Énigme", "Aventure", "Mystère"],
    primaryTags: ["escape game", "énigmes", "salles", "thématiques"],
    secondaryTags: ["team building", "réservation", "challenge", "groupe"],
    relatedTags: ["immersive", "énigme", "aventure", "mystère", "famille"]
  },
  escape_game_horreur: {
    label: "Escape Game Horreur",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Adrénaline", "Frissons", "Immersive", "Énigme"],
    primaryTags: ["escape game", "horreur", "frissons", "adrénaline"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["effrayant", "immersive", "énigme", "groupe", "adultes"]
  },
  escape_game_aventure: {
    label: "Escape Game Aventure",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Exploration", "Pirate", "Trésor", "Aventure"],
    primaryTags: ["escape game", "aventure", "pirate", "trésor"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["exploration", "immersive", "énigme", "famille", "enfants"]
  },
  escape_game_mystere: {
    label: "Escape Game Mystère",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Logique", "Enquête", "Détective", "Mystère"],
    primaryTags: ["escape game", "mystère", "enquête", "détective"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["logique", "immersive", "énigme", "groupe", "intellectuel"]
  },
  escape_game_sf: {
    label: "Escape Game Science-Fiction",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Futuriste", "Technologie", "Space", "Innovant"],
    primaryTags: ["escape game", "science-fiction", "futuriste", "technologie"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["space", "immersive", "énigme", "groupe", "innovant"]
  },
  escape_game_fantasy: {
    label: "Escape Game Fantasy",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Magie", "Médiéval", "Sorcier", "Imaginaire"],
    primaryTags: ["escape game", "fantasy", "magie", "médiéval"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["sorcier", "immersive", "énigme", "famille", "imaginaire"]
  },
  escape_game_familial: {
    label: "Escape Game Familial",
    services: ["Salles thématiques", "Énigmes", "Réservation", "Challenge"],
    ambiance: ["Éducatif", "Doux", "Tous âges", "Famille"],
    primaryTags: ["escape game", "familial", "enfant", "doux"],
    secondaryTags: ["salles", "thématiques", "team building", "challenge"],
    relatedTags: ["éducatif", "immersive", "énigme", "famille", "tous âges"]
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

  // 👶 ENFANTS & FAMILLE - Informations complètes
  trampoline_parc: {
    label: "Trampoline parc",
    services: ["Trampolines géants", "Saut libre", "Parcours", "Sécurité", "Moniteurs"],
    ambiance: ["Énergique", "Amusante", "Défoulement", "Groupe", "Familiale"],
    primaryTags: ["trampoline", "parc", "enfants", "saut", "rebond"],
    secondaryTags: ["famille", "loisir", "sport", "fun", "activité"],
    relatedTags: ["enfants", "amusant", "énergique", "défoulement", "groupe"]
  },
  parc_loisirs_enfants: {
    label: "Parc de loisirs enfants",
    services: ["Manèges", "Attractions", "Animations", "Anniversaires", "Goûters"],
    ambiance: ["Colorée", "Amusante", "Familiale", "Animée", "Diversifiée"],
    primaryTags: ["parc", "loisirs", "enfants", "jeux", "famille"],
    secondaryTags: ["attractions", "manèges", "animations", "anniversaires", "groupe"],
    relatedTags: ["enfants", "famille", "amusant", "coloré", "diversion"]
  },
  centre_aquatique: {
    label: "Centre aquatique",
    services: ["Piscine", "Toboggans", "Jeux d'eau", "Cours de natation", "Espace détente"],
    ambiance: ["Rafraîchissante", "Sécurisée", "Familiale", "Détendue", "Aquatique"],
    primaryTags: ["centre", "aquatique", "piscine", "enfants", "eau"],
    secondaryTags: ["toboggans", "jeux", "eau", "apprentissage", "natation"],
    relatedTags: ["rafraîchissant", "famille", "sport", "détente", "sécurisé"]
  },
  parc_aventure_enfants: {
    label: "Parc d'aventure enfants",
    services: ["Accrobranche", "Tyroliennes", "Parcours sécurisés", "Moniteurs", "Équipement"],
    ambiance: ["Aventure", "Nature", "Sécurisée", "Défi", "Familiale"],
    primaryTags: ["parc", "aventure", "enfants", "accrobranche", "tyrolienne"],
    secondaryTags: ["nature", "défi", "sécurisé", "moniteur", "famille"],
    relatedTags: ["nature", "défi", "enfants", "sécurisé", "moniteur"]
  },
  ludotheque: {
    label: "Ludothèque",
    services: ["Prêt de jeux", "Espace de jeu", "Ateliers", "Jeux de société", "Jouets éducatifs"],
    ambiance: ["Calme", "Éducative", "Intellectuelle", "Familiale", "Découverte"],
    primaryTags: ["ludothèque", "jeux", "enfants", "jouets", "bibliothèque"],
    secondaryTags: ["prêt", "jeux", "société", "éducatif", "famille"],
    relatedTags: ["éducatif", "calme", "intellectuel", "famille", "découverte"]
  },
  centre_loisirs_enfants: {
    label: "Centre de loisirs enfants",
    services: ["Garde périscolaire", "Ateliers créatifs", "Sorties", "Animations", "Encadrement"],
    ambiance: ["Éducative", "Sociale", "Diversifiée", "Encadrée", "Familiale"],
    primaryTags: ["centre", "loisirs", "enfants", "activités", "garde"],
    secondaryTags: ["mercredi", "vacances", "ateliers", "animations", "groupe"],
    relatedTags: ["garde", "éducatif", "social", "divers", "encadré"]
  },
  ferme_pedagogique: {
    label: "Ferme pédagogique",
    services: ["Contact animaux", "Visites guidées", "Ateliers nature", "Découverte", "Goûters fermiers"],
    ambiance: ["Naturelle", "Éducative", "Authentique", "Familiale", "Découverte"],
    primaryTags: ["ferme", "pédagogique", "animaux", "enfants", "nature"],
    secondaryTags: ["découverte", "éducatif", "contact", "animaux", "famille"],
    relatedTags: ["nature", "éducatif", "découverte", "famille", "authentique"]
  },
  musee_enfants: {
    label: "Musée enfants",
    services: ["Expositions interactives", "Ateliers", "Jeux éducatifs", "Visites guidées", "Découverte"],
    ambiance: ["Culturelle", "Éducative", "Interactive", "Intellectuelle", "Familiale"],
    primaryTags: ["musée", "enfants", "interactif", "découverte", "éducatif"],
    secondaryTags: ["ateliers", "expositions", "jeux", "apprentissage", "famille"],
    relatedTags: ["culturel", "éducatif", "interactif", "découverte", "intellectuel"]
  },
  parc_theme_enfants: {
    label: "Parc à thème enfants",
    services: ["Attractions thématiques", "Spectacles", "Personnages", "Anniversaires", "Boutiques"],
    ambiance: ["Magique", "Fantaisiste", "Spectaculaire", "Mémorable", "Familiale"],
    primaryTags: ["parc", "thème", "enfants", "attractions", "spectacles"],
    secondaryTags: ["personnages", "magie", "fantaisie", "anniversaires", "famille"],
    relatedTags: ["magique", "fantaisie", "enfants", "spectacle", "mémorable"]
  },
  centre_sportif_enfants: {
    label: "Centre sportif enfants",
    services: ["Cours de sport", "Entraînements", "Compétitions", "Moniteurs", "Équipements"],
    ambiance: ["Sportive", "Disciplinée", "Groupe", "Compétitive", "Éducative"],
    primaryTags: ["centre", "sportif", "enfants", "gymnastique", "sport"],
    secondaryTags: ["cours", "compétition", "entraînement", "moniteur", "groupe"],
    relatedTags: ["sport", "discipline", "groupe", "entraînement", "compétition"]
  },
  atelier_creatif_enfants: {
    label: "Atelier créatif enfants",
    services: ["Peinture", "Bricolage", "Créations artistiques", "Ateliers", "Matériel"],
    ambiance: ["Créative", "Artistique", "Manuelle", "Expression", "Découverte"],
    primaryTags: ["atelier", "créatif", "enfants", "art", "manuel"],
    secondaryTags: ["peinture", "bricolage", "création", "artistique", "groupe"],
    relatedTags: ["créatif", "artistique", "manuel", "expression", "découverte"]
  },
  parc_jeux_interieur: {
    label: "Parc de jeux intérieur",
    services: ["Aires de jeux", "Toboggans", "Tunnels", "Balles", "Sécurité"],
    ambiance: ["Sécurisée", "Amusante", "Intérieure", "Familiale", "Défoulement"],
    primaryTags: ["parc", "jeux", "intérieur", "enfants", "aire"],
    secondaryTags: ["toboggans", "tunnels", "balles", "sécurisé", "famille"],
    relatedTags: ["intérieur", "sécurisé", "amusant", "famille", "défoulement"]
  },
  mini_golf: {
    label: "Mini-golf",
    services: ["Parcours", "Clubs", "Balles", "Score", "Compétition"],
    ambiance: ["Calme", "Précision", "Familiale", "Technique", "Loisir"],
    primaryTags: ["mini", "golf", "enfants", "famille", "loisir"],
    secondaryTags: ["parcours", "balle", "club", "score", "compétition"],
    relatedTags: ["précision", "famille", "calme", "technique", "loisir"]
  },
  parc_attractions_familial: {
    label: "Parc d'attractions familial",
    services: ["Manèges tous âges", "Attractions", "Restaurants", "Boutiques", "Animations"],
    ambiance: ["Universelle", "Familiale", "Diverse", "Amusante", "Mémorable"],
    primaryTags: ["parc", "attractions", "familial", "manèges", "loisir"],
    secondaryTags: ["tous", "âges", "famille", "divers", "amusant"],
    relatedTags: ["universel", "famille", "divers", "amusant", "mémorable"]
  },
  centre_anniversaires: {
    label: "Centre d'anniversaires",
    services: ["Organisation fêtes", "Animation", "Gâteaux", "Cadeaux", "Décoration"],
    ambiance: ["Festive", "Célébration", "Mémorable", "Spéciale", "Groupe"],
    primaryTags: ["centre", "anniversaires", "enfants", "fête", "organisation"],
    secondaryTags: ["animation", "gâteau", "cadeaux", "groupe", "mémorable"],
    relatedTags: ["fête", "célébration", "groupe", "mémorable", "spécial"]
  },
  parc_animalier: {
    label: "Parc animalier",
    services: ["Visite animaux", "Nourrissage", "Spectacles", "Découverte", "Éducatif"],
    ambiance: ["Naturelle", "Éducative", "Découverte", "Familiale", "Authentique"],
    primaryTags: ["parc", "animalier", "animaux", "enfants", "nature"],
    secondaryTags: ["découverte", "sauvage", "domestique", "famille", "éducatif"],
    relatedTags: ["nature", "découverte", "éducatif", "famille", "authentique"]
  },
  parc_plage_enfants: {
    label: "Parc de plage enfants",
    services: ["Châteaux de sable", "Jeux d'eau", "Activités plage", "Sécurité", "Famille"],
    ambiance: ["Plage", "Sable", "Eau", "Familiale", "Été"],
    primaryTags: ["parc", "plage", "enfants", "sable", "eau"],
    secondaryTags: ["châteaux", "sable", "jeux", "eau", "famille"],
    relatedTags: ["plage", "sable", "eau", "famille", "été"]
  },
  centre_equitation_enfants: {
    label: "Centre d'équitation enfants",
    services: ["Monte poney", "Soins animaux", "Cours", "Nature", "Responsabilité"],
    ambiance: ["Naturelle", "Responsable", "Sportive", "Animale", "Découverte"],
    primaryTags: ["centre", "équitation", "enfants", "cheval", "poney"],
    secondaryTags: ["monte", "soins", "nature", "responsabilité", "famille"],
    relatedTags: ["nature", "responsabilité", "sport", "animal", "découverte"]
  },
  parc_skate_enfants: {
    label: "Parc de skate enfants",
    services: ["Rampes", "Tricks", "Sécurité", "Cours", "Équipement"],
    ambiance: ["Sportive", "Adrénaline", "Groupe", "Technique", "Urbaine"],
    primaryTags: ["parc", "skate", "enfants", "planche", "roues"],
    secondaryTags: ["rampes", "tricks", "sécurité", "groupe", "sport"],
    relatedTags: ["sport", "adrénaline", "groupe", "technique", "urbain"]
  },
  centre_cirque_enfants: {
    label: "Centre de cirque enfants",
    services: ["Acrobatie", "Jonglage", "Équilibre", "Spectacles", "Cours"],
    ambiance: ["Artistique", "Acrobatique", "Spectaculaire", "Groupe", "Créative"],
    primaryTags: ["centre", "cirque", "enfants", "acrobatie", "art"],
    secondaryTags: ["jonglage", "équilibre", "souplesse", "spectacle", "groupe"],
    relatedTags: ["artistique", "acrobatie", "spectacle", "groupe", "créatif"]
  },

  // 🎵 Blind Test & Quiz - Informations complètes
  blind_test: {
    label: "Blind Test / Quiz Musical",
    services: ["Salles blind test", "Quiz musique", "Équipes", "Compétition", "Playlist"],
    ambiance: ["Musicale", "Compétitive", "Conviviale", "Festive", "Interactive"],
    primaryTags: ["blind test", "musique", "quiz", "salle", "entre amis"],
    secondaryTags: ["chanson", "deviner", "équipe", "compétition", "amusant"],
    relatedTags: ["musical", "décontracté", "groupe", "festif", "interactif"]
  },
  quiz_room: {
    label: "Quiz Room / Salle de Quiz",
    services: ["Questions culture", "Quiz général", "Équipes", "Score", "Thématiques"],
    ambiance: ["Intellectuelle", "Compétitive", "Conviviale", "Défi", "Interactive"],
    primaryTags: ["quiz", "room", "questions", "culture", "général"],
    secondaryTags: ["salle", "équipe", "compétition", "savoir", "amusant"],
    relatedTags: ["intellectuel", "groupe", "défi", "connaissance", "interactif"]
  },
  salle_jeux_amis: {
    label: "Salle de jeux entre amis",
    services: ["Blind test", "Quiz", "Karaoké", "Jeux société", "Multiactivité"],
    ambiance: ["Conviviale", "Entre amis", "Festive", "Décontractée", "Amusante"],
    primaryTags: ["salle", "jeux", "amis", "groupe", "multiactivité"],
    secondaryTags: ["blind test", "quiz", "karaoké", "jeux société", "divertissement"],
    relatedTags: ["convivial", "entre amis", "festif", "décontracté", "amusant"]
  },
  complexe_multiactivites: {
    label: "Centre multiactivités",
    services: ["Blind test", "Quiz", "Escape game", "Karaoké", "Bowling", "Laser game"],
    ambiance: ["Diversifiée", "Entre amis", "Familiale", "Entreprise", "Anniversaire"],
    primaryTags: ["centre", "multiactivité", "salles", "jeux", "groupe"],
    secondaryTags: ["blind test", "quiz", "escape game", "karaoké", "bowling"],
    relatedTags: ["diversifié", "entre amis", "famille", "entreprise", "anniversaire"]
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
      "bar_ambiance", "bar_lounge", "bar_cocktails", "bar_vins", "bar_sports", 
      "rooftop_bar", "bar_karaoke", "bar_bières", "bar_jus_smoothies", "bar_tapas",
      "bar_plage", "bar_rooftop", "bar_brasserie", "bar_whisky", "bar_rhum", 
      "bar_gin", "bar_tequila", "bar_champagne", "bar_apéritif", "bar_afterwork",
      "bar_brunch", "bar_glacé", "bar_healthy", "bar_vegan", "bar_gluten_free",
      "bar_halal", "bar_kosher", "bar_jeux", "pub_traditionnel", "brasserie_artisanale"
    ],
    "🍽️ Restaurants": [
      "restaurant_gastronomique", "restaurant_traditionnel", "restaurant_familial", "bistrot"
    ],
    "🌍 Cuisines du monde": [
      // Cuisines asiatiques
      "restaurant_italien", "restaurant_chinois", "restaurant_japonais", "restaurant_thai", 
      "restaurant_vietnamien", "restaurant_coreen", "restaurant_asiatique", "restaurant_oriental",
      // Cuisines du Moyen-Orient
      "restaurant_indien", "restaurant_libanais", "restaurant_turc", "restaurant_grec",
      // Cuisines européennes
      "restaurant_espagnol", "restaurant_portugais", "restaurant_allemand", "restaurant_russe",
      // Cuisines africaines
      "restaurant_marocain", "restaurant_ethiopien",
      // Cuisines américaines
      "restaurant_brasilien", "restaurant_peruvien", "restaurant_mexicain"
    ],
    "🥙 Fast Food & Street Food": [
      "kebab", "tacos_mexicain", "burger", "pizzeria"
    ],
    "🎉 Sorties nocturnes": [
      "discotheque", "club_techno", "boite_nuit_mainstream"
    ],
    "🎯 Sports & Activités": [
    "bowling", "billard_americain", "billard_francais", "roller_indoor", "moto_electrique_indoor", "futsal", "karting", "laser_game", "vr_experience"
    ],
    "🎮 Escape Games": [
      "escape_game", "escape_game_horreur", "escape_game_aventure", "escape_game_mystere",
      "escape_game_sf", "escape_game_fantasy", "escape_game_familial"
    ],
    "🎵 Blind Test & Quiz": [
      "blind_test", "quiz_room", "salle_jeux_amis", "centre_multiactivites"
    ],
    "👶 Enfants & Famille": [
      "trampoline_parc", "parc_loisirs_enfants", "centre_aquatique", "parc_aventure_enfants",
      "ludotheque", "centre_loisirs_enfants", "ferme_pedagogique", "musee_enfants",
      "parc_theme_enfants", "centre_sportif_enfants", "atelier_creatif_enfants",
      "parc_jeux_interieur", "mini_golf", "parc_attractions_familial", "centre_anniversaires",
      "parc_animalier", "parc_plage_enfants", "centre_equitation_enfants", "parc_skate_enfants",
      "centre_cirque_enfants"
    ],
    "❓ Autres": [
      "autre"
    ]
  };

  return groups;
}
