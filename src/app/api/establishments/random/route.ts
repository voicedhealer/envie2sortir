import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cache simple en mémoire
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour vider le cache (utile pour le développement)
export function clearCache() {
  cache.clear();
}

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
    
    const supabase = await createClient();

    // Construire la requête Supabase (sans relations pour éviter les problèmes)
    let query = supabase
      .from('establishments')
      .select('*')
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
      console.error('❌ [Random Establishments] Erreur chargement établissements:', {
        error: establishmentsError,
        code: establishmentsError?.code,
        message: establishmentsError?.message,
        details: establishmentsError?.details
      });
      return NextResponse.json(
        { 
          success: false,
          error: "Erreur lors du chargement des établissements",
          details: process.env.NODE_ENV === 'production' ? undefined : establishmentsError.message,
          code: process.env.NODE_ENV === 'production' ? undefined : establishmentsError.code,
          establishments: [],
          count: 0
        },
        { status: 500 }
      );
    }
    
    // Récupérer les images pour tous les établissements
    const establishmentIds = (allEstablishments || []).map((est: any) => est.id);
    const imagesMap = new Map();
    
    if (establishmentIds.length > 0) {
      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .in('establishment_id', establishmentIds)
        .eq('is_primary', true);
      
      (imagesData || []).forEach((img: any) => {
        if (!imagesMap.has(img.establishment_id)) {
          imagesMap.set(img.establishment_id, []);
        }
        imagesMap.get(img.establishment_id).push(img);
      });
    }
    
    // Filtrer par rayon géographique si des coordonnées sont fournies
    let establishments = (allEstablishments || []);
    if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng) && radius > 0) {
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

      console.log(`📍 [Random Establishments] Filtrage géographique: ${establishments.length} établissements dans un rayon de ${radius}km autour de (${lat}, ${lng})`);
      
      // Ne pas faire de fallback - si aucun établissement ne rentre dans le rayon, retourner une liste vide
      // Cela permet à l'utilisateur de voir qu'il n'y a pas de résultats et d'augmenter le rayon
    }
    
    // Limiter le nombre de résultats
    establishments = establishments.slice(0, limit);
    
    // Formater la réponse (conversion snake_case -> camelCase)
    const formattedEstablishments = establishments.map((est: any) => {
      const images = imagesMap.get(est.id) || [];
      return {
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
        images: images.slice(0, 5).map((img: any) => ({
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
      };
    });
    
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