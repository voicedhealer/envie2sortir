/**
 * Service de recherche de villes avec l'API Adresse du gouvernement français
 * Permet de trouver toutes les communes françaises (35,000+)
 */

export interface CitySearchResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  department: string;
  postalCode: string;
  context: string;
}

/**
 * Recherche des villes via l'API Adresse
 * @param query - Terme de recherche (minimum 2 caractères)
 * @param limit - Nombre maximum de résultats (défaut: 10)
 */
export async function searchCitiesAPI(query: string, limit: number = 10): Promise<CitySearchResult[]> {
  if (query.length < 2) return [];
  
  try {
    // Nettoyer la requête pour éviter les caractères problématiques
    const cleanQuery = query.trim().replace(/[^\w\s\-'àâäéèêëïîôöùûüÿçñ]/gi, '');
    
    if (cleanQuery.length < 2) {
      console.warn('Requête trop courte après nettoyage:', query);
      return [];
    }
    
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(cleanQuery)}&type=municipality&limit=${Math.min(limit, 20)}`;
    
    console.log('Recherche API Adresse:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Envie2Sortir/1.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Adresse:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || !Array.isArray(data.features)) {
      console.warn('Format de réponse API invalide:', data);
      return [];
    }
    
    const results = data.features
      .filter((feature: any) => 
        feature.properties && 
        feature.properties.city && 
        feature.geometry && 
        feature.geometry.coordinates
      )
      .map((feature: any) => ({
        id: feature.properties.id || `${feature.properties.city}-${feature.properties.postcode || 'unknown'}`,
        name: feature.properties.city,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        region: extractRegion(feature.properties.context),
        department: extractDepartment(feature.properties.context),
        postalCode: feature.properties.postcode || '',
        context: feature.properties.context || ''
      }));
    
    console.log(`Trouvé ${results.length} villes pour "${query}"`);
    return results;
    
  } catch (error) {
    console.error('Erreur lors de la recherche de villes:', error);
    // Retourner un résultat vide au lieu de propager l'erreur
    return [];
  }
}

/**
 * Recherche de villes avec cache local pour améliorer les performances
 */
class CitySearchCache {
  private cache = new Map<string, { results: CitySearchResult[], timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async search(query: string, limit: number = 10): Promise<CitySearchResult[]> {
    const cacheKey = `${query}-${limit}`;
    const cached = this.cache.get(cacheKey);
    
    // Vérifier si le cache est encore valide
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.results;
    }
    
    // Faire la recherche
    const results = await searchCitiesAPI(query, limit);
    
    // Mettre en cache
    this.cache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Instance globale du cache
const citySearchCache = new CitySearchCache();

/**
 * Fonction principale de recherche de villes avec cache
 */
export async function searchCities(query: string, limit: number = 10): Promise<CitySearchResult[]> {
  return citySearchCache.search(query, limit);
}

/**
 * Recherche une ville spécifique par nom exact
 */
export async function findCityByName(cityName: string): Promise<CitySearchResult | null> {
  const results = await searchCities(cityName, 1);
  return results.find(city => 
    city.name.toLowerCase() === cityName.toLowerCase()
  ) || null;
}

/**
 * Recherche les villes d'un département
 */
export async function searchCitiesByDepartment(department: string, limit: number = 20): Promise<CitySearchResult[]> {
  const results = await searchCities(department, limit);
  return results.filter(city => 
    city.department.toLowerCase().includes(department.toLowerCase())
  );
}

/**
 * Recherche les villes d'une région
 */
export async function searchCitiesByRegion(region: string, limit: number = 20): Promise<CitySearchResult[]> {
  const results = await searchCities(region, limit);
  return results.filter(city => 
    city.region.toLowerCase().includes(region.toLowerCase())
  );
}

/**
 * Extrait la région du contexte de l'API
 */
function extractRegion(context: string): string {
  if (!context) return '';
  
  const parts = context.split(',');
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return '';
}

/**
 * Extrait le département du contexte de l'API
 */
function extractDepartment(context: string): string {
  if (!context) return '';
  
  const parts = context.split(',');
  if (parts.length >= 1) {
    return parts[0].trim();
  }
  return '';
}

/**
 * Vérifie si une ville existe dans la base de données française
 */
export async function cityExists(cityName: string): Promise<boolean> {
  const city = await findCityByName(cityName);
  return city !== null;
}

/**
 * Obtient les informations complètes d'une ville
 */
export async function getCityInfo(cityName: string): Promise<CitySearchResult | null> {
  return findCityByName(cityName);
}

/**
 * Fonction de debounce pour optimiser les recherches
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Nettoyer le cache (utile pour les tests ou en cas de problème)
 */
export function clearCitySearchCache(): void {
  citySearchCache.clear();
}
