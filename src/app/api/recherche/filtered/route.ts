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
    .filter(word => {
      const trimmed = word.trim();
      return (trimmed.length > 2 || (trimmed.length === 2 && /^[a-z]{2}$/.test(trimmed))) && !stopWords.includes(trimmed);
    })
    .map(word => word.trim());
}

// Fonction pour vérifier si un établissement est ouvert
function isOpenNow(horairesOuverture: any): boolean {
  if (!horairesOuverture) return true;
  
  try {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayKey = today as keyof typeof horairesOuverture;
    const todayHours = horairesOuverture[todayKey];
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const slot of todayHours.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      let closeTime = closeHour * 60 + closeMin;
      
      if (closeTime < openTime) {
        closeTime += 24 * 60;
      }
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        return true;
      }
    }
    
    return false;
  } catch {
    return true;
  }
}

// Fonction pour appliquer le tri selon le filtre
function applySorting(establishments: any[], filter: string) {
  switch (filter) {
    case 'popular':
      return establishments.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    
    case 'wanted':
      return establishments.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    
    case 'cheap':
      return establishments.sort((a, b) => {
        const priceA = a.priceMin || a.prixMoyen || 999;
        const priceB = b.priceMin || b.prixMoyen || 999;
        return priceA - priceB;
      });
    
    case 'premium':
      return establishments.sort((a, b) => {
        // Tri par subscription (PREMIUM en premier) puis par date de création
        const subscriptionOrder = { 'PREMIUM': 2, 'STANDARD': 1 };
        const orderA = subscriptionOrder[a.subscription as keyof typeof subscriptionOrder] || 0;
        const orderB = subscriptionOrder[b.subscription as keyof typeof subscriptionOrder] || 0;
        
        if (orderA !== orderB) return orderB - orderA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    case 'newest':
      return establishments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    case 'rating':
      return establishments.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    
    default:
      return establishments;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const envie = searchParams.get('envie');
    const ville = searchParams.get('ville');
    const filter = searchParams.get('filter') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const rayon = parseInt(searchParams.get('rayon') || '5');
    let lat = parseFloat(searchParams.get('lat') || '0');
    let lng = parseFloat(searchParams.get('lng') || '0');

    console.log(`🔍 RECHERCHE FILTRÉE - Envie: "${envie}", Ville: "${ville}", Filtre: ${filter}, Page: ${page}, Limite: ${limit}`);

    if (!envie) {
      return NextResponse.json({ error: "Paramètre 'envie' requis" }, { status: 400 });
    }

    // Géocodage si nécessaire
    if ((lat === 0 || lng === 0) && ville && ville !== "Autour de moi") {
      try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville + ', France')}&limit=1`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
        }
      } catch (geocodeError) {
        console.error('Erreur géocodage:', geocodeError);
      }
    }

    if (lat === 0 || lng === 0) {
      lat = 47.322;
      lng = 5.041;
    }

    const keywords = extractKeywords(envie);
    if (keywords.length === 0) {
      return NextResponse.json({ error: "Aucun mot-clé significatif trouvé" }, { status: 400 });
    }

    // Construire la clause WHERE
    const where: any = {
      status: 'active',
      latitude: { not: null },
      longitude: { not: null }
    };

    // Filtre premium
    if (filter === 'premium') {
      where.subscription = 'PREMIUM';
    }

    // Charger les établissements
    const establishments = await prisma.establishment.findMany({
      where,
      include: { 
        tags: true, 
        images: { 
          where: { isPrimary: true }, 
          take: 1 
        },
        events: {
          where: {
            startDate: {
              gte: new Date()
            }
          },
          orderBy: {
            startDate: 'asc'
          },
          take: 1
        }
      }
    });

    // Appliquer le filtrage géographique
    const establishmentsInRadius = establishments.filter(est => {
      if (lat && lng && est.latitude && est.longitude) {
        const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
        return distance <= rayon;
      }
      return true;
    });

    // Calculer les scores pour la pertinence thématique
    const scoredEstablishments = establishmentsInRadius.map(establishment => {
      let thematicScore = 0;
      let matchedTags: string[] = [];
      let distance = 0;
      
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
            const tagScore = tag.poids * 10;
            thematicScore += tagScore;
            matchedTags.push(tag.tag);
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
          thematicScore += 20;
        }
        if (descriptionNormalized.includes(keyword)) {
          thematicScore += 10;
        }
      });

      // Score basé sur les activités
      if (establishment.activities && Array.isArray(establishment.activities)) {
        establishment.activities.forEach((activity: any) => {
          if (typeof activity === 'string') {
            const activityNormalized = activity
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            keywords.forEach(keyword => {
              if (activityNormalized.includes(keyword) || keyword.includes(activityNormalized)) {
                thematicScore += 25;
              }
            });
          }
        });
      }

      const isOpen = isOpenNow(establishment.horairesOuverture);
      if (isOpen && thematicScore > 0) {
        thematicScore += 15;
      }

      let finalScore = thematicScore;
      let proximityBonus = 0;
      if (thematicScore > 0 && lat && lng && establishment.latitude && establishment.longitude) {
        proximityBonus = Math.max(0, 50 - distance * 2);
        finalScore += proximityBonus;
      }

      return {
        ...establishment,
        score: finalScore,
        thematicScore: thematicScore,
        distance: Math.round(distance * 100) / 100,
        isOpen,
        matchedTags: [...new Set(matchedTags)],
        primaryImage: establishment.images[0]?.url || null
      };
    });

    // Filtrer par pertinence thématique
    const relevantEstablishments = scoredEstablishments
      .filter(est => est.thematicScore > 0);

    // Appliquer le tri selon le filtre
    const sortedEstablishments = applySorting(relevantEstablishments, filter);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEstablishments = sortedEstablishments.slice(startIndex, endIndex);

    const hasMore = endIndex < sortedEstablishments.length;
    const totalPages = Math.ceil(sortedEstablishments.length / limit);

    return NextResponse.json({
      success: true,
      results: paginatedEstablishments,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: sortedEstablishments.length,
        hasMore,
        limit
      },
      filter,
      query: {
        envie,
        ville,
        rayon,
        keywords,
        coordinates: lat && lng ? { lat, lng } : null
      }
    });

  } catch (error) {
    console.error('Erreur recherche filtrée:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la recherche",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
