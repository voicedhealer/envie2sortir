import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';

const PDF_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf'],
  allowedExtensions: ['.pdf']
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const establishmentId = formData.get('establishmentId') as string;
    const fileType = formData.get('fileType') as string; // 'image' ou 'pdf'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        ownerId: session.user.id 
      },
      select: { 
        id: true, 
        subscription: true,
        name: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable ou accès refusé' }, { status: 404 });
    }

    // Vérifier que l'établissement est premium
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Validation du fichier selon le type
    let fileValidation;
    if (fileType === 'pdf') {
      fileValidation = validateFile(file, PDF_VALIDATION);
    } else {
      fileValidation = validateFile(file, IMAGE_VALIDATION);
    }

    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    // Créer le dossier deals s'il n'existe pas
    const dealsDir = join(process.cwd(), 'public', 'uploads', 'deals');
    if (!existsSync(dealsDir)) {
      await mkdir(dealsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // Chemin complet du fichier
    const filePath = join(dealsDir, fileName);
    
    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retourner l'URL publique
    const fileUrl = `/uploads/deals/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      fileUrl,
      fileName
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload du fichier' 
    }, { status: 500 });
  }
}

