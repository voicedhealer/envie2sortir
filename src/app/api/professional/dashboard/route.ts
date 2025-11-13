import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = createClient();

    // Récupérer le professionnel et son établissement
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, first_name, last_name, email, siret, company_name')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json({ error: "Professionnel non trouvé" }, { status: 404 });
    }

    // Récupérer l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: "Aucun établissement trouvé" }, { status: 404 });
    }

    // Récupérer les événements
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('establishment_id', establishment.id)
      .order('start_date', { ascending: true });

    // Récupérer les images
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('establishment_id', establishment.id);

    // Récupérer les interactions utilisateurs (simulation pour l'instant)
    const interactions = [
      {
        id: "1",
        userId: "user1",
        userName: "Marie D.",
        type: "want_to_go" as const,
        createdAt: new Date().toISOString()
      },
      {
        id: "2", 
        userId: "user2",
        userName: "Thomas L.",
        type: "recommend" as const,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        userId: "user3", 
        userName: "Sophie M.",
        type: "perfect_for_today" as const,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // Convertir snake_case -> camelCase
    const formattedEvents = (events || []).map((event: any) => ({
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
    }));

    return NextResponse.json({
      professional: {
        id: professional.id,
        firstName: professional.first_name,
        lastName: professional.last_name,
        email: professional.email,
        siret: professional.siret,
        companyName: professional.company_name
      },
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        status: establishment.status,
        description: establishment.description,
        address: establishment.address,
        city: establishment.city,
        viewsCount: establishment.views_count || 0,
        clicksCount: establishment.clicks_count || 0,
        avgRating: establishment.avg_rating || 0,
        totalComments: establishment.total_comments || 0,
        createdAt: establishment.created_at,
        updatedAt: establishment.updated_at
      },
      events: formattedEvents,
      interactions
    });

  } catch (error) {
    console.error('Erreur dashboard pro:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
