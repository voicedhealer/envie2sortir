import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();
    const { name, description, address, city, phone, email, website, instagram, facebook } = body;

    // Récupérer l'établissement du professionnel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Mettre à jour l'établissement avec statut "pending" pour modération
    const { data: updatedEstablishment, error: updateError } = await supabase
      .from('establishments')
      .update({
        name,
        description: description || "",
        address,
        city,
        phone: phone || null,
        email: email || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        status: 'pending', // Mise en attente de validation
        updated_at: new Date().toISOString()
      })
      .eq('id', establishment.id)
      .select()
      .single();

    if (updateError || !updatedEstablishment) {
      console.error('Erreur mise à jour établissement:', updateError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    return NextResponse.json({
      id: updatedEstablishment.id,
      name: updatedEstablishment.name,
      slug: updatedEstablishment.slug,
      status: updatedEstablishment.status,
      description: updatedEstablishment.description,
      address: updatedEstablishment.address,
      city: updatedEstablishment.city,
      viewsCount: updatedEstablishment.views_count || 0,
      clicksCount: updatedEstablishment.clicks_count || 0,
      avgRating: updatedEstablishment.avg_rating || 0,
      totalComments: updatedEstablishment.total_comments || 0,
      createdAt: updatedEstablishment.created_at,
      updatedAt: updatedEstablishment.updated_at
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
