import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";
import { getPremiumRequiredError, validateSubscriptionAccess } from "@/lib/subscription-utils";

/**
 * API pour gérer les événements d'un établissement
 * GET: Récupère tous les événements de l'établissement
 * POST: Crée un nouvel événement
 */

// GET - Récupérer tous les événements
export async function GET(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: "Non authentifié ou aucun établissement associé" }, { status: 401 });
    }

    const supabase = createClient();

    // Vérifier que l'établissement existe et est Premium
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Vérifier l'accès Premium avec validation centralisée
    const validation = validateSubscriptionAccess(establishment.subscription as 'FREE' | 'PREMIUM', 'canCreateEvents');
    if (!validation.hasAccess) {
      const error = getPremiumRequiredError('Événements');
      return NextResponse.json(error, { status: error.status });
    }

    // Récupérer tous les événements de l'établissement
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('establishment_id', user.establishmentId)
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('Erreur récupération événements:', eventsError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedEvents = (events || []).map((event: any) => ({
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
    }));

    return NextResponse.json({ events: formattedEvents });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json({ error: "Non authentifié ou aucun établissement associé" }, { status: 401 });
    }

    const supabase = createClient();

    // Vérifier que l'établissement existe et est Premium
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', user.establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Vérifier l'accès Premium avec validation centralisée
    const validation = validateSubscriptionAccess(establishment.subscription as 'FREE' | 'PREMIUM', 'canCreateEvents');
    if (!validation.hasAccess) {
      const error = getPremiumRequiredError('Événements');
      return NextResponse.json(error, { status: error.status });
    }

    const body = await request.json();
    const { title, description, modality, startDate, endDate, imageUrl, price, priceUnit, maxCapacity } = body;

    // Validation
    if (!title || !startDate) {
      return NextResponse.json({ error: "Titre et date de début requis" }, { status: 400 });
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        modality: modality || null,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        image_url: imageUrl || null,
        price: price ? parseFloat(price) : null,
        price_unit: priceUnit || null,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
        establishment_id: user.establishmentId
      })
      .select()
      .single();

    if (eventError || !event) {
      console.error('Erreur création événement:', eventError);
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
      message: "Événement créé avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
