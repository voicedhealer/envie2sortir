import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { uploadFile } from '@/lib/supabase/helpers';
import { getMaxImages } from '@/lib/subscription-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: 'Non authentifié ou aucun établissement associé' }, { status: 401 });
    }

    const supabase = createClient();

    // Récupérer l'établissement pour vérifier l'abonnement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Compter les images existantes
    const { count: currentImageCount, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', user.establishmentId);

    if (countError) {
      console.error('Erreur comptage images:', countError);
      return NextResponse.json({ error: 'Erreur lors de la vérification des images' }, { status: 500 });
    }

    // Vérifier les restrictions selon l'abonnement
    const maxImages = getMaxImages(establishment.subscription as 'FREE' | 'PREMIUM');
    const imageCount = currentImageCount || 0;

    if (imageCount >= maxImages) {
      return NextResponse.json({ 
        error: `Limite d'images atteinte. Maximum ${maxImages} image(s) pour un abonnement ${establishment.subscription}`,
        currentCount: imageCount,
        maxAllowed: maxImages
      }, { status: 403 });
    }

    // Traiter le fichier uploadé
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximum: 5MB' 
      }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const storagePath = `establishments/${user.establishmentId}/${fileName}`;

    // Uploader vers Supabase Storage
    const bytes = await file.arrayBuffer();
    const fileBlob = new Blob([bytes], { type: file.type });
    
    const uploadResult = await uploadFile(
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
      return NextResponse.json({ error: 'Erreur lors de l\'upload vers Supabase Storage' }, { status: 500 });
    }

    const imageUrl = uploadResult.data.url;
    const isFirstImage = imageCount === 0;

    // Sauvegarder en base de données
    const { data: image, error: imageError } = await supabase
      .from('images')
      .insert({
        url: imageUrl,
        alt_text: file.name,
        is_primary: isFirstImage,
        establishment_id: user.establishmentId,
        ordre: imageCount
      })
      .select()
      .single();

    if (imageError || !image) {
      // Rollback: supprimer le fichier uploadé
      await supabase.storage.from('images').remove([storagePath]);
      return NextResponse.json({ error: 'Erreur lors de la création de l\'entrée en base de données' }, { status: 500 });
    }

    // Si c'est la première image, la définir comme image principale de l'établissement
    if (isFirstImage) {
      await supabase
        .from('establishments')
        .update({ image_url: imageUrl })
        .eq('id', user.establishmentId);
    }

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        url: image.url,
        altText: image.alt_text,
        isPrimary: image.is_primary
      },
      message: `Image ajoutée avec succès. ${imageCount + 1}/${maxImages} images utilisées.`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload de l\'image' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: 'Non authentifié ou aucun établissement associé' }, { status: 401 });
    }

    const supabase = createClient();

    // Récupérer l'établissement avec ses images
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select(`
        id,
        name,
        subscription,
        image_url,
        images (
          id,
          url,
          alt_text,
          is_primary,
          created_at,
          ordre
        )
      `)
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Trier les images par ordre
    const sortedImages = (establishment.images || []).sort((a: any, b: any) => 
      (a.ordre || 0) - (b.ordre || 0)
    );

    // Convertir snake_case -> camelCase
    const formattedImages = sortedImages.map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      createdAt: img.created_at,
      ordre: img.ordre
    }));

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        subscription: establishment.subscription,
        imageUrl: establishment.image_url,
        images: formattedImages
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des images' 
    }, { status: 500 });
  }
}
