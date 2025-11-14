import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment, getProfessionalEstablishment } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = await createClient();
    const establishmentId = (user as any).establishmentId || null;

    console.log('📸 [GET] Images API - user context:', {
      userId: user.id,
      establishmentId,
      hasProfessional: user.userType === 'professional'
    });

    // Préparer la requête pour récupérer l'établissement
    let query = supabase
      .from('establishments')
      .select(`
        id,
        name,
        slug,
        image_url,
        images (
          id,
          url,
          is_primary,
          is_card_image,
          created_at,
          ordre
        )
      `)
      .limit(1);

    if (establishmentId) {
      query = query.eq('id', establishmentId);
    } else {
      query = query.eq('owner_id', user.id);
    }

    const { data: establishment, error: establishmentError } = await query.single();

    let finalEstablishment = establishment;
    if (establishmentError || !establishment) {
      console.error('❌ [GET] Établissement non trouvé via client standard', {
        establishmentId,
        ownerId: user.id,
        error: establishmentError
      });

      // Fallback avec client admin (contourne RLS éventuels)
      const fallbackEstablishment = await getProfessionalEstablishment(user.id);
      if (!fallbackEstablishment) {
        return NextResponse.json({ 
          error: "Établissement non trouvé",
          details: establishmentError?.message
        }, { status: 404 });
      }

      finalEstablishment = fallbackEstablishment;

      // Récupérer les images séparément
      const { data: adminImages } = await supabase
        .from('images')
        .select('id, url, is_primary, is_card_image, created_at, ordre')
        .eq('establishment_id', fallbackEstablishment.id)
        .order('ordre', { ascending: true });

      finalEstablishment.images = adminImages || [];
    }

    // Trier les images par ordre
    const sortedImages = (finalEstablishment.images || []).sort((a: any, b: any) => 
      (a.ordre || 0) - (b.ordre || 0)
    );

    return NextResponse.json({
      establishment: {
        id: finalEstablishment.id,
        name: finalEstablishment.name,
        slug: finalEstablishment.slug,
        imageUrl: finalEstablishment.image_url,
        images: sortedImages.map((img: any) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.is_primary,
          isCardImage: img.is_card_image,
          createdAt: img.created_at,
          ordre: img.ordre
        }))
      }
    });

  } catch (error) {
    console.error("❌ Erreur récupération images:", error);
    return NextResponse.json({ 
      error: "Erreur serveur",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = await createClient();
    const establishmentId = (user as any).establishmentId || null;

    console.log('📸 [PUT] Images API - user context:', {
      userId: user.id,
      establishmentId,
      hasProfessional: user.userType === 'professional'
    });

    let query = supabase
      .from('establishments')
      .select('id, name, status, image_url')
      .limit(1);

    if (establishmentId) {
      query = query.eq('id', establishmentId);
    } else {
      query = query.eq('owner_id', user.id);
    }

    const { data: establishment, error: establishmentError } = await query.single();

    if (establishmentError || !establishment) {
      console.error('❌ [PUT] Établissement non trouvé', {
        establishmentId,
        ownerId: user.id,
        error: establishmentError
      });
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 404 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de l'image requise" }, { status: 400 });
    }

    // Mettre à jour l'image principale
    // 1. Mettre à jour l'imageUrl de l'établissement
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', establishment.id);

    if (updateError) {
      console.error('Erreur mise à jour image_url:', updateError);
      return NextResponse.json({ 
        error: "Erreur serveur"
      }, { status: 500 });
    }

    // 2. Marquer toutes les images comme non-principales
    await supabase
      .from('images')
      .update({ is_primary: false })
      .eq('establishment_id', establishment.id);

    // 3. Marquer l'image sélectionnée comme principale
    await supabase
      .from('images')
      .update({ is_primary: true })
      .eq('establishment_id', establishment.id)
      .eq('url', imageUrl);

    return NextResponse.json({ 
      success: true,
      message: 'Image principale mise à jour'
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour image:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}
