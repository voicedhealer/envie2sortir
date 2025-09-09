import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer tous les tags
    const tags = await prisma.etablissementTag.findMany({
      include: {
        etablissement: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Récupérer un établissement avec ses tags
    const establishment = await prisma.establishment.findFirst({
      include: {
        tags: true
      }
    });

    return NextResponse.json({
      totalTags: tags.length,
      tags: tags.slice(0, 10), // Limiter à 10 pour la lisibilité
      establishmentWithTags: establishment
    });

  } catch (error) {
    console.error('Erreur vérification tags:', error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification des tags" },
      { status: 500 }
    );
  }
}

