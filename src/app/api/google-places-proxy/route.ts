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
        // Utiliser des fields complets si non fournis (même liste que dans enrichment-system.ts)
        const fieldsToUse = fields || 'name,types,price_level,rating,user_ratings_total,business_status,opening_hours,website,formatted_phone_number,formatted_address,geometry,wheelchair_accessible_entrance,takeout,delivery,dine_in,serves_lunch,serves_dinner,serves_beer,serves_wine,serves_vegetarian_food,editorial_summary,current_opening_hours,utc_offset,place_id,vicinity,address_components,adr_address,international_phone_number,plus_code,reviews,photos';
        
        console.log('🔍 Appel Place Details avec fields:', fieldsToUse);
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${firstResult.place_id}&fields=${fieldsToUse}&key=${apiKey}`;
        
        try {
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          console.log('📨 Réponse Place Details:', JSON.stringify(detailsData, null, 2));
          
          if (detailsData.status === 'OK') {
            console.log('✅ Données détaillées récupérées');
            console.log('🕐 Opening hours dans détails:', JSON.stringify(detailsData.result?.opening_hours, null, 2));
            console.log('♿ Accessibility dans détails:', detailsData.result?.wheelchair_accessible_entrance);
            console.log('💬 Reviews dans détails:', detailsData.result?.reviews?.length || 0, 'avis trouvés');
            console.log('💬 Premier avis:', detailsData.result?.reviews?.[0]?.text?.substring(0, 100) || 'Aucun avis');
            return NextResponse.json(detailsData);
          } else {
            console.error('❌ Erreur Place Details:', detailsData.status, detailsData.error_message);
          }
        } catch (e) {
          console.error('❌ Erreur appel Details:', e);
        }
      }
      
      // Fallback: retourner les données de base de Text Search
      console.log('⚠️ Fallback: retour des données Text Search');
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
          geometry: firstResult.geometry
        }
      });
    }
    
    // Si c'est déjà un Place ID (pas de coordonnées), faire directement l'appel Details
    if (!placeId.includes(',') && data.status === 'OK' && data.result) {
      console.log('🔍 Place ID direct détecté, appel API Details:', placeId);
      
      const fieldsToUse = fields || 'name,types,price_level,rating,user_ratings_total,business_status,opening_hours,website,formatted_phone_number,formatted_address,geometry,wheelchair_accessible_entrance,takeout,delivery,dine_in,serves_lunch,serves_dinner,serves_beer,serves_wine,serves_vegetarian_food,editorial_summary,current_opening_hours,utc_offset,place_id,vicinity,address_components,adr_address,international_phone_number,plus_code';
      
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fieldsToUse}&key=${apiKey}`;
      
      try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        console.log('📨 Réponse Place Details direct:', JSON.stringify(detailsData, null, 2));
        
        if (detailsData.status === 'OK') {
          console.log('✅ Données détaillées récupérées (Place ID direct)');
          return NextResponse.json(detailsData);
        }
      } catch (e) {
        console.error('❌ Erreur appel Details direct:', e);
      }
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