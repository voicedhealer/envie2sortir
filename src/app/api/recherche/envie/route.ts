import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fonction pour calculer la distance entre deux points (formule haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fonction intelligente de matching pour éviter les faux positifs
// Priorise les correspondances exactes et par mots entiers
function intelligentMatch(text: string, keyword: string): boolean {
  // 1. Correspondance exacte (priorité maximale)
  if (text === keyword) {
    return true;
  }
  
  // 2. Correspondance par mot entier (mot entouré de limites de mots)
  // Utiliser \b pour s'assurer que c'est un mot complet
  const wordBoundaryRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (wordBoundaryRegex.test(text)) {
    return true;
  }
  
  // 3. Correspondance partielle uniquement pour les mots-clés de 4+ caractères
  // Cela permet "karting" contient "kart" mais pas "art" contient "art" si art est un mot de 3 caractères
  if (keyword.length >= 4 && text.includes(keyword)) {
    return true;
  }
  
  // Pas de correspondance
  return false;
}

// Fonction pour extraire les mots-clés significatifs
function extractKeywords(envie: string): string[] {
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'manger', 'boire', 'faire','avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux'];
  
  return envie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[\s,]+/)
    .filter(word => {
      const trimmed = word.trim();
      // Accepter les mots de plus de 2 caractères OU les acronymes de 2 caractères (vr, ai, etc.)
      return (trimmed.length > 2 || (trimmed.length === 2 && /^[a-z]{2}$/.test(trimmed))) && !stopWords.includes(trimmed);
    })
    .map(word => word.trim());
}

// Fonction pour vérifier si un établissement est ouvert
function isOpenNow(horairesOuverture: any): boolean {
  if (!horairesOuverture) return true; // Par défaut, considéré comme ouvert
  
  try {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayKey = today as keyof typeof horairesOuverture;
    const todayHours = horairesOuverture[todayKey];
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Vérifier si on est dans un créneau d'ouverture
    for (const slot of todayHours.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      let closeTime = closeHour * 60 + closeMin;
      
      // Gérer les horaires qui passent minuit (ex: 19:00-02:00)
      if (closeTime < openTime) {
        closeTime += 24 * 60; // Ajouter 24h si la fermeture est le lendemain
      }
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        return true;
      }
    }
    
    return false;
  } catch {
    return true; // En cas d'erreur, considéré comme ouvert
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const envie = searchParams.get('envie');
    const ville = searchParams.get('ville');
    const rayon = parseInt(searchParams.get('rayon') || '5'); // Rayon par défaut de 5km
    let lat = parseFloat(searchParams.get('lat') || '0');
    let lng = parseFloat(searchParams.get('lng') || '0');

    console.log(`🔍 RECHERCHE DÉMARRÉE - Envie: "${envie}", Ville: "${ville}", Rayon: ${rayon}km, Coords: (${lat}, ${lng})`);

    if (!envie) {
      return NextResponse.json({ error: "Paramètre 'envie' requis" }, { status: 400 });
    }

    // Si pas de coordonnées mais une ville spécifiée, géocoder la ville
    if ((lat === 0 || lng === 0) && ville && ville !== "Autour de moi") {
      try {
        console.log(`🌍 Géocodage de la ville: ${ville}`);
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville + ', France')}&limit=1`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
          console.log(`📍 Coordonnées trouvées pour ${ville}: (${lat}, ${lng})`);
        } else {
          console.warn(`⚠️ Impossible de géocoder la ville: ${ville}`);
        }
      } catch (geocodeError) {
        console.error('Erreur géocodage:', geocodeError);
      }
    }

    // Si toujours pas de coordonnées, utiliser Dijon par défaut
    if (lat === 0 || lng === 0) {
      lat = 47.322;
      lng = 5.041;
      console.log(`📍 Utilisation des coordonnées par défaut (Dijon): (${lat}, ${lng})`);
    }

    // Extraire les mots-clés de l'envie
    const keywords = extractKeywords(envie);
    console.log(`📝 Mots-clés extraits: [${keywords.join(', ')}]`);
    
    if (keywords.length === 0) {
      return NextResponse.json({ error: "Aucun mot-clé significatif trouvé" }, { status: 400 });
    }

    // 1. Charger TOUS les établissements actifs avec coordonnées
    const supabase = await createClient();
    
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select(`
        *,
        tags:etablissement_tags (*),
        images (*)
      `)
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (establishmentsError) {
      console.error('Erreur chargement établissements:', establishmentsError);
      return NextResponse.json(
        { error: "Erreur lors du chargement des établissements" },
        { status: 500 }
      );
    }

    // Filtrer les images primaires et parser les données
    const establishmentsWithData = (establishments || []).map((est: any) => {
      // Parser les champs JSON
      const parseJsonField = (field: any) => {
        if (!field) return null;
        if (typeof field === 'object') return field;
        if (typeof field !== 'string') return field;
        try {
          return JSON.parse(field);
        } catch {
          return null;
        }
      };

      return {
        ...est,
        activities: parseJsonField(est.activities) || [],
        services: parseJsonField(est.services) || [],
        ambiance: parseJsonField(est.ambiance) || [],
        paymentMethods: parseJsonField(est.payment_methods) || [],
        horairesOuverture: parseJsonField(est.horaires_ouverture) || {},
        envieTags: parseJsonField(est.envie_tags) || [],
        informationsPratiques: parseJsonField(est.informations_pratiques) || [],
        // Filtrer les images primaires
        images: (est.images || []).filter((img: any) => img.is_primary).slice(0, 1)
      };
    });

    console.log(`🏢 ${establishmentsWithData.length} établissements actifs chargés avec coordonnées`);

    // 3. Appliquer le filtrage géographique D'ABORD
    const establishmentsInRadius = establishmentsWithData.filter(est => {
      if (lat && lng && est.latitude && est.longitude) {
        const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
        return distance <= rayon;
      }
      // Si pas de coordonnées de recherche, inclure tous les établissements
      return true;
    });

    console.log(`📍 ${establishmentsInRadius.length} établissements dans le rayon de ${rayon}km`);

    // 4. Calculer le score pour chaque établissement dans le rayon
    const scoredEstablishments = establishmentsInRadius.map(establishment => {
      let thematicScore = 0; // Score basé sur la pertinence thématique
      let matchedTags: string[] = [];
      let distance = 0;
      
      // Calculer la distance si géolocalisation disponible
      if (lat && lng && establishment.latitude && establishment.longitude) {
        distance = calculateDistance(lat, lng, establishment.latitude, establishment.longitude);
      }
      
      // Score basé sur les tags
      establishment.tags.forEach(tag => {
        const tagNormalized = tag.tag
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        keywords.forEach(keyword => {
          // Vérifier si le tag contient le mot-clé (uniquement dans ce sens)
          if (intelligentMatch(tagNormalized, keyword)) {
            // Ajuster le poids pour les tags "envie de" génériques
            let adjustedPoids = tag.poids;
            if (tag.tag.toLowerCase().includes('envie de découvrir') || 
                tag.tag.toLowerCase().includes('envie de sortir') ||
                tag.tag.toLowerCase().includes('envie de détente')) {
              adjustedPoids = 3; // Réduire le poids des tags génériques
            }
            const tagScore = adjustedPoids * 10; // Poids du tag * 10
            thematicScore += tagScore;
            matchedTags.push(tag.tag);
            console.log(`  🏷️  Tag "${tag.tag}" (poids: ${adjustedPoids}) correspond à "${keyword}" → +${tagScore} points`);
          }
        });
      });

      // Score basé sur le nom et la description
      const nameNormalized = establishment.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const descriptionNormalized = (establishment.description || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      // Vérifier si c'est un mot-clé "nourriture" pour augmenter la pertinence
      const foodKeywords = ['pizza', 'burger', 'sushi', 'restaurant', 'pasta', 'tacos', 'chinese', 'indian', 'french', 'italian', 'mexican', 'asian', 'food'];
      const isFoodKeyword = keywords.some(kw => foodKeywords.some(fk => kw.includes(fk) || fk.includes(kw)));
      
      keywords.forEach(keyword => {
        if (intelligentMatch(nameNormalized, keyword)) {
          const baseScore = 20;
          const bonusScore = isFoodKeyword && establishment.activities?.some((a: any) => a?.toLowerCase()?.includes('restaurant')) ? 30 : 0;
          thematicScore += baseScore + bonusScore;
          console.log(`  📛 Nom "${establishment.name}" contient "${keyword}" → +${baseScore + bonusScore} points`);
        }
        if (intelligentMatch(descriptionNormalized, keyword)) {
          const baseScore = 10;
          const bonusScore = isFoodKeyword && establishment.activities?.some((a: any) => a?.toLowerCase()?.includes('restaurant')) ? 20 : 0;
          thematicScore += baseScore + bonusScore;
          console.log(`  📄 Description contient "${keyword}" → +${baseScore + bonusScore} points`);
        }
      });

      // Score basé sur les activités (JSON)
      if (establishment.activities && Array.isArray(establishment.activities)) {
        establishment.activities.forEach((activity: any) => {
          if (typeof activity === 'string') {
            const activityNormalized = activity
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            keywords.forEach(keyword => {
              if (intelligentMatch(activityNormalized, keyword)) {
                thematicScore += 25; // Activité correspondante (score élevé)
                console.log(`  🎯 Activité "${activity}" correspond à "${keyword}" → +25 points`);
              }
            });
          }
        });
      }

      let openBonus = 0;
      // Vérifier si ouvert (bonus seulement si déjà pertinent thématiquement)
      const isOpen = isOpenNow(establishment.horairesOuverture);
      if (isOpen && thematicScore > 0) {
        openBonus = 15; // Bonus si ouvert ET pertinent
        console.log(`  🕐 Établissement ouvert → +15 points`);
      }

      // Score final = score thématique + bonus de proximité
      let finalScore = thematicScore + openBonus;
      let proximityBonus = 0;
      if (thematicScore > 0 && lat && lng && establishment.latitude && establishment.longitude) {
        proximityBonus = Math.max(0, 50 - distance * 2); // Bonus de 50 à 0 selon la distance
        finalScore += proximityBonus;
        console.log(`  📍 Bonus proximité (${distance.toFixed(2)}km) → +${proximityBonus.toFixed(1)} points`);
      }

      if (thematicScore > 0) {
        console.log(`  ✅ ${establishment.name}: Score thématique=${thematicScore}, Final=${finalScore.toFixed(1)}, Distance=${distance.toFixed(2)}km, Tags=[${matchedTags.join(', ')}]`);
      } else {
        // Log des établissements NON pertinents pour debug
        console.log(`  ❌ ${establishment.name}: Score thématique=${thematicScore}, Pas de correspondance avec les mots-clés [${keywords.join(', ')}]`);
      }

      return {
        ...establishment,
        score: finalScore,
        thematicScore: thematicScore, // Score sans bonus de proximité
        distance: Math.round(distance * 100) / 100,
        isOpen,
        matchedTags: [...new Set(matchedTags)], // Supprimer les doublons
        primaryImage: establishment.images && establishment.images.length > 0 ? establishment.images[0].url : null
      };
    });

    // 5. Filtrer par pertinence thématique (score thématique minimal requis)
    const MINIMUM_THEMATIC_SCORE = 5; // Score minimum pour être considéré comme pertinent
    
    // Filtre supplémentaire: pour les mots-clés de nourriture, s'assurer que c'est un restaurant
    const foodKeywords = ['pizza', 'burger', 'sushi', 'restaurant', 'pasta', 'tacos', 'chinese', 'indian', 'french', 'italian', 'mexican', 'asian', 'food', 'manger'];
    const searchIsForFood = keywords.some(kw => foodKeywords.some(fk => kw.includes(fk) || fk.includes(kw)));
    
    const filteredEstablishments = scoredEstablishments
      .filter(est => {
        if (est.thematicScore < MINIMUM_THEMATIC_SCORE) return false;
        
        // Si la recherche est pour de la nourriture, vérifier que c'est un restaurant
        if (searchIsForFood) {
          const isRestaurant = est.activities?.some((a: any) => 
            typeof a === 'string' && a.toLowerCase().includes('restaurant')
          ) || est.description?.toLowerCase().includes('restaurant');
          
          if (!isRestaurant) {
            console.log(`  🚫 ${est.name}: Écarté car la recherche est pour de la nourriture mais ce n'est pas un restaurant`);
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Tri principal par score décroissant
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tri secondaire par distance croissante
        return a.distance - b.distance;
      })
      .slice(0, 15); // Limiter à 15 résultats

    console.log(`🎯 ${filteredEstablishments.length} établissements pertinents trouvés après filtrage thématique`);
    console.log(`📊 Résultats finaux:`);
    filteredEstablishments.forEach((est, index) => {
      console.log(`  ${index + 1}. ${est.name} - Score: ${est.score.toFixed(1)} (thématique: ${est.thematicScore}, distance: ${est.distance}km)`);
    });

    return NextResponse.json({
      success: true,
      results: filteredEstablishments,
      total: filteredEstablishments.length,
      query: {
        envie,
        ville,
        rayon,
        keywords,
        coordinates: lat && lng ? { lat, lng } : null,
        distanceFilter: lat && lng ? `Rayon de ${rayon}km autour de (${lat}, ${lng})` : null,
        searchStrategy: "Géographique + Filtrage thématique - établissements pertinents dans le rayon",
        totalEstablishments: establishmentsWithData.length,
        establishmentsInRadius: establishmentsInRadius.length,
        establishmentsWithCoords: establishmentsWithData.filter(e => e.latitude && e.longitude).length,
        relevantResults: filteredEstablishments.length
      }
    });

  } catch (error) {
    console.error('Erreur recherche par envie:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: "Erreur lors de la recherche",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}