import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";

/**
 * API pour gérer un événement spécifique
 * PUT: Modifier un événement
 * DELETE: Supprimer un événement
 */

// PUT - Modifier un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: "Non authentifié ou aucun établissement associé" }, { status: 401 });
    }

    const supabase = createClient();

    // Vérifier que l'établissement est Premium
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment || establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ error: "Fonctionnalité réservée aux abonnements Premium" }, { status: 403 });
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { title, description, modality, startDate, endDate, imageUrl, price, priceUnit, maxCapacity } = body;

    // Validation
    if (!title || !startDate) {
      return NextResponse.json({ error: "Titre et date de début requis" }, { status: 400 });
    }

    // Vérifier que l'événement appartient à l'établissement
    const { data: existingEvent, error: existingError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('establishment_id', user.establishmentId)
      .single();

    if (existingError || !existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    // Modifier l'événement
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        modality: modality || null,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        image_url: imageUrl || null,
        price: price ? parseFloat(price) : null,
        price_unit: priceUnit || null,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null
      })
      .eq('id', eventId)
      .select()
      .single();

    if (updateError || !event) {
      console.error('Erreur modification événement:', updateError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      modality: event.modality,
      startDate: event.start_date,
      endDate: event.end_date,
      imageUrl: event.image_url,
      price: event.price,
      priceUnit: event.price_unit,
      maxCapacity: event.max_capacity,
      isRecurring: event.is_recurring,
      establishmentId: event.establishment_id,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    };

    return NextResponse.json({ 
      success: true, 
      event: formattedEvent,
      message: "Événement modifié avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: "Non authentifié ou aucun établissement associé" }, { status: 401 });
    }

    const supabase = createClient();

    // Vérifier que l'établissement est Premium
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment || establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ error: "Fonctionnalité réservée aux abonnements Premium" }, { status: 403 });
    }

    const { id: eventId } = await params;

    // Vérifier que l'événement appartient à l'établissement
    const { data: existingEvent, error: existingError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('establishment_id', user.establishmentId)
      .single();

    if (existingError || !existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    // Supprimer l'événement
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('Erreur suppression événement:', deleteError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Événement supprimé avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
