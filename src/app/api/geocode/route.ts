import { NextRequest, NextResponse } from "next/server";

/**
 * API ROUTE POUR LE GÉOCODAGE AUTOMATIQUE
 * 
 * Fichier : src/app/api/geocode/route.ts
 * 
 * Description :
 * - Géocode automatiquement une adresse en utilisant Nominatim (OpenStreetMap)
 * - Retourne les coordonnées latitude/longitude
 * - Pas de clé API requise (service gratuit)
 * 
 * Endpoint :
 * - GET /api/geocode?address=<adresse encodée>
 * 
 * Exemple d'utilisation :
 * GET /api/geocode?address=123%20Rue%20de%20la%20Paix%2C%20Paris
 * 
 * Réponse :
 * {
 *   "success": true,
 *   "data": {
 *     "latitude": 48.8566,
 *     "longitude": 2.3522
 *   }
 * }
 */

// Cache simple en mémoire pour éviter les requêtes répétées
const geocodeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Validation du paramètre address
    if (!address || address.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: "Paramètre 'address' manquant ou vide",
          details: "L'adresse à géocoder doit être fournie"
        },
        { status: 400 }
      );
    }

    const cleanAddress = address.trim();
    
    // Vérifier le cache d'abord
    const cacheKey = cleanAddress.toLowerCase();
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`💾 Utilisation du cache pour: ${cleanAddress}`);
      return NextResponse.json({
        success: true,
        data: cached.data,
        fromCache: true
      });
    }

    // Encodage de l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(cleanAddress);
    
    // Récupération du paramètre limit (pour l'autocomplete)
    const limit = searchParams.get('limit') || '1';
    
    console.log(`🔍 Géocodage de l'adresse: ${cleanAddress}`);
    
    // Pour activer le mode simulé en développement, définir USE_MOCK_GEOCODING=true dans .env
    // Sinon, le système utilisera le vrai service Nominatim (OpenStreetMap)
    
    // MODE DÉVELOPPEMENT : Géocodage simulé (seulement si NODE_ENV=development)
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_GEOCODING === 'true') { // Mode simulé optionnel
      console.log(`🚀 Mode développement : géocodage simulé`);
      
      // Coordonnées simulées pour Lyon
      const mockCoordinates = {
        latitude: 45.7640,
        longitude: 4.8357
      };
      
      // Pour l'autocomplete, retourner des suggestions simulées
      if (limit !== '1') {
        const mockSuggestions = [
          {
            display_name: `${address}, Lyon, France`,
            lat: mockCoordinates.latitude.toString(),
            lon: mockCoordinates.longitude.toString(),
            address: {
              house_number: address.match(/\d+/)?.[0] || '',
              road: address.replace(/\d+\s*/, ''),
              postcode: '69007',
              city: 'Lyon'
            }
          }
        ];
        
        return NextResponse.json({
          success: true,
          data: mockSuggestions
        });
      }
      
      // Pour le géocodage simple, retourner les coordonnées
      return NextResponse.json({
        success: true,
        data: mockCoordinates,
        additionalInfo: {
          displayName: `${address}, Lyon, France`,
          type: 'simulated',
          importance: 0.9,
          country: 'France',
          city: 'Lyon',
          postcode: '69007'
        }
      });
    }
    
    // MODE PRODUCTION : Utiliser l'API Adresse du gouvernement français (très précise !)
    
    // Pour les adresses françaises, utiliser api-adresse.data.gouv.fr
    // C'est GRATUIT, SANS CLÉ API, et TRÈS PRÉCIS (base officielle La Poste + IGN)
    
    let apiUrl;
    let isGouvernementAPI = false;
    
    // Détecter si c'est une adresse française (code postal 5 chiffres)
    const isFrenchAddress = /\d{5}/.test(address);
    
    if (isFrenchAddress && limit === '1') {
      // Utiliser l'API du gouvernement français pour les adresses françaises
      console.log('🇫🇷 Utilisation de l\'API Adresse du gouvernement français');
      apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodedAddress}&limit=1`;
      isGouvernementAPI = true;
    } else if (limit !== '1') {
      // Pour l'autocomplete, utiliser l'API française aussi
      console.log('🔍 Autocomplete avec l\'API française');
      apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodedAddress}&limit=${limit}`;
      isGouvernementAPI = true;
    } else {
      // Fallback sur Nominatim pour les adresses non françaises
      console.log('🌍 Fallback Nominatim pour adresse non française');
      apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=${limit}&addressdetails=1&countrycodes=be,ch,ca&accept-language=fr`;
      isGouvernementAPI = false;
    }
    
    console.log(`🌐 URL API: ${apiUrl}`);

    // Délai uniquement pour Nominatim (rate limiting)
    if (!isGouvernementAPI) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Réduit de 1000ms à 500ms
    }

    // Appel à l'API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Envie2Sortir/1.0 (https://envie2sortir.fr)',
        'Accept': 'application/json'
      }
    });

    console.log(`📡 Réponse API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur API: ${errorText}`);
      
      // Si c'est une erreur 429 (rate limiting), essayer un fallback
      if (response.status === 429) {
        console.log('⚠️ Rate limiting détecté, tentative de fallback...');
        
        // Fallback vers Nominatim avec délai
        if (isGouvernementAPI) {
          console.log('🔄 Fallback vers Nominatim...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Réduit de 2000ms à 1000ms
          
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=${limit}&addressdetails=1&countrycodes=fr&accept-language=fr`;
          
          try {
            const fallbackResponse = await fetch(fallbackUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'Envie2Sortir/1.0 (https://envie2sortir.fr)',
                'Accept': 'application/json'
              }
            });
            
            if (fallbackResponse.ok) {
              console.log('✅ Fallback Nominatim réussi');
              const fallbackData = await fallbackResponse.json();
              
              if (Array.isArray(fallbackData) && fallbackData.length > 0) {
                const firstResult = fallbackData[0];
                const result = {
                  latitude: parseFloat(firstResult.lat),
                  longitude: parseFloat(firstResult.lon),
                  additionalInfo: {
                    displayName: firstResult.display_name,
                    type: 'fallback',
                    source: 'nominatim'
                  }
                };
                
                // Mettre en cache le résultat du fallback
                geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
                
                return NextResponse.json({
                  success: true,
                  data: result,
                  fallback: true
                });
              }
            }
          } catch (fallbackError) {
            console.error('❌ Erreur fallback:', fallbackError);
          }
        }
      }
      
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log(`📡 Réponse API:`, JSON.stringify(data).substring(0, 500));

    // Adapter le format selon l'API utilisée
    let results = [];
    
    if (isGouvernementAPI) {
      // Format API française : { features: [...] }
      if (!data.features || data.features.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: "Adresse non trouvée",
            details: "Aucune correspondance trouvée pour cette adresse",
            searchedAddress: address
          },
          { status: 404 }
        );
      }
      
      // Convertir au format unifié
      results = data.features.map((feature: any) => ({
        lat: feature.geometry.coordinates[1].toString(), // latitude
        lon: feature.geometry.coordinates[0].toString(), // longitude
        display_name: feature.properties.label || feature.properties.name,
        address: {
          house_number: feature.properties.housenumber,
          road: feature.properties.street,
          postcode: feature.properties.postcode,
          city: feature.properties.city || feature.properties.municipality
        }
      }));
    } else {
      // Format Nominatim : [ { lat, lon, ... } ]
      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: "Adresse non trouvée",
            details: "Aucune correspondance trouvée pour cette adresse",
            searchedAddress: address
          },
          { status: 404 }
        );
      }
      results = data;
    }

    // Si limit > 1, c'est pour l'autocomplete - retourner tous les résultats
    if (limit !== '1') {
      return NextResponse.json({
        success: true,
        data: results.map(result => ({
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
          address: result.address || {}
        }))
      });
    }

    // Récupération du premier résultat pour le géocodage simple
    const firstResult = results[0];
    
    if (!firstResult.lat || !firstResult.lon) {
      return NextResponse.json(
        { 
          success: false,
          error: "Données de géocodage invalides",
          details: "Les coordonnées retournées sont invalides",
          apiData: firstResult
        },
        { status: 500 }
      );
    }

    // Conversion et validation des coordonnées
    const latitude = parseFloat(firstResult.lat);
    const longitude = parseFloat(firstResult.lon);

    // Validation des plages de coordonnées
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Coordonnées invalides",
          details: "Impossible de parser les coordonnées latitude/longitude"
        },
        { status: 500 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { 
          success: false,
          error: "Latitude invalide",
          details: "La latitude doit être comprise entre -90 et 90"
        },
        { status: 500 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { 
          success: false,
          error: "Longitude invalide",
          details: "La longitude doit être comprise entre -180 et 180"
        },
        { status: 500 }
      );
    }

    // Informations supplémentaires utiles
    const additionalInfo = {
      displayName: firstResult.display_name,
      type: firstResult.type || 'address',
      importance: firstResult.importance || 1,
      country: firstResult.address?.country || 'France',
      city: firstResult.address?.city || firstResult.address?.town || firstResult.address?.village,
      postcode: firstResult.address?.postcode,
      housenumber: firstResult.address?.house_number,
      street: firstResult.address?.road
    };

    console.log(`✅ Géocodage réussi: ${latitude}, ${longitude}`);
    console.log(`📍 Informations:`, additionalInfo);
    console.log(`🏠 Numéro trouvé:`, firstResult.address?.house_number || 'NON');

    const result = {
      latitude,
      longitude
    };

    // Mettre en cache le résultat
    geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Réponse de succès
    return NextResponse.json({
      success: true,
      data: result,
      additionalInfo
    });

  } catch (error) {
    console.error("❌ Erreur géocodage:", error);
    
    // En cas d'erreur, proposer des coordonnées par défaut pour continuer
    console.log("🆘 Mode de secours : coordonnées par défaut");
    
    // Coordonnées par défaut (centre de la France)
    const fallbackCoordinates = {
      latitude: 46.603354,
      longitude: 1.888334
    };
    
    // Réponse avec coordonnées par défaut
    return NextResponse.json({
      success: true,
      data: fallbackCoordinates,
      additionalInfo: {
        displayName: `${cleanAddress} (géocodage approximatif)`,
        type: 'fallback_default',
        source: 'emergency_fallback',
        warning: 'Géocodage approximatif utilisé'
      },
      warning: "Géocodage approximatif - les coordonnées exactes n'ont pas pu être récupérées"
    });
  }
}
