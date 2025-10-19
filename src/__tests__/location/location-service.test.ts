/**
 * Tests pour le service de localisation (localStorage)
 * @jest-environment jsdom
 */

import {
  saveLocationPreferences,
  getLocationPreferences,
  saveLastCity,
  getLastCity,
  addToHistory,
  getHistory,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  hasShownLocationPopup,
  markPopupAsShown,
  clearLocationData,
  determineCurrentCity,
} from '@/lib/location-service';
import { City, DEFAULT_CITY } from '@/types/location';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Ville de test
const testCity: City = {
  id: 'paris',
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  region: 'Île-de-France',
};

const testCity2: City = {
  id: 'lyon',
  name: 'Lyon',
  latitude: 45.7640,
  longitude: 4.8357,
  region: 'Auvergne-Rhône-Alpes',
};

describe('location-service', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorageMock.clear();
  });

  describe('saveLocationPreferences & getLocationPreferences', () => {
    it('devrait sauvegarder et récupérer les préférences', () => {
      const preferences = {
        defaultCity: testCity,
        searchRadius: 20,
        mode: 'manual' as const,
        useCurrentLocation: false,
      };

      saveLocationPreferences(preferences);
      const retrieved = getLocationPreferences();

      expect(retrieved).toBeDefined();
      expect(retrieved?.defaultCity?.id).toBe('paris');
      expect(retrieved?.searchRadius).toBe(20);
      expect(retrieved?.mode).toBe('manual');
    });

    it('devrait retourner null si aucune préférence enregistrée', () => {
      const preferences = getLocationPreferences();
      expect(preferences).toBeNull();
    });

    it('devrait retourner null si le cache est expiré', () => {
      // Sauvegarder avec un timestamp ancien
      const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 jours
      localStorageMock.setItem(
        'envie2sortir_location_preferences',
        JSON.stringify({
          defaultCity: testCity,
          searchRadius: 20,
          mode: 'manual',
          useCurrentLocation: false,
          timestamp: oldTimestamp,
        })
      );

      const preferences = getLocationPreferences();
      expect(preferences).toBeNull();
    });

    it('devrait gérer les erreurs de parsing gracieusement', () => {
      localStorageMock.setItem('envie2sortir_location_preferences', 'invalid json');
      const preferences = getLocationPreferences();
      expect(preferences).toBeNull();
    });
  });

  describe('saveLastCity & getLastCity', () => {
    it('devrait sauvegarder et récupérer la dernière ville', () => {
      saveLastCity(testCity);
      const lastCity = getLastCity();

      expect(lastCity).toBeDefined();
      expect(lastCity?.id).toBe('paris');
      expect(lastCity?.name).toBe('Paris');
    });

    it('devrait retourner null si aucune ville enregistrée', () => {
      const lastCity = getLastCity();
      expect(lastCity).toBeNull();
    });

    it('devrait retourner null si le cache est expiré', () => {
      const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000;
      localStorageMock.setItem(
        'envie2sortir_last_city',
        JSON.stringify({
          city: testCity,
          timestamp: oldTimestamp,
        })
      );

      const lastCity = getLastCity();
      expect(lastCity).toBeNull();
    });
  });

  describe('History management', () => {
    it('devrait ajouter une ville à l\'historique', () => {
      addToHistory(testCity);
      const history = getHistory();

      expect(history.length).toBe(1);
      expect(history[0].city.id).toBe('paris');
      expect(history[0].visitCount).toBe(1);
    });

    it('devrait incrémenter le compteur de visites', () => {
      addToHistory(testCity);
      addToHistory(testCity);
      addToHistory(testCity);

      const history = getHistory();
      expect(history.length).toBe(1);
      expect(history[0].visitCount).toBe(3);
    });

    it('devrait limiter l\'historique à 5 villes', () => {
      const cities: City[] = [
        { id: '1', name: 'Ville 1', latitude: 0, longitude: 0 },
        { id: '2', name: 'Ville 2', latitude: 0, longitude: 0 },
        { id: '3', name: 'Ville 3', latitude: 0, longitude: 0 },
        { id: '4', name: 'Ville 4', latitude: 0, longitude: 0 },
        { id: '5', name: 'Ville 5', latitude: 0, longitude: 0 },
        { id: '6', name: 'Ville 6', latitude: 0, longitude: 0 },
      ];

      cities.forEach(city => addToHistory(city));
      const history = getHistory();

      expect(history.length).toBe(5);
    });

    it('devrait mettre à jour lastVisited lors des visites', () => {
      addToHistory(testCity);
      const firstVisit = getHistory()[0].lastVisited;

      // Attendre un peu
      setTimeout(() => {
        addToHistory(testCity);
        const secondVisit = getHistory()[0].lastVisited;

        expect(secondVisit.getTime()).toBeGreaterThan(firstVisit.getTime());
      }, 10);
    });

    it('devrait retourner un tableau vide si pas d\'historique', () => {
      const history = getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('Favorites management', () => {
    it('devrait ajouter une ville aux favoris', () => {
      addToFavorites(testCity);
      const favorites = getFavorites();

      expect(favorites.length).toBe(1);
      expect(favorites[0].id).toBe('paris');
    });

    it('ne devrait pas ajouter une ville déjà favorite', () => {
      addToFavorites(testCity);
      addToFavorites(testCity);

      const favorites = getFavorites();
      expect(favorites.length).toBe(1);
    });

    it('devrait retirer une ville des favoris', () => {
      addToFavorites(testCity);
      addToFavorites(testCity2);

      let favorites = getFavorites();
      expect(favorites.length).toBe(2);

      removeFromFavorites('paris');
      favorites = getFavorites();

      expect(favorites.length).toBe(1);
      expect(favorites[0].id).toBe('lyon');
    });

    it('devrait retourner un tableau vide si pas de favoris', () => {
      const favorites = getFavorites();
      expect(favorites).toEqual([]);
    });

    it('devrait gérer plusieurs favoris', () => {
      const cities: City[] = [
        testCity,
        testCity2,
        { id: 'marseille', name: 'Marseille', latitude: 0, longitude: 0 },
      ];

      cities.forEach(city => addToFavorites(city));
      const favorites = getFavorites();

      expect(favorites.length).toBe(3);
    });
  });

  describe('Popup management', () => {
    it('devrait indiquer que le popup n\'a pas été affiché par défaut', () => {
      const shown = hasShownLocationPopup();
      expect(shown).toBe(false);
    });

    it('devrait marquer le popup comme affiché', () => {
      markPopupAsShown();
      const shown = hasShownLocationPopup();
      expect(shown).toBe(true);
    });
  });

  describe('clearLocationData', () => {
    it('devrait nettoyer toutes les données de localisation', () => {
      // Ajouter des données
      saveLocationPreferences({
        defaultCity: testCity,
        searchRadius: 20,
        mode: 'manual',
        useCurrentLocation: false,
      });
      saveLastCity(testCity);
      addToFavorites(testCity);
      addToHistory(testCity);
      markPopupAsShown();

      // Vérifier qu'elles existent
      expect(getLocationPreferences()).toBeDefined();
      expect(getLastCity()).toBeDefined();
      expect(getFavorites().length).toBeGreaterThan(0);
      expect(getHistory().length).toBeGreaterThan(0);
      expect(hasShownLocationPopup()).toBe(true);

      // Nettoyer
      clearLocationData();

      // Vérifier que tout est supprimé
      expect(getLocationPreferences()).toBeNull();
      expect(getLastCity()).toBeNull();
      expect(getFavorites().length).toBe(0);
      expect(getHistory().length).toBe(0);
      expect(hasShownLocationPopup()).toBe(false);
    });
  });

  describe('determineCurrentCity', () => {
    it('devrait retourner la ville par défaut des préférences', async () => {
      saveLocationPreferences({
        defaultCity: testCity,
        searchRadius: 20,
        mode: 'manual',
        useCurrentLocation: false,
      });

      const city = await determineCurrentCity();
      expect(city.id).toBe('paris');
    });

    it('devrait retourner la dernière ville si pas de préférences', async () => {
      saveLastCity(testCity2);

      const city = await determineCurrentCity();
      expect(city.id).toBe('lyon');
    });

    it('devrait retourner la ville par défaut (Dijon) en dernier recours', async () => {
      const city = await determineCurrentCity();
      expect(city.id).toBe(DEFAULT_CITY.id);
    });

    it('devrait prioriser les préférences sur la dernière ville', async () => {
      saveLastCity(testCity2);
      saveLocationPreferences({
        defaultCity: testCity,
        searchRadius: 20,
        mode: 'manual',
        useCurrentLocation: false,
      });

      const city = await determineCurrentCity();
      expect(city.id).toBe('paris'); // Préférences prioritaires
    });
  });
});

