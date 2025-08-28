import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Compter les établissements par statut
    const [pendingCount, activeCount] = await Promise.all([
      prisma.establishment.count({
        where: { status: "pending" },
      }),
      prisma.establishment.count({
        where: { status: "active" },
      }),
    ]);

    // Récupérer les 5 derniers établissements inscrits
    const recentEstablishments = await prisma.establishment.findMany({
      where: { status: "pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        professionalOwner: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json({
      pendingCount,
      activeCount,
      recentEstablishments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des statistiques",
      },
      { status: 500 }
    );
  }
}
