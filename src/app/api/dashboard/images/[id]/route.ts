import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { deleteFile } from '@/lib/supabase/helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: 'Non authentifié ou aucun établissement associé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;
    
    // Récupérer l'image avec l'établissement associé
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select(`
        id,
        url,
        establishment_id,
        establishments!images_establishment_id_fkey (
          id,
          owner_id
        )
      `)
      .eq('id', id)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const establishment = Array.isArray(image.establishments) ? image.establishments[0] : image.establishments;
    if (!establishment || establishment.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Extraire le chemin du fichier depuis l'URL Supabase Storage
    // Format URL: https://...supabase.co/storage/v1/object/public/establishments/path/to/file.jpg
    const urlParts = image.url.split('/');
    const bucketIndex = urlParts.indexOf('establishments');
    const storagePath = bucketIndex >= 0 ? urlParts.slice(bucketIndex + 1).join('/') : '';

    // Utiliser le client admin pour contourner RLS
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

    // Supprimer le fichier de Supabase Storage avec le client admin
    if (storagePath) {
      const { error: storageError } = await adminClient.storage
        .from('establishments')
        .remove([storagePath]);
        
      if (storageError) {
        console.warn('⚠️ Impossible de supprimer le fichier de Supabase Storage:', storageError);
        // Continuer même si le fichier n'existe pas
      } else {
        console.log('🗑️ Fichier supprimé de Supabase Storage:', storagePath);
      }
    }

    // Supprimer l'image de la base de données avec le client admin
    const { error: deleteError } = await adminClient
      .from('images')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erreur suppression image:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'image' }, { status: 500 });
    }

    // Vérifier s'il reste des images pour cet établissement
    const { data: remainingImages, error: remainingError } = await adminClient
      .from('images')
      .select('url')
      .eq('establishment_id', establishment.id)
      .order('created_at', { ascending: false });

    // Mettre à jour l'imageUrl de l'établissement avec le client admin
    if (remainingImages && remainingImages.length > 0) {
      // Utiliser la première image restante
      await adminClient
        .from('establishments')
        .update({ image_url: remainingImages[0].url })
        .eq('id', establishment.id);
      console.log('✅ ImageUrl de l\'établissement mise à jour avec:', remainingImages[0].url);
    } else {
      // Aucune image restante, vider l'imageUrl
      await adminClient
        .from('establishments')
        .update({ image_url: null })
        .eq('id', establishment.id);
      console.log('✅ ImageUrl de l\'établissement vidée (aucune image restante)');
    }

    console.log('✅ Image supprimée de la base de données:', id);

    return NextResponse.json({ 
      message: 'Image supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression de l\'image' 
    }, { status: 500 });
  }
}
