// Types pour le système de localisation

export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  postalCode?: string;
}

export interface LocationPreferences {
  defaultCity: City | null;
  searchRadius: number; // en km
  mode: 'auto' | 'manual' | 'ask'; // auto = utiliser position actuelle, manual = ville par défaut, ask = demander à chaque fois
  useCurrentLocation: boolean;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  accuracy?: number;
}

export interface CityHistory {
  city: City;
  lastVisited: Date;
  visitCount: number;
}

export interface LocationState {
  currentCity: City | null;
  searchRadius: number;
  loading: boolean;
  error: string | null;
  isDetected: boolean; // Si la ville a été détectée automatiquement
  preferences: LocationPreferences;
  history: CityHistory[];
  favorites: City[];
}

// Constantes pour les rayons de recherche
export const SEARCH_RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: 'Toute la région' }
] as const;

export type SearchRadius = typeof SEARCH_RADIUS_OPTIONS[number]['value'];

// Villes principales de France (peut être étendu)
export const MAJOR_FRENCH_CITIES: City[] = [
  { id: 'dijon', name: 'Dijon', latitude: 47.322, longitude: 5.041, region: 'Bourgogne-Franche-Comté' },
  { id: 'paris', name: 'Paris', latitude: 48.8566, longitude: 2.3522, region: 'Île-de-France' },
  { id: 'lyon', name: 'Lyon', latitude: 45.7640, longitude: 4.8357, region: 'Auvergne-Rhône-Alpes' },
  { id: 'marseille', name: 'Marseille', latitude: 43.2965, longitude: 5.3698, region: "Provence-Alpes-Côte d'Azur" },
  { id: 'toulouse', name: 'Toulouse', latitude: 43.6047, longitude: 1.4442, region: 'Occitanie' },
  { id: 'bordeaux', name: 'Bordeaux', latitude: 44.8378, longitude: -0.5792, region: 'Nouvelle-Aquitaine' },
  { id: 'lille', name: 'Lille', latitude: 50.6292, longitude: 3.0573, region: 'Hauts-de-France' },
  { id: 'nantes', name: 'Nantes', latitude: 47.2184, longitude: -1.5536, region: 'Pays de la Loire' },
  { id: 'strasbourg', name: 'Strasbourg', latitude: 48.5734, longitude: 7.7521, region: 'Grand Est' },
  { id: 'nice', name: 'Nice', latitude: 43.7102, longitude: 7.2620, region: "Provence-Alpes-Côte d'Azur" },
  { id: 'rennes', name: 'Rennes', latitude: 48.1173, longitude: -1.6778, region: 'Bretagne' },
  { id: 'reims', name: 'Reims', latitude: 49.2583, longitude: 4.0317, region: 'Grand Est' },
  { id: 'montpellier', name: 'Montpellier', latitude: 43.6108, longitude: 3.8767, region: 'Occitanie' },
];

// Ville par défaut (Dijon)
export const DEFAULT_CITY: City = MAJOR_FRENCH_CITIES[0];

