import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';
import { getMaxImages } from '@/lib/subscription-utils';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const establishmentId = formData.get('establishmentId') as string;
    
    if (!file) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('No file provided for upload', {
        establishmentId,
        ipAddress
      });

      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('No establishment ID provided for upload', {
        ipAddress
      });

      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    // Validation sécurisée du fichier
    const fileValidation = validateFile(file, IMAGE_VALIDATION);
    if (!fileValidation.valid) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('Invalid file upload attempt', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: fileValidation.error,
        ipAddress
      });

      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
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

    const maxImages = getMaxImages(establishment.subscription);
    
    if (existingImagesCount >= maxImages) {
      const planName = establishment.subscription === 'PREMIUM' ? 'Premium' : 'Standard';
      return NextResponse.json({ 
        error: `Limite d'images atteinte pour le plan ${planName}. Maximum: ${maxImages} image${maxImages > 1 ? 's' : ''}.`,
        subscription: establishment.subscription,
        currentCount: existingImagesCount,
        maxAllowed: maxImages
      }, { status: 403 });
    }

    console.log(`📸 Upload autorisé pour ${establishment.name} (${establishment.subscription}): ${existingImagesCount + 1}/${maxImages} images`);

    // Le fichier a déjà été validé avec validateFile() plus haut

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

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/upload/image', 'POST', 200, responseTime, {
      establishmentId,
      ipAddress
    });

    await requestLogger.info('Image uploaded successfully', {
      establishmentId,
      imageId: imageRecord.id,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      responseTime
    });
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName,
      imageId: imageRecord.id
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/upload/image', 'POST', 500, responseTime, { ipAddress });
    
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

    await requestLogger.error('Image upload failed', {
      error: errorMessage,
      ipAddress
    }, error);
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
