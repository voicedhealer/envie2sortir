import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createClient } from '@/lib/supabase/server';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';
import { getMaxImages } from '@/lib/subscription-utils';
import { uploadFileAdmin } from '@/lib/supabase/helpers';

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

    const supabase = await createClient();

    // Vérifier que l'établissement existe et récupérer son plan d'abonnement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier les restrictions d'abonnement pour l'upload d'images
    const { count: existingImagesCount, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', establishmentId);

    if (countError) {
      console.error('Erreur comptage images:', countError);
      return NextResponse.json({ error: 'Erreur lors de la vérification des images' }, { status: 500 });
    }

    const maxImages = getMaxImages(establishment.subscription as 'FREE' | 'PREMIUM');
    
    if ((existingImagesCount || 0) >= maxImages) {
      const planName = establishment.subscription === 'PREMIUM' ? 'Premium' : 'Basic';
      return NextResponse.json({ 
        error: `Limite d'images atteinte pour le plan ${planName}. Maximum: ${maxImages} image${maxImages > 1 ? 's' : ''}.`,
        subscription: establishment.subscription,
        currentCount: existingImagesCount || 0,
        maxAllowed: maxImages
      }, { status: 403 });
    }

    console.log(`📸 Upload autorisé pour ${establishment.name} (${establishment.subscription}): ${(existingImagesCount || 0) + 1}/${maxImages} images`);

    // Le fichier a déjà été validé avec validateFile() plus haut

    // Créer le dossier temporaire pour l'optimisation
    const tempDir = join(process.cwd(), 'temp', 'uploads');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Sauvegarder le fichier temporaire
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const tempFileName = `${timestamp}_${randomString}.${extension}`;
    const tempFilePath = join(tempDir, tempFileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // Créer le dossier de sortie pour les images d'établissement
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Optimiser l'image pour les établissements (temporairement en local)
    const { generateAllImageVariants } = await import('@/lib/image-management');
    const result = await generateAllImageVariants(
      tempFilePath, 
      uploadsDir, 
      'establishment'
    );

    if (!result.success) {
      await unlink(tempFilePath).catch(() => {});
      return NextResponse.json({ 
        error: 'Erreur lors de l\'optimisation de l\'image' 
      }, { status: 500 });
    }

    // Utiliser la variante 'hero' pour l'image principale
    const heroImagePath = result.variants.hero;
    const fileName = heroImagePath.split('/').pop() || '';
    
    console.log(`🏢 Image d'établissement optimisée: ${result.totalSavingsPercentage.toFixed(1)}% d'économie`);

    // Lire le fichier optimisé et l'uploader vers Supabase Storage
    const optimizedFile = await import('fs/promises').then(fs => fs.readFile(heroImagePath));
    const fileBlob = new Blob([optimizedFile], { type: file.type });
    
    // Chemin dans Supabase Storage : establishments/{establishmentId}/{fileName}
    const storagePath = `establishments/${establishmentId}/${fileName}`;
    
    // Utiliser le client admin pour contourner RLS lors de l'upload
    const uploadResult = await uploadFileAdmin(
      'establishments',
      storagePath,
      fileBlob,
      {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      }
    );

    // Nettoyer les fichiers temporaires
    await unlink(tempFilePath).catch(() => {});
    await unlink(heroImagePath).catch(() => {});

    if (uploadResult.error || !uploadResult.data) {
      console.error('Erreur upload Supabase:', uploadResult.error);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'upload vers Supabase Storage',
        details: uploadResult.error instanceof Error ? uploadResult.error.message : String(uploadResult.error),
        code: (uploadResult.error as any)?.statusCode || (uploadResult.error as any)?.code
      }, { status: 500 });
    }

    const imageUrl = uploadResult.data.url;
    
    // Créer le client admin pour l'insertion en base de données (contourne RLS)
    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }
    
    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Compter le nombre d'images existantes pour définir l'ordre
    const { count: totalImagesCount } = await adminClient
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', establishmentId);
    
    const nextOrdre = totalImagesCount || 0;
    const isFirstImage = nextOrdre === 0;
    
    console.log('📊 Images existantes:', totalImagesCount, '→ Prochain ordre:', nextOrdre);
    
    // Créer l'entrée en base de données avec le client admin
    const { data: imageRecord, error: imageError } = await adminClient
      .from('images')
      .insert({
        url: imageUrl,
        alt_text: file.name,
        establishment_id: establishmentId,
        is_primary: isFirstImage, // Seulement la première image est "primary"
        ordre: nextOrdre
      })
      .select()
      .single();

    if (imageError || !imageRecord) {
      // Rollback: supprimer le fichier uploadé
      await adminClient.storage.from('establishments').remove([storagePath]);
      
      console.error('Erreur création entrée image:', imageError);
      return NextResponse.json({ 
        error: 'Erreur lors de la création de l\'entrée en base de données',
        details: imageError?.message || 'Erreur inconnue',
        code: imageError?.code
      }, { status: 500 });
    }

    // Mettre à jour l'imageUrl de l'établissement avec le client admin
    await adminClient
      .from('establishments')
      .update({ image_url: imageUrl })
      .eq('id', establishmentId);

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
