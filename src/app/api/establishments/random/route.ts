import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const city = searchParams.get('city');
    
    console.log('🎲 Récupération d\'établissements aléatoires...');
    console.log(`   - Limite: ${limit}`);
    console.log(`   - Ville: ${city || 'Toutes'}`);
    
    // Construire les conditions de recherche
    const whereConditions: any = {
      status: 'active'
    };
    
    // Filtrer par ville si spécifiée
    if (city) {
      whereConditions.city = {
        contains: city,
        mode: 'insensitive'
      };
    }
    
    // Récupérer les établissements
    const establishments = await prisma.establishment.findMany({
      where: whereConditions,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        events: {
          where: { 
            startDate: { gte: new Date() }
          },
          orderBy: { startDate: 'asc' },
          take: 3
        },
        _count: {
          select: {
            favorites: true,
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    console.log(`✅ ${establishments.length} établissements trouvés`);
    
    // Formater la réponse
    const formattedEstablishments = establishments.map(est => ({
      id: est.id,
      name: est.name,
      slug: est.slug,
      address: est.address,
      city: est.city,
      description: est.description,
      latitude: est.latitude,
      longitude: est.longitude,
      phone: est.phone,
      email: est.email,
      website: est.website,
      instagram: est.instagram,
      facebook: est.facebook,
      tiktok: est.tiktok,
      activities: est.activities,
      services: est.services,
      ambiance: est.ambiance,
      horairesOuverture: est.horairesOuverture,
      priceMin: est.priceMin,
      priceMax: est.priceMax,
      accessibilite: est.accessibilite,
      parking: est.parking,
      terrasse: est.terrasse,
      status: est.status,
      subscription: est.subscription,
      viewsCount: est.viewsCount,
      clicksCount: est.clicksCount,
      avgRating: est.avgRating,
      totalComments: est.totalComments,
      imageUrl: est.imageUrl,
      images: est.images,
      events: est.events,
      rating: est.avgRating,
      reviewCount: est.totalComments,
      favoriteCount: est._count.favorites,
      likeCount: est._count.likes,
      commentCount: est._count.comments
    }));
    
    return NextResponse.json({
      success: true,
      establishments: formattedEstablishments,
      count: establishments.length
    });
    
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