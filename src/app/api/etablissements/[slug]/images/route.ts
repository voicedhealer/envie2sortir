import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireEstablishment } from "@/lib/supabase/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    
    // Récupérer l'établissement avec ses images
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select(`
        id,
        name,
        image_url,
        images (
          id,
          url,
          is_primary,
          created_at,
          ordre
        )
      `)
      .eq('slug', slug)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Trier les images par ordre
    const sortedImages = (establishment.images || []).sort((a: any, b: any) => 
      (a.ordre || 0) - (b.ordre || 0)
    );

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        imageUrl: establishment.image_url,
        images: sortedImages.map((img: any) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.is_primary,
          createdAt: img.created_at,
          ordre: img.ordre
        }))
      }
    });

  } catch (error) {
    console.error("Erreur récupération images:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = await createClient();
    const { slug } = await params;
    const { imageUrl } = await request.json();

    // Vérifier que l'utilisateur est le propriétaire
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, owner_id')
      .eq('slug', slug)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    if (establishment.owner_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Mettre à jour l'image principale
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', establishment.id);

    if (updateError) {
      console.error('Erreur mise à jour image:', updateError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur mise à jour image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

