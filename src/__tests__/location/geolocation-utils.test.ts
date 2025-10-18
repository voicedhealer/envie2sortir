/**
 * Tests pour les utilitaires de géolocalisation
 */

import {
  calculateDistance,
  findNearestCity,
  searchCities,
  formatDistance,
  isWithinRadius,
  checkGeolocationPermission,
} from '@/lib/geolocation-utils';
import { MAJOR_FRENCH_CITIES } from '@/types/location';

describe('geolocation-utils', () => {
  
  describe('calculateDistance', () => {
    it('devrait calculer la distance entre Paris et Lyon', () => {
      // Paris: 48.8566, 2.3522
      // Lyon: 45.7640, 4.8357
      const distance = calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);
      
      // Distance réelle ≈ 392 km
      expect(distance).toBeGreaterThan(390);
      expect(distance).toBeLessThan(400);
    });

    it('devrait retourner 0 pour deux points identiques', () => {
      const distance = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
      expect(distance).toBe(0);
    });

    it('devrait calculer des distances précises', () => {
      // Dijon: 47.322, 5.041
      // Paris: 48.8566, 2.3522
      const distance = calculateDistance(47.322, 5.041, 48.8566, 2.3522);
      
      // Distance réelle ≈ 262 km
      expect(distance).toBeGreaterThan(260);
      expect(distance).toBeLessThan(270);
    });
  });

  describe('findNearestCity', () => {
    it('devrait trouver Dijon comme ville la plus proche de ses coordonnées', () => {
      const nearestCity = findNearestCity(47.322, 5.041);
      expect(nearestCity.id).toBe('dijon');
      expect(nearestCity.name).toBe('Dijon');
    });

    it('devrait trouver Paris pour des coordonnées proches de Paris', () => {
      const nearestCity = findNearestCity(48.85, 2.35);
      expect(nearestCity.id).toBe('paris');
      expect(nearestCity.name).toBe('Paris');
    });

    it('devrait trouver Lyon pour des coordonnées proches de Lyon', () => {
      const nearestCity = findNearestCity(45.76, 4.83);
      expect(nearestCity.id).toBe('lyon');
      expect(nearestCity.name).toBe('Lyon');
    });

    it('devrait toujours retourner une ville (fallback sur Dijon)', () => {
      // Coordonnées au milieu de l'océan
      const nearestCity = findNearestCity(0, 0);
      expect(nearestCity).toBeDefined();
      expect(nearestCity.name).toBeTruthy();
    });
  });

  describe('searchCities', () => {
    it('devrait retourner toutes les villes pour une recherche vide', () => {
      const results = searchCities('');
      expect(results.length).toBe(MAJOR_FRENCH_CITIES.length);
    });

    it('devrait trouver Paris par son nom', () => {
      const results = searchCities('Paris');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Paris');
    });

    it('devrait être insensible à la casse', () => {
      const results1 = searchCities('paris');
      const results2 = searchCities('PARIS');
      const results3 = searchCities('Paris');
      
      expect(results1.length).toBe(results2.length);
      expect(results2.length).toBe(results3.length);
    });

    it('devrait chercher dans les noms de villes', () => {
      const results = searchCities('lyon');
      expect(results.some(city => city.name === 'Lyon')).toBe(true);
    });

    it('devrait chercher dans les régions', () => {
      const results = searchCities('Île-de-France');
      expect(results.some(city => city.region === 'Île-de-France')).toBe(true);
    });

    it('devrait retourner un tableau vide pour une recherche sans résultats', () => {
      const results = searchCities('VilleInexistante123');
      expect(results.length).toBe(0);
    });

    it('devrait gérer les recherches partielles', () => {
      const results = searchCities('Mar');
      expect(results.some(city => city.name === 'Marseille')).toBe(true);
    });
  });

  describe('formatDistance', () => {
    it('devrait formater les distances en km', () => {
      expect(formatDistance(5)).toBe('5km');
      expect(formatDistance(10.5)).toBe('10.5km');
      expect(formatDistance(100)).toBe('100km');
    });

    it('devrait formater les distances < 1km en mètres', () => {
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.25)).toBe('250m');
      expect(formatDistance(0.1)).toBe('100m');
    });

    it('devrait arrondir les mètres', () => {
      expect(formatDistance(0.567)).toBe('567m');
    });
  });

  describe('isWithinRadius', () => {
    const paris = MAJOR_FRENCH_CITIES.find(c => c.id === 'paris')!;
    const lyon = MAJOR_FRENCH_CITIES.find(c => c.id === 'lyon')!;

    it('devrait retourner true pour un point dans le rayon', () => {
      // Point proche de Paris (48.86, 2.35)
      const result = isWithinRadius(48.86, 2.35, paris, 10);
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un point hors du rayon', () => {
      // Lyon est à ~400km de Paris
      const result = isWithinRadius(lyon.latitude, lyon.longitude, paris, 100);
      expect(result).toBe(false);
    });

    it('devrait retourner true pour des coordonnées identiques', () => {
      const result = isWithinRadius(
        paris.latitude,
        paris.longitude,
        paris,
        1
      );
      expect(result).toBe(true);
    });

    it('devrait fonctionner avec différents rayons', () => {
      // Point à ~50km de Paris
      const result1 = isWithinRadius(48.5, 2.3, paris, 30);
      const result2 = isWithinRadius(48.5, 2.3, paris, 100);
      
      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });
  });

  describe('checkGeolocationPermission', () => {
    it('devrait retourner "prompt" si l\'API n\'est pas disponible', async () => {
      // Mock navigator.permissions comme undefined
      const originalPermissions = navigator.permissions;
      // @ts-ignore
      delete navigator.permissions;
      
      const result = await checkGeolocationPermission();
      expect(result).toBe('prompt');
      
      // Restaurer
      Object.defineProperty(navigator, 'permissions', {
        value: originalPermissions,
        writable: true,
      });
    });

    it('devrait gérer les erreurs gracieusement', async () => {
      // Mock navigator.permissions.query pour lancer une erreur
      const originalPermissions = navigator.permissions;
      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: jest.fn().mockRejectedValue(new Error('Test error')),
        },
        writable: true,
      });
      
      const result = await checkGeolocationPermission();
      expect(result).toBe('prompt');
      
      // Restaurer
      Object.defineProperty(navigator, 'permissions', {
        value: originalPermissions,
        writable: true,
      });
    });
  });
});

