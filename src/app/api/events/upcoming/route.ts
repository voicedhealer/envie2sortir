import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const now = new Date();
    
    // Récupérer les événements à venir ET en cours
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            // Événements futurs
            startDate: {
              gte: now
            }
          },
          {
            // Événements en cours (ont commencé mais pas encore terminés)
            AND: [
              { startDate: { lte: now } },
              {
                OR: [
                  { endDate: { gte: now } },
                  { endDate: null } // Événements sans date de fin
                ]
              }
            ]
          }
        ],
        establishment: {
          status: 'approved', // Seulement les établissements approuvés
          ...(city ? { city } : {})
        }
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            address: true,
            latitude: true,
            longitude: true
          }
        },
        engagements: {
          select: {
            type: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: limit
    });

    // 🔍 FILTRAGE PAR HORAIRES QUOTIDIENS pour les événements récurrents
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convertir en minutes depuis minuit
    
    const filteredEvents = events.filter(event => {
      console.log(`🕐 [API Upcoming] Filtrage événement: "${event.title}"`);
      console.log(`🕐 [API Upcoming] Heure actuelle: ${currentHour}:${currentMinute} (${currentTime} minutes)`);
      console.log(`🕐 [API Upcoming] Événement récurrent (DB): ${event.isRecurring}`);
      
      // 🔍 DÉTECTION AUTOMATIQUE : Est-ce un événement récurrent ?
      const startDate = new Date(event.startDate);
      const endDate = event.endDate ? new Date(event.endDate) : null;
      
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
      const isActuallyRecurring = event.isRecurring || durationInDays > 1;
      
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
      const isStillValid = !endDate || endDate >= now;
      
      console.log(`🕐 [API Upcoming] Dans les horaires: ${isWithinDailyHours}`);
      console.log(`🕐 [API Upcoming] Encore valide: ${isStillValid}`);
      console.log(`🕐 [API Upcoming] Résultat final: ${isStillValid ? 'AFFICHÉ' : 'MASQUÉ'}`);
      
      // Pour les événements récurrents, toujours afficher s'ils sont encore valides
      // Le statut (en cours/à venir) sera géré côté frontend
      return isStillValid;
    });

    // Calculer le score d'engagement et le statut pour chaque événement
    const eventsWithScore = filteredEvents.map(event => {
      const SCORES = {
        'envie': 1,
        'grande-envie': 3,
        'decouvrir': 2,
        'pas-envie': -1
      };

      const score = event.engagements.reduce((total, eng) => {
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
      const isRecurring = event.isRecurring || (event.endDate && 
        Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 1);
      
      if (isRecurring) {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        // D'abord vérifier si l'événement a déjà commencé selon sa date de début
        if (now < startDate) {
          eventStatus = 'upcoming'; // Pas encore commencé
        } else if (endDate && now > endDate) {
          eventStatus = 'past'; // Terminé
        } else {
          // L'événement est dans sa période de validité, vérifier les horaires quotidiens
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
        }
      } else {
        // Pour les événements ponctuels, vérifier si on est dans la période
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        if (now >= startDate && (!endDate || now <= endDate)) {
          eventStatus = 'ongoing';
        }
      }

      return {
        ...eventData,
        engagementScore: score,
        engagementCount: engagements.length,
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

