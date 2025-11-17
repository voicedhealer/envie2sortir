import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";

export async function GET() {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = await createClient();

    // Récupérer l'établissement du professionnel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Récupérer les tarifs
    const { data: pricing, error: pricingError } = await supabase
      .from('pricing')
      .select('*')
      .eq('establishment_id', establishment.id);

    if (pricingError) {
      console.error('Erreur récupération tarifs:', pricingError);
      return NextResponse.json({ error: "Erreur lors de la récupération des tarifs" }, { status: 500 });
    }

    // Convertir les tarifs en format clé-valeur
    const prices: Record<string, number> = {};
    if (pricing) {
      pricing.forEach((price: any) => {
        prices[price.service_id] = price.price;
      });
    }

    return NextResponse.json({ prices });

  } catch (error) {
    console.error('Erreur récupération tarifs:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tarifs" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { prices } = body;

    // Récupérer l'établissement du professionnel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    const establishmentId = establishment.id;

    // Supprimer les anciens tarifs
    await supabase
      .from('pricing')
      .delete()
      .eq('establishment_id', establishmentId);

    // Créer les nouveaux tarifs
    const pricingData = Object.entries(prices).map(([serviceId, price]) => ({
      establishment_id: establishmentId,
      service_id: serviceId,
      price: price as number
    }));

    if (pricingData.length > 0) {
      const { error: insertError } = await supabase
        .from('pricing')
        .insert(pricingData);

      if (insertError) {
        console.error('Erreur insertion tarifs:', insertError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des tarifs" }, { status: 500 });
      }
    }

    // Mettre à jour le statut de l'établissement pour modération
    await supabase
      .from('establishments')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', establishmentId);

    return NextResponse.json({ 
      success: true,
      message: "Tarifs mis à jour avec succès",
      prices 
    });

  } catch (error) {
    console.error('Erreur mise à jour tarifs:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des tarifs" },
      { status: 500 }
    );
  }
}
