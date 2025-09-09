import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API pour récupérer les événements publics d'un établissement
 * GET: Récupère tous les événements à venir d'un établissement
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Récupérer l'établissement par son slug
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { 
        id: true, 
        subscription: true,
        status: true 
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Vérifier que l'établissement est actif
    if (establishment.status !== 'active') {
      return NextResponse.json({ error: "Établissement non disponible" }, { status: 404 });
    }

    // Vérifier que l'établissement est Premium (pour les événements)
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ events: [] }); // Retourner un tableau vide pour les comptes Standard
    }

    // Récupérer les événements à venir de l'établissement
    const events = await prisma.event.findMany({
      where: { 
        establishmentId: establishment.id,
        startDate: {
          gte: new Date() // Seulement les événements à venir
        }
      },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
        price: true,
        maxCapacity: true
      }
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
