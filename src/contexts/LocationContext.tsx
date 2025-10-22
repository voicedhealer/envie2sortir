'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  City,
  LocationState,
  LocationPreferences,
  CityHistory,
  DEFAULT_CITY,
  SEARCH_RADIUS_OPTIONS,
} from '@/types/location';
import {
  saveLocationPreferences,
  getLocationPreferences,
  saveLastCity,
  getLastCity,
  getHistory,
  getFavorites,
  addToFavorites as addToFavoritesService,
  removeFromFavorites as removeFromFavoritesService,
  determineCurrentCity,
  syncPreferencesWithAPI,
  fetchPreferencesFromAPI,
} from '@/lib/location-service';
import { detectUserCity, detectCityByIP } from '@/lib/geolocation-utils';

interface LocationContextType extends LocationState {
  // Actions pour changer la localisation
  setCity: (city: City) => void;
  setSearchRadius: (radius: number) => void;
  setPreferences: (preferences: Partial<LocationPreferences>) => void;
  
  // Actions pour l'historique et favoris
  addToFavorites: (city: City) => void;
  removeFromFavorites: (cityId: string) => void;
  
  // Actions de détection automatique
  detectLocation: () => Promise<void>;
  
  // Réinitialisation
  resetToDefault: () => void;
  
  // Synchronisation pour utilisateurs connectés
  syncWithAPI: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export function LocationProvider({ children, isAuthenticated = false }: LocationProviderProps) {
  const [state, setState] = useState<LocationState>({
    currentCity: null,
    searchRadius: 10, // 10km par défaut
    loading: true,
    error: null,
    isDetected: false,
    preferences: {
      defaultCity: null,
      searchRadius: 10,
      mode: 'manual',
      useCurrentLocation: false,
    },
    history: [],
    favorites: [],
  });

  // Initialisation au montage du composant
  useEffect(() => {
    initializeLocation();
  }, []);

  // Synchroniser avec l'API si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      syncWithAPI();
    } else {
      // Utilisateur déconnecté, réinitialiser à Dijon + 10km
      resetToDefault();
    }
  }, [isAuthenticated]);

  /**
   * Initialise la localisation au chargement
   */
  const initializeLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Charger les préférences, historique et favoris
      const preferences = getLocationPreferences();
      const history = getHistory();
      const favorites = getFavorites();

      // Déterminer la ville actuelle
      const currentCity = await determineCurrentCity();

      // Utiliser un timeout pour éviter les warnings act
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentCity,
          searchRadius: preferences?.searchRadius || 10,
          preferences: preferences || prev.preferences,
          history,
          favorites,
          loading: false,
        }));
      }, 0);

      // Sauvegarder comme dernière ville visitée
      saveLastCity(currentCity);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setState(prev => ({
        ...prev,
        currentCity: DEFAULT_CITY,
        loading: false,
        error: 'Erreur lors du chargement de la localisation',
      }));
    }
  };

  /**
   * Change la ville actuelle
   */
  const setCity = (city: City) => {
    // Mettre à jour l'état en une seule fois
    setState(prev => {
      const newPreferences = prev.preferences.mode === 'manual' 
        ? { ...prev.preferences, defaultCity: city }
        : prev.preferences;
      
      return {
        ...prev,
        currentCity: city,
        isDetected: false,
        preferences: newPreferences,
      };
    });

    // Sauvegarder dans localStorage
    saveLastCity(city);

    // Mettre à jour les préférences si mode manual
    if (state.preferences.mode === 'manual') {
      const newPreferences = {
        ...state.preferences,
        defaultCity: city,
      };
      saveLocationPreferences(newPreferences);
      
      // Synchroniser avec l'API si authentifié
      if (isAuthenticated) {
        syncPreferencesWithAPI(newPreferences);
      }
    }
  };

  /**
   * Change le rayon de recherche
   */
  const setSearchRadius = (radius: number) => {
    // Mettre à jour l'état en une seule fois
    setState(prev => {
      return {
        ...prev,
        searchRadius: radius,
        preferences: {
          ...prev.preferences,
          searchRadius: radius,
        },
      };
    });

    // Sauvegarder
    const newPreferences = {
      ...state.preferences,
      searchRadius: radius,
    };
    saveLocationPreferences(newPreferences);

    // Synchroniser avec l'API si authentifié
    if (isAuthenticated) {
      syncPreferencesWithAPI(newPreferences);
    }
  };

  /**
   * Met à jour les préférences
   */
  const setPreferences = (preferences: Partial<LocationPreferences>) => {
    const newPreferences = {
      ...state.preferences,
      ...preferences,
    };

    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      searchRadius: newPreferences.searchRadius,
    }));

    saveLocationPreferences(newPreferences);

    // Synchroniser avec l'API si authentifié
    if (isAuthenticated) {
      syncPreferencesWithAPI(newPreferences);
    }
  };

  /**
   * Ajoute une ville aux favoris
   */
  const addToFavorites = (city: City) => {
    addToFavoritesService(city);
    setState(prev => ({
      ...prev,
      favorites: [...prev.favorites, city],
    }));
  };

  /**
   * Retire une ville des favoris
   */
  const removeFromFavorites = (cityId: string) => {
    removeFromFavoritesService(cityId);
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(f => f.id !== cityId),
    }));
  };

  /**
   * Détecte automatiquement la localisation de l'utilisateur
   */
  const detectLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Essayer la géolocalisation GPS d'abord
      let detectedCity: City;
      
      try {
        detectedCity = await detectUserCity();
      } catch (gpsError) {
        // Si GPS échoue, essayer par IP
        console.log('GPS échoué, tentative par IP...');
        const cityByIP = await detectCityByIP();
        detectedCity = cityByIP || DEFAULT_CITY;
      }

      setState(prev => ({
        ...prev,
        currentCity: detectedCity,
        isDetected: true,
        loading: false,
      }));

      saveLastCity(detectedCity);

      return detectedCity;
    } catch (error) {
      console.error('Erreur lors de la détection:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Impossible de détecter votre position',
      }));
      throw error;
    }
  };

  /**
   * Réinitialise à la ville par défaut
   */
  const resetToDefault = () => {
    console.log('🔄 Réinitialisation à Dijon + 10km...');
    
    setState(prev => ({
      ...prev,
      currentCity: DEFAULT_CITY,
      searchRadius: 10, // 10km par défaut
      isDetected: false,
      preferences: {
        defaultCity: null,
        searchRadius: 10,
        mode: 'manual',
        useCurrentLocation: false,
      },
      history: [],
      favorites: [],
    }));
    
    // Vider le localStorage pour une réinitialisation complète
    localStorage.removeItem('locationPreferences');
    localStorage.removeItem('lastCity');
    localStorage.removeItem('cityHistory');
    localStorage.removeItem('cityFavorites');
    
    saveLastCity(DEFAULT_CITY);
    
    console.log('✅ Réinitialisation terminée - Dijon + 10km');
  };

  /**
   * Synchronise avec l'API (pour utilisateurs connectés)
   */
  const syncWithAPI = async () => {
    if (!isAuthenticated) return;

    try {
      // Récupérer les préférences depuis l'API
      const apiPreferences = await fetchPreferencesFromAPI();
      
      if (apiPreferences) {
        // Utiliser les préférences de l'API (prioritaire)
        setState(prev => ({
          ...prev,
          preferences: apiPreferences,
          searchRadius: apiPreferences.searchRadius,
          currentCity: apiPreferences.defaultCity || prev.currentCity,
        }));
        
        // Sauvegarder localement aussi
        saveLocationPreferences(apiPreferences);
        if (apiPreferences.defaultCity) {
          saveLastCity(apiPreferences.defaultCity);
        }
      } else {
        // Envoyer les préférences locales à l'API
        await syncPreferencesWithAPI(state.preferences);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  // Fonction de test temporaire pour forcer la réinitialisation
  const forceResetToDefault = () => {
    console.log('🧪 FORCE RESET - Réinitialisation forcée à Dijon + 10km');
    resetToDefault();
  };

  const contextValue: LocationContextType = {
    ...state,
    setCity,
    setSearchRadius,
    setPreferences,
    addToFavorites,
    removeFromFavorites,
    detectLocation,
    resetToDefault,
    syncWithAPI,
    // Exposer la fonction de test temporairement
    forceResetToDefault,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de localisation
 */
export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext doit être utilisé dans un LocationProvider');
  }
  return context;
}

