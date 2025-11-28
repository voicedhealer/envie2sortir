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

  // ☕ CAFÉS & CAFÉS - Système hiérarchique complet
  cafe_traditionnel: {
    primaryTags: ["café", "traditionnel", "expresso", "barista", "artisanal"],
    secondaryTags: ["pâtisseries", "croissants", "petit-déjeuner", "terrasse", "chaleureux"],
    relatedTags: ["authentique", "quartier", "convivial", "matinal", "décontracté"]
  },
  cafe_brasserie: {
    primaryTags: ["café", "brasserie", "restaurant", "plats", "jour"],
    secondaryTags: ["menu", "déjeuner", "dîner", "terrasse", "convivial"],
    relatedTags: ["familial", "traditionnel", "quartier", "chaleureux", "accessible"]
  },
  cafe_lounge: {
    primaryTags: ["café", "lounge", "détente", "confortable", "sofa"],
    secondaryTags: ["musique", "douce", "wifi", "travail", "calme"],
    relatedTags: ["relaxation", "sophistiqué", "rendez-vous", "intimiste", "premium"]
  },
  cafe_rooftop: {
    primaryTags: ["café", "rooftop", "terrasse", "vue", "panoramique"],
    secondaryTags: ["hauteur", "coucher", "soleil", "premium", "exclusif"],
    relatedTags: ["romantique", "instagram", "haut", "vue", "ville", "élégant"]
  },
  cafe_artisanal: {
    primaryTags: ["café", "artisanal", "torréfaction", "grains", "spécialisé"],
    secondaryTags: ["dégustation", "origines", "méthodes", "expert", "premium"],
    relatedTags: ["connaisseur", "raffiné", "authentique", "découverte", "passionné"]
  },
  cafe_healthy: {
    primaryTags: ["café", "healthy", "santé", "bio", "naturel"],
    secondaryTags: ["smoothies", "jus", "détox", "légumes", "fruits"],
    relatedTags: ["bien-être", "sport", "léger", "pur", "équilibré"]
  },
  cafe_vegan: {
    primaryTags: ["café", "vegan", "végétal", "sans", "animal"],
    secondaryTags: ["lait", "végétal", "alternatives", "éthique", "responsable"],
    relatedTags: ["écologique", "conscient", "moderne", "sain", "engagé"]
  },
  cafe_gluten_free: {
    primaryTags: ["café", "sans", "gluten", "intolérance", "allergie"],
    secondaryTags: ["alternatives", "précaution", "santé", "spécialisé", "attention"],
    relatedTags: ["précaution", "inclusif", "attention", "soin", "adapté"]
  },
  cafe_halal: {
    primaryTags: ["café", "halal", "musulman", "islamique", "religieux"],
    secondaryTags: ["respectueux", "culturel", "communauté", "traditionnel", "inclusif"],
    relatedTags: ["communauté", "respect", "diversité", "inclusif", "culturel"]
  },
  cafe_kosher: {
    primaryTags: ["café", "kosher", "juif", "religieux", "traditionnel"],
    secondaryTags: ["respectueux", "culturel", "communauté", "tradition", "spirituel"],
    relatedTags: ["religieux", "respect", "diversité", "inclusif", "culturel"]
  },
  cafe_jeux: {
    primaryTags: ["café", "jeux", "société", "board", "games"],
    secondaryTags: ["ludothèque", "prêt", "jeux", "tournois", "événements"],
    relatedTags: ["ludique", "convivial", "entre amis", "décontracté", "amusant"]
  },
  cafe_livres: {
    primaryTags: ["café", "livres", "librairie", "lecture", "culturel"],
    secondaryTags: ["bibliothèque", "silence", "intellectuel", "détente", "calme"],
    relatedTags: ["culturel", "intellectuel", "calme", "découverte", "sophistiqué"]
  },
  cafe_enfants: {
    primaryTags: ["café", "enfants", "familial", "aire", "jeux"],
    secondaryTags: ["chaises", "hautes", "animations", "sécurisé", "coloré"],
    relatedTags: ["familial", "enfants", "amusant", "sécurisé", "chaleureux"]
  },
  cafe_afterwork: {
    primaryTags: ["café", "afterwork", "travail", "bureau", "soirée"],
    secondaryTags: ["collègues", "détente", "happy hour", "convivial", "professionnel"],
    relatedTags: ["réseautage", "décompression", "collaboration", "moderne", "urbain"]
  },
  cafe_brunch: {
    primaryTags: ["café", "brunch", "weekend", "matin", "déjeuner"],
    secondaryTags: ["œufs", "benedict", "pancakes", "mimosa", "détente"],
    relatedTags: ["famille", "paresseux", "gourmand", "chaleureux", "dominical"]
  },
  cafe_glacé: {
    primaryTags: ["café", "glacé", "glace", "dessert", "sucré"],
    secondaryTags: ["parfums", "cônes", "sundae", "milkshake", "gourmandise"],
    relatedTags: ["enfants", "famille", "été", "rafraîchissant", "amusant"]
  },
  cafe_emporter: {
    primaryTags: ["café", "emporter", "takeaway", "rapide", "pratique"],
    secondaryTags: ["express", "mobile", "bureau", "déplacement", "efficace"],
    relatedTags: ["pratique", "rapide", "urbain", "moderne", "efficace"]
  },
  cafe_terrasse: {
    primaryTags: ["café", "terrasse", "extérieur", "plein", "air"],
    secondaryTags: ["soleil", "été", "vue", "rue", "passants"],
    relatedTags: ["naturel", "romantique", "familial", "détente", "saisonnier"]
  },
  cafe_nuit: {
    primaryTags: ["café", "nuit", "nocturne", "tard", "soirée"],
    secondaryTags: ["ambiance", "éclairage", "intimiste", "romantique", "spécial"],
    relatedTags: ["romantique", "intimiste", "spécial", "nocturne", "unique"]
  },

  // 🏛️ MUSÉES - Système hiérarchique complet
  musee_art: {
    primaryTags: ["musée", "art", "peinture", "sculpture", "exposition"],
    secondaryTags: ["collections", "permanente", "temporaire", "culturel", "artistique"],
    relatedTags: ["culturel", "sophistiqué", "intellectuel", "découverte", "raffiné"]
  },
  musee_histoire: {
    primaryTags: ["musée", "histoire", "historique", "patrimoine", "archéologie"],
    secondaryTags: ["collections", "objets", "civilisations", "époques", "découverte"],
    relatedTags: ["éducatif", "culturel", "traditionnel", "découverte", "intellectuel"]
  },
  musee_science: {
    primaryTags: ["musée", "science", "technologie", "innovation", "découverte"],
    secondaryTags: ["expériences", "interactif", "éducatif", "futuriste", "expérimental"],
    relatedTags: ["éducatif", "interactif", "futuriste", "découverte", "innovant"]
  },
  musee_nature: {
    primaryTags: ["musée", "nature", "histoire", "naturelle", "animaux"],
    secondaryTags: ["fossiles", "minéraux", "biodiversité", "environnement", "découverte"],
    relatedTags: ["naturel", "éducatif", "découverte", "environnemental", "authentique"]
  },
  musee_enfants: {
    primaryTags: ["musée", "enfants", "interactif", "découverte", "éducatif"],
    secondaryTags: ["ateliers", "expositions", "jeux", "apprentissage", "famille"],
    relatedTags: ["éducatif", "interactif", "découverte", "intellectuel", "familial"]
  },
  musee_contemporain: {
    primaryTags: ["musée", "contemporain", "art", "moderne", "création"],
    secondaryTags: ["installations", "performances", "multimédia", "innovant", "créatif"],
    relatedTags: ["moderne", "innovant", "créatif", "artistique", "avant-garde"]
  },
  musee_ethnographie: {
    primaryTags: ["musée", "ethnographie", "cultures", "peuples", "traditions"],
    secondaryTags: ["artisanat", "coutumes", "objets", "sociétés", "diversité"],
    relatedTags: ["culturel", "diversité", "traditionnel", "authentique", "découverte"]
  },
  musee_maritime: {
    primaryTags: ["musée", "maritime", "navire", "océan", "navigation"],
    secondaryTags: ["bateaux", "exploration", "commerce", "pêche", "aventures"],
    relatedTags: ["océan", "aventure", "exploration", "historique", "découverte"]
  },
  musee_militaire: {
    primaryTags: ["musée", "militaire", "guerre", "armée", "histoire"],
    secondaryTags: ["armes", "uniformes", "véhicules", "batailles", "mémoire"],
    relatedTags: ["historique", "patriotique", "mémoire", "traditionnel", "éducatif"]
  },
  musee_automobile: {
    primaryTags: ["musée", "automobile", "voitures", "véhicules", "collection"],
    secondaryTags: ["vintage", "sportives", "classiques", "moteurs", "design"],
    relatedTags: ["mécanique", "vintage", "collection", "passion", "technologique"]
  },
  musee_ferroviaire: {
    primaryTags: ["musée", "ferroviaire", "trains", "chemin", "fer"],
    secondaryTags: ["locomotives", "wagons", "gares", "transport", "histoire"],
    relatedTags: ["transport", "historique", "mécanique", "nostalgique", "éducatif"]
  },
  musee_aviation: {
    primaryTags: ["musée", "aviation", "avions", "aéronautique", "vol"],
    secondaryTags: ["avions", "hélicoptères", "moteurs", "pilotes", "histoire"],
    relatedTags: ["aéronautique", "technologique", "aventure", "historique", "innovant"]
  },
  musee_espace: {
    primaryTags: ["musée", "espace", "astronomie", "cosmos", "planètes"],
    secondaryTags: ["fusées", "satellites", "exploration", "scientifique", "futuriste"],
    relatedTags: ["futuriste", "scientifique", "découverte", "innovant", "éducatif"]
  },
  musee_photographie: {
    primaryTags: ["musée", "photographie", "photos", "images", "art"],
    secondaryTags: ["expositions", "artistes", "techniques", "histoire", "création"],
    relatedTags: ["artistique", "créatif", "visuel", "culturel", "moderne"]
  },
  musee_musique: {
    primaryTags: ["musée", "musique", "instruments", "compositeurs", "sons"],
    secondaryTags: ["concerts", "enregistrements", "histoire", "artistes", "culturel"],
    relatedTags: ["musical", "culturel", "artistique", "créatif", "émotionnel"]
  },
  musee_architecture: {
    primaryTags: ["musée", "architecture", "bâtiments", "design", "construction"],
    secondaryTags: ["maquettes", "plans", "techniques", "histoire", "création"],
    relatedTags: ["créatif", "technique", "historique", "artistique", "innovant"]
  },
  musee_archéologie: {
    primaryTags: ["musée", "archéologie", "fouilles", "civilisations", "antiquité"],
    secondaryTags: ["artefacts", "fossiles", "vestiges", "découvertes", "histoire"],
    relatedTags: ["historique", "découverte", "authentique", "éducatif", "culturel"]
  },
  musee_ethnologie: {
    primaryTags: ["musée", "ethnologie", "anthropologie", "sociétés", "cultures"],
    secondaryTags: ["traditions", "coutumes", "objets", "peuples", "diversité"],
    relatedTags: ["culturel", "diversité", "traditionnel", "authentique", "éducatif"]
  },
  musee_technologie: {
    primaryTags: ["musée", "technologie", "innovation", "machines", "industrie"],
    secondaryTags: ["inventions", "développement", "futuriste", "expérimental", "scientifique"],
    relatedTags: ["technologique", "innovant", "futuriste", "scientifique", "éducatif"]
  },
  musee_virtuel: {
    primaryTags: ["musée", "virtuel", "numérique", "en ligne", "interactif"],
    secondaryTags: ["visite", "virtuelle", "multimédia", "technologie", "accessible"],
    relatedTags: ["moderne", "technologique", "accessible", "innovant", "futuriste"]
  },

  // 🎬 CINÉMA - Système hiérarchique complet
  cinema_multiplexe: {
    primaryTags: ["cinéma", "multiplexe", "films", "salles", "blockbusters"],
    secondaryTags: ["popcorn", "boissons", "confort", "grand", "écran"],
    relatedTags: ["familial", "accessible", "populaire", "divertissement", "sortie"]
  },
  cinema_art_essai: {
    primaryTags: ["cinéma", "art", "essai", "indépendant", "auteur"],
    secondaryTags: ["festival", "découverte", "culturel", "intellectuel", "raffiné"],
    relatedTags: ["cinéphile", "culturel", "sophistiqué", "original", "artistique"]
  },
  cinema_imax: {
    primaryTags: ["cinéma", "imax", "grand", "écran", "immersion"],
    secondaryTags: ["spectaculaire", "technologie", "expérience", "premium", "sensation"],
    relatedTags: ["impressionnant", "technologique", "immersif", "unique", "mémorable"]
  },
  drive_in: {
    primaryTags: ["drive-in", "voiture", "cinéma", "extérieur", "vintage"],
    secondaryTags: ["rétro", "original", "voiture", "été", "familial"],
    relatedTags: ["nostalgique", "unique", "décontracté", "romantique", "original"]
  },
  cinema_4dx: {
    primaryTags: ["cinéma", "4dx", "mouvement", "effets", "sensoriel"],
    secondaryTags: ["vibration", "vent", "eau", "odeurs", "immersion"],
    relatedTags: ["sensoriel", "innovant", "expérience", "unique", "technologique"]
  },
  cinema_dolby_atmos: {
    primaryTags: ["cinéma", "dolby", "atmos", "son", "premium"],
    secondaryTags: ["audio", "qualité", "immersion", "technologie", "expérience"],
    relatedTags: ["audio", "qualité", "technologique", "premium", "immersif"]
  },
  cinema_3d: {
    primaryTags: ["cinéma", "3d", "stéréoscopique", "lunettes", "effet"],
    secondaryTags: ["immersion", "technologie", "spectaculaire", "visuel", "expérience"],
    relatedTags: ["visuel", "technologique", "immersif", "spectaculaire", "moderne"]
  },
  cinema_retro: {
    primaryTags: ["cinéma", "rétro", "vintage", "classique", "nostalgie"],
    secondaryTags: ["ancien", "traditionnel", "authentique", "charme", "histoire"],
    relatedTags: ["nostalgique", "authentique", "charmant", "traditionnel", "unique"]
  },
  cinema_open_air: {
    primaryTags: ["cinéma", "plein", "air", "extérieur", "été"],
    secondaryTags: ["terrasse", "nature", "romantique", "familial", "détente"],
    relatedTags: ["naturel", "romantique", "familial", "détente", "saisonnier"]
  },
  cinema_marathon: {
    primaryTags: ["cinéma", "marathon", "saga", "séries", "longue"],
    secondaryTags: ["passionné", "intensif", "gourmand", "expérience", "unique"],
    relatedTags: ["passionné", "intensif", "gourmand", "expérience", "communauté"]
  },
  cinema_theme: {
    primaryTags: ["cinéma", "thème", "spécialisé", "genre", "programmation"],
    secondaryTags: ["sélection", "curation", "expert", "passionné", "communauté"],
    relatedTags: ["spécialisé", "curation", "expert", "communauté", "passionné"]
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

  // 🎢 SENSATIONS FORTES & AVENTURE
  circuit_voiture_sport: {
    primaryTags: ["circuit", "voiture", "sport", "vitesse", "adrénaline"],
    secondaryTags: ["piste", "course", "sportive", "sensation", "forte"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  circuit_moto: {
    primaryTags: ["circuit", "moto", "vitesse", "adrénaline", "sport"],
    secondaryTags: ["piste", "course", "moto", "sensation", "forte"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  bapteme_ulm: {
    primaryTags: ["ulm", "baptême", "vol", "avion", "ciel"],
    secondaryTags: ["aérien", "sensation", "forte", "vue", "panoramique"],
    relatedTags: ["aventure", "aérien", "découverte", "unique", "mémorable"]
  },
  parachutisme: {
    primaryTags: ["parachutisme", "parachute", "saut", "ciel", "adrénaline"],
    secondaryTags: ["tandem", "duo", "sensation", "forte", "chute", "libre"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  saut_elastique: {
    primaryTags: ["saut", "élastique", "bungee", "jump", "adrénaline"],
    secondaryTags: ["sensation", "forte", "hauteur", "chute", "extrême"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  parapente: {
    primaryTags: ["parapente", "vol", "libre", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "nature"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  deltaplane: {
    primaryTags: ["deltaplane", "vol", "libre", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "nature"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  bapteme_helicoptere: {
    primaryTags: ["hélicoptère", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "luxe"],
    relatedTags: ["aventure", "aérien", "luxe", "découverte", "mémorable"]
  },
  bapteme_avion: {
    primaryTags: ["avion", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "aérien"],
    relatedTags: ["aventure", "aérien", "découverte", "unique", "mémorable"]
  },
  vol_cerf_volant: {
    primaryTags: ["cerf-volant", "traction", "kite", "surf", "vent"],
    secondaryTags: ["sensation", "forte", "mer", "plage", "sport"],
    relatedTags: ["aventure", "sport", "nature", "mer", "unique"]
  },
  accrobranche: {
    primaryTags: ["accrobranche", "arbre", "tyrolienne", "aventure", "nature"],
    secondaryTags: ["parcours", "hauteur", "défi", "sécurisé", "famille"],
    relatedTags: ["aventure", "nature", "défi", "famille", "découverte"]
  },
  tyrolienne: {
    primaryTags: ["tyrolienne", "glisse", "corde", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "hauteur", "vitesse", "défi"],
    relatedTags: ["aventure", "nature", "défi", "famille", "unique"]
  },
  via_ferrata: {
    primaryTags: ["via", "ferrata", "escalade", "falaise", "aventure"],
    secondaryTags: ["sensation", "forte", "hauteur", "défi", "nature"],
    relatedTags: ["aventure", "nature", "défi", "sport", "unique"]
  },
  escalade: {
    primaryTags: ["escalade", "falaise", "mur", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "hauteur", "défi", "technique"],
    relatedTags: ["aventure", "sport", "défi", "technique", "unique"]
  },
  canyoning: {
    primaryTags: ["canyoning", "canyon", "eau", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "descente", "rapide", "sport"],
    relatedTags: ["aventure", "nature", "eau", "sport", "unique"]
  },
  rafting: {
    primaryTags: ["rafting", "eau", "vive", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "rivière", "rapide", "équipe"],
    relatedTags: ["aventure", "sport", "eau", "équipe", "unique"]
  },
  hydrospeed: {
    primaryTags: ["hydrospeed", "eau", "vive", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "rivière", "rapide", "individuel"],
    relatedTags: ["aventure", "sport", "eau", "extrême", "unique"]
  },
  surf: {
    primaryTags: ["surf", "vague", "mer", "océan", "sport"],
    secondaryTags: ["sensation", "forte", "glisse", "nature", "plage"],
    relatedTags: ["aventure", "sport", "mer", "nature", "unique"]
  },
  kitesurf: {
    primaryTags: ["kitesurf", "kite", "surf", "vent", "mer"],
    secondaryTags: ["sensation", "forte", "glisse", "nature", "sport"],
    relatedTags: ["aventure", "sport", "mer", "nature", "unique"]
  },
  wingsuit: {
    primaryTags: ["wingsuit", "vol", "libre", "ciel", "extrême"],
    secondaryTags: ["sensation", "forte", "adrénaline", "parachute", "chute"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  saut_en_chute_libre: {
    primaryTags: ["chute", "libre", "parachute", "ciel", "adrénaline"],
    secondaryTags: ["sensation", "forte", "extrême", "tandem", "saut"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  bapteme_voiture_course: {
    primaryTags: ["voiture", "course", "baptême", "circuit", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "piste", "sportive"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  bapteme_moto_course: {
    primaryTags: ["moto", "course", "baptême", "circuit", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "piste", "sportive"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  quad: {
    primaryTags: ["quad", "tout", "terrain", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "adrénaline", "chemin", "sport"],
    relatedTags: ["aventure", "sport", "nature", "défi", "unique"]
  },
  buggy: {
    primaryTags: ["buggy", "désert", "aventure", "sport", "nature"],
    secondaryTags: ["sensation", "forte", "adrénaline", "sable", "vitesse"],
    relatedTags: ["aventure", "sport", "nature", "défi", "unique"]
  },
  jet_ski: {
    primaryTags: ["jet", "ski", "mer", "eau", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "glisse", "sport"],
    relatedTags: ["aventure", "sport", "mer", "vitesse", "unique"]
  },
  flyboard: {
    primaryTags: ["flyboard", "vol", "eau", "sensation", "forte"],
    secondaryTags: ["adrénaline", "extrême", "mer", "sport", "unique"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  plongee: {
    primaryTags: ["plongée", "sous-marine", "mer", "océan", "découverte"],
    secondaryTags: ["sensation", "forte", "nature", "poissons", "aventure"],
    relatedTags: ["aventure", "nature", "mer", "découverte", "unique"]
  },
  plongee_bouteille: {
    primaryTags: ["plongée", "bouteille", "scaphandre", "mer", "océan"],
    secondaryTags: ["sensation", "forte", "nature", "profondeur", "aventure"],
    relatedTags: ["aventure", "nature", "mer", "découverte", "unique"]
  },
  plongee_apnee: {
    primaryTags: ["plongée", "apnée", "libre", "mer", "océan"],
    secondaryTags: ["sensation", "forte", "nature", "profondeur", "sport"],
    relatedTags: ["aventure", "sport", "mer", "défi", "unique"]
  },
  saut_parachute_tandem: {
    primaryTags: ["parachute", "tandem", "duo", "saut", "ciel"],
    secondaryTags: ["sensation", "forte", "adrénaline", "chute", "libre"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  bapteme_planeur: {
    primaryTags: ["planeur", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "silence"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  bapteme_hot_air_balloon: {
    primaryTags: ["montgolfière", "ballon", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "romantique"],
    relatedTags: ["aventure", "aérien", "romantique", "découverte", "unique"]
  },
  saut_base_jump: {
    primaryTags: ["base", "jump", "saut", "extrême", "adrénaline"],
    secondaryTags: ["sensation", "forte", "parachute", "hauteur", "extrême"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
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

  // 💆 Soins & Beauté
  coiffeur: {
    primaryTags: ["coiffeur", "salon", "coupe", "cheveux", "coiffure"],
    secondaryTags: ["coloration", "mise", "plis", "soin", "cheveux"],
    relatedTags: ["beauté", "soin", "personnel", "relaxation", "professionnel"]
  },
  coiffeur_homme: {
    primaryTags: ["coiffeur", "homme", "coupe", "barbe", "rasage"],
    secondaryTags: ["tondeuse", "ciseaux", "soin", "barbe", "moustache"],
    relatedTags: ["masculin", "soin", "personnel", "traditionnel", "professionnel"]
  },
  coiffeur_femme: {
    primaryTags: ["coiffeur", "femme", "coupe", "coloration", "mise"],
    secondaryTags: ["plis", "balayage", "mèches", "soin", "cheveux"],
    relatedTags: ["féminin", "beauté", "soin", "personnel", "professionnel"]
  },
  coiffeur_enfant: {
    primaryTags: ["coiffeur", "enfant", "coupe", "famille", "jeune"],
    secondaryTags: ["doux", "rapide", "amusant", "patience", "soin"],
    relatedTags: ["familial", "décontracté", "enfants", "soin", "personnel"]
  },
  salon_beaute: {
    primaryTags: ["salon", "beauté", "soin", "visage", "corps"],
    secondaryTags: ["esthétique", "relaxation", "bien-être", "professionnel", "soin"],
    relatedTags: ["détente", "soin", "personnel", "beauté", "relaxation"]
  },
  institut_beaute: {
    primaryTags: ["institut", "beauté", "soin", "visage", "corps"],
    secondaryTags: ["esthétique", "relaxation", "bien-être", "professionnel", "soin"],
    relatedTags: ["détente", "soin", "personnel", "beauté", "raffiné"]
  },
  massage: {
    primaryTags: ["massage", "relaxation", "bien-être", "corps", "détente"],
    secondaryTags: ["huile", "soin", "professionnel", "thérapeutique", "relaxant"],
    relatedTags: ["détente", "soin", "personnel", "bien-être", "relaxation"]
  },
  massage_relaxant: {
    primaryTags: ["massage", "relaxant", "détente", "bien-être", "corps"],
    secondaryTags: ["huile", "aromathérapie", "calme", "zen", "relaxation"],
    relatedTags: ["détente", "soin", "personnel", "bien-être", "apaisant"]
  },
  massage_sportif: {
    primaryTags: ["massage", "sportif", "sport", "récupération", "muscles"],
    secondaryTags: ["thérapeutique", "décontractant", "sport", "performance", "soin"],
    relatedTags: ["sport", "récupération", "soin", "personnel", "thérapeutique"]
  },
  massage_oriental: {
    primaryTags: ["massage", "oriental", "traditionnel", "bien-être", "corps"],
    secondaryTags: ["huile", "chaud", "traditionnel", "relaxation", "soin"],
    relatedTags: ["traditionnel", "exotique", "soin", "personnel", "découverte"]
  },
  spa: {
    primaryTags: ["spa", "bien-être", "relaxation", "détente", "soin"],
    secondaryTags: ["jacuzzi", "sauna", "hammam", "massage", "bien-être"],
    relatedTags: ["luxe", "détente", "soin", "personnel", "premium"]
  },
  centre_esthetique: {
    primaryTags: ["centre", "esthétique", "beauté", "soin", "visage"],
    secondaryTags: ["soin", "corps", "relaxation", "professionnel", "bien-être"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "raffiné"]
  },
  manucure_pedicure: {
    primaryTags: ["manucure", "pédicure", "ongles", "beauté", "soin"],
    secondaryTags: ["vernis", "pose", "ongles", "soin", "mains"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "professionnel"]
  },
  epilation: {
    primaryTags: ["épilation", "soin", "corps", "beauté", "définitif"],
    secondaryTags: ["laser", "cire", "soin", "corps", "professionnel"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "détente"]
  },
  soin_visage: {
    primaryTags: ["soin", "visage", "beauté", "peau", "esthétique"],
    secondaryTags: ["nettoyage", "hydratation", "masque", "professionnel", "soin"],
    relatedTags: ["beauté", "soin", "personnel", "relaxation", "professionnel"]
  },
  soin_corps: {
    primaryTags: ["soin", "corps", "beauté", "relaxation", "esthétique"],
    secondaryTags: ["gommage", "enveloppement", "hydratation", "professionnel", "soin"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "relaxation"]
  },
  maquillage: {
    primaryTags: ["maquillage", "beauté", "makeup", "art", "professionnel"],
    secondaryTags: ["maquilleur", "soirée", "mariage", "événement", "beauté"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "artistique"]
  },
  barbe_moustache: {
    primaryTags: ["barbe", "moustache", "rasage", "soin", "homme"],
    secondaryTags: ["tondeuse", "ciseaux", "soin", "barbe", "traditionnel"],
    relatedTags: ["masculin", "soin", "personnel", "traditionnel", "professionnel"]
  },
  onglerie: {
    primaryTags: ["onglerie", "ongles", "beauté", "soin", "mains"],
    secondaryTags: ["pose", "vernis", "gel", "soin", "professionnel"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "professionnel"]
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

  // ☕ CAFÉS - Informations complètes
  cafe_traditionnel: {
    label: "Café traditionnel",
    services: ["Expresso", "Cappuccino", "Pâtisseries", "Petit-déjeuner", "Terrasse"],
    ambiance: ["Authentique", "Chaleureuse", "Conviviale", "Quartier"],
    primaryTags: ["café", "traditionnel", "expresso", "barista", "artisanal"],
    secondaryTags: ["pâtisseries", "croissants", "petit-déjeuner", "terrasse", "chaleureux"],
    relatedTags: ["authentique", "quartier", "convivial", "matinal", "décontracté"]
  },
  cafe_brasserie: {
    label: "Café brasserie",
    services: ["Café", "Plats du jour", "Déjeuner", "Dîner", "Terrasse"],
    ambiance: ["Familiale", "Traditionnelle", "Chaleureuse", "Accessible"],
    primaryTags: ["café", "brasserie", "restaurant", "plats", "jour"],
    secondaryTags: ["menu", "déjeuner", "dîner", "terrasse", "convivial"],
    relatedTags: ["familial", "traditionnel", "quartier", "chaleureux", "accessible"]
  },
  cafe_lounge: {
    label: "Café lounge",
    services: ["Café premium", "Sofas", "WiFi", "Musique douce", "Ambiance détente"],
    ambiance: ["Sophistiquée", "Intimiste", "Détendue", "Premium"],
    primaryTags: ["café", "lounge", "détente", "confortable", "sofa"],
    secondaryTags: ["musique", "douce", "wifi", "travail", "calme"],
    relatedTags: ["relaxation", "sophistiqué", "rendez-vous", "intimiste", "premium"]
  },
  cafe_rooftop: {
    label: "Café rooftop",
    services: ["Vue panoramique", "Café premium", "Terrasse", "Coucher de soleil"],
    ambiance: ["Exclusive", "Romantique", "Panoramique", "Élégante"],
    primaryTags: ["café", "rooftop", "terrasse", "vue", "panoramique"],
    secondaryTags: ["hauteur", "coucher", "soleil", "premium", "exclusif"],
    relatedTags: ["romantique", "instagram", "haut", "vue", "ville", "élégant"]
  },
  cafe_artisanal: {
    label: "Café artisanal",
    services: ["Torréfaction maison", "Grains sélectionnés", "Dégustation", "Expert conseil"],
    ambiance: ["Authentique", "Passionnée", "Raffinée", "Connaisseur"],
    primaryTags: ["café", "artisanal", "torréfaction", "grains", "spécialisé"],
    secondaryTags: ["dégustation", "origines", "méthodes", "expert", "premium"],
    relatedTags: ["connaisseur", "raffiné", "authentique", "découverte", "passionné"]
  },
  cafe_healthy: {
    label: "Café healthy",
    services: ["Café bio", "Smoothies", "Jus détox", "Boissons naturelles", "Bien-être"],
    ambiance: ["Saine", "Énergisante", "Pure", "Équilibrée"],
    primaryTags: ["café", "healthy", "santé", "bio", "naturel"],
    secondaryTags: ["smoothies", "jus", "détox", "légumes", "fruits"],
    relatedTags: ["bien-être", "sport", "léger", "pur", "équilibré"]
  },
  cafe_vegan: {
    label: "Café vegan",
    services: ["Lait végétal", "Alternatives", "Café éthique", "Végétal", "Responsable"],
    ambiance: ["Consciente", "Moderne", "Engagée", "Responsable"],
    primaryTags: ["café", "vegan", "végétal", "sans", "animal"],
    secondaryTags: ["lait", "végétal", "alternatives", "éthique", "responsable"],
    relatedTags: ["écologique", "conscient", "moderne", "sain", "engagé"]
  },
  cafe_gluten_free: {
    label: "Café sans gluten",
    services: ["Alternatives sans gluten", "Précaution", "Spécialisé", "Attention"],
    ambiance: ["Attentionnée", "Inclusive", "Soignée", "Adaptée"],
    primaryTags: ["café", "sans", "gluten", "intolérance", "allergie"],
    secondaryTags: ["alternatives", "précaution", "santé", "spécialisé", "attention"],
    relatedTags: ["précaution", "inclusif", "attention", "soin", "adapté"]
  },
  cafe_halal: {
    label: "Café halal",
    services: ["Café halal", "Respectueux", "Culturel", "Communauté"],
    ambiance: ["Respectueuse", "Culturelle", "Inclusive", "Communautaire"],
    primaryTags: ["café", "halal", "musulman", "islamique", "religieux"],
    secondaryTags: ["respectueux", "culturel", "communauté", "traditionnel", "inclusif"],
    relatedTags: ["communauté", "respect", "diversité", "inclusif", "culturel"]
  },
  cafe_kosher: {
    label: "Café kosher",
    services: ["Café kosher", "Respectueux", "Traditionnel", "Culturel"],
    ambiance: ["Respectueuse", "Traditionnelle", "Culturelle", "Spirituelle"],
    primaryTags: ["café", "kosher", "juif", "religieux", "traditionnel"],
    secondaryTags: ["respectueux", "culturel", "communauté", "tradition", "spirituel"],
    relatedTags: ["religieux", "respect", "diversité", "inclusif", "culturel"]
  },
  cafe_jeux: {
    label: "Café à jeux",
    services: ["Jeux de société", "Ludothèque", "Tournois", "Événements", "Prêt de jeux"],
    ambiance: ["Ludique", "Conviviale", "Décontractée", "Amusante"],
    primaryTags: ["café", "jeux", "société", "board", "games"],
    secondaryTags: ["ludothèque", "prêt", "jeux", "tournois", "événements"],
    relatedTags: ["ludique", "convivial", "entre amis", "décontracté", "amusant"]
  },
  cafe_livres: {
    label: "Café librairie",
    services: ["Librairie", "Lecture", "Silence", "Culture", "Détente"],
    ambiance: ["Culturelle", "Intellectuelle", "Calme", "Sophistiquée"],
    primaryTags: ["café", "livres", "librairie", "lecture", "culturel"],
    secondaryTags: ["bibliothèque", "silence", "intellectuel", "détente", "calme"],
    relatedTags: ["culturel", "intellectuel", "calme", "découverte", "sophistiqué"]
  },
  cafe_enfants: {
    label: "Café enfants",
    services: ["Aire de jeux", "Chaises hautes", "Animations", "Sécurisé", "Familial"],
    ambiance: ["Familiale", "Amusante", "Sécurisée", "Colorée"],
    primaryTags: ["café", "enfants", "familial", "aire", "jeux"],
    secondaryTags: ["chaises", "hautes", "animations", "sécurisé", "coloré"],
    relatedTags: ["familial", "enfants", "amusant", "sécurisé", "chaleureux"]
  },
  cafe_afterwork: {
    label: "Café afterwork",
    services: ["Happy hour", "Réseautage", "Détente", "Professionnel"],
    ambiance: ["Moderne", "Urbaine", "Conviviale", "Professionnelle"],
    primaryTags: ["café", "afterwork", "travail", "bureau", "soirée"],
    secondaryTags: ["collègues", "détente", "happy hour", "convivial", "professionnel"],
    relatedTags: ["réseautage", "décompression", "collaboration", "moderne", "urbain"]
  },
  cafe_brunch: {
    label: "Café brunch",
    services: ["Brunch weekend", "Œufs Benedict", "Pancakes", "Mimosa", "Détente"],
    ambiance: ["Chaleureuse", "Familiale", "Détendue", "Dominicale"],
    primaryTags: ["café", "brunch", "weekend", "matin", "déjeuner"],
    secondaryTags: ["œufs", "benedict", "pancakes", "mimosa", "détente"],
    relatedTags: ["famille", "paresseux", "gourmand", "chaleureux", "dominical"]
  },
  cafe_glacé: {
    label: "Café glacé",
    services: ["Glaces artisanales", "Sundae", "Milkshakes", "Desserts", "Rafraîchissant"],
    ambiance: ["Amusante", "Familiale", "Rafraîchissante", "Gourmande"],
    primaryTags: ["café", "glacé", "glace", "dessert", "sucré"],
    secondaryTags: ["parfums", "cônes", "sundae", "milkshake", "gourmandise"],
    relatedTags: ["enfants", "famille", "été", "rafraîchissant", "amusant"]
  },
  cafe_emporter: {
    label: "Café emporter",
    services: ["Café express", "Takeaway", "Mobile", "Rapide", "Pratique"],
    ambiance: ["Pratique", "Rapide", "Urbaine", "Moderne"],
    primaryTags: ["café", "emporter", "takeaway", "rapide", "pratique"],
    secondaryTags: ["express", "mobile", "bureau", "déplacement", "efficace"],
    relatedTags: ["pratique", "rapide", "urbain", "moderne", "efficace"]
  },
  cafe_terrasse: {
    label: "Café terrasse",
    services: ["Terrasse extérieure", "Vue", "Plein air", "Soleil", "Été"],
    ambiance: ["Naturelle", "Romantique", "Familiale", "Détendue"],
    primaryTags: ["café", "terrasse", "extérieur", "plein", "air"],
    secondaryTags: ["soleil", "été", "vue", "rue", "passants"],
    relatedTags: ["naturel", "romantique", "familial", "détente", "saisonnier"]
  },
  cafe_nuit: {
    label: "Café de nuit",
    services: ["Ouverture tardive", "Ambiance intimiste", "Éclairage doux", "Romantique"],
    ambiance: ["Romantique", "Intimiste", "Spéciale", "Nocturne"],
    primaryTags: ["café", "nuit", "nocturne", "tard", "soirée"],
    secondaryTags: ["ambiance", "éclairage", "intimiste", "romantique", "spécial"],
    relatedTags: ["romantique", "intimiste", "spécial", "nocturne", "unique"]
  },

  // 🏛️ MUSÉES - Informations complètes
  musee_art: {
    label: "Musée d'art",
    services: ["Collections permanentes", "Expositions temporaires", "Visites guidées", "Ateliers", "Conférences"],
    ambiance: ["Culturelle", "Sophistiquée", "Intellectuelle", "Raffinée"],
    primaryTags: ["musée", "art", "peinture", "sculpture", "exposition"],
    secondaryTags: ["collections", "permanente", "temporaire", "culturel", "artistique"],
    relatedTags: ["culturel", "sophistiqué", "intellectuel", "découverte", "raffiné"]
  },
  musee_histoire: {
    label: "Musée d'histoire",
    services: ["Collections historiques", "Objets d'époque", "Expositions thématiques", "Visites guidées", "Éducatif"],
    ambiance: ["Éducative", "Culturelle", "Traditionnelle", "Intellectuelle"],
    primaryTags: ["musée", "histoire", "historique", "patrimoine", "archéologie"],
    secondaryTags: ["collections", "objets", "civilisations", "époques", "découverte"],
    relatedTags: ["éducatif", "culturel", "traditionnel", "découverte", "intellectuel"]
  },
  musee_science: {
    label: "Musée des sciences",
    services: ["Expériences interactives", "Expositions scientifiques", "Ateliers", "Démonstrations", "Éducatif"],
    ambiance: ["Éducative", "Interactive", "Futuriste", "Innovante"],
    primaryTags: ["musée", "science", "technologie", "innovation", "découverte"],
    secondaryTags: ["expériences", "interactif", "éducatif", "futuriste", "expérimental"],
    relatedTags: ["éducatif", "interactif", "futuriste", "découverte", "innovant"]
  },
  musee_nature: {
    label: "Musée d'histoire naturelle",
    services: ["Collections naturelles", "Fossiles", "Minéraux", "Biodiversité", "Environnement"],
    ambiance: ["Naturelle", "Éducative", "Authentique", "Découverte"],
    primaryTags: ["musée", "nature", "histoire", "naturelle", "animaux"],
    secondaryTags: ["fossiles", "minéraux", "biodiversité", "environnement", "découverte"],
    relatedTags: ["naturel", "éducatif", "découverte", "environnemental", "authentique"]
  },
  musee_enfants: {
    label: "Musée pour enfants",
    services: ["Expositions interactives", "Ateliers créatifs", "Jeux éducatifs", "Apprentissage", "Famille"],
    ambiance: ["Éducative", "Interactive", "Familiale", "Amusante"],
    primaryTags: ["musée", "enfants", "interactif", "découverte", "éducatif"],
    secondaryTags: ["ateliers", "expositions", "jeux", "apprentissage", "famille"],
    relatedTags: ["éducatif", "interactif", "découverte", "intellectuel", "familial"]
  },
  musee_contemporain: {
    label: "Musée d'art contemporain",
    services: ["Installations", "Performances", "Art multimédia", "Expositions innovantes", "Création"],
    ambiance: ["Moderne", "Innovante", "Créative", "Avant-garde"],
    primaryTags: ["musée", "contemporain", "art", "moderne", "création"],
    secondaryTags: ["installations", "performances", "multimédia", "innovant", "créatif"],
    relatedTags: ["moderne", "innovant", "créatif", "artistique", "avant-garde"]
  },
  musee_ethnographie: {
    label: "Musée d'ethnographie",
    services: ["Collections culturelles", "Objets traditionnels", "Artisanat", "Coutumes", "Diversité"],
    ambiance: ["Culturelle", "Diverse", "Authentique", "Traditionnelle"],
    primaryTags: ["musée", "ethnographie", "cultures", "peuples", "traditions"],
    secondaryTags: ["artisanat", "coutumes", "objets", "sociétés", "diversité"],
    relatedTags: ["culturel", "diversité", "traditionnel", "authentique", "découverte"]
  },
  musee_maritime: {
    label: "Musée maritime",
    services: ["Collections navales", "Bateaux", "Histoire maritime", "Exploration", "Navigation"],
    ambiance: ["Océane", "Aventure", "Historique", "Exploration"],
    primaryTags: ["musée", "maritime", "navire", "océan", "navigation"],
    secondaryTags: ["bateaux", "exploration", "commerce", "pêche", "aventures"],
    relatedTags: ["océan", "aventure", "exploration", "historique", "découverte"]
  },
  musee_militaire: {
    label: "Musée militaire",
    services: ["Collections militaires", "Armes", "Uniformes", "Véhicules", "Mémoire"],
    ambiance: ["Historique", "Patriotique", "Traditionnelle", "Éducative"],
    primaryTags: ["musée", "militaire", "guerre", "armée", "histoire"],
    secondaryTags: ["armes", "uniformes", "véhicules", "batailles", "mémoire"],
    relatedTags: ["historique", "patriotique", "mémoire", "traditionnel", "éducatif"]
  },
  musee_automobile: {
    label: "Musée automobile",
    services: ["Collections de voitures", "Véhicules vintage", "Sportives", "Moteurs", "Design"],
    ambiance: ["Mécanique", "Vintage", "Passionnée", "Technologique"],
    primaryTags: ["musée", "automobile", "voitures", "véhicules", "collection"],
    secondaryTags: ["vintage", "sportives", "classiques", "moteurs", "design"],
    relatedTags: ["mécanique", "vintage", "collection", "passion", "technologique"]
  },
  musee_ferroviaire: {
    label: "Musée ferroviaire",
    services: ["Collections ferroviaires", "Locomotives", "Wagons", "Histoire du rail", "Transport"],
    ambiance: ["Nostalgique", "Historique", "Mécanique", "Éducative"],
    primaryTags: ["musée", "ferroviaire", "trains", "chemin", "fer"],
    secondaryTags: ["locomotives", "wagons", "gares", "transport", "histoire"],
    relatedTags: ["transport", "historique", "mécanique", "nostalgique", "éducatif"]
  },
  musee_aviation: {
    label: "Musée de l'aviation",
    services: ["Collections aéronautiques", "Avions", "Hélicoptères", "Histoire du vol", "Pilotes"],
    ambiance: ["Aéronautique", "Technologique", "Aventure", "Innovante"],
    primaryTags: ["musée", "aviation", "avions", "aéronautique", "vol"],
    secondaryTags: ["avions", "hélicoptères", "moteurs", "pilotes", "histoire"],
    relatedTags: ["aéronautique", "technologique", "aventure", "historique", "innovant"]
  },
  musee_espace: {
    label: "Musée de l'espace",
    services: ["Collections spatiales", "Fusées", "Satellites", "Exploration", "Scientifique"],
    ambiance: ["Futuriste", "Scientifique", "Innovante", "Éducative"],
    primaryTags: ["musée", "espace", "astronomie", "cosmos", "planètes"],
    secondaryTags: ["fusées", "satellites", "exploration", "scientifique", "futuriste"],
    relatedTags: ["futuriste", "scientifique", "découverte", "innovant", "éducatif"]
  },
  musee_photographie: {
    label: "Musée de la photographie",
    services: ["Expositions photos", "Artistes", "Techniques", "Histoire", "Création"],
    ambiance: ["Artistique", "Créative", "Visuelle", "Culturelle"],
    primaryTags: ["musée", "photographie", "photos", "images", "art"],
    secondaryTags: ["expositions", "artistes", "techniques", "histoire", "création"],
    relatedTags: ["artistique", "créatif", "visuel", "culturel", "moderne"]
  },
  musee_musique: {
    label: "Musée de la musique",
    services: ["Collections musicales", "Instruments", "Concerts", "Enregistrements", "Histoire"],
    ambiance: ["Musicale", "Culturelle", "Artistique", "Émotionnelle"],
    primaryTags: ["musée", "musique", "instruments", "compositeurs", "sons"],
    secondaryTags: ["concerts", "enregistrements", "histoire", "artistes", "culturel"],
    relatedTags: ["musical", "culturel", "artistique", "créatif", "émotionnel"]
  },
  musee_architecture: {
    label: "Musée d'architecture",
    services: ["Collections architecturales", "Maquettes", "Plans", "Techniques", "Histoire"],
    ambiance: ["Créative", "Technique", "Historique", "Innovante"],
    primaryTags: ["musée", "architecture", "bâtiments", "design", "construction"],
    secondaryTags: ["maquettes", "plans", "techniques", "histoire", "création"],
    relatedTags: ["créatif", "technique", "historique", "artistique", "innovant"]
  },
  musee_archéologie: {
    label: "Musée d'archéologie",
    services: ["Collections archéologiques", "Artefacts", "Fouilles", "Civilisations", "Découvertes"],
    ambiance: ["Historique", "Authentique", "Éducative", "Découverte"],
    primaryTags: ["musée", "archéologie", "fouilles", "civilisations", "antiquité"],
    secondaryTags: ["artefacts", "fossiles", "vestiges", "découvertes", "histoire"],
    relatedTags: ["historique", "découverte", "authentique", "éducatif", "culturel"]
  },
  musee_ethnologie: {
    label: "Musée d'ethnologie",
    services: ["Collections ethnologiques", "Traditions", "Coutumes", "Sociétés", "Diversité"],
    ambiance: ["Culturelle", "Diverse", "Authentique", "Éducative"],
    primaryTags: ["musée", "ethnologie", "anthropologie", "sociétés", "cultures"],
    secondaryTags: ["traditions", "coutumes", "objets", "peuples", "diversité"],
    relatedTags: ["culturel", "diversité", "traditionnel", "authentique", "éducatif"]
  },
  musee_technologie: {
    label: "Musée de la technologie",
    services: ["Collections technologiques", "Inventions", "Machines", "Innovation", "Industrie"],
    ambiance: ["Technologique", "Innovante", "Futuriste", "Scientifique"],
    primaryTags: ["musée", "technologie", "innovation", "machines", "industrie"],
    secondaryTags: ["inventions", "développement", "futuriste", "expérimental", "scientifique"],
    relatedTags: ["technologique", "innovant", "futuriste", "scientifique", "éducatif"]
  },
  musee_virtuel: {
    label: "Musée virtuel",
    services: ["Visites virtuelles", "Expositions numériques", "Multimédia", "Accessible", "Innovant"],
    ambiance: ["Moderne", "Technologique", "Accessible", "Innovante"],
    primaryTags: ["musée", "virtuel", "numérique", "en ligne", "interactif"],
    secondaryTags: ["visite", "virtuelle", "multimédia", "technologie", "accessible"],
    relatedTags: ["moderne", "technologique", "accessible", "innovant", "futuriste"]
  },

  // 🎬 CINÉMA - Informations complètes
  cinema_multiplexe: {
    label: "Cinéma multiplexe",
    services: ["Films blockbusters", "Popcorn", "Boissons", "Salles multiples", "Confort"],
    ambiance: ["Familiale", "Accessible", "Populaire", "Divertissement"],
    primaryTags: ["cinéma", "multiplexe", "films", "salles", "blockbusters"],
    secondaryTags: ["popcorn", "boissons", "confort", "grand", "écran"],
    relatedTags: ["familial", "accessible", "populaire", "divertissement", "sortie"]
  },
  cinema_art_essai: {
    label: "Cinéma d'art et d'essai",
    services: ["Films indépendants", "Festivals", "Découvertes", "Programmation culturelle"],
    ambiance: ["Culturelle", "Intellectuelle", "Sophistiquée", "Cinéphile"],
    primaryTags: ["cinéma", "art", "essai", "indépendant", "auteur"],
    secondaryTags: ["festival", "découverte", "culturel", "intellectuel", "raffiné"],
    relatedTags: ["cinéphile", "culturel", "sophistiqué", "original", "artistique"]
  },
  cinema_imax: {
    label: "Cinéma IMAX",
    services: ["Grand écran", "Technologie IMAX", "Expérience immersive", "Films spectaculaires"],
    ambiance: ["Spectaculaire", "Technologique", "Immersive", "Premium"],
    primaryTags: ["cinéma", "imax", "grand", "écran", "immersion"],
    secondaryTags: ["spectaculaire", "technologie", "expérience", "premium", "sensation"],
    relatedTags: ["impressionnant", "technologique", "immersif", "unique", "mémorable"]
  },
  drive_in: {
    label: "Drive-in",
    services: ["Cinéma en voiture", "Son radio", "Snacks", "Expérience vintage"],
    ambiance: ["Rétro", "Originale", "Familiale", "Nostalgique"],
    primaryTags: ["drive-in", "voiture", "cinéma", "extérieur", "vintage"],
    secondaryTags: ["rétro", "original", "voiture", "été", "familial"],
    relatedTags: ["nostalgique", "unique", "décontracté", "romantique", "original"]
  },
  cinema_4dx: {
    label: "Cinéma 4DX",
    services: ["Effets sensoriels", "Mouvement", "Vent", "Odeurs", "Immersion totale"],
    ambiance: ["Sensorielle", "Innovante", "Unique", "Technologique"],
    primaryTags: ["cinéma", "4dx", "mouvement", "effets", "sensoriel"],
    secondaryTags: ["vibration", "vent", "eau", "odeurs", "immersion"],
    relatedTags: ["sensoriel", "innovant", "expérience", "unique", "technologique"]
  },
  cinema_dolby_atmos: {
    label: "Cinéma Dolby Atmos",
    services: ["Son spatial", "Audio premium", "Technologie Dolby", "Expérience audio"],
    ambiance: ["Audio", "Premium", "Technologique", "Immersive"],
    primaryTags: ["cinéma", "dolby", "atmos", "son", "premium"],
    secondaryTags: ["audio", "qualité", "immersion", "technologie", "expérience"],
    relatedTags: ["audio", "qualité", "technologique", "premium", "immersif"]
  },
  cinema_3d: {
    label: "Cinéma 3D",
    services: ["Projection 3D", "Lunettes 3D", "Effets stéréoscopiques", "Films 3D"],
    ambiance: ["Visuelle", "Technologique", "Immersive", "Spectaculaire"],
    primaryTags: ["cinéma", "3d", "stéréoscopique", "lunettes", "effet"],
    secondaryTags: ["immersion", "technologie", "spectaculaire", "visuel", "expérience"],
    relatedTags: ["visuel", "technologique", "immersif", "spectaculaire", "moderne"]
  },
  cinema_retro: {
    label: "Cinéma rétro",
    services: ["Films classiques", "Ambiance vintage", "Programmation nostalgique", "Charme d'époque"],
    ambiance: ["Nostalgique", "Authentique", "Charmante", "Traditionnelle"],
    primaryTags: ["cinéma", "rétro", "vintage", "classique", "nostalgie"],
    secondaryTags: ["ancien", "traditionnel", "authentique", "charme", "histoire"],
    relatedTags: ["nostalgique", "authentique", "charmant", "traditionnel", "unique"]
  },
  cinema_open_air: {
    label: "Cinéma plein air",
    services: ["Projection extérieure", "Terrasse", "Nature", "Expérience estivale"],
    ambiance: ["Naturelle", "Romantique", "Familiale", "Détendue"],
    primaryTags: ["cinéma", "plein", "air", "extérieur", "été"],
    secondaryTags: ["terrasse", "nature", "romantique", "familial", "détente"],
    relatedTags: ["naturel", "romantique", "familial", "détente", "saisonnier"]
  },
  cinema_marathon: {
    label: "Cinéma marathon",
    services: ["Séances longues", "Sagas complètes", "Programmation spéciale", "Expérience intensive"],
    ambiance: ["Passionnée", "Intensive", "Gourmande", "Communautaire"],
    primaryTags: ["cinéma", "marathon", "saga", "séries", "longue"],
    secondaryTags: ["passionné", "intensif", "gourmand", "expérience", "unique"],
    relatedTags: ["passionné", "intensif", "gourmand", "expérience", "communauté"]
  },
  cinema_theme: {
    label: "Cinéma thématique",
    services: ["Programmation spécialisée", "Genres spécifiques", "Curations expertes", "Communauté"],
    ambiance: ["Spécialisée", "Expert", "Communautaire", "Passionnée"],
    primaryTags: ["cinéma", "thème", "spécialisé", "genre", "programmation"],
    secondaryTags: ["sélection", "curation", "expert", "passionné", "communauté"],
    relatedTags: ["spécialisé", "curation", "expert", "communauté", "passionné"]
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

  // 🎢 SENSATIONS FORTES & AVENTURE - Informations complètes
  circuit_voiture_sport: {
    label: "Circuit voiture de sport",
    services: ["Tours de circuit", "Voiture de sport", "Piste", "Instructeur", "Sécurité"],
    ambiance: ["Adrénaline", "Vitesse", "Sportive", "Mémorable"],
    primaryTags: ["circuit", "voiture", "sport", "vitesse", "adrénaline"],
    secondaryTags: ["piste", "course", "sportive", "sensation", "forte"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  circuit_moto: {
    label: "Circuit moto",
    services: ["Tours de circuit", "Moto", "Piste", "Instructeur", "Sécurité"],
    ambiance: ["Adrénaline", "Vitesse", "Sportive", "Mémorable"],
    primaryTags: ["circuit", "moto", "vitesse", "adrénaline", "sport"],
    secondaryTags: ["piste", "course", "moto", "sensation", "forte"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  bapteme_ulm: {
    label: "Baptême ULM",
    services: ["Vol en ULM", "Vue panoramique", "Pilote professionnel", "Sécurité", "Découverte"],
    ambiance: ["Aérienne", "Sensation forte", "Découverte", "Unique"],
    primaryTags: ["ulm", "baptême", "vol", "avion", "ciel"],
    secondaryTags: ["aérien", "sensation", "forte", "vue", "panoramique"],
    relatedTags: ["aventure", "aérien", "découverte", "unique", "mémorable"]
  },
  parachutisme: {
    label: "Parachutisme",
    services: ["Saut en parachute", "Tandem", "Instructeur", "Sécurité", "Vidéo"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["parachutisme", "parachute", "saut", "ciel", "adrénaline"],
    secondaryTags: ["tandem", "duo", "sensation", "forte", "chute", "libre"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  saut_elastique: {
    label: "Saut à l'élastique",
    services: ["Saut bungee", "Hauteur", "Sécurité", "Équipement", "Sensation"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["saut", "élastique", "bungee", "jump", "adrénaline"],
    secondaryTags: ["sensation", "forte", "hauteur", "chute", "extrême"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  parapente: {
    label: "Parapente",
    services: ["Vol en parapente", "Décollage", "Pilote", "Vue panoramique", "Sécurité"],
    ambiance: ["Aérienne", "Naturelle", "Découverte", "Unique"],
    primaryTags: ["parapente", "vol", "libre", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "nature"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  deltaplane: {
    label: "Deltaplane",
    services: ["Vol en deltaplane", "Décollage", "Pilote", "Vue panoramique", "Sécurité"],
    ambiance: ["Aérienne", "Naturelle", "Découverte", "Unique"],
    primaryTags: ["deltaplane", "vol", "libre", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "nature"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  bapteme_helicoptere: {
    label: "Baptême hélicoptère",
    services: ["Vol en hélicoptère", "Vue panoramique", "Pilote professionnel", "Luxe", "Sécurité"],
    ambiance: ["Luxueuse", "Aérienne", "Découverte", "Mémorable"],
    primaryTags: ["hélicoptère", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "luxe"],
    relatedTags: ["aventure", "aérien", "luxe", "découverte", "mémorable"]
  },
  bapteme_avion: {
    label: "Baptême avion",
    services: ["Vol en avion", "Vue panoramique", "Pilote professionnel", "Sécurité", "Découverte"],
    ambiance: ["Aérienne", "Découverte", "Unique", "Mémorable"],
    primaryTags: ["avion", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "aérien"],
    relatedTags: ["aventure", "aérien", "découverte", "unique", "mémorable"]
  },
  vol_cerf_volant: {
    label: "Vol cerf-volant / Kitesurf",
    services: ["Kitesurf", "Traction", "Mer", "Plage", "Instructeur"],
    ambiance: ["Sportive", "Naturelle", "Aventure", "Unique"],
    primaryTags: ["cerf-volant", "traction", "kite", "surf", "vent"],
    secondaryTags: ["sensation", "forte", "mer", "plage", "sport"],
    relatedTags: ["aventure", "sport", "nature", "mer", "unique"]
  },
  accrobranche: {
    label: "Accrobranche",
    services: ["Parcours aérien", "Tyrolienne", "Hauteur", "Sécurité", "Moniteur"],
    ambiance: ["Aventure", "Naturelle", "Défi", "Familiale"],
    primaryTags: ["accrobranche", "arbre", "tyrolienne", "aventure", "nature"],
    secondaryTags: ["parcours", "hauteur", "défi", "sécurisé", "famille"],
    relatedTags: ["aventure", "nature", "défi", "famille", "découverte"]
  },
  tyrolienne: {
    label: "Tyrolienne",
    services: ["Glisse sur corde", "Hauteur", "Vitesse", "Sécurité", "Sensation"],
    ambiance: ["Aventure", "Naturelle", "Défi", "Unique"],
    primaryTags: ["tyrolienne", "glisse", "corde", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "hauteur", "vitesse", "défi"],
    relatedTags: ["aventure", "nature", "défi", "famille", "unique"]
  },
  via_ferrata: {
    label: "Via ferrata",
    services: ["Escalade sécurisée", "Falaise", "Hauteur", "Équipement", "Guide"],
    ambiance: ["Aventure", "Naturelle", "Défi", "Sportive"],
    primaryTags: ["via", "ferrata", "escalade", "falaise", "aventure"],
    secondaryTags: ["sensation", "forte", "hauteur", "défi", "nature"],
    relatedTags: ["aventure", "nature", "défi", "sport", "unique"]
  },
  escalade: {
    label: "Escalade",
    services: ["Escalade falaise", "Mur d'escalade", "Équipement", "Moniteur", "Sécurité"],
    ambiance: ["Sportive", "Défi", "Technique", "Aventure"],
    primaryTags: ["escalade", "falaise", "mur", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "hauteur", "défi", "technique"],
    relatedTags: ["aventure", "sport", "défi", "technique", "unique"]
  },
  canyoning: {
    label: "Canyoning",
    services: ["Descente canyon", "Eau vive", "Rapide", "Équipement", "Guide"],
    ambiance: ["Aventure", "Naturelle", "Sportive", "Unique"],
    primaryTags: ["canyoning", "canyon", "eau", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "descente", "rapide", "sport"],
    relatedTags: ["aventure", "nature", "eau", "sport", "unique"]
  },
  rafting: {
    label: "Rafting",
    services: ["Descente rivière", "Eau vive", "Équipe", "Équipement", "Guide"],
    ambiance: ["Aventure", "Sportive", "Conviviale", "Unique"],
    primaryTags: ["rafting", "eau", "vive", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "rivière", "rapide", "équipe"],
    relatedTags: ["aventure", "sport", "eau", "équipe", "unique"]
  },
  hydrospeed: {
    label: "Hydrospeed",
    services: ["Descente rivière", "Eau vive", "Individuel", "Équipement", "Guide"],
    ambiance: ["Aventure", "Sportive", "Extrême", "Unique"],
    primaryTags: ["hydrospeed", "eau", "vive", "aventure", "sport"],
    secondaryTags: ["sensation", "forte", "rivière", "rapide", "individuel"],
    relatedTags: ["aventure", "sport", "eau", "extrême", "unique"]
  },
  surf: {
    label: "Surf",
    services: ["Surf vague", "Mer", "Océan", "Planche", "Cours"],
    ambiance: ["Sportive", "Naturelle", "Aventure", "Unique"],
    primaryTags: ["surf", "vague", "mer", "océan", "sport"],
    secondaryTags: ["sensation", "forte", "glisse", "nature", "plage"],
    relatedTags: ["aventure", "sport", "mer", "nature", "unique"]
  },
  kitesurf: {
    label: "Kitesurf",
    services: ["Kitesurf", "Vent", "Mer", "Planche", "Cours"],
    ambiance: ["Sportive", "Naturelle", "Aventure", "Unique"],
    primaryTags: ["kitesurf", "kite", "surf", "vent", "mer"],
    secondaryTags: ["sensation", "forte", "glisse", "nature", "sport"],
    relatedTags: ["aventure", "sport", "mer", "nature", "unique"]
  },
  wingsuit: {
    label: "Wingsuit",
    services: ["Vol wingsuit", "Chute libre", "Parachute", "Extrême", "Sécurité"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["wingsuit", "vol", "libre", "ciel", "extrême"],
    secondaryTags: ["sensation", "forte", "adrénaline", "parachute", "chute"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  saut_en_chute_libre: {
    label: "Saut en chute libre",
    services: ["Chute libre", "Parachute", "Tandem", "Sécurité", "Vidéo"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["chute", "libre", "parachute", "ciel", "adrénaline"],
    secondaryTags: ["sensation", "forte", "extrême", "tandem", "saut"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  bapteme_voiture_course: {
    label: "Baptême voiture de course",
    services: ["Tours de circuit", "Voiture de course", "Pilote", "Sécurité", "Sensation"],
    ambiance: ["Adrénaline", "Vitesse", "Sportive", "Mémorable"],
    primaryTags: ["voiture", "course", "baptême", "circuit", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "piste", "sportive"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  bapteme_moto_course: {
    label: "Baptême moto de course",
    services: ["Tours de circuit", "Moto de course", "Pilote", "Sécurité", "Sensation"],
    ambiance: ["Adrénaline", "Vitesse", "Sportive", "Mémorable"],
    primaryTags: ["moto", "course", "baptême", "circuit", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "piste", "sportive"],
    relatedTags: ["adrénaline", "vitesse", "sport", "aventure", "mémorable"]
  },
  quad: {
    label: "Quad",
    services: ["Quad tout terrain", "Parcours", "Nature", "Équipement", "Guide"],
    ambiance: ["Aventure", "Sportive", "Naturelle", "Unique"],
    primaryTags: ["quad", "tout", "terrain", "aventure", "nature"],
    secondaryTags: ["sensation", "forte", "adrénaline", "chemin", "sport"],
    relatedTags: ["aventure", "sport", "nature", "défi", "unique"]
  },
  buggy: {
    label: "Buggy",
    services: ["Buggy désert", "Sable", "Vitesse", "Équipement", "Guide"],
    ambiance: ["Aventure", "Sportive", "Naturelle", "Unique"],
    primaryTags: ["buggy", "désert", "aventure", "sport", "nature"],
    secondaryTags: ["sensation", "forte", "adrénaline", "sable", "vitesse"],
    relatedTags: ["aventure", "sport", "nature", "défi", "unique"]
  },
  jet_ski: {
    label: "Jet ski",
    services: ["Jet ski", "Mer", "Vitesse", "Équipement", "Sécurité"],
    ambiance: ["Aventure", "Sportive", "Vitesse", "Unique"],
    primaryTags: ["jet", "ski", "mer", "eau", "vitesse"],
    secondaryTags: ["sensation", "forte", "adrénaline", "glisse", "sport"],
    relatedTags: ["aventure", "sport", "mer", "vitesse", "unique"]
  },
  flyboard: {
    label: "Flyboard",
    services: ["Flyboard", "Vol eau", "Sensation", "Équipement", "Instructeur"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["flyboard", "vol", "eau", "sensation", "forte"],
    secondaryTags: ["adrénaline", "extrême", "mer", "sport", "unique"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  plongee: {
    label: "Plongée sous-marine",
    services: ["Plongée", "Mer", "Océan", "Découverte", "Équipement"],
    ambiance: ["Aventure", "Naturelle", "Découverte", "Unique"],
    primaryTags: ["plongée", "sous-marine", "mer", "océan", "découverte"],
    secondaryTags: ["sensation", "forte", "nature", "poissons", "aventure"],
    relatedTags: ["aventure", "nature", "mer", "découverte", "unique"]
  },
  plongee_bouteille: {
    label: "Plongée bouteille",
    services: ["Plongée scaphandre", "Bouteille", "Profondeur", "Équipement", "Guide"],
    ambiance: ["Aventure", "Naturelle", "Découverte", "Unique"],
    primaryTags: ["plongée", "bouteille", "scaphandre", "mer", "océan"],
    secondaryTags: ["sensation", "forte", "nature", "profondeur", "aventure"],
    relatedTags: ["aventure", "nature", "mer", "découverte", "unique"]
  },
  plongee_apnee: {
    label: "Plongée apnée",
    services: ["Plongée libre", "Apnée", "Profondeur", "Technique", "Guide"],
    ambiance: ["Aventure", "Sportive", "Défi", "Unique"],
    primaryTags: ["plongée", "apnée", "libre", "mer", "océan"],
    secondaryTags: ["sensation", "forte", "nature", "profondeur", "sport"],
    relatedTags: ["aventure", "sport", "mer", "défi", "unique"]
  },
  saut_parachute_tandem: {
    label: "Saut parachute tandem",
    services: ["Saut tandem", "Parachute", "Duo", "Instructeur", "Sécurité"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["parachute", "tandem", "duo", "saut", "ciel"],
    secondaryTags: ["sensation", "forte", "adrénaline", "chute", "libre"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
  },
  bapteme_planeur: {
    label: "Baptême planeur",
    services: ["Vol planeur", "Vue panoramique", "Silence", "Pilote", "Sécurité"],
    ambiance: ["Aérienne", "Naturelle", "Découverte", "Unique"],
    primaryTags: ["planeur", "baptême", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "silence"],
    relatedTags: ["aventure", "aérien", "nature", "découverte", "unique"]
  },
  bapteme_hot_air_balloon: {
    label: "Baptême montgolfière",
    services: ["Vol montgolfière", "Ballon", "Vue panoramique", "Romantique", "Sécurité"],
    ambiance: ["Romantique", "Aérienne", "Découverte", "Unique"],
    primaryTags: ["montgolfière", "ballon", "vol", "ciel", "aérien"],
    secondaryTags: ["sensation", "forte", "vue", "panoramique", "romantique"],
    relatedTags: ["aventure", "aérien", "romantique", "découverte", "unique"]
  },
  saut_base_jump: {
    label: "Base jump",
    services: ["Saut extrême", "Parachute", "Hauteur", "Extrême", "Sécurité"],
    ambiance: ["Adrénaline", "Extrême", "Aventure", "Mémorable"],
    primaryTags: ["base", "jump", "saut", "extrême", "adrénaline"],
    secondaryTags: ["sensation", "forte", "parachute", "hauteur", "extrême"],
    relatedTags: ["adrénaline", "extrême", "aventure", "unique", "mémorable"]
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

  // 💆 Soins & Beauté - Informations complètes
  coiffeur: {
    label: "Coiffeur",
    services: ["Coupe", "Coloration", "Mise en plis", "Soin cheveux", "Conseil"],
    ambiance: ["Professionnelle", "Relaxante", "Soignée", "Accueillante"],
    primaryTags: ["coiffeur", "salon", "coupe", "cheveux", "coiffure"],
    secondaryTags: ["coloration", "mise", "plis", "soin", "cheveux"],
    relatedTags: ["beauté", "soin", "personnel", "relaxation", "professionnel"]
  },
  coiffeur_homme: {
    label: "Coiffeur homme",
    services: ["Coupe homme", "Barbe", "Rasage", "Soin barbe", "Tondeuse"],
    ambiance: ["Masculine", "Traditionnelle", "Professionnelle", "Décontractée"],
    primaryTags: ["coiffeur", "homme", "coupe", "barbe", "rasage"],
    secondaryTags: ["tondeuse", "ciseaux", "soin", "barbe", "moustache"],
    relatedTags: ["masculin", "soin", "personnel", "traditionnel", "professionnel"]
  },
  coiffeur_femme: {
    label: "Coiffeur femme",
    services: ["Coupe femme", "Coloration", "Mèches", "Balayage", "Mise en plis", "Soin"],
    ambiance: ["Féminine", "Raffinée", "Professionnelle", "Soignée"],
    primaryTags: ["coiffeur", "femme", "coupe", "coloration", "mise"],
    secondaryTags: ["plis", "balayage", "mèches", "soin", "cheveux"],
    relatedTags: ["féminin", "beauté", "soin", "personnel", "professionnel"]
  },
  coiffeur_enfant: {
    label: "Coiffeur enfant",
    services: ["Coupe enfant", "Soin doux", "Patience", "Rapide", "Amusant"],
    ambiance: ["Familiale", "Décontractée", "Patiente", "Amusante"],
    primaryTags: ["coiffeur", "enfant", "coupe", "famille", "jeune"],
    secondaryTags: ["doux", "rapide", "amusant", "patience", "soin"],
    relatedTags: ["familial", "décontracté", "enfants", "soin", "personnel"]
  },
  salon_beaute: {
    label: "Salon de beauté",
    services: ["Soin visage", "Soin corps", "Épilation", "Manucure", "Pédicure", "Maquillage"],
    ambiance: ["Relaxante", "Professionnelle", "Soignée", "Détendue"],
    primaryTags: ["salon", "beauté", "soin", "visage", "corps"],
    secondaryTags: ["esthétique", "relaxation", "bien-être", "professionnel", "soin"],
    relatedTags: ["détente", "soin", "personnel", "beauté", "relaxation"]
  },
  institut_beaute: {
    label: "Institut de beauté",
    services: ["Soin visage", "Soin corps", "Épilation", "Manucure", "Pédicure", "Massage"],
    ambiance: ["Raffinée", "Professionnelle", "Luxueuse", "Détendue"],
    primaryTags: ["institut", "beauté", "soin", "visage", "corps"],
    secondaryTags: ["esthétique", "relaxation", "bien-être", "professionnel", "soin"],
    relatedTags: ["détente", "soin", "personnel", "beauté", "raffiné"]
  },
  massage: {
    label: "Massage",
    services: ["Massage corps", "Relaxation", "Bien-être", "Soin professionnel"],
    ambiance: ["Relaxante", "Apaisante", "Professionnelle", "Détendue"],
    primaryTags: ["massage", "relaxation", "bien-être", "corps", "détente"],
    secondaryTags: ["huile", "soin", "professionnel", "thérapeutique", "relaxant"],
    relatedTags: ["détente", "soin", "personnel", "bien-être", "relaxation"]
  },
  massage_relaxant: {
    label: "Massage relaxant",
    services: ["Massage doux", "Aromathérapie", "Relaxation", "Bien-être", "Détente"],
    ambiance: ["Calme", "Zen", "Apaisante", "Relaxante"],
    primaryTags: ["massage", "relaxant", "détente", "bien-être", "corps"],
    secondaryTags: ["huile", "aromathérapie", "calme", "zen", "relaxation"],
    relatedTags: ["détente", "soin", "personnel", "bien-être", "apaisant"]
  },
  massage_sportif: {
    label: "Massage sportif",
    services: ["Massage musculaire", "Récupération", "Décontractant", "Thérapeutique"],
    ambiance: ["Sportive", "Professionnelle", "Thérapeutique", "Efficace"],
    primaryTags: ["massage", "sportif", "sport", "récupération", "muscles"],
    secondaryTags: ["thérapeutique", "décontractant", "sport", "performance", "soin"],
    relatedTags: ["sport", "récupération", "soin", "personnel", "thérapeutique"]
  },
  massage_oriental: {
    label: "Massage oriental",
    services: ["Massage traditionnel", "Huile chaude", "Techniques orientales", "Bien-être"],
    ambiance: ["Traditionnelle", "Exotique", "Relaxante", "Authentique"],
    primaryTags: ["massage", "oriental", "traditionnel", "bien-être", "corps"],
    secondaryTags: ["huile", "chaud", "traditionnel", "relaxation", "soin"],
    relatedTags: ["traditionnel", "exotique", "soin", "personnel", "découverte"]
  },
  spa: {
    label: "Spa",
    services: ["Massage", "Jacuzzi", "Sauna", "Hammam", "Soin visage", "Soin corps"],
    ambiance: ["Luxueuse", "Relaxante", "Premium", "Détendue"],
    primaryTags: ["spa", "bien-être", "relaxation", "détente", "soin"],
    secondaryTags: ["jacuzzi", "sauna", "hammam", "massage", "bien-être"],
    relatedTags: ["luxe", "détente", "soin", "personnel", "premium"]
  },
  centre_esthetique: {
    label: "Centre esthétique",
    services: ["Soin visage", "Soin corps", "Épilation", "Manucure", "Pédicure", "Massage"],
    ambiance: ["Professionnelle", "Raffinée", "Soignée", "Détendue"],
    primaryTags: ["centre", "esthétique", "beauté", "soin", "visage"],
    secondaryTags: ["soin", "corps", "relaxation", "professionnel", "bien-être"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "raffiné"]
  },
  manucure_pedicure: {
    label: "Manucure & Pédicure",
    services: ["Soin ongles", "Pose vernis", "Soin mains", "Soin pieds", "Décorations"],
    ambiance: ["Soignée", "Détendue", "Professionnelle", "Féminine"],
    primaryTags: ["manucure", "pédicure", "ongles", "beauté", "soin"],
    secondaryTags: ["vernis", "pose", "ongles", "soin", "mains"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "professionnel"]
  },
  epilation: {
    label: "Épilation",
    services: ["Épilation cire", "Épilation laser", "Soin corps", "Définitif", "Professionnel"],
    ambiance: ["Professionnelle", "Soignée", "Efficace", "Détendue"],
    primaryTags: ["épilation", "soin", "corps", "beauté", "définitif"],
    secondaryTags: ["laser", "cire", "soin", "corps", "professionnel"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "détente"]
  },
  soin_visage: {
    label: "Soin visage",
    services: ["Nettoyage", "Hydratation", "Masque", "Gommage", "Soin professionnel"],
    ambiance: ["Relaxante", "Professionnelle", "Soignée", "Détendue"],
    primaryTags: ["soin", "visage", "beauté", "peau", "esthétique"],
    secondaryTags: ["nettoyage", "hydratation", "masque", "professionnel", "soin"],
    relatedTags: ["beauté", "soin", "personnel", "relaxation", "professionnel"]
  },
  soin_corps: {
    label: "Soin corps",
    services: ["Gommage", "Enveloppement", "Hydratation", "Massage", "Soin professionnel"],
    ambiance: ["Relaxante", "Détendue", "Professionnelle", "Soignée"],
    primaryTags: ["soin", "corps", "beauté", "relaxation", "esthétique"],
    secondaryTags: ["gommage", "enveloppement", "hydratation", "professionnel", "soin"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "relaxation"]
  },
  maquillage: {
    label: "Maquillage",
    services: ["Maquillage professionnel", "Soirée", "Mariage", "Événement", "Conseil"],
    ambiance: ["Artistique", "Professionnelle", "Créative", "Soignée"],
    primaryTags: ["maquillage", "beauté", "makeup", "art", "professionnel"],
    secondaryTags: ["maquilleur", "soirée", "mariage", "événement", "beauté"],
    relatedTags: ["beauté", "soin", "personnel", "professionnel", "artistique"]
  },
  barbe_moustache: {
    label: "Soin barbe & moustache",
    services: ["Taille barbe", "Rasage", "Soin barbe", "Tondeuse", "Ciseaux"],
    ambiance: ["Masculine", "Traditionnelle", "Professionnelle", "Décontractée"],
    primaryTags: ["barbe", "moustache", "rasage", "soin", "homme"],
    secondaryTags: ["tondeuse", "ciseaux", "soin", "barbe", "traditionnel"],
    relatedTags: ["masculin", "soin", "personnel", "traditionnel", "professionnel"]
  },
  onglerie: {
    label: "Onglerie",
    services: ["Pose ongles", "Vernis gel", "Décorations", "Soin ongles", "Professionnel"],
    ambiance: ["Soignée", "Créative", "Professionnelle", "Détendue"],
    primaryTags: ["onglerie", "ongles", "beauté", "soin", "mains"],
    secondaryTags: ["pose", "vernis", "gel", "soin", "professionnel"],
    relatedTags: ["beauté", "soin", "personnel", "détente", "professionnel"]
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
    "☕ Cafés": [
      "cafe_traditionnel", "cafe_brasserie", "cafe_lounge", "cafe_rooftop", 
      "cafe_artisanal", "cafe_healthy", "cafe_vegan", "cafe_gluten_free", 
      "cafe_halal", "cafe_kosher", "cafe_jeux", "cafe_livres", "cafe_enfants", 
      "cafe_afterwork", "cafe_brunch", "cafe_glacé", "cafe_emporter", 
      "cafe_terrasse", "cafe_nuit"
    ],
    "🏛️ Musées": [
      "musee_art", "musee_histoire", "musee_science", "musee_nature", "musee_enfants",
      "musee_contemporain", "musee_ethnographie", "musee_maritime", "musee_militaire",
      "musee_automobile", "musee_ferroviaire", "musee_aviation", "musee_espace",
      "musee_photographie", "musee_musique", "musee_architecture", "musee_archéologie",
      "musee_ethnologie", "musee_technologie", "musee_virtuel"
    ],
    "🎬 Cinéma": [
      "cinema_multiplexe", "cinema_art_essai", "cinema_imax", "drive_in", 
      "cinema_4dx", "cinema_dolby_atmos", "cinema_3d", "cinema_retro", 
      "cinema_open_air", "cinema_marathon", "cinema_theme"
    ],
    "🎉 Sorties nocturnes": [
      "discotheque", "club_techno", "boite_nuit_mainstream"
    ],
    "🎯 Sports & Activités": [
    "bowling", "billard_americain", "billard_francais", "roller_indoor", "moto_electrique_indoor", "futsal", "karting", "laser_game", "vr_experience"
    ],
    "🎢 Sensations fortes & Aventure": [
      "circuit_voiture_sport", "circuit_moto", "bapteme_ulm", "parachutisme", "saut_elastique",
      "parapente", "deltaplane", "bapteme_helicoptere", "bapteme_avion", "vol_cerf_volant",
      "accrobranche", "tyrolienne", "via_ferrata", "escalade", "canyoning",
      "rafting", "hydrospeed", "surf", "kitesurf", "wingsuit",
      "saut_en_chute_libre", "bapteme_voiture_course", "bapteme_moto_course", "quad", "buggy",
      "jet_ski", "flyboard", "plongee", "plongee_bouteille", "plongee_apnee",
      "saut_parachute_tandem", "bapteme_planeur", "bapteme_hot_air_balloon", "saut_base_jump"
    ],
    "🎮 Escape Games": [
      "escape_game", "escape_game_horreur", "escape_game_aventure", "escape_game_mystere",
      "escape_game_sf", "escape_game_fantasy", "escape_game_familial"
    ],
    "🎵 Blind Test & Quiz": [
      "blind_test", "quiz_room", "salle_jeux_amis", "complexe_multiactivites"
    ],
    "👶 Enfants & Famille": [
      "trampoline_parc", "parc_loisirs_enfants", "centre_aquatique", "parc_aventure_enfants",
      "ludotheque", "centre_loisirs_enfants", "ferme_pedagogique", "musee_enfants",
      "parc_theme_enfants", "centre_sportif_enfants", "atelier_creatif_enfants",
      "parc_jeux_interieur", "mini_golf", "parc_attractions_familial", "centre_anniversaires",
      "parc_animalier", "parc_plage_enfants", "centre_equitation_enfants", "parc_skate_enfants",
      "centre_cirque_enfants"
    ],
    "💆 Soins & Beauté": [
      "coiffeur", "coiffeur_homme", "coiffeur_femme", "coiffeur_enfant",
      "salon_beaute", "institut_beaute", "centre_esthetique",
      "massage", "massage_relaxant", "massage_sportif", "massage_oriental",
      "spa", "soin_visage", "soin_corps",
      "manucure_pedicure", "onglerie", "epilation",
      "maquillage", "barbe_moustache"
    ],
    "❓ Autres": [
      "autre"
    ]
  };

  return groups;
}
