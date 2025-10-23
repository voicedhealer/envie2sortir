import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Récupérer l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Récupérer les événements de l'établissement avec filtrage par horaires quotidiens
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convertir en minutes depuis minuit
    
    // Récupérer tous les événements de l'établissement
    const allEvents = await prisma.event.findMany({
      where: { 
        establishmentId: establishment.id,
        OR: [
          // Événements à venir (pas encore commencés)
          {
            startDate: {
              gt: now
            }
          },
          // Événements en cours (commencés mais pas encore finis)
          {
            startDate: {
              lte: now
            },
            endDate: {
              gte: now
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
        price: true,
        maxCapacity: true,
        isRecurring: true,
        modality: true,
        createdAt: true
      },
      orderBy: { startDate: 'asc' }
    });

    // Filtrer les événements par horaires quotidiens
    const events = allEvents.filter(event => {
      console.log(`🕐 [API Events] Filtrage événement: "${event.title}"`);
      console.log(`🕐 [API Events] Heure actuelle: ${currentHour}:${currentMinute} (${currentTime} minutes)`);
      console.log(`🕐 [API Events] Événement récurrent (DB): ${event.isRecurring}`);
      
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
    const eventsWithStatus = events.map(event => {
      // Déterminer le statut : "en cours" ou "à venir"
      let eventStatus = 'upcoming'; // Par défaut "à venir"
      
      // Si c'est un événement récurrent, vérifier les horaires quotidiens
      const isRecurring = event.isRecurring || (event.endDate && 
        Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 1);
      
      if (isRecurring) {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
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
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        if (now >= startDate && (!endDate || now <= endDate)) {
          eventStatus = 'ongoing';
        }
      }

      return {
        ...event,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

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
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { 
        id: true, 
        name: true, 
        ownerId: true,
        subscription: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    if (establishment.ownerId !== session.user.id) {
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
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        establishmentId: establishment.id,
        isRecurring: false
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        price: event.price,
        maxCapacity: event.maxCapacity,
        isRecurring: event.isRecurring
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