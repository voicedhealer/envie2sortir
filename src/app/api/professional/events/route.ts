import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name, description, startDate, endDate, price, maxCapacity, isRecurring } = body;

    // Récupérer l'établissement du professionnel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name,
        description: description || "",
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        price: price ? parseFloat(price) : null,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
        is_recurring: isRecurring || false,
        establishment_id: establishment.id
      })
      .select()
      .single();

    if (eventError || !event) {
      console.error('Erreur création événement:', eventError);
      return NextResponse.json({ error: "Erreur lors de la création de l'événement" }, { status: 500 });
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      price: event.price,
      maxCapacity: event.max_capacity,
      isRecurring: event.is_recurring,
      status: new Date(event.start_date) > new Date() ? 'upcoming' : 'completed',
      createdAt: event.created_at
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
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
    const { id, name, description, startDate, endDate, price, maxCapacity, isRecurring } = body;

    // Vérifier que l'événement appartient à l'utilisateur
    const { data: existingEvent, error: existingError } = await supabase
      .from('events')
      .select('establishment_id, establishments!events_establishment_id_fkey(owner_id)')
      .eq('id', id)
      .single();

    if (existingError || !existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    const establishment = Array.isArray(existingEvent.establishments) ? existingEvent.establishments[0] : existingEvent.establishments;
    if (establishment?.owner_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data: event, error: updateError } = await supabase
      .from('events')
      .update({
        name,
        description: description || "",
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        price: price ? parseFloat(price) : null,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
        is_recurring: isRecurring
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !event) {
      console.error('Erreur modification événement:', updateError);
      return NextResponse.json({ error: "Erreur lors de la modification de l'événement" }, { status: 500 });
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      price: event.price,
      maxCapacity: event.max_capacity,
      isRecurring: event.is_recurring,
      status: new Date(event.start_date) > new Date() ? 'upcoming' : 'completed',
      createdAt: event.created_at
    });

  } catch (error) {
    console.error('Erreur modification événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'événement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID de l'événement requis" }, { status: 400 });
    }

    // Vérifier que l'événement appartient à l'utilisateur
    const { data: existingEvent, error: existingError } = await supabase
      .from('events')
      .select('establishment_id, establishments!events_establishment_id_fkey(owner_id)')
      .eq('id', id)
      .single();

    if (existingError || !existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    const establishment = Array.isArray(existingEvent.establishments) ? existingEvent.establishments[0] : existingEvent.establishments;
    if (establishment?.owner_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erreur suppression événement:', deleteError);
      return NextResponse.json({ error: "Erreur lors de la suppression de l'événement" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur suppression événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
