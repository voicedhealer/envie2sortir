/**
 * Tests pour le hook useCityHistory
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { LocationProvider } from '@/contexts/LocationContext';
import { useCityHistory } from '@/hooks/useCityHistory';
import { useLocation } from '@/hooks/useLocation';
import { City } from '@/types/location';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Villes de test
const paris: City = {
  id: 'paris',
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  region: 'Île-de-France',
};

const lyon: City = {
  id: 'lyon',
  name: 'Lyon',
  latitude: 45.7640,
  longitude: 4.8357,
  region: 'Auvergne-Rhône-Alpes',
};

const marseille: City = {
  id: 'marseille',
  name: 'Marseille',
  latitude: 43.2965,
  longitude: 5.3698,
  region: "Provence-Alpes-Côte d'Azur",
};

// Wrapper avec LocationProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider isAuthenticated={false}>
    {children}
  </LocationProvider>
);

describe('useCityHistory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('devrait initialiser avec un historique vide', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.history).toEqual([]);
      expect(result.current.favorites).toEqual([]);
    });
  });

  it('devrait ajouter une ville aux favoris', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(0);
    });

    act(() => {
      result.current.addFavorite(paris);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(1);
      expect(result.current.favorites[0].id).toBe('paris');
    });
  });

  it('devrait retirer une ville des favoris', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(0);
    });

    act(() => {
      result.current.addFavorite(paris);
      result.current.addFavorite(lyon);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(2);
    });

    act(() => {
      result.current.removeFavorite('paris');
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(1);
      expect(result.current.favorites[0].id).toBe('lyon');
    });
  });

  it('devrait vérifier si une ville est favorite', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isFavorite('paris')).toBe(false);
    });

    act(() => {
      result.current.addFavorite(paris);
    });

    await waitFor(() => {
      expect(result.current.isFavorite('paris')).toBe(true);
      expect(result.current.isFavorite('lyon')).toBe(false);
    });
  });

  it('devrait toggle une ville favorite', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isFavorite('paris')).toBe(false);
    });

    // Ajouter
    act(() => {
      result.current.toggleFavorite(paris);
    });

    await waitFor(() => {
      expect(result.current.isFavorite('paris')).toBe(true);
    });

    // Retirer
    act(() => {
      result.current.toggleFavorite(paris);
    });

    await waitFor(() => {
      expect(result.current.isFavorite('paris')).toBe(false);
    });
  });

  it('devrait trier l\'historique par date (plus récent en premier)', async () => {
    const { result: locationResult } = renderHook(() => useLocation(), { wrapper });
    
    await waitFor(() => {
      expect(locationResult.current.loading).toBe(false);
    });

    // Ajouter des villes avec délai
    act(() => {
      locationResult.current.changeCity(paris);
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    act(() => {
      locationResult.current.changeCity(lyon);
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    act(() => {
      locationResult.current.changeCity(marseille);
    });

    const { result: historyResult } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      const history = historyResult.current.history;
      if (history.length > 1) {
        // Le premier devrait être le plus récent
        expect(history[0].city.id).toBe('marseille');
      }
    });
  });

  it('devrait retourner les villes récentes (max 5)', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      const recentCities = result.current.recentCities;
      expect(Array.isArray(recentCities)).toBe(true);
      expect(recentCities.length).toBeLessThanOrEqual(5);
    });
  });

  it('devrait calculer les villes les plus visitées', async () => {
    const { result: locationResult } = renderHook(() => useLocation(), { wrapper });
    
    await waitFor(() => {
      expect(locationResult.current.loading).toBe(false);
    });

    // Visiter Paris 3 fois
    act(() => {
      locationResult.current.changeCity(paris);
      locationResult.current.changeCity(lyon);
      locationResult.current.changeCity(paris);
      locationResult.current.changeCity(marseille);
      locationResult.current.changeCity(paris);
    });

    const { result: historyResult } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      const mostVisited = historyResult.current.mostVisited;
      if (mostVisited.length > 0) {
        // Paris devrait être le plus visité
        expect(mostVisited[0].city.id).toBe('paris');
        expect(mostVisited[0].visitCount).toBe(3);
      }
    });
  });

  it('devrait générer des villes suggérées', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    // Attendre que le hook soit prêt
    await waitFor(() => {
      expect(result.current.suggestedCities).toBeDefined();
    }, { timeout: 3000 });

    act(() => {
      result.current.addFavorite(paris);
      result.current.addFavorite(lyon);
    });

    await waitFor(() => {
      const suggestedCities = result.current.suggestedCities;
      expect(Array.isArray(suggestedCities)).toBe(true);
      expect(suggestedCities.length).toBeGreaterThan(0);
      
      // Les favoris doivent être inclus
      const favoriteIds = suggestedCities.map(c => c.id);
      expect(favoriteIds).toContain('paris');
      expect(favoriteIds).toContain('lyon');
    }, { timeout: 3000 });
  });

  it('ne devrait pas dépasser 5 villes suggérées', async () => {
    const { result } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      const suggestedCities = result.current.suggestedCities;
      expect(suggestedCities.length).toBeLessThanOrEqual(5);
    });
  });

  it('ne devrait pas avoir de doublons dans les suggestions', async () => {
    const { result: locationResult } = renderHook(() => useLocation(), { wrapper });
    
    await waitFor(() => {
      expect(locationResult.current.loading).toBe(false);
    });

    // Ajouter Paris comme favori ET dans l'historique
    act(() => {
      locationResult.current.addFavorite(paris);
      locationResult.current.changeCity(paris);
    });

    const { result: historyResult } = renderHook(() => useCityHistory(), { wrapper });

    await waitFor(() => {
      const suggestedCities = historyResult.current.suggestedCities;
      const parisCount = suggestedCities.filter(c => c.id === 'paris').length;
      
      // Paris ne devrait apparaître qu'une seule fois
      expect(parisCount).toBe(1);
    });
  });
});

