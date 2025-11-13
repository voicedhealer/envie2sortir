import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé - Session manquante' }, { status: 401 });
    }

    const supabase = createClient();
    const { imageId, establishmentId } = await request.json();

    console.log('📥 Requête:', { imageId, establishmentId });

    if (!imageId || !establishmentId) {
      return NextResponse.json({ error: 'Image ID et Establishment ID requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, owner_id')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    if (establishment.owner_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé - Vous n\'êtes pas le propriétaire' }, { status: 403 });
    }

    // Retirer is_card_image de toutes les images de cet établissement
    await supabase
      .from('images')
      .update({ is_card_image: false })
      .eq('establishment_id', establishmentId)
      .eq('is_card_image', true);

    // Définir la nouvelle image de card
    const { data: updatedImage, error: updateError } = await supabase
      .from('images')
      .update({ is_card_image: true })
      .eq('id', imageId)
      .select()
      .single();

    if (updateError || !updatedImage) {
      console.error('Erreur mise à jour image:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'image' }, { status: 500 });
    }

    console.log('✅ Image de card définie:', imageId);

    // Convertir snake_case -> camelCase
    const formattedImage = {
      ...updatedImage,
      establishmentId: updatedImage.establishment_id,
      isCardImage: updatedImage.is_card_image,
      isPrimary: updatedImage.is_primary,
      createdAt: updatedImage.created_at,
      updatedAt: updatedImage.updated_at
    };

    return NextResponse.json({
      success: true,
      message: 'Image de card définie avec succès',
      image: formattedImage,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la définition de l\'image de card:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Erreur lors de la définition de l\'image de card',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

