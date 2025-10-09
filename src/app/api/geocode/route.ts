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

    // Encodage de l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address.trim());
    
    // Récupération du paramètre limit (pour l'autocomplete)
    const limit = searchParams.get('limit') || '1';
    
    console.log(`🔍 Géocodage de l'adresse: ${address}`);
    
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      console.error(`❌ Erreur Nominatim: ${errorText}`);
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

    // Réponse de succès
    return NextResponse.json({
      success: true,
      data: {
        latitude,
        longitude
      },
      additionalInfo
    });

  } catch (error) {
    console.error("❌ Erreur géocodage:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur interne du serveur",
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Erreur inconnue' 
          : "Erreur lors du géocodage de l'adresse"
      },
      { status: 500 }
    );
  }
}
