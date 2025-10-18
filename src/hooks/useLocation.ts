/**
 * Hook personnalisé pour utiliser la localisation
 * Simplifie l'accès au contexte de localisation
 */

import { useLocationContext } from '@/contexts/LocationContext';
import { City } from '@/types/location';

export function useLocation() {
  const context = useLocationContext();

  return {
    // État actuel
    currentCity: context.currentCity,
    searchRadius: context.searchRadius,
    loading: context.loading,
    error: context.error,
    isDetected: context.isDetected,
    preferences: context.preferences,
    history: context.history,
    favorites: context.favorites,

    // Actions simplifiées
    changeCity: (city: City) => context.setCity(city),
    changeRadius: (radius: number) => context.setSearchRadius(radius),
    updatePreferences: context.setPreferences,
    
    // Favoris
    addFavorite: context.addToFavorites,
    removeFavorite: context.removeFromFavorites,
    isFavorite: (cityId: string) => context.favorites.some(f => f.id === cityId),
    
    // Détection
    detectMyLocation: context.detectLocation,
    
    // Utilitaires
    reset: context.resetToDefault,
    sync: context.syncWithAPI,
  };
}

