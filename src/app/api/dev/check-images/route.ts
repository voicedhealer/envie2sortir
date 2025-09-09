import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🖼️  Vérification des images de l\'établissement L Bar...');
    
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
    console.log(`🖼️  Image principale: ${establishment.imageUrl}`);
    console.log(`📸 Images associées: ${establishment.images.length}`);

    // Vérifier les fichiers physiques
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    const physicalFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    console.log(`📁 Fichiers physiques dans uploads: ${physicalFiles.length}`);

    const result = {
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        imageUrl: establishment.imageUrl
      },
      images: establishment.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        createdAt: img.createdAt
      })),
      physicalFiles: physicalFiles,
      issues: [
        !establishment.imageUrl && 'Aucune image principale définie',
        establishment.images.length === 0 && 'Aucune image associée en base',
        physicalFiles.length === 0 && 'Aucun fichier physique trouvé'
      ].filter(Boolean)
    };

    console.log('🚨 Problèmes identifiés:', result.issues);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erreur lors de la vérification des images:', error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification", details: error.message },
      { status: 500 }
    );
  }
}
