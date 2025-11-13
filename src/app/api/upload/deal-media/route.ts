import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { uploadFile } from '@/lib/supabase/helpers';

const PDF_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf'],
  allowedExtensions: ['.pdf']
};

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
    const fileType = formData.get('fileType') as string; // 'image' ou 'pdf'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name')
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
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

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // Chemin dans Supabase Storage : deals/{establishmentId}/{fileName}
    const storagePath = `deals/${establishmentId}/${fileName}`;
    
    // Convertir le fichier en Blob
    const bytes = await file.arrayBuffer();
    const fileBlob = new Blob([bytes], { type: file.type });
    
    // Uploader vers Supabase Storage (bucket 'menus' pour les PDF, 'images' pour les images)
    const bucket = fileType === 'pdf' ? 'menus' : 'images';
    
    const uploadResult = await uploadFile(
      bucket,
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

    const fileUrl = uploadResult.data.url;
    
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



