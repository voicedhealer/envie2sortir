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
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'manger', 'boire', 'faire', 'découvrir', 'avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux'];
  
  return envie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[\s,]+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => word.trim());
}

// Fonction pour vérifier si un établissement est ouvert
function isOpenNow(horairesOuverture: any): boolean {
  if (!horairesOuverture) return true; // Par défaut, considéré comme ouvert
  
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit
    
    const horaires = horairesOuverture[dayOfWeek];
    if (!horaires || !horaires.ouvert) return false;
    
    const ouverture = horaires.ouverture || 0; // Minutes depuis minuit
    const fermeture = horaires.fermeture || 1440; // Minutes depuis minuit (24h)
    
    return currentTime >= ouverture && currentTime <= fermeture;
  } catch {
    return true; // En cas d'erreur, considéré comme ouvert
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const envie = searchParams.get('envie');
    const ville = searchParams.get('ville');
    const rayon = parseInt(searchParams.get('rayon') || '5');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    if (!envie) {
      return NextResponse.json({ error: "Paramètre 'envie' requis" }, { status: 400 });
    }

    // Extraire les mots-clés de l'envie
    const keywords = extractKeywords(envie);
    
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

    // 3. Appliquer le filtrage géographique D'ABORD
    const establishmentsInRadius = establishments.filter(est => {
      if (lat && lng && est.latitude && est.longitude) {
        const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
        return distance <= rayon;
      }
      // Si pas de coordonnées de recherche, inclure tous les établissements
      return true;
    });

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
        const tagLower = tag.tag.toLowerCase();
        keywords.forEach(keyword => {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
            thematicScore += tag.poids * 10; // Poids du tag * 10
            matchedTags.push(tag.tag);
          }
        });
      });

      // Score basé sur le nom et la description
      const nameLower = establishment.name.toLowerCase();
      const descriptionLower = (establishment.description || '').toLowerCase();
      
      keywords.forEach(keyword => {
        if (nameLower.includes(keyword)) {
          thematicScore += 20; // Nom contient le mot-clé
        }
        if (descriptionLower.includes(keyword)) {
          thematicScore += 10; // Description contient le mot-clé
        }
      });

      // Score basé sur les activités (JSON)
      if (establishment.activities && Array.isArray(establishment.activities)) {
        establishment.activities.forEach((activity: any) => {
          if (typeof activity === 'string') {
            const activityLower = activity.toLowerCase();
            keywords.forEach(keyword => {
              if (activityLower.includes(keyword) || keyword.includes(activityLower)) {
                thematicScore += 25; // Activité correspondante (score élevé)
              }
            });
          }
        });
      }

      // Vérifier si ouvert (bonus seulement si déjà pertinent thématiquement)
      const isOpen = isOpenNow(establishment.horairesOuverture);
      if (isOpen && thematicScore > 0) {
        thematicScore += 15; // Bonus si ouvert ET pertinent
      }

      // Score final = score thématique + bonus de proximité
      let finalScore = thematicScore;
      if (thematicScore > 0 && lat && lng && establishment.latitude && establishment.longitude) {
        finalScore += Math.max(0, 50 - distance * 2); // Bonus de 50 à 0 selon la distance
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
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}