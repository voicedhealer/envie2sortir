
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ModernActivitiesSelector } from "@/components/ModernActivitiesSelector"; 
import OpeningHoursInput, { HoursData } from '@/components/forms/OpeningHoursInput';
import SummaryStep, { EstablishmentFormData } from '@/components/forms/SummaryStep';
import AdresseStep, { AddressData } from '@/components/forms/AdresseStep';
import TagsSelector from '@/components/forms/TagsSelector';
import EnrichmentStep from '@/components/forms/EnrichmentStep';
import { EnrichmentData } from '@/lib/enrichment-system';
import OrganizedServicesAmbianceManager from '@/components/OrganizedServicesAmbianceManager';
import EnvieTagsInput from '@/components/forms/EnvieTagsInput';

// Fonction pour parser l'adresse Google en format formulaire
function parseAddressFromGoogle(googleAddress: string): AddressData {
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
function getSuggestedTags(activities: string[]): string[] {
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
function convertAccessibilityArrayToObject(accessibilityArray: string[] = []): any {
  return {
    wheelchairAccessibleEntrance: accessibilityArray.includes('Entrée accessible en fauteuil roulant'),
    wheelchairAccessibleParking: accessibilityArray.includes('Parking accessible en fauteuil roulant'),
    wheelchairAccessibleRestroom: accessibilityArray.includes('Toilettes accessibles en fauteuil roulant'),
    wheelchairAccessibleSeating: accessibilityArray.includes('Places assises accessibles en fauteuil roulant')
  };
}

function convertServicesAvailableArrayToObject(servicesArray: string[] = []): any {
  return {
    delivery: servicesArray.includes('Livraison'),
    takeout: servicesArray.includes('Vente à emporter'),
    dineIn: servicesArray.includes('Repas sur place')
  };
}

function convertDiningServicesArrayToObject(diningArray: string[] = []): any {
  return {
    lunch: diningArray.includes('Déjeuner'),
    dinner: diningArray.includes('Dîner'),
    catering: diningArray.includes('Traiteur'),
    desserts: diningArray.includes('Desserts'),
    tableService: diningArray.includes('Service à table')
  };
}

function convertOfferingsArrayToObject(offeringsArray: string[] = []): any {
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

function convertAtmosphereArrayToObject(atmosphereArray: string[] = []): any {
  return {
    casual: atmosphereArray.includes('Ambiance décontractée'),
    cozy: atmosphereArray.includes('Cadre agréable'),
    quiet: atmosphereArray.includes('Calme'),
    romantic: atmosphereArray.includes('Romantique'),
    festive: atmosphereArray.includes('Festif')
  };
}

function convertGeneralServicesArrayToObject(servicesArray: string[] = []): any {
  return {
    wifi: servicesArray.includes('WiFi'),
    airConditioning: servicesArray.includes('Climatisation'),
    restrooms: servicesArray.includes('Toilettes'),
    parking: servicesArray.includes('Parking')
  };
}

// Types
type ProfessionalData = {
  // Données de compte (nouvelle étape 0)
  accountEmail: string;
  accountPassword: string;
  accountPasswordConfirm: string;
  accountFirstName: string;
  accountLastName: string;
  accountPhone?: string;
  
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
  
  // Contact
  phone?: string;
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
type ExistingEstablishment = {
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
};

type FormStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Icônes simples en SVG
const Icons = {
  Camera: () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Info: () => (
    <svg className="inline w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="inline w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Spinner: () => (
    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
  )
};

// Configuration des catégories et services
const CATEGORIES = {
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
};

const SUBSCRIPTION_PLANS = {
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
      "10 photos maximum",
      "Description détaillée",
      "Mise en avant dans les résultats",
      "Statistiques avancées",
      "Badge 'Partenaire vérifié'",
      "Support prioritaire"
    ],
    price: "29€/mois"
  }
};

// Fonction pour récupérer les services et ambiances basés sur les activités sélectionnées
const getActivitiesServicesAndAmbiance = (activities: string[]) => {
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

// Listes génériques de secours pour Services & Ambiances (fallback)
// Les services et ambiances sont maintenant générés dynamiquement depuis Google Places


interface EstablishmentFormProps {
  establishment?: ExistingEstablishment;
  isEditMode?: boolean;
}

export default function ProfessionalRegistrationForm({ establishment, isEditMode = false }: EstablishmentFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<FormStep>(isEditMode ? 2 : 0); // Commencer à l'étape 2 en mode édition (Informations de l'établissement)
  const [formData, setFormData] = useState<ProfessionalData>(() => {
    // Pré-remplir avec les données existantes si en mode édition
    if (isEditMode && establishment) {
      return {
        // Données de compte (étape 0) - non modifiables en mode édition
        accountEmail: "",
        accountPassword: "",
        accountPasswordConfirm: "",
        accountFirstName: "",
        accountLastName: "",
        accountPhone: "",
        
        // Données légales/administratives - non modifiables en mode édition
        siret: "",
        companyName: "",
        legalStatus: "",
        
        // Données de l'établissement - pré-remplies
        establishmentName: establishment.name || "",
        description: establishment.description || "",
        address: {
          street: establishment.address || "",
          postalCode: establishment.postalCode || "",
          city: establishment.city || "",
          latitude: establishment.latitude || undefined,
          longitude: establishment.longitude || undefined
        },
        activities: establishment.activities || [],
        services: establishment.services || [],
        ambiance: establishment.ambiance || [],
        paymentMethods: undefined, // Sera défini par l'enrichissement
        tags: establishment.tags || [],
        photos: [],
        hours: establishment.horairesOuverture || {},
        website: establishment.website || "",
        instagram: establishment.instagram || "",
        facebook: establishment.facebook || "",
        tiktok: establishment.tiktok || "",
        priceMin: establishment.priceMin || undefined,
        priceMax: establishment.priceMax || undefined,
        informationsPratiques: establishment.informationsPratiques || [],
        subscriptionPlan: establishment.subscription === 'PREMIUM' ? 'premium' : 'free'
      };
    }
    
    // Valeurs par défaut pour la création
    return {
      // Données de compte (étape 0)
      accountEmail: "",
      accountPassword: "",
      accountPasswordConfirm: "",
      accountFirstName: "",
      accountLastName: "",
      accountPhone: "",
      
      // Données légales/administratives
      siret: "",
      companyName: "",
      legalStatus: "",
      establishmentName: "",
      description: "",
      address: {
        street: "",
        postalCode: "",
        city: "",
        latitude: undefined,
        longitude: undefined
      },
      activities: [],
      services: [],
      ambiance: [],
      paymentMethods: undefined,
      tags: [],
      photos: [],
      hours: {},
      priceMin: undefined,
      priceMax: undefined,
      informationsPratiques: [],
      subscriptionPlan: "free"
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envieGeneratedTags, setEnvieGeneratedTags] = useState<string[]>([]);
    const [enrichmentData, setEnrichmentData] = useState<EnrichmentData>({
    name: '',
    establishmentType: '',
    priceLevel: 0,
    rating: 0,
    address: '',
    phone: '',
    website: '',
    description: '',
    openingHours: [],
    hours: {},
    practicalInfo: [],
    envieTags: [],
    specialties: [],
    atmosphere: [],
    googlePlaceId: '',
    googleBusinessUrl: '',
    googleRating: 0,
    googleReviewCount: 0,
    theForkLink: '',
    uberEatsLink: '',
    accessibilityInfo: [],
    servicesAvailableInfo: [],
    pointsForts: [],
    populairePour: [],
    offres: [],
    servicesRestauration: [],
    servicesInfo: [],
    ambianceInfo: [],
    clientele: [],
    planning: [],
    paiements: [],
    enfants: [],
    parking: []
  });
  const [siretVerification, setSiretVerification] = useState<{
    status: 'idle' | 'loading' | 'valid' | 'invalid';
    data?: any;
  }>({ status: 'idle' });

  // Vérification si l'utilisateur a déjà un établissement
  useEffect(() => {
    const checkExistingEstablishment = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/professional/establishments');
          if (response.ok) {
            const data = await response.json();
            if (data.establishment) {
              // L'utilisateur a déjà un établissement, rediriger vers le dashboard
              router.push('/dashboard?tab=overview');
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'établissement:', error);
        }
      }
    };

    if (status === 'authenticated') {
      checkExistingEstablishment();
    }
  }, [session, status, router]);

  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && establishment) {
      console.log('🔄 Chargement des données existantes en mode édition:', establishment);
      
      // Charger les données Google Places existantes
      if (establishment.services) {
        try {
          const services = typeof establishment.services === 'string' 
            ? JSON.parse(establishment.services) 
            : establishment.services;
          setFormData(prev => ({ ...prev, services: Array.isArray(services) ? services : [] }));
        } catch (error) {
          console.error('Erreur parsing services:', error);
        }
      }
      
      if (establishment.ambiance) {
        try {
          const ambiance = typeof establishment.ambiance === 'string' 
            ? JSON.parse(establishment.ambiance) 
            : establishment.ambiance;
          setFormData(prev => ({ ...prev, ambiance: Array.isArray(ambiance) ? ambiance : [] }));
        } catch (error) {
          console.error('Erreur parsing ambiance:', error);
        }
      }
      
      if (establishment.informationsPratiques) {
        try {
          const informationsPratiques = typeof establishment.informationsPratiques === 'string' 
            ? JSON.parse(establishment.informationsPratiques) 
            : establishment.informationsPratiques;
          setFormData(prev => ({ ...prev, informationsPratiques: Array.isArray(informationsPratiques) ? informationsPratiques : [] }));
        } catch (error) {
          console.error('Erreur parsing informationsPratiques:', error);
        }
      }
      
      console.log('✅ Données Google Places chargées en mode édition');
    }
  }, [isEditMode, establishment]);

  // Vérification SIRET en temps réel
  const verifySiret = async (siret: string) => {
    if (siret.length !== 14) return;
    
    setSiretVerification({ status: 'loading' });
    
    try {
      // Simulation d'appel API - à remplacer par une vraie API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation de données retournées
      const mockData = {
        valid: true,
        denomination: "SARL EXEMPLE",
        categorieJuridiqueUniteLegale: "SARL",
        adresse: "123 Rue de la Paix, 21000 Dijon"
      };
      
      setSiretVerification({ status: 'valid', data: mockData });
      setFormData(prev => ({
        ...prev,
        companyName: mockData.denomination || "",
        legalStatus: mockData.categorieJuridiqueUniteLegale || ""
        // Note: address reste inchangé car c'est un objet AddressData, pas une string
      }));
    } catch (error) {
      setSiretVerification({ status: 'invalid' });
    }
  };



  const handleInputChange = (field: keyof ProfessionalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'siret' && typeof value === 'string') {
      const cleanSiret = value.replace(/\s/g, '');
      setFormData(prev => ({ ...prev, siret: cleanSiret }));
      
      if (cleanSiret.length === 14) {
        verifySiret(cleanSiret);
      }
    }
    
    // Gestion spéciale pour l'adresse (AddressData)
    if (field === 'address' && typeof value === 'object') {
      // L'adresse est déjà mise à jour par le composant AdresseStep
      console.log('📍 Adresse mise à jour:', value);
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fonction pour convertir un tableau de moyens de paiement en objet
  const convertPaymentMethodsArrayToObject = (paymentMethodsArray: string[]) => {
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
  };

  const handleEnrichmentComplete = (enrichmentData: EnrichmentData) => {
    console.log('🎯 handleEnrichmentComplete appelé avec:', enrichmentData);
    
    // Mettre à jour les données du formulaire avec les données enrichies
    setFormData(prev => ({
      ...prev,
      establishmentName: enrichmentData.name || prev.establishmentName,
      description: enrichmentData.description || prev.description,
      phone: enrichmentData.phone || prev.phone,
      website: enrichmentData.website || prev.website,
      
      // === CORRECTION : Mapping correct des données Google Places ===
      services: enrichmentData.servicesArray || [],
      ambiance: enrichmentData.ambianceArray || [],
      activities: enrichmentData.activities || [],
      paymentMethods: enrichmentData.paymentMethodsArray ? 
        convertPaymentMethodsArrayToObject(enrichmentData.paymentMethodsArray) : 
        prev.paymentMethods,
      informationsPratiques: enrichmentData.informationsPratiques || prev.informationsPratiques,
      address: enrichmentData.address ? {
        ...parseAddressFromGoogle(enrichmentData.address),
        latitude: enrichmentData.latitude,
        longitude: enrichmentData.longitude
      } : prev.address,
      hours: enrichmentData.hours || prev.hours,
      envieTags: enrichmentData.envieTags || prev.envieTags,
      theForkLink: enrichmentData.theForkLink || prev.theForkLink,
      uberEatsLink: enrichmentData.uberEatsLink || prev.uberEatsLink,
      
      // === MAPPING DES NOUVELLES SECTIONS DÉTAILLÉES ===
      accessibilityInfo: convertAccessibilityArrayToObject(enrichmentData.accessibilityInfo) || prev.accessibilityInfo,
      servicesAvailable: convertServicesAvailableArrayToObject(enrichmentData.servicesAvailableInfo) || prev.servicesAvailable,
      diningServices: convertDiningServicesArrayToObject(enrichmentData.servicesRestauration) || prev.diningServices,
      offerings: convertOfferingsArrayToObject(enrichmentData.offres) || prev.offerings,
      atmosphereFeatures: convertAtmosphereArrayToObject(enrichmentData.ambianceInfo) || prev.atmosphereFeatures,
      generalServices: convertGeneralServicesArrayToObject(enrichmentData.servicesInfo) || prev.generalServices,
      
      // === INTÉGRATION DES DONNÉES HYBRIDES ===
      // Stocker les données hybrides dans formData pour les transmettre à l'étape 4
      hybridAccessibilityDetails: enrichmentData.accessibilityDetails,
      hybridDetailedServices: enrichmentData.detailedServices,
      hybridClienteleInfo: enrichmentData.clienteleInfo,
      hybridDetailedPayments: enrichmentData.detailedPayments,
      hybridChildrenServices: enrichmentData.childrenServices,
      
      enriched: true
    }));
    
    // Stocker les données d'enrichissement pour les réutiliser
    setEnrichmentData(enrichmentData);
    
    console.log('✅ Données d\'enrichissement intégrées, passage à l\'étape 3');
    // Passer à l'étape 3 (Informations sur l'établissement)
    setCurrentStep(3);
  };
  const handleTagsChange = (tags: string[]) => {
    // Combiner les tags manuels avec les tags générés par les envies
    const allTags = [...new Set([...tags, ...envieGeneratedTags])]; // Éviter les doublons
    setFormData(prev => ({ ...prev, tags: allTags }));
  };

  const handleEnvieTagsGenerated = (generatedTags: string[]) => {
    setEnvieGeneratedTags(generatedTags);
    // Mettre à jour immédiatement les tags du formulaire
    const currentManualTags = formData.tags.filter(tag => !envieGeneratedTags.includes(tag));
    const allTags = [...new Set([...currentManualTags, ...generatedTags])];
    setFormData(prev => ({ ...prev, tags: allTags }));
  };

  const handleArrayToggle = (field: 'services' | 'ambiance' | 'informationsPratiques', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Les photos sont maintenant gérées sur la page pro

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    // En mode édition, ignorer les étapes 0 et 1 (création de compte et vérification SIRET)
    if (isEditMode && (step === 0 || step === 1)) {
      return true;
    }

    switch (step) {
      case 0:
        if (!formData.accountFirstName) newErrors.accountFirstName = "Prénom requis";
        if (!formData.accountLastName) newErrors.accountLastName = "Nom requis";
        if (!formData.accountEmail) newErrors.accountEmail = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail)) {
          newErrors.accountEmail = "Format d'email invalide";
        }
        if (!formData.accountPassword) newErrors.accountPassword = "Mot de passe requis";
        else if (formData.accountPassword.length < 8) {
          newErrors.accountPassword = "Le mot de passe doit contenir au moins 8 caractères";
        }
        if (!formData.accountPasswordConfirm) newErrors.accountPasswordConfirm = "Confirmation du mot de passe requise";
        else if (formData.accountPassword !== formData.accountPasswordConfirm) {
          newErrors.accountPasswordConfirm = "Les mots de passe ne correspondent pas";
        }
        break;

      case 1:
        if (!formData.siret) newErrors.siret = "SIRET requis";
        if (siretVerification.status !== 'valid') newErrors.siret = "SIRET invalide";
        break;
      
      case 2:
        // L'étape d'enrichissement est optionnelle, pas de validation requise
        break;
      
      case 3:
        if (!formData.establishmentName) newErrors.establishmentName = "Nom requis";
        if (!formData.address.street || !formData.address.postalCode || !formData.address.city) {
          newErrors.address = "Adresse complète requise (rue, code postal et ville)";
        }
        if (formData.activities.length === 0) newErrors.activities = "Sélectionnez au moins une activité";
        break;
      
      case 4:
        // Validation plus permissive pour l'étape 4
        // Les services et ambiance peuvent être vides si l'utilisateur n'a pas encore enrichi
        break;
      
      case 5:
        // En mode édition, les tags sont optionnels
        if (!isEditMode && formData.tags.length < 3) {
          newErrors.tags = "Sélectionnez au moins 3 tags de recherche";
        }
        break;
      
      case 6:
        // Validation de l'abonnement (obligatoire)
        if (!formData.subscriptionPlan) newErrors.subscriptionPlan = "Veuillez sélectionner un plan";
        break;
      
      case 7:
        // Réseaux sociaux (optionnel)
        break;
      
      case 8:
        // Récapitulatif final (pas de validation supplémentaire)
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(8, prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1) as FormStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && establishment) {
        // Mode édition - utiliser l'API de mise à jour
        const updateData = {
          name: formData.establishmentName,
          description: formData.description,
          address: formData.address.street,
          city: formData.address.city,
          postalCode: formData.address.postalCode,
          latitude: formData.address.latitude,
          longitude: formData.address.longitude,
          activities: formData.activities,
          services: formData.services,
          ambiance: formData.ambiance,
          paymentMethods: formData.paymentMethods,
          horairesOuverture: formData.hours,
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          priceMin: formData.priceMin,
          priceMax: formData.priceMax,
          informationsPratiques: formData.informationsPratiques,
          subscription: formData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'STANDARD',
          // === DONNÉES HYBRIDES ===
          accessibilityDetails: formData.hybridAccessibilityDetails,
          detailedServices: formData.hybridDetailedServices,
          clienteleInfo: formData.hybridClienteleInfo,
          detailedPayments: formData.hybridDetailedPayments,
          childrenServices: formData.hybridChildrenServices
        };

        const response = await fetch(`/api/etablissements/${establishment.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la modification');
        }

        // Redirection vers le dashboard après modification
        router.push('/dashboard?tab=overview');
        
      } else {
        // Mode création - utiliser l'API d'inscription
        const formDataToSend = new FormData();
        
        // Ajouter toutes les données
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'photos') {
            if (Array.isArray(value)) {
              (value as File[]).forEach((photo, index) => {
                formDataToSend.append(`photo_${index}`, photo);
              });
            }
          } else if (key === 'hours') {
            // Traitement spécial pour le champ hours (objet complexe)
            formDataToSend.append(key, JSON.stringify(value));
          } else if (key === 'address') {
            // Traitement spécial pour l'adresse : construction de l'adresse complète
            const addressData = value as AddressData;
            const fullAddress = `${addressData.street}, ${addressData.postalCode} ${addressData.city}`;
            formDataToSend.append('address', fullAddress);
            
            // Ajout des coordonnées séparément
            if (addressData.latitude !== undefined) {
              formDataToSend.append('latitude', addressData.latitude.toString());
            }
            if (addressData.longitude !== undefined) {
              formDataToSend.append('longitude', addressData.longitude.toString());
            }
          } else if (key.startsWith('hybrid') && typeof value === 'object' && value !== null) {
            // Traitement spécial pour les données hybrides (objets JSON)
            formDataToSend.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });
        
        const response = await fetch('/api/professional-registration', {
          method: 'POST',
          body: formDataToSend,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de l\'inscription');
        }
        
        // Connexion automatique si demandée
        if (result.autoLogin && result.user) {
          try {
            const signInResult = await signIn('credentials', {
              email: result.user.email,
              password: formData.accountPassword,
              redirect: false,
            });

            if (signInResult?.ok) {
              // Redirection vers le dashboard
              router.push('/dashboard');
            } else {
              // Fallback vers la page d'établissement
              router.push(`/etablissements/${result.establishment.slug}`);
            }
          } catch (error) {
            console.error('Erreur connexion automatique:', error);
            // Fallback vers la page d'établissement
            router.push(`/etablissements/${result.establishment.slug}`);
          }
        } else {
          // Redirection classique
          router.push(`/etablissements/${result.establishment.slug}`);
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : `Erreur lors de ${isEditMode ? 'la modification' : 'l\'inscription'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

/**
 * Composant de rendu dynamique pour chaque étape du formulaire professionnel.
 * Affiche le contenu correspondant à l'étape courante, gère la validation front, 
 * et permet d'adapter facilement les contenus pour chaque logique métier.
 *
 * Utilisation : placer `{renderStep()}` dans le JSX parent, et inclure les états nécessaires :
 *  - currentStep, formData, errors, handleInputChange, etc.
 */
const renderStep = () => {
  switch (currentStep) {
    // === Étape 0 : Création de compte ===
    case 0:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Création de votre compte
            </h2>
            <p className="text-gray-600 mt-2">
              Créez votre compte professionnel pour gérer votre établissement
            </p>
          </div>
          
          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.accountFirstName}
                onChange={(e) => handleInputChange('accountFirstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Votre prénom"
              />
              {errors.accountFirstName && (
                <p className="text-red-500 text-sm mt-1">{errors.accountFirstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.accountLastName}
                onChange={(e) => handleInputChange('accountLastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Votre nom"
              />
              {errors.accountLastName && (
                <p className="text-red-500 text-sm mt-1">{errors.accountLastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Email professionnel *
            </label>
            <input
              type="email"
              value={formData.accountEmail}
              onChange={(e) => handleInputChange('accountEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="votre.email@exemple.com"
            />
            {errors.accountEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.accountEmail}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              value={formData.accountPhone || ''}
              onChange={(e) => handleInputChange('accountPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="06 12 34 56 78"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.accountPassword}
              onChange={(e) => handleInputChange('accountPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Minimum 8 caractères"
            />
            {errors.accountPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.accountPassword}</p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              value={formData.accountPasswordConfirm}
              onChange={(e) => handleInputChange('accountPasswordConfirm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Répétez votre mot de passe"
            />
            {errors.accountPasswordConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.accountPasswordConfirm}</p>
            )}
          </div>
        </div>
      );

    // === Étape 1 : Informations professionnelles et vérification SIRET ===
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Vérification professionnelle
            </h2>
            <p className="text-gray-600 mt-2">
              Nous devons vérifier votre statut professionnel pour valider votre inscription
            </p>
          </div>
          {/* Champ SIRET + indication du statut de vérification */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Numéro SIRET * <Icons.Info />
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.siret}
                onChange={(e) =>
                  handleInputChange('siret', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siret ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="14 chiffres (ex: 12345678901234)"
                maxLength={14}
              />
              <div className="absolute right-3 top-3">
                {siretVerification.status === 'loading' && <Icons.Spinner />}
                {siretVerification.status === 'valid' && <Icons.Check />}
                {siretVerification.status === 'invalid' && <Icons.X />}
              </div>
            </div>
            {/* Feedback de vérification */}
            {siretVerification.status === 'valid' && siretVerification.data && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Entreprise vérifiée: {siretVerification.data.denomination}
                </p>
              </div>
            )}
            {errors.siret && <p className="text-red-500 text-sm mt-1">{errors.siret}</p>}
          </div>

          {/* Informations du responsable (pré-remplies depuis l'étape 0) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Responsable de l'établissement
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Prénom :</span>
                <span className="ml-2 text-gray-900">{formData.accountFirstName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nom :</span>
                <span className="ml-2 text-gray-900">{formData.accountLastName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email :</span>
                <span className="ml-2 text-gray-900">{formData.accountEmail}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Téléphone :</span>
                <span className="ml-2 text-gray-900">{formData.accountPhone || 'Non renseigné'}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ces informations ont été saisies lors de la création de votre compte.
            </p>
          </div>
        </div>
      );
        // === Étape 2 : Enrichissement automatique ===
    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Réenrichissement avec Google Places' : 'Enrichissement automatique'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isEditMode 
                ? 'Vous pouvez refaire l\'enrichissement pour mettre à jour les informations de votre établissement'
                : 'Récupérez automatiquement les informations de votre établissement depuis Google Places'
              }
            </p>
          </div>
          
          <EnrichmentStep
            onEnrichmentComplete={handleEnrichmentComplete}
            onSkip={() => {
              console.log('Enrichissement ignoré par l\'utilisateur');
              setCurrentStep(3);
            }}
            isVisible={true}
            onEnrichmentDataChange={handleEnrichmentDataChange}
          />
        </div>
      );

    // === Étape 3 : Informations sur l'établissement ===
    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Informations sur l'établissement
            </h2>
            <p className="text-gray-600 mt-2">
              Décrivez votre établissement pour que les clients le trouvent facilement
            </p>
          </div>
          {/* Nom commercial */}
          <div>
            <label className="block text-sm font-medium mb-2">Nom de l’établissement *</label>
            <input
              type="text"
              value={formData.establishmentName}
              onChange={(e) => handleInputChange('establishmentName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.establishmentName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Le Central Bar"
            />
            {errors.establishmentName && <p className="text-red-500 text-sm mt-1">{errors.establishmentName}</p>}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description de l’établissement</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez l’ambiance, les spécialités, etc."
            />
          </div>
          {/* Adresse de l'établissement */}
          <AdresseStep
            value={formData.address}
            onChange={(address) => handleInputChange('address', address)}
            error={errors.address}
            disableAutoGeocode={isEditMode}
          />
          
          {/* Horaires d'ouverture */}
          <OpeningHoursInput 
            value={formData.hours} 
            onChange={(hours) => handleInputChange('hours', hours)} 
          />
          
          {/* Activités proposées */}
          <ModernActivitiesSelector
            value={formData.activities}
            onChange={(value) => handleInputChange('activities', value)}
            error={errors.activities}
          />
          
        </div>
      );

    // === Étape 4 : Services & Ambiances Dynamiques ===
         case 4:
      
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Services et ambiance
            </h2>
            <p className="text-gray-600 mt-2">
              {isEditMode 
                ? 'Gérez les services et l\'ambiance de votre établissement'
                : 'Personnalisez les services et l\'ambiance détectés automatiquement'
              }
            </p>
          </div>

          {/* Affichage des données hybrides si elles existent */}
          {(formData.hybridAccessibilityDetails || formData.hybridDetailedServices || 
            formData.hybridClienteleInfo || formData.hybridDetailedPayments || 
            formData.hybridChildrenServices) && (
            <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                🌟 Informations détaillées récupérées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {formData.hybridAccessibilityDetails && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">♿ Accessibilité détaillée</h4>
                    <p className="text-gray-600">
                      {Object.keys(formData.hybridAccessibilityDetails).length} éléments configurés
                    </p>
                  </div>
                )}
                {formData.hybridDetailedServices && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">🏪 Services détaillés</h4>
                    <p className="text-gray-600">
                      {Object.keys(formData.hybridDetailedServices).length} services configurés
                    </p>
                  </div>
                )}
                {formData.hybridClienteleInfo && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">👥 Clientèle et inclusivité</h4>
                    <p className="text-gray-600">
                      {Object.keys(formData.hybridClienteleInfo).length} informations configurées
                    </p>
                  </div>
                )}
                {formData.hybridDetailedPayments && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">💳 Moyens de paiement détaillés</h4>
                    <p className="text-gray-600">
                      {Object.keys(formData.hybridDetailedPayments).length} moyens configurés
                    </p>
                  </div>
                )}
                {formData.hybridChildrenServices && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">👶 Services enfants</h4>
                    <p className="text-gray-600">
                      {Object.keys(formData.hybridChildrenServices).length} services configurés
                    </p>
                  </div>
                )}
              </div>
              <p className="text-sm text-orange-700 mt-3">
                💡 Ces informations détaillées ont été récupérées lors de l'enrichissement et seront intégrées à votre établissement.
              </p>
            </div>
          )}

          <OrganizedServicesAmbianceManager
            services={formData.services || []}
            ambiance={formData.ambiance || []}
            onServicesChange={(services) => handleInputChange('services', services)}
            onAmbianceChange={(ambiance) => handleInputChange('ambiance', ambiance)}
            isEditMode={isEditMode}
          />
        </div>
      );

    // === Étape 5 : Tags & Mots-clés ===
    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Comment les clients vous trouvent-ils ?
            </h2>
            <p className="text-gray-600 mt-2">
              Décrivez vos envies et choisissez les mots-clés qui décrivent le mieux votre établissement
            </p>
          </div>

          {/* Section "Envie de..." pour générer des tags automatiquement */}
          <EnvieTagsInput
            onEnvieTagsGenerated={handleEnvieTagsGenerated}
            existingTags={formData.tags}
          />

          {/* Sélecteur de tags traditionnel */}
          <TagsSelector
            selectedTags={formData.tags}
            onTagsChange={handleTagsChange}
            suggestedTags={getSuggestedTags(formData.activities)}
            error={errors.tags}
          />
        </div>
      );

    // === Étape 6 : Sélection de l'abonnement ===
    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Choisissez votre plan</h2>
            <p className="text-gray-600 mt-2">
              Sélectionnez le plan qui correspond le mieux à vos besoins
            </p>
          </div>
          {/* Sélection du plan */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('subscriptionPlan', key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan.label}</h3>
                  <span className="text-lg font-bold text-blue-600">{plan.price}</span>
                </div>
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Icons.Check />
                      <span className="ml-2">{feature}</span>
                    </li>
                  ))}
                </ul>
                {key === 'premium' && (
                  <div className="mt-2">
                    <Icons.Star />
                    <span className="text-sm text-gray-600 ml-1">Recommandé</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Vous pourrez ajouter vos photos après l'inscription depuis votre espace professionnel.
              {formData.subscriptionPlan === 'premium' 
                ? ' Avec le plan Premium, vous pourrez ajouter jusqu\'à 10 photos.'
                : ' Avec le plan Gratuit, vous pourrez ajouter 1 photo.'
              }
            </p>
          </div>
        </div>
      );

    // === Étape 7 : Réseaux sociaux (mode création et édition) ===
    case 7:
      // Réseaux sociaux (mode création et édition)
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Réseaux sociaux</h2>
            <p className="text-gray-600 mt-2">
              Ajoutez vos liens réseaux sociaux pour améliorer votre visibilité
            </p>
          </div>
          {/* Liens réseaux sociaux */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site web</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.votre-site.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@votre_compte"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input
              type="url"
              value={formData.facebook || ''}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.facebook.com/votre-page"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">TikTok</label>
            <input
              type="url"
              value={formData.tiktok || ''}
              onChange={(e) => handleInputChange('tiktok', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.tiktok.com/@votrepseudo"
            />
          </div>

          {/* Section Prix */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fourchette de prix</h3>
            <p className="text-sm text-gray-600 mb-4">
              Indiquez votre fourchette de prix pour aider vos clients à mieux vous connaître
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prix minimum (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.priceMin || ''}
                  onChange={(e) => handleInputChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prix maximum (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.priceMax || ''}
                  onChange={(e) => handleInputChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="45"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exemple : 15-45€ pour un restaurant, 5-12€ pour un bar
            </p>
          </div>
        </div>
      );

    // === Étape 8 : Récapitulatif final ===
    case 8:
      return (
        <div className="space-y-6">
          <SummaryStep 
            data={{
              establishmentName: formData.establishmentName,
              description: formData.description,
              address: `${formData.address.street}, ${formData.address.postalCode} ${formData.address.city}`,
              activities: formData.activities,
              hours: formData.hours,
              services: formData.services,
              ambiance: formData.ambiance,
              paymentMethods: [], // Géré par l'enrichissement automatique
              tags: formData.tags,
              photos: [], // Les photos sont maintenant ajoutées sur la page pro
              phone: formData.phone || '',
              email: formData.email || '',
              website: formData.website,
              instagram: formData.instagram,
              facebook: formData.facebook,
              tiktok: formData.tiktok,
            }}
            onEdit={(step) => setCurrentStep(step as FormStep)}
          />
          {/* Conditions d'utilisation (seulement en mode création) */}
          {!isEditMode && (
            <div className="text-sm text-gray-600">
              <label className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" required />
                <span>
                  J'accepte les{' '}
                  <a href="/conditions" className="text-blue-600 underline">
                    conditions générales d'utilisation
                  </a>
                  {' '}et la{' '}
                  <a href="/politique-confidentialite" className="text-blue-600 underline">
                    politique de confidentialité
                  </a>
                </span>
              </label>
            </div>
          )}
        </div>
      );
    // Sécurité fallback si étape inconnue
    default:
      return <div>Erreur technique : étape inconnue.</div>;
  }
  };

  // Fonction stable pour éviter les boucles infinies dans useEffect
  const handleEnrichmentDataChange = useCallback((data: EnrichmentData | null) => {
    console.log('🔄 Données d\'enrichissement mises à jour dans le parent:', data);
    setEnrichmentData(data || {
      name: '',
      establishmentType: '',
      priceLevel: 0,
      rating: 0,
      address: '',
      phone: '',
      website: '',
      description: '',
      openingHours: [],
      hours: {},
      practicalInfo: [],
      envieTags: [],
      specialties: [],
      atmosphere: [],
      googlePlaceId: '',
      googleBusinessUrl: '',
      googleRating: 0,
      googleReviewCount: 0,
      theForkLink: '',
      uberEatsLink: '',
      accessibilityInfo: [],
      servicesAvailableInfo: [],
      pointsForts: [],
      populairePour: [],
      offres: [],
      servicesRestauration: [],
      servicesInfo: [],
      ambianceInfo: [],
      clientele: [],
      planning: [],
      paiements: [],
      enfants: [],
      parking: []
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => {
            const stepIndex = stepNumber - 1; // Convertir 1-9 en 0-8
            const isActive = stepNumber === currentStep; // Étape actuelle
            const isCompleted = stepNumber < currentStep; // Étapes complétées
            return (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  isActive || isCompleted
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={isEditMode ? currentStep === 2 : currentStep === 0}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => {
                // Si on est à l'étape 2 (enrichissement) et qu'on a des données enrichies,
                // les transmettre avant de passer à l'étape suivante
                if (currentStep === 2 && enrichmentData && enrichmentData.name) {
                  console.log('🔄 Transmission des données d\'enrichissement via bouton Suivant');
                  handleEnrichmentComplete(enrichmentData);
                } else {
                  nextStep();
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : currentStep === 8 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
{isEditMode ? "Sauvegarder les modifications" : "Créer l'établissement"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isEditMode ? 'Modification en cours...' : 'Inscription en cours...') 
                : (isEditMode ? 'Sauvegarder les modifications' : 'Finaliser l\'inscription')
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
