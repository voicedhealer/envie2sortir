/**
 * Hook pour gérer l'historique et les favoris de villes
 */

import { useLocation } from './useLocation';
import { City, CityHistory } from '@/types/location';

export function useCityHistory() {
  const { history, favorites, addFavorite, removeFavorite, isFavorite } = useLocation();

  // Trier l'historique par date (plus récent en premier)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime();
  });

  // Villes les plus visitées
  const mostVisited = [...history]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 3);

  // Villes récentes (dernières 5)
  const recentCities = sortedHistory.slice(0, 5);

  // Villes suggérées (combinaison de favoris et récents)
  const suggestedCities = [
    ...favorites,
    ...recentCities.map(h => h.city).filter(city => 
      !favorites.some(f => f.id === city.id)
    )
  ].slice(0, 5);

  const toggleFavorite = (city: City) => {
    if (isFavorite(city.id)) {
      removeFavorite(city.id);
    } else {
      addFavorite(city);
    }
  };

  return {
    // Historique complet
    history: sortedHistory,
    
    // Villes filtrées
    recentCities,
    mostVisited,
    suggestedCities,
    
    // Favoris
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}

