import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer tous les établissements en attente avec les infos du propriétaire
    const pendingEstablishments = await prisma.establishment.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        professionalOwner: {
          select: {
            companyName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(pendingEstablishments);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des demandes",
      },
      { status: 500 }
    );
  }
}
