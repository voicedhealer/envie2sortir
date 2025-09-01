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
    
    // Construction de l'URL Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=${limit}&addressdetails=1&countrycodes=fr,be,ch,ca&accept-language=fr`;
    
    console.log(`🔍 Géocodage de l'adresse: ${address}`);
    console.log(`🌐 URL Nominatim: ${nominatimUrl}`);

    // Appel à l'API Nominatim
    const response = await fetch(nominatimUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Envie2Sortir/1.0 (https://envie2sortir.fr)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`📡 Réponse Nominatim:`, data);

    // Vérification des résultats
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

    // Si limit > 1, c'est pour l'autocomplete - retourner tous les résultats
    if (limit !== '1') {
      return NextResponse.json({
        success: true,
        data: data.map(result => ({
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
          address: result.address || {}
        }))
      });
    }

    // Récupération du premier résultat pour le géocodage simple
    const firstResult = data[0];
    
    if (!firstResult.lat || !firstResult.lon) {
      return NextResponse.json(
        { 
          success: false,
          error: "Données de géocodage invalides",
          details: "Les coordonnées retournées sont invalides",
          nominatimData: firstResult
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
      type: firstResult.type,
      importance: firstResult.importance,
      country: firstResult.address?.country,
      city: firstResult.address?.city || firstResult.address?.town || firstResult.address?.village,
      postcode: firstResult.address?.postcode
    };

    console.log(`✅ Géocodage réussi: ${latitude}, ${longitude}`);
    console.log(`📍 Informations:`, additionalInfo);

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
