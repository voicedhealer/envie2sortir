import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer l'ID du professionnel depuis la session
    // Pour l'instant, on simule avec un ID fixe pour les tests
    const professionalId = "cmf0ygvkn00008ztdq5rc0bwx"; // ID de test

    // Récupérer le professionnel et son établissement
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        establishments: {
          include: {
            events: {
              orderBy: { startDate: 'asc' }
            },
            images: true
          }
        }
      }
    });

    if (!professional) {
      return NextResponse.json({ error: "Professionnel non trouvé" }, { status: 404 });
    }

    const establishment = professional.establishments[0]; // Premier établissement
    if (!establishment) {
      return NextResponse.json({ error: "Aucun établissement trouvé" }, { status: 404 });
    }

    // Récupérer les interactions utilisateurs (simulation pour l'instant)
    const interactions = [
      {
        id: "1",
        userId: "user1",
        userName: "Marie D.",
        type: "want_to_go" as const,
        createdAt: new Date().toISOString()
      },
      {
        id: "2", 
        userId: "user2",
        userName: "Thomas L.",
        type: "recommend" as const,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        userId: "user3", 
        userName: "Sophie M.",
        type: "perfect_for_today" as const,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    return NextResponse.json({
      professional: {
        id: professional.id,
        firstName: professional.firstName,
        lastName: professional.lastName,
        email: professional.email,
        siret: professional.siret,
        companyName: professional.companyName
      },
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        status: establishment.status,
        description: establishment.description,
        address: establishment.address,
        city: establishment.city,
        viewsCount: establishment.viewsCount,
        clicksCount: establishment.clicksCount,
        avgRating: establishment.avgRating,
        totalComments: establishment.totalComments,
        createdAt: establishment.createdAt.toISOString(),
        updatedAt: establishment.updatedAt.toISOString()
      },
      events: establishment.events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString(),
        price: event.price,
        maxCapacity: event.maxCapacity,
        isRecurring: event.isRecurring,
        status: event.startDate > new Date() ? 'upcoming' : 'completed',
        createdAt: event.createdAt.toISOString()
      })),
      interactions
    });

  } catch (error) {
    console.error('Erreur dashboard pro:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
