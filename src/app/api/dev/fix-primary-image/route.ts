import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('🖼️  Correction de l\'image principale...');
    
    // Chercher l'établissement L Bar
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: "L Bar"
        }
      },
      include: {
        images: true
      }
    });

    if (!establishment) {
      return NextResponse.json({
        error: "Établissement 'L Bar' non trouvé"
      }, { status: 404 });
    }

    console.log(`📊 Établissement trouvé: ${establishment.name}`);
    console.log(`🖼️  Image principale actuelle: ${establishment.imageUrl}`);
    console.log(`📸 Images en base: ${establishment.images.length}`);

    // Trouver l'image principale
    const primaryImage = establishment.images.find(img => img.isPrimary);
    
    if (primaryImage && !establishment.imageUrl) {
      // Mettre à jour l'établissement avec l'image principale
      await prisma.establishment.update({
        where: { id: establishment.id },
        data: { imageUrl: primaryImage.url }
      });
      
      console.log(`✅ Image principale mise à jour: ${primaryImage.url}`);
      
      return NextResponse.json({
        success: true,
        message: "Image principale mise à jour",
        establishment: {
          id: establishment.id,
          name: establishment.name,
          imageUrl: primaryImage.url
        },
        primaryImage: {
          id: primaryImage.id,
          url: primaryImage.url
        }
      });
    } else if (establishment.imageUrl) {
      return NextResponse.json({
        success: true,
        message: "Image principale déjà définie",
        establishment: {
          id: establishment.id,
          name: establishment.name,
          imageUrl: establishment.imageUrl
        }
      });
    } else {
      return NextResponse.json({
        error: "Aucune image principale trouvée"
      }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Erreur lors de la correction de l\'image principale:', error);
    return NextResponse.json(
      { error: "Erreur lors de la correction", details: error.message },
      { status: 500 }
    );
  }
}
