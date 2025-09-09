import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const establishmentId = formData.get('establishmentId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    // Vérifier que l'établissement existe et récupérer son plan d'abonnement
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { 
        id: true, 
        subscription: true,
        name: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier les restrictions d'abonnement pour l'upload d'images
    const existingImagesCount = await prisma.image.count({
      where: { establishmentId: establishmentId }
    });

    const maxImages = establishment.subscription === 'PREMIUM' ? 10 : 1;
    
    if (existingImagesCount >= maxImages) {
      const planName = establishment.subscription === 'PREMIUM' ? 'Premium' : 'Gratuit';
      return NextResponse.json({ 
        error: `Limite d'images atteinte pour le plan ${planName}. Maximum: ${maxImages} image${maxImages > 1 ? 's' : ''}.`,
        subscription: establishment.subscription,
        currentCount: existingImagesCount,
        maxAllowed: maxImages
      }, { status: 403 });
    }

    console.log(`📸 Upload autorisé pour ${establishment.name} (${establishment.subscription}): ${existingImagesCount + 1}/${maxImages} images`);

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP' 
      }, { status: 400 });
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximum: 5MB' 
      }, { status: 400 });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // Chemin complet du fichier
    const filePath = join(uploadsDir, fileName);
    
    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retourner l'URL publique
    const imageUrl = `/uploads/${fileName}`;
    
    // Créer l'entrée en base de données
    const imageRecord = await prisma.image.create({
      data: {
        url: imageUrl,
        altText: file.name,
        establishmentId: establishmentId,
        isPrimary: true, // Marquer comme image principale
        ordre: 0
      }
    });

    // Mettre à jour l'imageUrl de l'établissement
    await prisma.establishment.update({
      where: { id: establishmentId },
      data: { imageUrl: imageUrl }
    });

    console.log('✅ Image créée en base:', imageRecord.id);
    console.log('✅ ImageUrl de l\'établissement mise à jour:', imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName,
      imageId: imageRecord.id
    });

  } catch (error) {
    console.error('Erreur upload image:', error);
    
    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur lors de l\'upload de l\'image';
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        errorMessage = 'Erreur de permissions sur le dossier d\'upload';
      } else if (error.message.includes('ENOSPC')) {
        errorMessage = 'Espace disque insuffisant';
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'ID d\'établissement invalide';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
