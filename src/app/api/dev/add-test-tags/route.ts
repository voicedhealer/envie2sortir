import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('🏷️  Ajout de tags de test pour "La Pièce Unique Dijon"...');
    
    // Trouver l'établissement "La Pièce Unique Dijon"
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: "Pièce Unique"
        }
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement 'La Pièce Unique Dijon' non trouvé" },
        { status: 404 }
      );
    }

    console.log(`📍 Établissement trouvé: ${establishment.name} (ID: ${establishment.id})`);

    // Tags de test pour roller
    const testTags = [
      { tag: "roller", typeTag: "manuel", poids: 10 },
      { tag: "roller dance", typeTag: "manuel", poids: 10 },
      { tag: "piste roller", typeTag: "manuel", poids: 10 },
      { tag: "patin à roulettes", typeTag: "manuel", poids: 10 },
      { tag: "famille", typeTag: "manuel", poids: 8 },
      { tag: "amis", typeTag: "manuel", poids: 8 },
      { tag: "soirée", typeTag: "manuel", poids: 7 },
      { tag: "loisir", typeTag: "manuel", poids: 7 }
    ];

    // Créer les tags
    const tagsToCreate = testTags.map(tagData => ({
      etablissementId: establishment.id,
      tag: tagData.tag,
      typeTag: tagData.typeTag,
      poids: tagData.poids
    }));

    await prisma.etablissementTag.createMany({
      data: tagsToCreate
    });

    console.log(`✅ ${testTags.length} tags créés pour ${establishment.name}`);

    return NextResponse.json({
      success: true,
      message: `${testTags.length} tags créés pour ${establishment.name}`,
      establishment: {
        id: establishment.id,
        name: establishment.name
      },
      tagsCreated: testTags.length
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'ajout des tags de test:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout des tags de test", details: error.message },
      { status: 500 }
    );
  }
}

