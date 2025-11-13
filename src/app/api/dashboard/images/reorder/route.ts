import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function PUT(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient();
    const { establishmentId, imageOrder } = await request.json();

    console.log('🔄 Réorganisation des images:', {
      establishmentId,
      userId: user.id,
      newOrder: imageOrder
    });

    // Vérifier que l'établissement appartient bien à l'utilisateur
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name, owner_id')
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les images de l'établissement
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('establishment_id', establishmentId);

    if (imagesError) {
      console.error('Erreur récupération images:', imagesError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des images' }, { status: 500 });
    }

    console.log('✅ Établissement trouvé:', establishment.name);
    console.log('📸 Images actuelles:', images?.length || 0);

    // Mettre à jour l'ordre des images
    const updatePromises = imageOrder.map(async (imageUrl: string, index: number) => {
      // Trouver l'image correspondante
      const image = images?.find((img: any) => img.url === imageUrl);
      
      if (image) {
        return supabase
          .from('images')
          .update({ 
            ordre: index,
            is_primary: index === 0
          })
          .eq('id', image.id);
      }
    });

    const results = await Promise.all(updatePromises.filter(Boolean));
    console.log('✅ Nombre d\'images mises à jour:', results.length);

    // Mettre à jour aussi l'image_url principale de l'établissement
    if (imageOrder.length > 0) {
      await supabase
        .from('establishments')
        .update({ image_url: imageOrder[0] })
        .eq('id', establishmentId);
    }

    console.log('✅ Ordre des images mis à jour avec succès');

    return NextResponse.json({
      success: true,
      message: 'Ordre des images mis à jour'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réorganisation des images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réorganisation des images' },
      { status: 500 }
    );
  }
}

