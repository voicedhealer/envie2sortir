import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/admin/professionals - Récupérer la liste des professionnels (pour admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
        siret: true,
      },
      orderBy: {
        companyName: "asc",
      },
    });

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error("Erreur lors de la récupération des professionnels:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

