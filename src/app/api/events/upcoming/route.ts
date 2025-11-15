import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Calcul du pourcentage de la jauge (0-150%)
function calculateGaugePercentage(totalScore: number): number {
  // Formule : on considère qu'un score de 15 = 100%
  // Donc 22.5 = 150%
  const percentage = (totalScore / 15) * 100;
  return Math.min(Math.max(percentage, 0), 150); // Clamp entre 0 et 150
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();
    const now = new Date().toISOString();
    
    // Construire la requête Supabase pour les événements à venir ou en cours
    let query = supabase
      .from('events')
      .select(`
        *,
        establishment:establishments!events_establishment_id_fkey!inner (
          id,
          name,
          slug,
          city,
          address,
          latitude,
          longitude
        ),
        engagements:event_engagements!event_engagements_event_id_fkey (
          type
        )
      `)
      .eq('establishments.status', 'approved')
      .or(`start_date.gte.${now},and(start_date.lte.${now},or(end_date.gte.${now},end_date.is.null))`)
      .order('start_date', { ascending: true })
      .limit(limit);

    // Filtrer par ville si spécifiée
    if (city) {
      query = query.eq('establishments.city', city);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error('Erreur chargement événements:', eventsError);
      return NextResponse.json(
        { 
          success: false,
          error: "Erreur lors du chargement des événements",
          details: process.env.NODE_ENV === 'production' ? undefined : eventsError.message,
          code: process.env.NODE_ENV === 'production' ? undefined : eventsError.code,
          events: []
        },
        { status: 500 }
      );
    }

    // 🔍 FILTRAGE PAR HORAIRES QUOTIDIENS pour les événements récurrents
    const nowDate = new Date();
    const currentHour = nowDate.getHours();
    const currentMinute = nowDate.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convertir en minutes depuis minuit
    
    const filteredEvents = (events || []).filter((event: any) => {
      console.log(`🕐 [API Upcoming] Filtrage événement: "${event.title}"`);
      console.log(`🕐 [API Upcoming] Heure actuelle: ${currentHour}:${currentMinute} (${currentTime} minutes)`);
      console.log(`🕐 [API Upcoming] Événement récurrent (DB): ${event.is_recurring}`);
      
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
      
      console.log(`🕐 [API Upcoming] Durée: ${durationInDays} jours`);
      console.log(`🕐 [API Upcoming] Horaires: ${eventStartHour}:${eventStartMinute} - ${eventEndHour}:${eventEndMinute}`);
      console.log(`🕐 [API Upcoming] Finalement récurrent: ${isActuallyRecurring}`);
      
      // Si l'événement n'est pas récurrent (ni en DB ni auto-détecté), utiliser la logique normale
      if (!isActuallyRecurring) {
        console.log(`✅ [API Upcoming] Événement non-récurrent - Affiché`);
        return true;
      }

      // Pour les événements récurrents, vérifier les horaires quotidiens
      const eventStartTime = eventStartHour * 60 + eventStartMinute;
      const eventEndTime = eventEndHour * 60 + eventEndMinute;
      
      console.log(`🕐 [API Upcoming] Horaires événement: ${eventStartHour}:${eventStartMinute} - ${eventEndHour}:${eventEndMinute}`);
      console.log(`🕐 [API Upcoming] Plage horaire: ${eventStartTime} - ${eventEndTime} minutes`);
      
      // Vérifier si l'heure actuelle est dans la plage horaire de l'événement
      const isWithinDailyHours = currentTime >= eventStartTime && currentTime <= eventEndTime;
      
      // Vérifier si l'événement est encore valide (pas expiré)
      const isStillValid = !endDate || endDate >= nowDate;
      
      console.log(`🕐 [API Upcoming] Dans les horaires: ${isWithinDailyHours}`);
      console.log(`🕐 [API Upcoming] Encore valide: ${isStillValid}`);
      console.log(`🕐 [API Upcoming] Résultat final: ${isStillValid ? 'AFFICHÉ' : 'MASQUÉ'}`);
      
      // Pour les événements récurrents, toujours afficher s'ils sont encore valides
      // Le statut (en cours/à venir) sera géré côté frontend
      return isStillValid;
    });

    // Calculer le score d'engagement et le statut pour chaque événement
    const eventsWithScore = filteredEvents.map((event: any) => {
      const SCORES = {
        'envie': 1,
        'grande-envie': 3,
        'decouvrir': 2,
        'pas-envie': -1
      };

      const score = (event.engagements || []).reduce((total: number, eng: any) => {
        return total + (SCORES[eng.type as keyof typeof SCORES] || 0);
      }, 0);

      const { engagements, ...eventData } = event;

      // Calculer le gaugePercentage et eventBadge pour cohérence avec les overlays
      const gaugePercentage = calculateGaugePercentage(score);
      
      // Déterminer le badge de l'événement (même logique que dans /api/events/[eventId]/engage)
      let eventBadge = null;
      if (gaugePercentage >= 150) {
        eventBadge = { type: 'fire', label: '🔥 C\'EST LE FEU !', color: '#9C27B0' };
      } else if (gaugePercentage >= 100) {
        eventBadge = { type: 'gold', label: '🏆 Coup de Cœur', color: '#FFD700' };
      } else if (gaugePercentage >= 75) {
        eventBadge = { type: 'silver', label: '⭐ Populaire', color: '#C0C0C0' };
      } else if (gaugePercentage >= 50) {
        eventBadge = { type: 'bronze', label: '👍 Apprécié', color: '#CD7F32' };
      }

      // 🎯 DÉTERMINER LE STATUT : "en cours" ou "à venir"
      let eventStatus = 'upcoming'; // Par défaut "à venir"
      
      // Si c'est un événement récurrent, vérifier les horaires quotidiens
      // Conversion snake_case -> camelCase pour compatibilité
      const eventDataFormatted = {
        ...eventData,
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        imageUrl: eventData.image_url,
        establishmentId: eventData.establishment_id,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        price: eventData.price,
        priceUnit: eventData.price_unit,
        maxCapacity: eventData.max_capacity,
        isRecurring: eventData.is_recurring,
        modality: eventData.modality,
        createdAt: eventData.created_at,
        updatedAt: eventData.updated_at,
        establishment: eventData.establishment ? {
          id: eventData.establishment.id,
          name: eventData.establishment.name,
          slug: eventData.establishment.slug,
          city: eventData.establishment.city,
          address: eventData.establishment.address,
          latitude: eventData.establishment.latitude,
          longitude: eventData.establishment.longitude
        } : null
      };

      const isRecurring = eventDataFormatted.isRecurring || (eventDataFormatted.endDate && 
        Math.ceil((new Date(eventDataFormatted.endDate).getTime() - new Date(eventDataFormatted.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 1);
      
      if (isRecurring) {
        const startDate = new Date(eventDataFormatted.startDate);
        const endDate = eventDataFormatted.endDate ? new Date(eventDataFormatted.endDate) : null;
        
        // D'abord vérifier si l'événement a déjà commencé selon sa date de début
        if (nowDate < startDate) {
          eventStatus = 'upcoming'; // Pas encore commencé
        } else if (endDate && nowDate > endDate) {
          eventStatus = 'past'; // Terminé
        } else {
          // L'événement est dans sa période de validité, vérifier les horaires quotidiens
          const eventStartHour = startDate.getHours();
          const eventStartMinute = startDate.getMinutes();
          const eventEndHour = endDate ? endDate.getHours() : 23;
          const eventEndMinute = endDate ? endDate.getMinutes() : 59;
          
          const eventStartTime = eventStartHour * 60 + eventStartMinute;
          const eventEndTime = eventEndHour * 60 + eventEndMinute;
          const currentTime = nowDate.getHours() * 60 + nowDate.getMinutes();
          
          // Si on est dans les horaires quotidiens, l'événement est "en cours"
          if (currentTime >= eventStartTime && currentTime <= eventEndTime) {
            eventStatus = 'ongoing';
          }
        }
      } else {
        // Pour les événements ponctuels, vérifier si on est dans la période
        const startDate = new Date(eventDataFormatted.startDate);
        const endDate = eventDataFormatted.endDate ? new Date(eventDataFormatted.endDate) : null;
        
        if (nowDate >= startDate && (!endDate || nowDate <= endDate)) {
          eventStatus = 'ongoing';
        }
      }

      return {
        ...eventDataFormatted,
        engagementScore: score,
        engagementCount: (engagements || []).length,
        gaugePercentage,
        eventBadge,
        status: eventStatus
      };
    });

    // Trier par score d'engagement décroissant pour identifier les trending
    const trending = [...eventsWithScore]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    return NextResponse.json({
      events: eventsWithScore,
      trending,
      total: eventsWithScore.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

