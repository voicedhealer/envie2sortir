import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const establishments = await prisma.establishment.findMany({
      where: { 
        status: 'active' as const,
        // Seulement les établissements avec coordonnées GPS
        latitude: { not: null },
        longitude: { not: null }
      },
      include: { 
        tags: true, 
        images: { 
          where: { isPrimary: true }, 
          take: 1 
        }
      }
    });

    console.log(`🏢 ${establishments.length} établissements actifs chargés avec coordonnées`);

    // 3. Appliquer le filtrage géographique D'ABORD
    const establishmentsInRadius = establishments.filter(est => {
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
          if (tagNormalized.includes(keyword) || keyword.includes(tagNormalized)) {
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
      
      keywords.forEach(keyword => {
        if (nameNormalized.includes(keyword)) {
          thematicScore += 20; // Nom contient le mot-clé
          console.log(`  📛 Nom "${establishment.name}" contient "${keyword}" → +20 points`);
        }
        if (descriptionNormalized.includes(keyword)) {
          thematicScore += 10; // Description contient le mot-clé
          console.log(`  📄 Description contient "${keyword}" → +10 points`);
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
              if (activityNormalized.includes(keyword) || keyword.includes(activityNormalized)) {
                thematicScore += 25; // Activité correspondante (score élevé)
                console.log(`  🎯 Activité "${activity}" correspond à "${keyword}" → +25 points`);
              }
            });
          }
        });
      }

      // Vérifier si ouvert (bonus seulement si déjà pertinent thématiquement)
      const isOpen = isOpenNow(establishment.horairesOuverture);
      if (isOpen && thematicScore > 0) {
        thematicScore += 15; // Bonus si ouvert ET pertinent
        console.log(`  🕐 Établissement ouvert → +15 points`);
      }

      // Score final = score thématique + bonus de proximité
      let finalScore = thematicScore;
      let proximityBonus = 0;
      if (thematicScore > 0 && lat && lng && establishment.latitude && establishment.longitude) {
        proximityBonus = Math.max(0, 50 - distance * 2); // Bonus de 50 à 0 selon la distance
        finalScore += proximityBonus;
        console.log(`  📍 Bonus proximité (${distance.toFixed(2)}km) → +${proximityBonus.toFixed(1)} points`);
      }

      if (thematicScore > 0) {
        console.log(`  ✅ ${establishment.name}: Score thématique=${thematicScore}, Final=${finalScore.toFixed(1)}, Distance=${distance.toFixed(2)}km, Tags=[${matchedTags.join(', ')}]`);
      }

      return {
        ...establishment,
        score: finalScore,
        thematicScore: thematicScore, // Score sans bonus de proximité
        distance: Math.round(distance * 100) / 100,
        isOpen,
        matchedTags: [...new Set(matchedTags)], // Supprimer les doublons
        primaryImage: establishment.images[0]?.url || null
      };
    });

    // 5. Filtrer par pertinence thématique (score thématique > 0)
    const filteredEstablishments = scoredEstablishments
      .filter(est => est.thematicScore > 0) // Seulement ceux qui correspondent à l'envie
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
        totalEstablishments: establishments.length,
        establishmentsInRadius: establishmentsInRadius.length,
        establishmentsWithCoords: establishments.filter(e => e.latitude && e.longitude).length,
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