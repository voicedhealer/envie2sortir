import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeId, fields, apiKey, placeName } = await request.json();

    if (!placeId || !apiKey) {
      return NextResponse.json(
        { error: 'Paramètres manquants: placeId, apiKey requis' },
        { status: 400 }
      );
    }
    
    // Si placeId contient des coordonnées, fields est optionnel
    if (!fields && !placeId.includes(',')) {
      return NextResponse.json(
        { error: 'Paramètre fields requis pour les Place IDs' },
        { status: 400 }
      );
    }

    // Construire l'URL de l'API Google Places
    let googleApiUrl;
    
    // Vérifier si c'est un Place ID ou des coordonnées
    if (placeId.includes(',')) {
      // C'est des coordonnées
      const [lat, lng] = placeId.split(',');
      
      if (placeName) {
        // Si on a un nom, utiliser l'API Text Search
        // Note: Text Search ne supporte pas le paramètre fields, on récupère tout
        const query = encodeURIComponent(placeName);
        googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${lat},${lng}&radius=100&key=${apiKey}`;
      } else {
        // Sinon utiliser l'API Nearby Search
        // Note: Nearby Search ne supporte pas le paramètre fields, on récupère tout
        googleApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${apiKey}`;
      }
    } else {
      // C'est un Place ID, utiliser l'API Details
      googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    }

    // Appel à l'API Google Places
    const response = await fetch(googleApiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur API Google Places: ${response.status}`);
    }

    const data = await response.json();

    // Vérifier si l'API Google a retourné une erreur
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: `Erreur Google Places: ${data.status}`, details: data.error_message },
        { status: 400 }
      );
    }

    // Si c'est une recherche par coordonnées et qu'on a des résultats, faire un appel Details
    if (placeId.includes(',') && data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      
      if (firstResult.place_id) {
        console.log('🔍 Place ID trouvé, appel API Details pour plus d\'infos:', firstResult.place_id);
        
        // Faire un appel Place Details pour obtenir toutes les informations
        // Utiliser des fields par défaut si non fournis (notamment pour les horaires)
        const fieldsToUse = fields || 'place_id,name,rating,user_ratings_total,types,price_level,vicinity,formatted_address,geometry,photos,opening_hours,website,formatted_phone_number';
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${firstResult.place_id}&fields=${fieldsToUse}&key=${apiKey}`;
        
        try {
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.status === 'OK') {
            console.log('✅ Données détaillées récupérées');
            console.log('🕐 Opening hours dans détails:', JSON.stringify(detailsData.result?.opening_hours, null, 2));
            return NextResponse.json(detailsData);
          }
        } catch (e) {
          console.error('❌ Erreur appel Details:', e);
        }
      }
      
      // Fallback: retourner les données de base de Text Search
      return NextResponse.json({
        status: 'OK',
        result: {
          place_id: firstResult.place_id,
          name: firstResult.name,
          rating: firstResult.rating,
          user_ratings_total: firstResult.user_ratings_total,
          types: firstResult.types,
          price_level: firstResult.price_level,
          vicinity: firstResult.vicinity || firstResult.formatted_address,
          geometry: firstResult.geometry,
          photos: firstResult.photos
        }
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur proxy Google Places:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}