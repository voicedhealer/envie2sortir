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
    
    // Clé de cache
    const cacheKey = `random-${city || 'all'}-${limit}`;
    
    // Vérifier le cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Données servies depuis le cache');
      return NextResponse.json(cached.data);
    }
    
    console.log('🎲 Récupération d\'établissements aléatoires...');
    
    // Construire les conditions de recherche
    const whereConditions: {
      status: string;
      city?: { contains: string; mode: string };
    } = {
      status: 'approved'
    };
    
    // Filtrer par ville si spécifiée
    if (city) {
      whereConditions.city = {
        contains: city,
        mode: 'insensitive'
      };
    }
    
    // Récupérer les établissements (optimisé: moins de données)
    const establishments = await prisma.establishment.findMany({
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
      },
      take: limit
    });
    
    console.log(`✅ ${establishments.length} établissements trouvés`);
    
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
      reviewCount: est.totalComments
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