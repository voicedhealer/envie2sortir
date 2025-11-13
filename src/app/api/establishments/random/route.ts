import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    
    const supabase = createClient();

    // Construire la requête Supabase
    let query = supabase
      .from('establishments')
      .select(`
        id,
        name,
        slug,
        address,
        city,
        description,
        latitude,
        longitude,
        price_min,
        price_max,
        status,
        subscription,
        image_url,
        avg_rating,
        total_comments,
        views_count,
        clicks_count,
        created_at,
        last_modified_at,
        images (
          id,
          url,
          alt_text,
          is_primary,
          is_card_image
        )
      `)
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false });

    // Filtrer par ville si spécifiée
    if (city && (!lat || !lng)) {
      query = query.eq('city', city);
    }

    const { data: allEstablishments, error: establishmentsError } = await query;

    if (establishmentsError) {
      console.error('Erreur chargement établissements:', establishmentsError);
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
    
    // Filtrer par rayon géographique si des coordonnées sont fournies
    let establishments = (allEstablishments || []);
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
      
      establishments = establishments.filter((est: any) => {
        if (est.latitude && est.longitude) {
          const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
          return distance <= radius;
        }
        return false;
      });
    }
    
    // Limiter le nombre de résultats
    establishments = establishments.slice(0, limit);
    
    // Formater la réponse (conversion snake_case -> camelCase)
    const formattedEstablishments = establishments.map((est: any) => ({
      id: est.id,
      name: est.name,
      slug: est.slug,
      address: est.address,
      city: est.city,
      description: est.description,
      latitude: est.latitude,
      longitude: est.longitude,
      priceMin: est.price_min,
      priceMax: est.price_max,
      status: est.status,
      subscription: est.subscription,
      imageUrl: est.image_url,
      images: (est.images || []).slice(0, 5).map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text,
        isPrimary: img.is_primary,
        isCardImage: img.is_card_image
      })),
      rating: est.avg_rating,
      reviewCount: est.total_comments,
      viewsCount: est.views_count,
      clicksCount: est.clicks_count,
      createdAt: est.created_at,
      lastModifiedAt: est.last_modified_at
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