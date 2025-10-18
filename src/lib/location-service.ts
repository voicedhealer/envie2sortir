// Service pour gérer les préférences de localisation (localStorage + API)

import { City, LocationPreferences, CityHistory, DEFAULT_CITY } from '@/types/location';

const STORAGE_KEYS = {
  PREFERENCES: 'envie2sortir_location_preferences',
  HISTORY: 'envie2sortir_city_history',
  FAVORITES: 'envie2sortir_city_favorites',
  LAST_CITY: 'envie2sortir_last_city',
  POPUP_SHOWN: 'envie2sortir_location_popup_shown',
} as const;

// Durée de vie du cache (30 jours)
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Sauvegarde les préférences de localisation
 */
export function saveLocationPreferences(preferences: LocationPreferences): void {
  try {
    const data = {
      ...preferences,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
  }
}

/**
 * Récupère les préférences de localisation
 */
export function getLocationPreferences(): LocationPreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    // Vérifier si le cache est expiré
    if (data.timestamp && Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      return null;
    }

    return {
      defaultCity: data.defaultCity,
      searchRadius: data.searchRadius || 20,
      mode: data.mode || 'manual',
      useCurrentLocation: data.useCurrentLocation || false,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return null;
  }
}

/**
 * Sauvegarde la dernière ville visitée
 */
export function saveLastCity(city: City): void {
  try {
    const data = {
      city,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.LAST_CITY, JSON.stringify(data));
    
    // Ajouter à l'historique
    addToHistory(city);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la dernière ville:', error);
  }
}

/**
 * Récupère la dernière ville visitée
 */
export function getLastCity(): City | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_CITY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    // Vérifier si le cache est expiré
    if (data.timestamp && Date.now() - data.timestamp > CACHE_DURATION) {
      return null;
    }

    return data.city;
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière ville:', error);
    return null;
  }
}

/**
 * Ajoute une ville à l'historique
 */
export function addToHistory(city: City): void {
  try {
    const history = getHistory();
    
    // Vérifier si la ville existe déjà
    const existingIndex = history.findIndex(h => h.city.id === city.id);
    
    if (existingIndex !== -1) {
      // Mettre à jour la ville existante
      history[existingIndex] = {
        city,
        lastVisited: new Date(),
        visitCount: history[existingIndex].visitCount + 1,
      };
    } else {
      // Ajouter la nouvelle ville
      history.unshift({
        city,
        lastVisited: new Date(),
        visitCount: 1,
      });
    }

    // Garder seulement les 5 dernières villes
    const limitedHistory = history.slice(0, 5);
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Erreur lors de l\'ajout à l\'historique:', error);
  }
}

/**
 * Récupère l'historique des villes
 */
export function getHistory(): CityHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    
    // Convertir les dates string en objets Date
    return history.map((h: any) => ({
      ...h,
      lastVisited: new Date(h.lastVisited),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

/**
 * Ajoute une ville aux favoris
 */
export function addToFavorites(city: City): void {
  try {
    const favorites = getFavorites();
    
    // Vérifier si la ville n'est pas déjà dans les favoris
    if (favorites.some(f => f.id === city.id)) {
      return;
    }

    favorites.push(city);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
  }
}

/**
 * Retire une ville des favoris
 */
export function removeFromFavorites(cityId: string): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.id !== cityId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
  }
}

/**
 * Récupère les villes favorites
 */
export function getFavorites(): City[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return [];

    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
}

/**
 * Vérifie si le popup de localisation a déjà été affiché
 */
export function hasShownLocationPopup(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.POPUP_SHOWN) === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Marque le popup comme affiché
 */
export function markPopupAsShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POPUP_SHOWN, 'true');
  } catch (error) {
    console.error('Erreur lors du marquage du popup:', error);
  }
}

/**
 * Nettoie toutes les données de localisation (utile pour debug/logout)
 */
export function clearLocationData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des données:', error);
  }
}

/**
 * Détermine la ville à utiliser selon l'ordre de priorité
 */
export async function determineCurrentCity(): Promise<City> {
  // 1. Essayer les préférences enregistrées
  const preferences = getLocationPreferences();
  if (preferences?.defaultCity) {
    return preferences.defaultCity;
  }

  // 2. Essayer la dernière ville visitée
  const lastCity = getLastCity();
  if (lastCity) {
    return lastCity;
  }

  // 3. Fallback sur la ville par défaut (Dijon)
  return DEFAULT_CITY;
}

/**
 * Synchronise les préférences avec l'API (pour les utilisateurs connectés)
 */
export async function syncPreferencesWithAPI(preferences: LocationPreferences): Promise<void> {
  try {
    const response = await fetch('/api/user/location-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      console.error('Erreur lors de la synchronisation des préférences');
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

/**
 * Récupère les préférences depuis l'API (pour les utilisateurs connectés)
 */
export async function fetchPreferencesFromAPI(): Promise<LocationPreferences | null> {
  try {
    const response = await fetch('/api/user/location-preferences');
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.preferences;
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return null;
  }
}

