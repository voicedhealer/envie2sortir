import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { generateAllImageVariants, cleanupTempFiles } from '@/lib/image-management';
import { uploadFileAdmin } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et que l'utilisateur est un professionnel
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const establishmentId = formData.get('establishmentId') as string;
    const imageType = formData.get('imageType') as string; // 'establishment', 'deals', 'menus'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    // Validation du fichier
    const fileValidation = validateFile(file, IMAGE_VALIDATION);
    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name')
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ 
        error: 'Établissement introuvable ou accès refusé' 
      }, { status: 404 });
    }

    // Créer le dossier temporaire
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

    // Créer le dossier de sortie selon le type
    const outputDir = join(process.cwd(), 'public', 'uploads', imageType);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    console.log(`🖼️  Upload optimisé pour ${establishment.name} (${imageType})`);

    // Générer toutes les variantes optimisées
    const result = await generateAllImageVariants(
      tempFilePath, 
      outputDir, 
      imageType as 'establishment' | 'deals' | 'menus'
    );

    // Nettoyer le fichier temporaire
    await cleanupTempFiles(tempFilePath);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Erreur lors de l\'optimisation de l\'image' 
      }, { status: 500 });
    }

    // Uploader toutes les variantes vers Supabase Storage
    const variants: Record<string, string> = {};
    const uploadPromises = [];

    for (const [variant, path] of Object.entries(result.variants)) {
      const fileName = path.split('/').pop() || '';
      const storagePath = `${imageType}/${establishmentId}/${fileName}`;
      
      // Lire le fichier optimisé
      const optimizedFile = await import('fs/promises').then(fs => fs.readFile(path));
      
      // Uploader vers Supabase Storage (client admin pour contourner RLS)
      uploadPromises.push(
        uploadFileAdmin('images', storagePath, optimizedFile, {
          cacheControl: '3600',
          contentType: 'image/webp',
          upsert: false
        }).then(uploadResult => {
          if (uploadResult.data) {
            variants[variant] = uploadResult.data.url;
          }
          // Nettoyer le fichier local
          return unlink(path).catch(() => {});
        })
      );
    }

    await Promise.all(uploadPromises);

    if (Object.keys(variants).length === 0) {
      console.error('❌ Aucune variante uploadée pour', { establishmentId, imageType, resultKeys: Object.keys(result.variants) });
      return NextResponse.json(
        { error: "Échec de l'upload des images optimisées" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      variants,
      totalSavings: result.totalSavings,
      totalSavingsPercentage: result.totalSavingsPercentage,
      message: `Image optimisée avec ${result.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload optimisé:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload de l\'image' 
    }, { status: 500 });
  }
}
