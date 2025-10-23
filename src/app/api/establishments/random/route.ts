import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache simple en mémoire
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const city = searchParams.get('city');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '20');
    
    // Clé de cache
    const cacheKey = `random-${city || 'all'}-${limit}-${lat}-${lng}-${radius}`;
    
    // Vérifier le cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Construire les conditions de recherche
    const whereConditions: any = {
      status: 'approved',
      // Seulement les établissements avec coordonnées GPS
      latitude: { not: null },
      longitude: { not: null }
    };
    
    // Filtrer par ville si spécifiée (fallback si pas de coordonnées GPS)
    if (city && (!lat || !lng)) {
      whereConditions.city = city;
    }
    
    // Récupérer TOUS les établissements qui correspondent aux critères de base
    const allEstablishments = await prisma.establishment.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        description: true,
        latitude: true,
        longitude: true,
        priceMin: true,
        priceMax: true,
        status: true,
        subscription: true,
        imageUrl: true,
        avgRating: true,
        totalComments: true,
        viewsCount: true,
        clicksCount: true,
        createdAt: true,
        lastModifiedAt: true,
        images: {
          take: 5,
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            isCardImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Filtrer par rayon géographique si des coordonnées sont fournies
    let establishments = allEstablishments;
    if (lat && lng && radius) {
      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      establishments = allEstablishments.filter(est => {
        if (est.latitude && est.longitude) {
          const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
          return distance <= radius;
        }
        return false;
      });
    }
    
    // Limiter le nombre de résultats
    establishments = establishments.slice(0, limit);
    
    // Formater la réponse (optimisé: moins de champs)
    const formattedEstablishments = establishments.map(est => ({
      id: est.id,
      name: est.name,
      slug: est.slug,
      address: est.address,
      city: est.city,
      description: est.description,
      latitude: est.latitude,
      longitude: est.longitude,
      priceMin: est.priceMin,
      priceMax: est.priceMax,
      status: est.status,
      subscription: est.subscription,
      imageUrl: est.imageUrl,
      images: est.images,
      rating: est.avgRating,
      reviewCount: est.totalComments,
      viewsCount: est.viewsCount,
      clicksCount: est.clicksCount,
      createdAt: est.createdAt,
      lastModifiedAt: est.lastModifiedAt
    }));
    
    const response = {
      success: true,
      establishments: formattedEstablishments,
      count: establishments.length
    };
    
    // Mettre en cache
    cache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // Ajouter des headers de cache HTTP
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('❌ Erreur récupération établissements aléatoires:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors du chargement des établissements",
        establishments: [],
        count: 0
      },
      { status: 500 }
    );
  }
}