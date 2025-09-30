import { AddressData, HoursData } from '@/components/forms/AdresseStep';
import { EnrichmentData } from '@/lib/enrichment-system';

// Types pour les données du formulaire professionnel
export type ProfessionalData = {
  // Données de compte (nouvelle étape 0)
  accountEmail: string;
  accountPassword: string;
  accountPasswordConfirm: string;
  accountFirstName: string;
  accountLastName: string;
  accountPhone: string; // Obligatoire pour la vérification Twilio
  
  // Données légales/administratives
  siret: string;
  companyName: string;
  legalStatus: string;
  
  // Données de l'établissement
  establishmentName: string;
  description: string;
  address: AddressData;
  
  // Activités et services
  activities: string[];
  services: string[];
  ambiance: string[];
  
  // Tags de recherche
  tags: string[];
  
  // Photos
  photos: File[];
  
  // Horaires d'ouverture
  hours: HoursData;
  
  // Réseaux sociaux
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  
  // Contact de l'établissement (différent du contact professionnel)
  phone?: string;
  whatsappPhone?: string;
  messengerUrl?: string;
  email?: string;
  
  // Prix
  priceMin?: number;
  priceMax?: number;
  
  // Informations pratiques
  informationsPratiques: string[];
  
  // Enrichissement automatique
  googleBusinessUrl?: string;
  enriched?: boolean;
  envieTags?: string[];
  priceLevel?: number;
  googleRating?: number;
  googleReviewCount?: number;
  theForkLink?: string;
  uberEatsLink?: string;
  specialties?: string[];
  atmosphere?: string[];
  accessibility?: string[];
  
  // === NOUVELLES SECTIONS DÉTAILLÉES ===
  accessibilityInfo?: {
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  servicesAvailable?: {
    delivery?: boolean;
    takeout?: boolean;
    dineIn?: boolean;
    curbsidePickup?: boolean;
    reservations?: boolean;
  };
  diningServices?: {
    breakfast?: boolean;
    brunch?: boolean;
    lunch?: boolean;
    dinner?: boolean;
    dessert?: boolean;
    lateNightFood?: boolean;
  };
  offerings?: {
    beer?: boolean;
    wine?: boolean;
    cocktails?: boolean;
    coffee?: boolean;
    vegetarianFood?: boolean;
    happyHourFood?: boolean;
  };
  paymentMethods?: {
    creditCards?: boolean;
    debitCards?: boolean;
    nfc?: boolean;
    cashOnly?: boolean;
  };
  atmosphereFeatures?: {
    goodForChildren?: boolean;
    goodForGroups?: boolean;
    goodForWatchingSports?: boolean;
    liveMusic?: boolean;
    outdoorSeating?: boolean;
  };
  generalServices?: {
    wifi?: boolean;
    restroom?: boolean;
    parking?: boolean;
    valetParking?: boolean;
    paidParking?: boolean;
    freeParking?: boolean;
  };
  
  // Abonnement
  subscriptionPlan: 'free' | 'premium';
  
  // === DONNÉES HYBRIDES ===
  hybridAccessibilityDetails?: any;
  hybridDetailedServices?: any;
  hybridClienteleInfo?: any;
  hybridDetailedPayments?: any;
  hybridChildrenServices?: any;
};

// Type pour un établissement existant (pour le mode édition)
export type ExistingEstablishment = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string | null;
  postalCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsappPhone: string | null;
  messengerUrl: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  activities: string[] | null;
  services: string[] | null;
  ambiance: string[] | null;
  tags: string[] | null;
  horairesOuverture: any;
  prixMoyen: number | null;
  capaciteMax: number | null;
  accessibilite: boolean;
  parking: boolean;
  terrasse: boolean;
  priceMin: number | null;
  priceMax: number | null;
  informationsPratiques: string[] | null;
  subscription: string;
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    siret: string;
    legalStatus: string;
  };
  status?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  lastModifiedAt?: string;
};

export type FormStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Props du composant principal
export interface EstablishmentFormProps {
  establishment?: ExistingEstablishment;
  isEditMode?: boolean;
}

// État de vérification SIRET
export type SiretVerification = {
  status: 'idle' | 'loading' | 'valid' | 'invalid';
  data?: any;
};

// État de vérification téléphone
export type PhoneVerification = {
  isVerified: boolean;
  isSending: boolean;
  verificationCode: string;
  error: string;
};

// Configuration des catégories et services
export const CATEGORIES = {
  bar: {
    label: "Bar / Pub / Brasserie",
    services: [
      "Cocktails maison", "Bières pression", "Vins au verre", "Tapas/Planches",
      "Happy Hour", "Terrasse", "Musique live", "DJ", "Écrans sport"
    ],
    ambiance: ["Décontractée", "Festive", "Cosy", "Branchée", "Sportive", "Romantique"]
  },
  restaurant: {
    label: "Restaurant",
    services: [
      "Menu du jour", "Carte des vins", "Terrasse", "Privatisation",
      "Livraison", "À emporter", "Brunch", "Menu enfant", "Végétarien/Vegan"
    ],
    ambiance: ["Gastronomique", "Bistrot", "Familiale", "Romantique", "Décontractée"]
  },
  nightclub: {
    label: "Discothèque / Club",
    services: [
      "Piste de danse", "Bar", "VIP/Carré", "Vestiaire", "Parking",
      "Fumoir", "Terrasse", "Événements privés"
    ],
    ambiance: ["Électro", "Hip-Hop", "Pop/Rock", "Latino", "Années 80/90", "Clubbing"]
  },
  escape_game: {
    label: "Escape Game",
    services: [
      "Plusieurs salles", "Team building", "Anniversaires", "Parking",
      "Vestiaire", "Espace détente", "Boutique souvenirs"
    ],
    ambiance: ["Horreur", "Aventure", "Mystère", "Sci-Fi", "Historique", "Familial"]
  },
  cinema: {
    label: "Cinéma",
    services: [
      "Plusieurs salles", "3D/IMAX", "Snack", "Parking",
      "Séances matinales", "Avant-premières", "Cinéma d'art"
    ],
    ambiance: ["Blockbusters", "Art et essai", "Familial", "Documentaires"]
  }
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    label: "Plan Gratuit",
    features: [
      "1 photo maximum",
      "Informations de base",
      "Présence sur la carte",
      "Statistiques limitées"
    ],
    price: "0€/mois"
  },
  premium: {
    label: "Plan Premium",
    features: [
      "+ 10 photos = valeurs visuelles ajoutées",
      "Description détaillée",
      "Logo flamme pour un visuel client tendance",
      "Mise en avant de votre établissement avec l'offre premium dans le filtre de recherche",
      "Statistiques avancées, détails de vos visiteurs",
      "Support prioritaire",
      "Événements temporaires + visuel sur la card de votre établissement"
    ],
    price: "29€/mois"
  }
} as const;

