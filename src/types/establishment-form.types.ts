import { AddressData } from '@/components/forms/AdresseStep';
import { HoursData } from '@/components/forms/OpeningHoursInput';
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
  
  // Données SIRET enrichies (nouvelles)
  siretAddress: string;
  siretActivity: string;
  siretCreationDate: string;
  siretEffectifs: string;
  
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
  youtube?: string;
  
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
  subscriptionPlanType?: 'monthly' | 'annual'; // Type d'abonnement (mensuel ou annuel) pour le plan premium
  
  // Acceptation des conditions
  termsAccepted?: boolean;
  
  // === DONNÉES HYBRIDES ===
  hybridAccessibilityDetails?: any;
  hybridDetailedServices?: any;
  hybridClienteleInfo?: any;
  hybridDetailedPayments?: any;
  hybridChildrenServices?: any;
  hybridParkingInfo?: any;
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
  youtube: string | null;
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
    // Nouvelles données SIRET enrichies
    siretAddress: string;
    siretActivity: string;
    siretCreationDate: string;
    siretEffectifs: string;
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
    label: "Plan Basic",
    features: [
      "1 photo pour votre établissement",
      "Fiche établissement basique",
      "Présence sur la carte interactive",
      "Statistiques de consultation limitées"
    ],
    price: "Gratuit",
    badge: "Découverte",
    color: "gray",
    savings: undefined
  },
  premium: {
    label: "Plan Premium",
    features: [
      "🦋 Effet Papillon : jusqu'à 5 photos avec découverte progressive au survol",
      "🔥 Badge Premium avec logo flamme tendance",
      "📢 Créez des Événements temporaires avec visuel attractif",
      "🎁 Publiez des Bons Plans quotidiens pour attirer plus de clients",
      "⭐ Mise en avant prioritaire dans les résultats de recherche",
      "🏠 Mise en avant de vos événements sur la page d'accueil",
      "📊 Analytics avancées : profil détaillé de vos visiteurs",
      "💬 Support client prioritaire et dédié",
      "✨ Description enrichie avec intelligence artificielle"
    ],
    price: "29,90€/mois",
    badge: "Recommandé",
    color: "orange",
    savings: undefined
  }
} as const;

