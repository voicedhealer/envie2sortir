import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment, uploadFileAdmin } from '@/lib/supabase/helpers';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    // Vérifier l'authentification et que l'utilisateur est un professionnel
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: 'Non authentifié ou aucun établissement associé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      const responseTime = Date.now() - startTime;
      recordAPIMetric('/api/upload/event-image', 'POST', 400, responseTime, { ipAddress });
      
      await requestLogger.warn('No file provided for event image upload', {
        establishmentId: user.establishmentId,
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
        establishmentId: user.establishmentId,
        ipAddress
      });

      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier que l'établissement existe et est Premium
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name, owner_id')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment) {
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

    // Log pour debug RLS
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log('🔐 Auth UID:', authUser?.id);
    console.log('🏢 Establishment owner_id:', establishment.owner_id);
    console.log('🏢 Establishment ID:', user.establishmentId);
    console.log('✅ Match?', authUser?.id === establishment.owner_id);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // Chemin dans Supabase Storage : events/{establishmentId}/{fileName}
    const storagePath = `events/${user.establishmentId}/${fileName}`;
    console.log('📁 Storage path:', storagePath);
    
    // Convertir le fichier en Blob
    const bytes = await file.arrayBuffer();
    const fileBlob = new Blob([bytes], { type: file.type });
    
    // Uploader vers Supabase Storage avec les droits admin pour bypass RLS
    const uploadResult = await uploadFileAdmin(
      'images',
      storagePath,
      fileBlob,
      {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      }
    );

    if (uploadResult.error || !uploadResult.data) {
      console.error('Erreur upload Supabase:', uploadResult.error);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'upload vers Supabase Storage' 
      }, { status: 500 });
    }

    const imageUrl = uploadResult.data.url;

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/upload/event-image', 'POST', 200, responseTime, {
      establishmentId: user.establishmentId,
      ipAddress
    });

    await requestLogger.info('Event image uploaded successfully', {
      establishmentId: user.establishmentId,
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
