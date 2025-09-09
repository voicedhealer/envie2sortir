import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Trouver l'établissement "La Pièce Unique Dijon"
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: "Pièce Unique"
        }
      },
      include: {
        tags: true
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement 'La Pièce Unique Dijon' non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        status: establishment.status,
        latitude: establishment.latitude,
        longitude: establishment.longitude,
        address: establishment.address,
        tagsCount: establishment.tags.length,
        tags: establishment.tags.map(tag => ({
          tag: tag.tag,
          typeTag: tag.typeTag,
          poids: tag.poids
        }))
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la vérification de l\'établissement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'établissement", details: error.message },
      { status: 500 }
    );
  }
}

