/**
 * Tests pour le hook useLocation
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { LocationProvider } from '@/contexts/LocationContext';
import { useLocation } from '@/hooks/useLocation';
import { City, DEFAULT_CITY } from '@/types/location';
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

// Ville de test
const testCity: City = {
  id: 'paris',
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  region: 'Île-de-France',
};

// Wrapper avec LocationProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider isAuthenticated={false}>
    {children}
  </LocationProvider>
);

describe('useLocation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('devrait initialiser avec la ville par défaut', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentCity).toBeDefined();
    expect(result.current.currentCity?.id).toBe(DEFAULT_CITY.id);
    expect(result.current.searchRadius).toBe(20);
  });

  it('devrait changer de ville', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.changeCity(testCity);
    });

    expect(result.current.currentCity?.id).toBe('paris');
    expect(result.current.currentCity?.name).toBe('Paris');
  });

  it('devrait changer le rayon de recherche', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.changeRadius(50);
    });

    expect(result.current.searchRadius).toBe(50);
  });

  it('devrait mettre à jour les préférences', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.updatePreferences({
        mode: 'auto',
        useCurrentLocation: true,
      });
    });

    expect(result.current.preferences.mode).toBe('auto');
    expect(result.current.preferences.useCurrentLocation).toBe(true);
  });

  it('devrait gérer les favoris', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Ajouter aux favoris
    act(() => {
      result.current.addFavorite(testCity);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(1);
      expect(result.current.isFavorite('paris')).toBe(true);
    });

    // Retirer des favoris
    act(() => {
      result.current.removeFavorite('paris');
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(0);
      expect(result.current.isFavorite('paris')).toBe(false);
    });
  });

  it('devrait réinitialiser à la ville par défaut', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Changer de ville
    act(() => {
      result.current.changeCity(testCity);
    });

    expect(result.current.currentCity?.id).toBe('paris');

    // Réinitialiser
    act(() => {
      result.current.reset();
    });

    expect(result.current.currentCity?.id).toBe(DEFAULT_CITY.id);
    expect(result.current.searchRadius).toBe(20);
  });

  it('devrait exposer toutes les propriétés nécessaires', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Vérifier que toutes les propriétés sont présentes
    expect(result.current).toHaveProperty('currentCity');
    expect(result.current).toHaveProperty('searchRadius');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isDetected');
    expect(result.current).toHaveProperty('preferences');
    expect(result.current).toHaveProperty('history');
    expect(result.current).toHaveProperty('favorites');
    
    // Vérifier que toutes les fonctions sont présentes
    expect(typeof result.current.changeCity).toBe('function');
    expect(typeof result.current.changeRadius).toBe('function');
    expect(typeof result.current.updatePreferences).toBe('function');
    expect(typeof result.current.addFavorite).toBe('function');
    expect(typeof result.current.removeFavorite).toBe('function');
    expect(typeof result.current.isFavorite).toBe('function');
    expect(typeof result.current.detectMyLocation).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.sync).toBe('function');
  });

  it('devrait persister le changement de ville dans localStorage', async () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.changeCity(testCity);
    });

    // Vérifier que localStorage a été mis à jour
    const lastCity = localStorageMock.getItem('envie2sortir_last_city');
    expect(lastCity).toBeTruthy();
    
    const parsed = JSON.parse(lastCity!);
    expect(parsed.city.id).toBe('paris');
  });

  it('ne devrait pas planter si utilisé hors du Provider', () => {
    // Ce test vérifie que le hook lance une erreur explicite
    const { result } = renderHook(() => {
      try {
        return useLocation();
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    expect(result.current).toHaveProperty('error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.current as any).error).toContain('LocationProvider');
  });
});

