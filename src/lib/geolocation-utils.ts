// Utilitaires pour la géolocalisation et détection de position

import { City, GeolocationResult, MAJOR_FRENCH_CITIES } from '@/types/location';

/**
 * Demande la permission de géolocalisation et récupère les coordonnées
 */
export async function getCurrentPosition(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Économise la batterie
        timeout: 10000, // 10 secondes max
        maximumAge: 300000, // Cache de 5 minutes
      }
    );
  });
}

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * @returns Distance en kilomètres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Trouve la ville la plus proche des coordonnées données
 */
export function findNearestCity(latitude: number, longitude: number): City {
  let nearestCity = MAJOR_FRENCH_CITIES[0]; // Dijon par défaut
  let minDistance = Infinity;

  for (const city of MAJOR_FRENCH_CITIES) {
    const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
}

/**
 * Détecte la ville de l'utilisateur via géolocalisation
 */
export async function detectUserCity(): Promise<City> {
  try {
    const position = await getCurrentPosition();
    const nearestCity = findNearestCity(position.latitude, position.longitude);
    return nearestCity;
  } catch (error) {
    console.error('Erreur lors de la détection de la ville:', error);
    throw error;
  }
}

/**
 * Détecte la ville via l'adresse IP (fallback si géolocalisation refusée)
 * Utilise l'API ipapi.co (gratuite, 1000 requêtes/jour)
 */
export async function detectCityByIP(): Promise<City | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Erreur lors de la détection par IP');
    }
    
    const data = await response.json();
    const { latitude, longitude, city: cityName } = data;
    
    if (latitude && longitude) {
      const nearestCity = findNearestCity(latitude, longitude);
      return nearestCity;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la détection par IP:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a déjà donné/refusé la permission de géolocalisation
 */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt'; // Permissions API non supportée, on demande
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    return 'prompt';
  }
}

/**
 * Recherche une ville par son nom (autocomplétion)
 */
export function searchCities(query: string): City[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return MAJOR_FRENCH_CITIES;
  }
  
  return MAJOR_FRENCH_CITIES.filter(city =>
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.region?.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Formatte une distance pour l'affichage
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km}km`;
}

/**
 * Vérifie si un point est dans un rayon donné d'une ville
 */
export function isWithinRadius(
  pointLat: number,
  pointLng: number,
  city: City,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLng, city.latitude, city.longitude);
  return distance <= radiusKm;
}

