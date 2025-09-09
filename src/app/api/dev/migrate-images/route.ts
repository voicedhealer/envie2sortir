import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('🖼️  Migration des images existantes vers la base de données...');
    
    // Chercher l'établissement L Bar
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: "L Bar"
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({
        error: "Établissement 'L Bar' non trouvé"
      }, { status: 404 });
    }

    console.log(`📊 Établissement trouvé: ${establishment.name} (ID: ${establishment.id})`);

    // Vérifier les fichiers physiques
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({
        error: "Dossier uploads non trouvé"
      }, { status: 404 });
    }

    const physicalFiles = fs.readdirSync(uploadsDir)
      .filter((file: string) => file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'))
      .filter((file: string) => !file.includes('examples'));

    console.log(`📁 Fichiers images trouvés: ${physicalFiles.length}`);
    console.log(`📁 Liste: ${physicalFiles.join(', ')}`);

    // Vérifier les images déjà en base
    const existingImages = await prisma.image.findMany({
      where: { establishmentId: establishment.id }
    });

    console.log(`📸 Images déjà en base: ${existingImages.length}`);

    let migratedCount = 0;
    const results = [];

    for (const fileName of physicalFiles) {
      const imageUrl = `/uploads/${fileName}`;
      
      // Vérifier si l'image existe déjà en base
      const existingImage = existingImages.find(img => img.url === imageUrl);
      
      if (existingImage) {
        console.log(`⏭️  Image déjà en base: ${fileName}`);
        results.push({
          fileName,
          status: 'already_exists',
          imageId: existingImage.id
        });
        continue;
      }

      try {
        // Créer l'entrée en base de données
        const imageRecord = await prisma.image.create({
          data: {
            url: imageUrl,
            altText: fileName,
            establishmentId: establishment.id,
            isPrimary: migratedCount === 0, // Première image = image principale
            ordre: migratedCount
          }
        });

        console.log(`✅ Image migrée: ${fileName} → ID: ${imageRecord.id}`);
        migratedCount++;
        
        results.push({
          fileName,
          status: 'migrated',
          imageId: imageRecord.id,
          isPrimary: migratedCount === 1
        });

      } catch (error) {
        console.error(`❌ Erreur migration ${fileName}:`, error);
        results.push({
          fileName,
          status: 'error',
          error: error.message
        });
      }
    }

    // Mettre à jour l'image principale de l'établissement si nécessaire
    if (migratedCount > 0 && !establishment.imageUrl) {
      const firstImage = results.find(r => r.isPrimary);
      if (firstImage) {
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: { imageUrl: `/uploads/${firstImage.fileName}` }
        });
        console.log(`✅ Image principale mise à jour: ${firstImage.fileName}`);
      }
    }

    console.log(`🎉 Migration terminée: ${migratedCount} images migrées`);

    return NextResponse.json({
      success: true,
      message: `${migratedCount} images migrées`,
      establishment: {
        id: establishment.id,
        name: establishment.name
      },
      totalFiles: physicalFiles.length,
      migratedCount,
      results
    });

  } catch (error: any) {
    console.error('Erreur lors de la migration des images:', error);
    return NextResponse.json(
      { error: "Erreur lors de la migration", details: error.message },
      { status: 500 }
    );
  }
}
