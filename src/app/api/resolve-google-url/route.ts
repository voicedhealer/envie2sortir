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
        // Utiliser GET au lieu de HEAD pour mieux gérer les redirections
        const response = await fetch(url, { 
          method: 'GET', 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        finalUrl = response.url;
        console.log('✅ URL résolue:', finalUrl);
        
        // Si la résolution n'a pas fonctionné (même URL), essayer une autre méthode
        if (finalUrl === url || finalUrl.includes('goo.gl') || finalUrl.includes('maps.app.goo.gl')) {
          console.log('⚠️ URL toujours raccourcie après résolution, tentative alternative...');
          // Essayer de suivre la redirection manuellement en lisant le body
          const text = await response.text();
          // Chercher une redirection dans le HTML
          const redirectMatch = text.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i) ||
                               text.match(/window\.location\s*=\s*["']([^"']+)["']/i) ||
                               text.match(/location\.href\s*=\s*["']([^"']+)["']/i);
          
          if (redirectMatch && redirectMatch[1]) {
            finalUrl = redirectMatch[1];
            console.log('✅ URL résolue via parsing HTML:', finalUrl);
          }
        }
      } catch (e) {
        console.error('❌ Erreur résolution URL raccourcie:', e);
        // Ne pas échouer immédiatement, essayer d'extraire directement depuis l'URL raccourcie
        console.log('⚠️ Tentative d\'extraction directe depuis l\'URL raccourcie...');
        // Continuer avec l'URL originale, extractPlaceIdFromUrl pourra peut-être extraire quelque chose
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
  
  // Vérifier que c'est bien une URL Google Maps (accepter tous les domaines Google)
  const isGoogleMapsUrl = (url.includes('google.') && url.includes('/maps')) || 
                         url.includes('maps.google.') || 
                         url.includes('goo.gl') || 
                         url.includes('maps.app.goo.gl');
  
  if (!isGoogleMapsUrl) {
    console.log('❌ URL ne semble pas être une URL Google Maps');
    return null;
  }
  
  // Extraction du Place ID depuis différents formats d'URL Google
  const patterns = [
    // Format classique avec place_id
    /[?&]place_id=([a-zA-Z0-9_-]+)/,
    // Format avec !3m5!1s (format moderne avec Place ID 0x...:0x...) - capturer jusqu'au ! suivant
    /!3m5!1s([0-9a-fx:]+?)(?=!|$)/i,
    // Format avec !3m1!4b1!4m6!3m5!1s (format complexe - le plus important)
    /!3m1!4b1!4m6!3m5!1s([a-zA-Z0-9_:]+?)(?=!|$)/,
    // Format avec 1s suivi d'un Place ID (0x...:0x... ou autre) - capturer jusqu'au ! suivant
    /!1s([0-9a-fx:]+?)(?=!|$)/i,
    // Format avec 1s (le plus courant pour les URLs modernes) - amélioré
    /[!\/]1s([a-zA-Z0-9_:%\/-]+)/,
    // Format avec !16s (nouveau format)
    /!16s([a-zA-Z0-9_%\/-]+)/,
    // Format avec data
    /[?&]data=([^&]+)/,
    // Format avec !8m2!3d!4d!16s (format avec coordonnées)
    /!8m2!3d[^!]+!4d[^!]+!16s([a-zA-Z0-9_%\/-]+)/,
    // Format avec ChIJ (Place ID standard)
    /ChIJ[a-zA-Z0-9_-]+/,
    // Format avec /place/ dans l'URL (nom encodé)
    /\/place\/([^\/\?]+)/,
    // Format avec !2e0 (nouveau format 2024)
    /!2e0!3m2!1s([a-zA-Z0-9_:]+)!2sen/
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
      
      // Nettoyer le Place ID (enlever les caractères de fin comme !, ?, &, etc.)
      placeId = placeId.replace(/[!?&].*$/, '').trim();
      
      // Vérifier que c'est un Place ID valide
      // Place ID valide si :
      // - Contient des deux-points (format standard, ex: 0x...:0x...)
      // - Commence par 0x (ancien format)
      // - Commence par ChIJ (format standard Google)
      // - A une longueur > 15 et contient des chiffres (format encodé)
      // - Est un nom de lieu encodé (contient %)
      // - Contient au moins un 'x' suivi de chiffres hexadécimaux (format 0x...)
      const isValidPlaceId = placeId.includes(':') || 
                            placeId.match(/0x[0-9a-f]+/i) || 
                            placeId.startsWith('ChIJ') ||
                            (placeId.length > 15 && /[0-9]/.test(placeId)) ||
                            placeId.includes('%');
      
      if (isValidPlaceId) {
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