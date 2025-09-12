import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL requise et doit être une chaîne de caractères' },
        { status: 400 }
      );
    }

    // Validation basique de l'URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'URL malformée - vérifiez le format' },
        { status: 400 }
      );
    }

    let finalUrl = url;
    
    // Si c'est une URL raccourcie, la résoudre d'abord
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.log('🔗 URL raccourcie détectée, résolution...');
      try {
        // Suivre la redirection pour obtenir l'URL complète
        const response = await fetch(url, { 
          method: 'HEAD', 
          redirect: 'follow' 
        });
        finalUrl = response.url;
        console.log('✅ URL résolue:', finalUrl);
      } catch (e) {
        console.error('❌ Erreur résolution URL raccourcie:', e);
        return NextResponse.json(
          { error: 'Impossible de résoudre l\'URL raccourcie' },
          { status: 400 }
        );
      }
    }

    // Extraire le Place ID depuis l'URL (résolue ou originale)
    let placeId = extractPlaceIdFromUrl(finalUrl);
    
    // Si le Place ID est au format 0x... (incompatible avec l'API Places), 
    // extraire les coordonnées à la place
    if (placeId && placeId.includes('0x')) {
      console.log('🔄 Place ID format 0x détecté, extraction des coordonnées...');
      const coordMatch = finalUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        placeId = `${coordMatch[1]},${coordMatch[2]}`;
        console.log('✅ Coordonnées extraites:', placeId);
      }
    }
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'URL Google Maps invalide', success: false },
        { status: 400 }
      );
    }

    // Extraire le nom du lieu si possible
    let placeName = null;
    const nameMatch = finalUrl.match(/\/place\/([^\/]+)\/@/);
    if (nameMatch) {
      placeName = decodeURIComponent(nameMatch[1]).replace(/\+/g, ' ');
    }

    return NextResponse.json({
      success: true,
      placeId: placeId,
      placeName: placeName,
      originalUrl: url,
      resolvedUrl: finalUrl
    });

  } catch (error) {
    console.error('Erreur résolution URL Google:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

function extractPlaceIdFromUrl(url: string): string | null {
  console.log('🔍 Extraction Place ID depuis:', url);
  
    // Vérifier que c'est bien une URL Google Maps
  if (!url.includes('google.com/maps') && !url.includes('maps.google.com')) {
    console.log('❌ URL ne semble pas être une URL Google Maps');
    return null;
  }
  
  // Extraction du Place ID depuis différents formats d'URL Google
  const patterns = [
    // Format classique avec place_id
    /place_id=([a-zA-Z0-9_-]+)/,
    // Format avec !3m1!4b1!4m6!3m5!1s (format complexe - le plus important)
    /!3m1!4b1!4m6!3m5!1s([a-zA-Z0-9_:]+)/,
    // Format avec 1s (le plus courant pour les URLs modernes)
    /1s([a-zA-Z0-9_:]+)/,
    // Format avec !16s (nouveau format)
    /!16s([a-zA-Z0-9_%\/-]+)/,
    // Format avec !1s (autre format moderne)
    /!1s([a-zA-Z0-9_%\/-]+)/,
    // Format avec data
    /data=([^&]+)/,
    // Format avec !8m2!3d!4d!16s (format avec coordonnées)
    /!8m2!3d[^!]+!4d[^!]+!16s([a-zA-Z0-9_%\/-]+)/
  ];

  // Essayer d'extraire les coordonnées si aucun Place ID n'est trouvé
  const coordPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const coordMatch = url.match(coordPattern);

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      let placeId = match[1];
      console.log('✅ Place ID trouvé:', placeId);
      
      // Nettoyer l'ID si nécessaire
      if (placeId.includes('?')) {
        placeId = placeId.split('?')[0];
      }
      
      // Décoder l'URL si nécessaire
      try {
        placeId = decodeURIComponent(placeId);
      } catch (e) {
        // Ignorer les erreurs de décodage
      }
      
      // Vérifier que c'est un Place ID valide (contient des deux-points ou commence par 0x)
      if (placeId.includes(':') || placeId.startsWith('0x') || (placeId.length > 15 && /[0-9]/.test(placeId))) {
        console.log('✅ Place ID valide:', placeId);
        return placeId;
      } else {
        console.log('❌ Place ID invalide (probablement un nom):', placeId);
      }
    }
  }
  
  // Si aucun Place ID n'est trouvé mais qu'on a des coordonnées, les utiliser
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    console.log('✅ Coordonnées trouvées:', lat, lng);
    // Retourner les coordonnées comme "placeId" pour l'API Places
    return `${lat},${lng}`;
  }
  
  console.log('❌ Aucun Place ID ou coordonnées valides trouvés');
  return null;
}