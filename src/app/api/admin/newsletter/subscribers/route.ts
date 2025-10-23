import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Construire les conditions de filtrage
    const whereConditions: any = {};

    // Filtre par statut
    switch (status) {
      case 'active':
        whereConditions.newsletterOptIn = true;
        whereConditions.isVerified = true;
        break;
      case 'inactive':
        whereConditions.newsletterOptIn = false;
        break;
      case 'unverified':
        whereConditions.newsletterOptIn = true;
        whereConditions.isVerified = false;
        break;
    }

    // Recherche par email
    if (search) {
      whereConditions.email = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Récupérer les abonnés avec pagination
    const [subscribers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          email: true,
          newsletterOptIn: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          preferences: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereConditions })
    ]);

    return NextResponse.json({
      success: true,
      subscribers: subscribers.map(sub => ({
        ...sub,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ [Newsletter Admin] Erreur récupération abonnés:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des abonnés" },
      { status: 500 }
    );
  }
}
