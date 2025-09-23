import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const filter = searchParams.get('filter') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    console.log(`🏢 TOUS LES ÉTABLISSEMENTS - Filtre: ${filter}, Page: ${page}, Limite: ${limit}`);

    // Charger tous les établissements actifs
    const establishments = await prisma.establishment.findMany({
      where: {
        status: 'active',
        latitude: { not: null },
        longitude: { not: null }
      },
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

    // Appliquer le tri selon le filtre
    const sortedEstablishments = applySorting(establishments, filter);

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
