import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès professionnel requis' }, { status: 403 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: 'Aucun établissement associé' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/event-image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('No file provided for event image upload', {
        establishmentId: session.user.establishmentId,
        ipAddress
      });

      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validation sécurisée du fichier
    const fileValidation = validateFile(file, IMAGE_VALIDATION);
    if (!fileValidation.valid) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/event-image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('Invalid event image upload attempt', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: fileValidation.error,
        establishmentId: session.user.establishmentId,
        ipAddress
      });

      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    // Vérifier que l'établissement existe et est Premium
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: { 
        id: true, 
        subscription: true,
        name: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier l'accès Premium pour les événements
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Fonctionnalité réservée aux abonnements Premium',
        subscription: establishment.subscription
      }, { status: 403 });
    }

    console.log(`📸 Upload d'image d'événement autorisé pour ${establishment.name} (${establishment.subscription})`);

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

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/upload/event-image', 'POST', 200, responseTime, {
      establishmentId: session.user.establishmentId,
      ipAddress
    });

    await requestLogger.info('Event image uploaded successfully', {
      establishmentId: session.user.establishmentId,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      responseTime
    });
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/upload/event-image', 'POST', 500, responseTime, { ipAddress });
    
    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur lors de l\'upload de l\'image d\'événement';
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        errorMessage = 'Erreur de permissions sur le dossier d\'upload';
      } else if (error.message.includes('ENOSPC')) {
        errorMessage = 'Espace disque insuffisant';
      } else {
        errorMessage = error.message;
      }
    }

    await requestLogger.error('Event image upload failed', {
      error: errorMessage,
      ipAddress
    }, error);
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
