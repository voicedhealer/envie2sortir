import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const supabase = await createClient();
    const now = new Date();
    const nowISO = now.toISOString();

    // Récupérer l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Récupérer tous les événements de l'établissement
    // On récupère tous les événements et on filtre ensuite
    const { data: allEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('establishment_id', establishment.id)
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('Erreur récupération événements:', eventsError);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des événements' 
      }, { status: 500 });
    }

    // Filtrer les événements à venir ou en cours
    const filteredEvents = (allEvents || []).filter((event: any) => {
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;
      
      // Événements à venir (pas encore commencés)
      if (startDate > now) return true;
      
      // Événements en cours (commencés mais pas encore finis)
      if (startDate <= now && (!endDate || endDate >= now)) return true;
      
      return false;
    });

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Filtrer les événements par horaires quotidiens
    const events = filteredEvents.filter((event: any) => {
      console.log(`🕐 [API Events] Filtrage événement: "${event.title}"`);
      console.log(`🕐 [API Events] Heure actuelle: ${currentHour}:${currentMinute} (${currentTime} minutes)`);
      console.log(`🕐 [API Events] Événement récurrent (DB): ${event.is_recurring}`);
      
      // 🔍 DÉTECTION AUTOMATIQUE : Est-ce un événement récurrent ?
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;
      
      // Calculer la durée en jours
      const durationInDays = endDate ? 
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Extraire les heures de début et fin
      const eventStartHour = startDate.getHours();
      const eventStartMinute = startDate.getMinutes();
      const eventEndHour = endDate ? endDate.getHours() : 23;
      const eventEndMinute = endDate ? endDate.getMinutes() : 59;
      
      // 🎯 LOGIQUE SIMPLIFIÉE : Tout événement multi-jours est récurrent pour le filtrage
      // Si un événement dure plus d'1 jour, il doit respecter ses horaires quotidiens
      const isActuallyRecurring = event.is_recurring || durationInDays > 1;
      
      console.log(`🕐 [API Events] Durée: ${durationInDays} jours`);
      console.log(`🕐 [API Events] Horaires: ${eventStartHour}:${eventStartMinute} - ${eventEndHour}:${eventEndMinute}`);
      console.log(`🕐 [API Events] Finalement récurrent: ${isActuallyRecurring}`);
      
      // Si l'événement n'est pas récurrent (ni en DB ni auto-détecté), utiliser la logique normale
      if (!isActuallyRecurring) {
        console.log(`✅ [API Events] Événement non-récurrent - Affiché`);
        return true;
      }

      // Pour les événements récurrents, vérifier les horaires quotidiens
      const eventStartTime = eventStartHour * 60 + eventStartMinute;
      const eventEndTime = eventEndHour * 60 + eventEndMinute;
      
      console.log(`🕐 [API Events] Horaires événement: ${eventStartHour}:${eventStartMinute} - ${eventEndHour}:${eventEndMinute}`);
      console.log(`🕐 [API Events] Plage horaire: ${eventStartTime} - ${eventEndTime} minutes`);
      
      // Vérifier si l'heure actuelle est dans la plage horaire de l'événement
      const isWithinDailyHours = currentTime >= eventStartTime && currentTime <= eventEndTime;
      
      // Vérifier si l'événement est encore valide (pas expiré)
      const isStillValid = !endDate || endDate >= now;
      
      console.log(`🕐 [API Events] Dans les horaires: ${isWithinDailyHours}`);
      console.log(`🕐 [API Events] Encore valide: ${isStillValid}`);
      console.log(`🕐 [API Events] Résultat final: ${isStillValid ? 'AFFICHÉ' : 'MASQUÉ'}`);
      
      // Pour les événements récurrents, toujours afficher s'ils sont encore valides
      // Le statut (en cours/à venir) sera géré côté frontend
      return isStillValid;
    });

    // 🎯 AJOUTER LE STATUT À CHAQUE ÉVÉNEMENT
    const eventsWithStatus = events.map((event: any) => {
      // Déterminer le statut : "en cours" ou "à venir"
      let eventStatus = 'upcoming'; // Par défaut "à venir"
      
      // Si c'est un événement récurrent, vérifier les horaires quotidiens
      const isRecurring = event.is_recurring || (event.end_date && 
        Math.ceil((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60 * 24)) > 1);
      
      if (isRecurring) {
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : null;
        
        const eventStartHour = startDate.getHours();
        const eventStartMinute = startDate.getMinutes();
        const eventEndHour = endDate ? endDate.getHours() : 23;
        const eventEndMinute = endDate ? endDate.getMinutes() : 59;
        
        const eventStartTime = eventStartHour * 60 + eventStartMinute;
        const eventEndTime = eventEndHour * 60 + eventEndMinute;
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Si on est dans les horaires quotidiens, l'événement est "en cours"
        if (currentTime >= eventStartTime && currentTime <= eventEndTime) {
          eventStatus = 'ongoing';
        }
      } else {
        // Pour les événements ponctuels, vérifier si on est dans la période
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : null;
        
        if (now >= startDate && (!endDate || now <= endDate)) {
          eventStatus = 'ongoing';
        }
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        imageUrl: event.image_url,
        price: event.price,
        maxCapacity: event.max_capacity,
        isRecurring: event.is_recurring,
        modality: event.modality,
        createdAt: event.created_at,
        status: eventStatus
      };
    });

    return NextResponse.json({ events: eventsWithStatus });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des événements' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = await createClient();
    const { slug } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, price, maxCapacity } = body;

    // Validation des données requises
    if (!title || !description || !startDate) {
      return NextResponse.json({ 
        error: 'Titre, description et date de début sont requis' 
      }, { status: 400 });
    }

    // Récupérer l'établissement et vérifier les permissions
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name, owner_id, subscription')
      .eq('slug', slug)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    if (establishment.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier que l'établissement a un abonnement PREMIUM pour créer des événements
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Un abonnement PREMIUM est requis pour créer des événements',
        currentSubscription: establishment.subscription,
        requiredSubscription: 'PREMIUM'
      }, { status: 403 });
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        price: price ? parseFloat(price) : null,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
        establishment_id: establishment.id,
        is_recurring: false
      })
      .select()
      .single();

    if (eventError || !event) {
      console.error('Erreur création événement:', eventError);
      return NextResponse.json({ 
        error: 'Erreur lors de la création de l\'événement' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        price: event.price,
        maxCapacity: event.max_capacity,
        isRecurring: event.is_recurring
      },
      message: 'Événement créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de l\'événement' 
    }, { status: 500 });
  }
}