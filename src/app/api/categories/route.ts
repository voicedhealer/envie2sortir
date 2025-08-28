/**
 * API ROUTE HANDLER POUR LES CATÉGORIES D'ÉTABLISSEMENTS
 * 
 * Fichier : app/api/categories/route.ts
 * 
 * Fonctionnalités :
 * - Récupère les catégories disponibles depuis la base de données
 * - Enrichit chaque catégorie avec label et mots-clés pour recherche
 * - Supporte la recherche par nom et adresse d'établissement
 * - Retourne le nombre d'établissements par catégorie
 * - Compatible avec le système "Envie de..." pour recherche sémantique
 * 
 * Endpoints :
 * GET /api/categories - Récupère toutes les catégories
 * GET /api/categories?q=search - Filtre par recherche
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CONFIGURATION COMPLÈTE DES CATÉGORIES
 * 
 * Structure : enum_value -> { label, keywords }
 * - label : Texte affiché à l'utilisateur
 * - keywords : Mots-clés pour la recherche "Envie de..." (extensible)
 * 
 * Recherche optimisée pour des requêtes comme :
 * "envie de sushi" -> restaurant_asiatique
 * "envie de bowling" -> bowling
 * "envie de cocktails" -> bar_cocktails
 */
const CATEGORY_DATA: Record<string, { label: string; keywords: string[] }> = {
  
  // ===== BARS & BOISSONS =====
  
  bar_ambiance: {
    label: "Bar d'ambiance / Lounge",
    keywords: ["bar", "ambiance", "lounge", "apéro", "cocktail", "chic", "élégant", "sofas", "musique douce", "after-work", "rendez-vous"]
  },
  
  pub_traditionnel: {
    label: "Pub traditionnel",
    keywords: ["pub", "bière", "pression", "anglais", "irlandais", "guinness", "fish and chips", "rugby", "foot", "convivial"]
  },
  
  brasserie_artisanale: {
    label: "Brasserie artisanale",
    keywords: ["brasserie", "bière artisanale", "craft beer", "IPA", "blonde", "brune", "locale", "dégustation", "houblon", "malt"]
  },
  
  bar_cocktails: {
    label: "Bar à cocktails spécialisé",
    keywords: ["cocktails", "mixologie", "bartender", "mojito", "margarita", "whisky", "rhum", "gin", "apéro", "happy hour", "cosmopolitan"]
  },
  
  bar_vins: {
    label: "Bar à vins / Cave à vin",
    keywords: ["vin", "cave", "dégustation", "œnologie", "bordeaux", "bourgogne", "rouge", "blanc", "rosé", "sommelier", "vignoble"]
  },
  
  bar_sports: {
    label: "Bar sportif",
    keywords: ["sport", "match", "football", "écran", "télé", "supporters", "bière", "pression", "rugby", "basket", "champions league"]
  },
  
  rooftop_bar: {
    label: "Bar rooftop / Terrasse",
    keywords: ["rooftop", "terrasse", "vue", "hauteur", "panorama", "coucher de soleil", "été", "extérieur", "ciel ouvert"]
  },
  
  bar_karaoke: {
    label: "Bar karaoké",
    keywords: ["karaoké", "chanter", "micro", "musique", "soirée", "amis", "cabine", "playlist", "amusant", "fou rire"]
  },
  
  bar_jeux: {
    label: "Bar avec jeux",
    keywords: ["jeux", "fléchettes", "babyfoot", "arcade", "borne", "flipper", "amusement", "compétition", "détente", "fun"]
  },

  // ===== RESTAURANTS =====
  
  restaurant_gastronomique: {
    label: "Restaurant gastronomique",
    keywords: ["gastronomie", "étoilé", "raffiné", "chef", "haute cuisine", "michelin", "dégustation", "menu", "exception", "luxe"]
  },
  
  restaurant_traditionnel: {
    label: "Restaurant traditionnel français",
    keywords: ["traditionnel", "français", "terroir", "cassoulet", "coq au vin", "bœuf bourguignon", "cuisine grand-mère", "authentique"]
  },
  
  restaurant_familial: {
    label: "Restaurant familial",
    keywords: ["familial", "enfants", "convivial", "menu enfant", "groupe", "anniversaire", "générations", "simple", "bon"]
  },
  
  bistrot: {
    label: "Bistrot de quartier",
    keywords: ["bistrot", "quartier", "simple", "convivial", "ardoise", "plat du jour", "zinc", "ambiance", "local", "habitués"]
  },
  
  brasserie_restaurant: {
    label: "Brasserie-restaurant",
    keywords: ["brasserie", "plat du jour", "rapide", "service continu", "choucroute", "plateau fruits de mer", "efficace"]
  },
  
  restaurant_rapide: {
    label: "Restauration rapide",
    keywords: ["rapide", "fast food", "emporter", "livraison", "quick", "mcdo", "kfc", "sandwich", "burger", "frites"]
  },

  // ===== CUISINES DU MONDE =====
  
  restaurant_italien: {
    label: "Restaurant italien",
    keywords: ["italien", "pâtes", "pizza", "antipasti", "risotto", "carbonara", "bolognaise", "parmesan", "basilic", "italia"]
  },
  
  restaurant_asiatique: {
    label: "Restaurant asiatique",
    keywords: ["asiatique", "sushi", "wok", "japonais", "chinois", "coréen", "thaï", "vietnamien", "ramen", "pad thaï", "dim sum", "maki", "sashimi"]
  },
  
  restaurant_oriental: {
    label: "Restaurant oriental",
    keywords: ["oriental", "couscous", "tajine", "maghrébin", "marocain", "tunisien", "algérien", "merguez", "semoule", "harissa"]
  },
  
  restaurant_mexicain: {
    label: "Restaurant mexicain",
    keywords: ["mexicain", "tacos", "burritos", "tex-mex", "guacamole", "salsa", "chili", "nachos", "quesadilla", "épicé"]
  },
  
  restaurant_indien: {
    label: "Restaurant indien",
    keywords: ["indien", "curry", "tandoori", "épices", "naan", "basmati", "masala", "bollywood", "végétarien", "dal"]
  },
  
  restaurant_veggie: {
    label: "Restaurant végétarien/vegan",
    keywords: ["végétarien", "vegan", "bio", "healthy", "légumes", "quinoa", "tofu", "sans viande", "nature", "santé"]
  },

  // ===== SPÉCIALITÉS =====
  
  pizzeria: {
    label: "Pizzeria",
    keywords: ["pizza", "italiana", "four", "margherita", "4 fromages", "calzone", "pâte", "mozzarella", "tomate", "basilic"]
  },
  
  creperie: {
    label: "Crêperie",
    keywords: ["crêpes", "galettes", "bretonne", "sarrasin", "cidre", "nutella", "jambon", "œuf", "fromage", "sucré", "salé"]
  },

  // ===== FAST FOOD & STREET FOOD =====
  
  kebab: {
    label: "Kebab",
    keywords: ["kebab", "döner", "turc", "grec", "sandwich", "viande", "salade", "tomate", "oignon", "sauce", "galette"]
  },
  
  tacos_mexicain: {
    label: "Tacos mexicains",
    keywords: ["tacos", "mexicain", "burrito", "quesadilla", "guacamole", "salsa", "tex-mex", "épicé", "tortilla", "street food"]
  },
  
  burger: {
    label: "Burger house",
    keywords: ["burger", "hamburger", "cheeseburger", "frites", "bacon", "steak", "pain", "américain", "sauce", "fromage"]
  },
  
  sandwich: {
    label: "Sandwicherie",
    keywords: ["sandwich", "panini", "croque", "jambon", "thon", "salade", "tomate", "pain", "baguette", "emporter"]
  },
  
  fish_and_chips: {
    label: "Fish & Chips",
    keywords: ["fish", "chips", "friture", "anglais", "poisson", "pané", "frites", "vinaigre", "mushy peas"]
  },
  
  food_truck: {
    label: "Food truck",
    keywords: ["food truck", "mobile", "rue", "street food", "original", "camion", "nomade", "festival", "marché"]
  },
  
  friterie: {
    label: "Friterie",
    keywords: ["friterie", "frites", "belgique", "baraque", "mayo", "sauce", "mitraillette", "spécialité", "cornet"]
  },
  
  poke_bowl: {
    label: "Poke bowl",
    keywords: ["poke", "bowl", "healthy", "hawaïen", "saumon", "avocat", "riz", "légumes", "frais", "équilibré"]
  },

  // ===== SORTIES NOCTURNES =====
  
  discotheque: {
    label: "Discothèque classique",
    keywords: ["discothèque", "danser", "nuit", "dj", "piste", "musique", "boule disco", "strobe", "fête", "ambiance"]
  },
  
  club_prive: {
    label: "Club privé",
    keywords: ["club", "privé", "exclusif", "VIP", "champagne", "luxe", "dress code", "sélection", "huppé", "élite"]
  },
  
  boite_nuit_mainstream: {
    label: "Boîte de nuit grand public",
    keywords: ["boîte", "fête", "danse", "nuit", "jeunes", "musique", "commercial", "hits", "ambiance", "soirée"]
  },
  
  club_techno: {
    label: "Club techno/électro",
    keywords: ["techno", "électro", "underground", "DJ", "beats", "rave", "house", "minimal", "berlin", "bass"]
  },
  
  club_hip_hop: {
    label: "Club hip-hop/RnB",
    keywords: ["hip-hop", "rnb", "rap", "urban", "r&b", "trap", "afrobeat", "groove", "danse urbaine", "microphone"]
  },
  
  club_latino: {
    label: "Club latino",
    keywords: ["latino", "salsa", "bachata", "merengue", "reggaeton", "mambo", "danse", "amérique du sud", "passion"]
  },
  
  dancing_retro: {
    label: "Dancing rétro",
    keywords: ["rétro", "80s", "90s", "nostalgie", "vintage", "disco", "années", "oldies", "souvenirs", "revival"]
  },
  
  boite_estudiantine: {
    label: "Soirée étudiante",
    keywords: ["étudiant", "pas cher", "jeune", "université", "fac", "soirée", "budget", "alcool", "étudiants"]
  },

  // ===== SPORTS INTÉRIEUR =====
  roller: {
    label: "Roller",
    keywords: ["patin à roulettes", "trottinette", "piste", "skate park", "amis", "famille", "bmx", "amusement", "convivialité"]
  },

  patin_a_roulettes: {
    label: "Patin à roulettes",
    keywords: ["patin", "roulettes", "piste", "boule", "amis", "famille", "disco", "soirée musicale", "musique", "danse", "amusement", "convivialité"]
  },
  
  bowling: {
    label: "Bowling",
    keywords: ["bowling", "quilles", "strike", "spare", "piste", "boule", "amis", "famille", "score", "compétition","potes"]
  },
  
  billard_americain: {
    label: "Billard américain",
    keywords: ["billard", "pool", "américain", "8-ball", "9-ball", "snook", "queue", "table", "boules", "trou"]
  },
  
  billard_francais: {
    label: "Billard français",
    keywords: ["billard", "français", "carambole", "queue", "billes", "bandes", "technique", "précision", "sport"]
  },
  
  snooker: {
    label: "Snooker",
    keywords: ["snooker", "anglais", "rouge", "couleur", "table", "queue", "précision", "tactical", "tournament"]
  },
  
  ping_pong_bar: {
    label: "Bar ping-pong",
    keywords: ["ping-pong", "tennis de table", "raquette", "balle", "table", "sport", "bar", "convivial", "tournoi"]
  },
  
  squash: {
    label: "Squash",
    keywords: ["squash", "raquette", "mur", "court", "cardio", "sport", "intense", "rapide", "échange", "endurance"]
  },
  
  badminton: {
    label: "Badminton",
    keywords: ["badminton", "volant", "raquette", "filet", "sport", "précision", "smash", "terrain", "indoor"]
  },
  
  tennis_table: {
    label: "Tennis de table",
    keywords: ["tennis de table", "ping-pong", "raquette", "balle", "table", "filet", "sport", "rapide", "réflexes"]
  },

  // ===== SPORTS EXTÉRIEUR =====
  
  futsal: {
    label: "Futsal",
    keywords: ["futsal", "foot", "football", "salle", "5vs5", "équipe", "match", "terrain", "indoor", "technique"]
  },
  
  football_5vs5: {
    label: "Football à 5",
    keywords: ["foot", "football", "5vs5", "terrain", "équipe", "match", "but", "gardien", "synthétique", "amis"]
  },
  
  football_7vs7: {
    label: "Football à 7",
    keywords: ["foot", "football", "7vs7", "match", "équipe", "terrain", "but", "gardien", "compétition", "ligue"]
  },
  
  tennis_exterieur: {
    label: "Tennis extérieur",
    keywords: ["tennis", "court", "extérieur", "raquette", "balle", "filet", "service", "match", "set", "sport"]
  },
  
  padel: {
    label: "Padel",
    keywords: ["padel", "raquette", "tendance", "mur", "verre", "double", "espagne", "court", "sport", "social"]
  },
  
  basketball: {
    label: "Basketball",
    keywords: ["basket", "basketball", "panier", "terrain", "équipe", "match", "dribble", "shoot", "NBA", "sport"]
  },
  
  beach_volley: {
    label: "Beach-volley",
    keywords: ["beach-volley", "sable", "été", "filet", "équipe", "beach", "volleyball", "soleil", "vacation", "sport"]
  },

  // ===== ACTIVITÉS LUDIQUES & GAMING =====
  
  escape_game_horreur: {
    label: "Escape game horreur",
    keywords: ["escape game", "horreur", "peur", "énigmes", "zombie", "thriller", "frissons", "équipe", "adrénaline", "sombre"]
  },
  
  escape_game_aventure: {
    label: "Escape game aventure",
    keywords: ["escape game", "aventure", "énigmes", "mystère", "trésor", "exploration", "équipe", "mission", "défi", "puzzle"]
  },
  
  escape_game_familial: {
    label: "Escape game familial",
    keywords: ["escape game", "famille", "enfants", "tous âges", "accessible", "amusant", "éducatif", "coopération", "simple"]
  },
  
  escape_game_immersif: {
    label: "Escape game immersif",
    keywords: ["escape game", "VR", "réalité virtuelle", "immersion", "technologie", "futuriste", "casque", "moderne", "3D"]
  },
  
  laser_game: {
    label: "Laser game",
    keywords: ["laser game", "laser", "combat", "équipe", "gilet", "pistolet", "stratégie", "obscurité", "action", "tir"]
  },
  
  paintball_exterieur: {
    label: "Paintball extérieur",
    keywords: ["paintball", "extérieur", "forêt", "nature", "billes", "masque", "équipe", "stratégie", "combat", "terrain"]
  },
  
  paintball_interieur: {
    label: "Paintball intérieur",
    keywords: ["paintball", "intérieur", "salle", "billes", "masque", "équipe", "urban", "cqb", "rapproché", "indoor"]
  },
  
  realite_virtuelle: {
    label: "Réalité virtuelle",
    keywords: ["VR", "réalité virtuelle", "casque", "immersion", "3D", "jeux", "technologie", "futur", "expérience", "virtuel"]
  },
  
  salle_jeux_arcade: {
    label: "Salle d'arcade",
    keywords: ["arcade", "rétro", "borne", "pacman", "street fighter", "nostalgie", "jeton", "vintage", "pixel", "classic"]
  },
  
  casino: {
    label: "Casino",
    keywords: ["casino", "jeux", "argent", "poker", "roulette", "blackjack", "machine", "sous", "mise", "chance", "risque"]
  },
  
  salle_jeux_moderne: {
    label: "Salle de jeux moderne",
    keywords: ["gaming", "PS5", "Xbox", "console", "multijoueur", "compétition", "esport", "écran", "manette", "moderne"]
  },

  // ===== DIVERTISSEMENT CULTUREL =====
  
  cinema_mainstream: {
    label: "Cinéma grand public",
    keywords: ["cinéma", "film", "movie", "blockbuster", "pop-corn", "séance", "écran", "salle", "sortie", "divertissement"]
  },
  
  cinema_art_essai: {
    label: "Cinéma d'art et d'essai",
    keywords: ["cinéma", "art", "auteur", "indépendant", "festival", "cannes", "réalisateur", "culturel", "original", "pensée"]
  },
  
  cinema_imax: {
    label: "Cinéma IMAX/premium",
    keywords: ["IMAX", "premium", "grand écran", "qualité", "son", "image", "expérience", "technologie", "immersif", "3D"]
  },
  
  drive_in: {
    label: "Drive-in",
    keywords: ["drive-in", "voiture", "cinéma", "extérieur", "américain", "rétro", "vintage", "original", "parking"]
  },
  
  theatre_classique: {
    label: "Théâtre classique",
    keywords: ["théâtre", "pièce", "comédiens", "scène", "culture", "molière", "racine", "tragédie", "comédie", "classique"]
  },
  
  theatre_cafe: {
    label: "Café-théâtre",
    keywords: ["café-théâtre", "humour", "intimiste", "petit", "convivial", "sketch", "one-man-show", "rire", "proximité"]
  },
  
  spectacle_humour: {
    label: "Spectacle d'humour",
    keywords: ["humour", "stand-up", "rire", "comique", "sketch", "one-man", "comedian", "blague", "divertissant", "drôle"]
  },

  // ===== MUSIQUE & CONCERTS =====
  
  concert_rock: {
    label: "Concert rock",
    keywords: ["concert", "rock", "guitare", "live", "musique", "groupe", "scène", "ampli", "métal", "hard rock"]
  },
  
  concert_jazz: {
    label: "Club de jazz",
    keywords: ["jazz", "saxophone", "piano", "trompette", "impro", "swing", "bebop", "ambiance", "feutrée", "intime"]
  },
  
  concert_rap: {
    label: "Concert rap",
    keywords: ["rap", "hip-hop", "micro", "flow", "beat", "urbain", "freestyle", "battle", "underground", "scène"]
  },
  
  concert_electronique: {
    label: "Concert électronique",
    keywords: ["électronique", "DJ", "synthé", "mix", "house", "techno", "dance", "festival", "lights", "bass"]
  },
  
  concert_classique: {
    label: "Concert classique",
    keywords: ["classique", "orchestre", "opéra", "symphonie", "violon", "piano", "chef", "maestro", "culturel", "raffiné"]
  },
  
  concert_variete: {
    label: "Concert variété française",
    keywords: ["variété", "française", "chanson", "artiste", "populaire", "mainstream", "tubes", "succès", "français"]
  },

  // ===== CULTURE & MUSÉES =====
  
  musee_art: {
    label: "Musée d'art",
    keywords: ["musée", "art", "peinture", "sculpture", "exposition", "culture", "œuvre", "artiste", "galerie", "beaux-arts"]
  },
  
  musee_histoire: {
    label: "Musée d'histoire",
    keywords: ["histoire", "patrimoine", "archéologie", "ancien", "civilisation", "guerre", "époque", "vestige", "mémoire"]
  },
  
  musee_science: {
    label: "Musée scientifique",
    keywords: ["science", "expériences", "découverte", "physique", "chimie", "biologie", "technologie", "innovation", "recherche"]
  },
  
  musee_insolite: {
    label: "Musée insolite",
    keywords: ["insolite", "bizarre", "original", "unique", "curiosité", "étrange", "particulier", "surprenant", "rare"]
  },
  
  galerie_art: {
    label: "Galerie d'art",
    keywords: ["galerie", "exposition", "contemporain", "artiste", "vernissage", "œuvre", "moderne", "art", "culture"]
  },
  
  centre_exposition: {
    label: "Centre d'exposition",
    keywords: ["exposition", "temporaire", "thématique", "découverte", "présentation", "collection", "visite", "culturel"]
  },
  
  planetarium: {
    label: "Planétarium",
    keywords: ["planétarium", "astronomie", "étoiles", "espace", "cosmos", "univers", "galaxie", "science", "observation"]
  },

  // ===== MARCHÉS & ÉVÉNEMENTS =====
  
  marche_nocturne: {
    label: "Marché nocturne",
    keywords: ["marché", "nuit", "ambiance", "été", "produits", "locaux", "animation", "convivial", "découverte"]
  },
  
  marche_artisanal: {
    label: "Marché artisanal",
    keywords: ["artisanal", "local", "créateur", "fait main", "artisan", "original", "unique", "terroir", "savoir-faire"]
  },
  
  marche_vintage: {
    label: "Marché vintage",
    keywords: ["vintage", "brocante", "chiner", "occasion", "rétro", "ancien", "collection", "trouvaille", "antiquité"]
  },
  
  festival_plein_air: {
    label: "Festival plein air",
    keywords: ["festival", "extérieur", "événement", "musique", "art", "culture", "animation", "été", "plein air"]
  },
  
  foire_commerciale: {
    label: "Foire commerciale",
    keywords: ["foire", "commercial", "exposition", "salon", "professionnel", "business", "stands", "networking"]
  },
  
  salon_professionnel: {
    label: "Salon professionnel",
    keywords: ["salon", "professionnel", "business", "networking", "conférence", "formation", "rencontre", "industrie"]
  },

  // ===== BIEN-ÊTRE & DÉTENTE =====
  
  spa_detente: {
    label: "Spa détente",
    keywords: ["spa", "massage", "détente", "relaxation", "bien-être", "jacuzzi", "soin", "zen", "repos", "calme"]
  },
  
  hammam_traditionnel: {
    label: "Hammam traditionnel",
    keywords: ["hammam", "vapeur", "détente", "oriental", "gommage", "relaxation", "spa", "sauna", "chaleur", "purification"]
  },
  
  sauna_finlandais: {
    label: "Sauna finlandais",
    keywords: ["sauna", "chaleur", "finlandais", "vapeur", "bois", "détente", "sudation", "relaxation", "tradition"]
  },
  
  spa_nordique: {
    label: "Spa nordique",
    keywords: ["spa", "nordique", "bains", "chaud", "froid", "nature", "relaxation", "bien-être", "hydrotherapie"]
  },
  
  centre_massage: {
    label: "Centre de massage",
    keywords: ["massage", "relaxation", "thérapie", "soin", "bien-être", "détente", "corps", "stress", "muscle"]
  },
  
  institut_beaute: {
    label: "Institut de beauté",
    keywords: ["beauté", "soin", "esthétique", "visage", "corps", "relaxation", "peau", "traitement", "cosmétique"]
  },
  
  salon_coiffure_premium: {
    label: "Salon de coiffure premium",
    keywords: ["coiffure", "premium", "relooking", "coupe", "couleur", "style", "tendance", "soin", "cheveux"]
  },
  
  onglerie: {
    label: "Salon d'ongles",
    keywords: ["ongles", "manucure", "pédicure", "vernis", "nail art", "soin", "beauté", "mains", "pieds"]
  },

  // ===== ACTIVITÉS AQUATIQUES =====
  
  piscine_couverte: {
    label: "Piscine couverte",
    keywords: ["piscine", "nager", "couverte", "bassin", "eau", "sport", "natation", "longueur", "détente"]
  },
  
  piscine_exterieure: {
    label: "Piscine extérieure",
    keywords: ["piscine", "extérieure", "bronzer", "soleil", "été", "eau", "baignade", "détente", "plein air"]
  },
  
  centre_aquatique: {
    label: "Centre aquatique",
    keywords: ["aquatique", "toboggan", "bassin", "eau", "famille", "enfants", "jeux", "piscine", "amusement"]
  },
  
  aqua_fitness: {
    label: "Aqua fitness",
    keywords: ["aqua", "fitness", "sport", "eau", "gym", "exercice", "musculation", "cardio", "doux", "articulaire"]
  },

  // ===== LOISIRS CRÉATIFS =====
  
  atelier_cuisine: {
    label: "Atelier de cuisine",
    keywords: ["cuisine", "atelier", "apprendre", "chef", "recette", "cours", "culinaire", "gastronomie", "technique"]
  },
  
  atelier_patisserie: {
    label: "Atelier de pâtisserie",
    keywords: ["pâtisserie", "gâteau", "sucré", "atelier", "apprendre", "dessert", "cake", "chocolat", "cours"]
  },
  
  atelier_poterie: {
    label: "Atelier de poterie",
    keywords: ["poterie", "argile", "créatif", "modelage", "céramique", "tour", "artisanat", "art", "manuel"]
  },
  
  atelier_peinture: {
    label: "Atelier de peinture",
    keywords: ["peinture", "art", "couleur", "toile", "pinceau", "créatif", "artistique", "expression", "cours"]
  },
  
  cours_danse: {
    label: "Cours de danse",
    keywords: ["danse", "cours", "apprendre", "chorégraphie", "musique", "mouvement", "rythme", "expression", "social"]
  },
  
  salle_musique: {
    label: "Studio de musique",
    keywords: ["musique", "studio", "instrument", "répétition", "enregistrement", "son", "groupe", "band", "composition"]
  },

  // ===== PARCS & LOISIRS FAMILIAUX =====
  
  parc_attraction: {
    label: "Parc d'attractions",
    keywords: ["parc", "attraction", "manège", "sensation", "famille", "enfants", "montagne russe", "fête foraine", "amusement"]
  },
  
  parc_aquatique: {
    label: "Parc aquatique",
    keywords: ["parc", "aquatique", "toboggan", "piscine", "eau", "famille", "enfants", "glisse", "amusement"]
  },
  
  mini_golf: {
    label: "Mini-golf",
    keywords: ["mini-golf", "golf", "famille", "parcours", "obstacle", "amusant", "enfants", "précision", "détente"]
  },
  
  golf_practice: {
    label: "Practice de golf",
    keywords: ["golf", "practice", "driving", "swing", "balle", "club", "sport", "précision", "technique"]
  },
  
  karting_interieur: {
    label: "Karting intérieur",
    keywords: ["karting", "vitesse", "course", "intérieur", "kart", "pilotage", "adrénaline", "compétition", "indoor"]
  },
  
  karting_exterieur: {
    label: "Karting extérieur",
    keywords: ["karting", "extérieur", "course", "vitesse", "kart", "pilotage", "circuit", "outdoor", "compétition"]
  },
  
  trampoline_park: {
    label: "Parc de trampolines",
    keywords: ["trampoline", "saut", "acrobatie", "rebond", "famille", "enfants", "sport", "amusement", "fitness"]
  },
  
  accrobranche: {
    label: "Parcours accrobranche",
    keywords: ["accrobranche", "aventure", "hauteur", "arbre", "forêt", "tyrolienne", "nature", "sport", "défi"]
  },

  // ===== DIVERS & INSOLITES =====
  
  salle_privee: {
    label: "Salle privée",
    keywords: ["salle", "privée", "privatiser", "événement", "groupe", "anniversaire", "entreprise", "réception", "exclusive"]
  },
  
  peniche: {
    label: "Péniche bar/restaurant",
    keywords: ["péniche", "bateau", "eau", "original", "seine", "rivière", "navigation", "unique", "flottant"]
  },
  
  rooftop_restaurant: {
    label: "Restaurant rooftop",
    keywords: ["rooftop", "restaurant", "hauteur", "vue", "panorama", "terrasse", "ciel", "unique", "élégant"]
  },
  
  cave_degustation: {
    label: "Cave dégustation",
    keywords: ["cave", "dégustation", "vin", "vigneron", "œnologie", "terroir", "appellation", "cuvée", "millésime"]
  },
  
  microbrasserie: {
    label: "Microbrasserie",
    keywords: ["microbrasserie", "bière", "artisan", "local", "craft", "houblon", "malt", "dégustation", "brasseur"]
  },
  
  distillerie: {
    label: "Distillerie",
    keywords: ["distillerie", "spiritueux", "whisky", "gin", "rhum", "dégustation", "artisanal", "alambic", "alcool"]
  },

  // ===== COMPATIBILITÉ ANCIENNE VERSION =====
  
  bar: {
    label: "Bar d'ambiance / Pub / Brasserie",
    keywords: ["bar", "pub", "brasserie", "bière", "apéro", "ambiance", "convivial", "détente"]
  },
  
  restaurant: {
    label: "Restaurant",
    keywords: ["restaurant", "repas", "déjeuner", "dîner", "cuisine", "manger", "plat", "menu"]
  },
  
  nightclub: {
    label: "Discothèque / Club",
    keywords: ["discothèque", "club", "danse", "nuit", "musique", "fête", "soirée", "dj"]
  },
  
  cinema: {
    label: "Cinéma / Drive-in",
    keywords: ["cinéma", "film", "séance", "movie", "écran", "salle", "pop-corn"]
  },
  
  theater: {
    label: "Théâtre / Spectacle",
    keywords: ["théâtre", "spectacle", "pièce", "scène", "culture", "comédie", "drame"]
  },
  
  concert: {
    label: "Concert",
    keywords: ["concert", "musique", "live", "groupe", "artiste", "scène", "spectacle"]
  },
  
  museum: {
    label: "Musée / Exposition",
    keywords: ["musée", "exposition", "culture", "art", "histoire", "visite", "découverte"]
  },
  
  market: {
    label: "Marché / Marché nocturne",
    keywords: ["marché", "nocturne", "produits", "local", "artisanal", "animation"]
  },
  
  escape_game: {
    label: "Escape game / Jeu d'évasion",
    keywords: ["escape game", "énigmes", "évasion", "équipe", "mystère", "réflexion"]
  },
  
  other: {
    label: "Autres activités",
    keywords: ["autre", "divers", "original", "insolite", "unique", "spécial", "différent"]
  }
};

/**
 * ENDPOINT GET /api/categories
 * 
 * Récupère toutes les catégories d'établissements avec enrichissement sémantique
 * 
 * Query Parameters:
 * - q (optionnel) : Filtre par recherche sur nom/adresse d'établissement
 * 
 * Réponse JSON :
 * {
 *   categories: [
 *     {
 *       value: string,      // Enum Prisma (ex: "restaurant_asiatique")
 *       label: string,      // Label utilisateur (ex: "Restaurant asiatique") 
 *       keywords: string[], // Mots-clés recherche (ex: ["sushi", "wok"])
 *       count: number       // Nombre d'établissements dans cette catégorie
 *     }
 *   ]
 * }
 */
export async function GET(request: Request) {
  try {
    // Extraction des paramètres de recherche
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    // Construction des filtres de recherche
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },      // Recherche dans le nom
        { address: { contains: q } },   // Recherche dans l'adresse
      ];
    }

    // Requête groupée pour compter les établissements par catégorie
    const rows = await prisma.establishment.groupBy({
      by: ["category"],                                    // Grouper par catégorie
      _count: { category: true },                          // Compter les occurrences
      orderBy: { _count: { category: "desc" } },          // Trier par popularité décroissante
      where: Object.keys(where).length ? where : undefined // Appliquer les filtres si présents
    });

    // Enrichissement des données avec labels et mots-clés
    const data = rows.map((r) => ({
      value: r.category,                                   // Enum Prisma original
      label: CATEGORY_DATA[r.category]?.label ?? r.category, // Label enrichi ou fallback
      keywords: CATEGORY_DATA[r.category]?.keywords ?? [], // Mots-clés pour recherche
      count: r._count.category,                            // Nombre d'établissements
    }));

    return NextResponse.json({ categories: data });
    
  } catch (e) {
    // Gestion d'erreur avec log pour debugging
    console.error("categories GET error", e);
    
    // Retour gracieux même en cas d'erreur
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
