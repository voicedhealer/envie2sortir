import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🧪 Test de l\'API d\'upload d\'images...');
    
    // Vérifier que le dossier uploads existe
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadsExists = fs.existsSync(uploadsDir);
    
    console.log(`📁 Dossier uploads existe: ${uploadsExists}`);
    console.log(`📁 Chemin: ${uploadsDir}`);
    
    if (uploadsExists) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`📄 Fichiers dans uploads: ${files.length}`);
      console.log(`📄 Liste: ${files.join(', ')}`);
    }
    
    // Vérifier les permissions d'écriture
    let canWrite = false;
    try {
      const testFile = path.join(uploadsDir, 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      canWrite = true;
    } catch (error) {
      console.log('❌ Impossible d\'écrire dans le dossier uploads');
    }
    
    console.log(`✍️  Permissions d'écriture: ${canWrite}`);
    
    return NextResponse.json({
      success: true,
      uploadsDir,
      uploadsExists,
      canWrite,
      filesCount: uploadsExists ? fs.readdirSync(uploadsDir).length : 0
    });

  } catch (error: any) {
    console.error('Erreur test upload:', error);
    return NextResponse.json(
      { error: "Erreur lors du test", details: error.message },
      { status: 500 }
    );
  }
}
