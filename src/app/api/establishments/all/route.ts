import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        const subscriptionOrder = { 'PREMIUM': 2, 'FREE': 1 };
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
    const filter = searchParams.get('filter') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    console.log(`🏢 TOUS LES ÉTABLISSEMENTS - Filtre: ${filter}, Page: ${page}, Limite: ${limit}`);

    const supabase = await createClient();

    // Charger tous les établissements actifs avec relations
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select(`
        *,
        tags:etablissement_tags (*),
        images (*),
        events (*)
      `)
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (establishmentsError) {
      console.error('Erreur chargement établissements:', establishmentsError);
      return NextResponse.json(
        { 
          error: "Erreur lors du chargement des établissements",
          details: establishmentsError.message
        },
        { status: 500 }
      );
    }

    // Parser les champs JSON et filtrer les données
    const establishmentsWithData = (establishments || []).map((est: any) => {
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

      // ✅ CORRECTION : Prioriser l'image de card, puis l'image primaire
      const cardImage = (est.images || []).find((img: any) => img.is_card_image) || null;
      const primaryImage = (est.images || []).find((img: any) => img.is_primary) || null;
      const selectedImage = cardImage || primaryImage;
      
      // Filtrer les événements à venir
      const now = new Date().toISOString();
      const upcomingEvent = (est.events || [])
        .filter((event: any) => event.start_date >= now)
        .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] || null;

      return {
        ...est,
        tags: est.tags || [],
        images: selectedImage ? [selectedImage] : [],
        events: upcomingEvent ? [upcomingEvent] : [],
        activities: parseJsonField(est.activities) || [],
        services: parseJsonField(est.services) || [],
        ambiance: parseJsonField(est.ambiance) || [],
        paymentMethods: parseJsonField(est.payment_methods) || [],
        horairesOuverture: parseJsonField(est.horaires_ouverture) || {},
        envieTags: parseJsonField(est.envie_tags) || [],
        informationsPratiques: parseJsonField(est.informations_pratiques) || [],
        // Conversion snake_case -> camelCase pour compatibilité
        viewsCount: est.views_count || 0,
        likesCount: 0, // À calculer si nécessaire
        prixMoyen: est.price_min && est.price_max ? (est.price_min + est.price_max) / 2 : null,
        createdAt: est.created_at,
        updatedAt: est.updated_at
      };
    });

    // Appliquer le tri selon le filtre
    const sortedEstablishments = applySorting(establishmentsWithData, filter);

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
      filter
    });

  } catch (error) {
    console.error('Erreur chargement tous les établissements:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors du chargement des établissements",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
