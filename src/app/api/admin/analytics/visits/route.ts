import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30'); // Par défaut 30 jours

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Calculer la date de début
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    // Récupérer toutes les données de click_analytics
    const { data: allClicks, error: clicksError } = await adminClient
      .from('click_analytics')
      .select('id, timestamp, hour, day_of_week, user_agent, action, establishment_id')
      .gte('timestamp', startDateISO);

    if (clicksError) {
      console.error('Erreur récupération clicks:', clicksError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données', details: clicksError.message },
        { status: 500 }
      );
    }

    // Récupérer toutes les données de search_analytics
    const { data: allSearches, error: searchesError } = await adminClient
      .from('search_analytics')
      .select('id, timestamp, user_agent, clicked_establishment_id')
      .gte('timestamp', startDateISO);

    if (searchesError) {
      console.error('Erreur récupération searches:', searchesError);
    }

    // Fonction pour détecter si c'est mobile
    const isMobile = (userAgent: string | null | undefined): boolean => {
      if (!userAgent) return false;
      const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent);
    };

    // Calculer les statistiques
    const totalClicks = allClicks?.length || 0;
    const totalSearches = allSearches?.length || 0;
    
    // Visites uniques (approximation basée sur les établissements visités par jour)
    const visitsByDay = new Map<string, Set<string>>(); // date -> Set d'établissements
    allClicks?.forEach(click => {
      const date = new Date(click.timestamp).toISOString().split('T')[0];
      if (!visitsByDay.has(date)) {
        visitsByDay.set(date, new Set());
      }
      visitsByDay.get(date)!.add(click.establishment_id);
    });
    const uniqueVisits = Array.from(visitsByDay.values()).reduce((sum, set) => sum + set.size, 0);
    const totalVisits = visitsByDay.size > 0 ? Array.from(visitsByDay.values()).reduce((sum, set) => sum + set.size, 0) : 0;

    // Taux de passage (visites uniques / total de visites potentielles)
    // On considère qu'une visite = au moins un clic sur un établissement
    const passageRate = totalClicks > 0 ? (uniqueVisits / totalClicks) * 100 : 0;

    // Taux de conversion (clics sur actions importantes / total clics)
    const conversionActions = ['phone', 'email', 'website', 'reservation', 'call', 'contact'];
    const conversionClicks = allClicks?.filter(click => 
      conversionActions.some(action => click.action?.toLowerCase().includes(action))
    ).length || 0;
    const conversionRate = totalClicks > 0 ? (conversionClicks / totalClicks) * 100 : 0;

    // Horaires de visite (par heure de 0 à 23)
    const visitsByHour: number[] = new Array(24).fill(0);
    allClicks?.forEach(click => {
      if (click.hour !== null && click.hour !== undefined) {
        visitsByHour[click.hour] = (visitsByHour[click.hour] || 0) + 1;
      } else {
        // Si pas d'heure, extraire de timestamp
        const hour = new Date(click.timestamp).getHours();
        visitsByHour[hour] = (visitsByHour[hour] || 0) + 1;
      }
    });

    // Jours de visite (par jour de la semaine)
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const visitsByDayOfWeek: Record<string, number> = {};
    dayNames.forEach(day => visitsByDayOfWeek[day] = 0);
    
    allClicks?.forEach(click => {
      let dayName: string;
      if (click.day_of_week) {
        dayName = click.day_of_week;
      } else {
        const dayIndex = new Date(click.timestamp).getDay();
        dayName = dayNames[dayIndex];
      }
      visitsByDayOfWeek[dayName] = (visitsByDayOfWeek[dayName] || 0) + 1;
    });

    // Différenciation Mobile vs Web
    let mobileClicks = 0;
    let webClicks = 0;
    allClicks?.forEach(click => {
      if (isMobile(click.user_agent)) {
        mobileClicks++;
      } else {
        webClicks++;
      }
    });

    let mobileSearches = 0;
    let webSearches = 0;
    allSearches?.forEach(search => {
      if (isMobile(search.user_agent)) {
        mobileSearches++;
      } else {
        webSearches++;
      }
    });

    const mobileTotal = mobileClicks + mobileSearches;
    const webTotal = webClicks + webSearches;
    const totalWithDevice = mobileTotal + webTotal;
    const mobilePercentage = totalWithDevice > 0 ? (mobileTotal / totalWithDevice) * 100 : 0;
    const webPercentage = totalWithDevice > 0 ? (webTotal / totalWithDevice) * 100 : 0;

    // Périodes de la journée
    const timeSlots = {
      'Matin (6h-12h)': 0,
      'Après-midi (12h-18h)': 0,
      'Soirée (18h-22h)': 0,
      'Nuit (22h-6h)': 0
    };

    allClicks?.forEach(click => {
      let hour: number;
      if (click.hour !== null && click.hour !== undefined) {
        hour = click.hour;
      } else {
        hour = new Date(click.timestamp).getHours();
      }

      if (hour >= 6 && hour < 12) {
        timeSlots['Matin (6h-12h)']++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots['Après-midi (12h-18h)']++;
      } else if (hour >= 18 && hour < 22) {
        timeSlots['Soirée (18h-22h)']++;
      } else {
        timeSlots['Nuit (22h-6h)']++;
      }
    });

    return NextResponse.json({
      period: {
        startDate: startDateISO,
        endDate: endDate.toISOString(),
        days
      },
      overview: {
        totalClicks,
        totalSearches,
        uniqueVisits,
        totalVisits,
        passageRate: Math.round(passageRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionClicks
      },
      visitsByHour: visitsByHour.map((count, hour) => ({
        hour,
        count,
        label: `${hour}h`
      })),
      visitsByDayOfWeek: Object.entries(visitsByDayOfWeek).map(([day, count]) => ({
        day,
        count
      })),
      timeSlots,
      deviceBreakdown: {
        mobile: {
          clicks: mobileClicks,
          searches: mobileSearches,
          total: mobileTotal,
          percentage: Math.round(mobilePercentage * 10) / 10
        },
        web: {
          clicks: webClicks,
          searches: webSearches,
          total: webTotal,
          percentage: Math.round(webPercentage * 10) / 10
        }
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques de visite:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des statistiques',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

