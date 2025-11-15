import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';
import { getPremiumRequiredError } from '@/lib/subscription-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const period = searchParams.get('period') || '30d';

    if (!establishmentId) {
      return NextResponse.json({ error: 'establishmentId is required' }, { status: 400 });
    }

    // Utiliser le client admin pour bypass RLS (route utilisée par les professionnels)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [Analytics Detailed] Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Vérifier l'abonnement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('subscription')
      .eq('id', establishmentId)
      .single();

    if (establishmentError) {
      console.error('❌ [Analytics Detailed] Erreur récupération établissement:', establishmentError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération de l\'établissement',
          details: establishmentError.message,
          code: establishmentError.code
        },
        { status: 500 }
      );
    }

    if (!establishment || establishment.subscription !== 'PREMIUM') {
      const error = getPremiumRequiredError('Analytics');
      return NextResponse.json(error, { status: error.status });
    }

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startDateISO = startDate.toISOString();

    // Récupérer toutes les données d'analytics pour l'établissement
    const { data: analytics, error: analyticsError } = await supabase
      .from('click_analytics')
      .select('*')
      .eq('establishment_id', establishmentId)
      .gte('timestamp', startDateISO)
      .order('timestamp', { ascending: false });

    if (analyticsError) {
      console.error('Erreur récupération analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to fetch detailed analytics' },
        { status: 500 }
      );
    }

    if (!analytics || analytics.length === 0) {
      // Retourner des données vides au lieu de données mockées
      return NextResponse.json({
        totalInteractions: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: 0,
          visitors: 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: {
          totalViews: 0,
          peakHours: [],
          mostViewedDay: null,
        },
        contactStats: [],
      });
    }

    // Convertir les données Supabase en format utilisable
    const formattedAnalytics = (analytics || []).map((a: any) => ({
      ...a,
      elementType: a.element_type,
      elementId: a.element_id,
      elementName: a.element_name,
      userAgent: a.user_agent,
      timestamp: new Date(a.timestamp),
      hour: new Date(a.timestamp).getHours(),
      dayOfWeek: new Date(a.timestamp).toLocaleDateString('fr-FR', { weekday: 'long' })
    }));

    // Statistiques générales
    const totalInteractions = formattedAnalytics.length;
    const uniqueVisitors = new Set(formattedAnalytics.map(a => a.userAgent)).size;
    const averageSessionTime = Math.round(formattedAnalytics.length / Math.max(uniqueVisitors, 1) * 2); // Estimation

    // Statistiques par heure
    const hourlyMap = new Map<number, { interactions: number; visitors: Set<string> }>();
    formattedAnalytics.forEach(analytics => {
      const hour = analytics.hour || 0;
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { interactions: 0, visitors: new Set() });
      }
      const hourData = hourlyMap.get(hour)!;
      hourData.interactions++;
      if (analytics.userAgent) {
        hourData.visitors.add(analytics.userAgent);
      }
    });

    const hourlyStats = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour,
        interactions: data.interactions,
        visitors: data.visitors.size,
        timeSlot: `${hour}h-${hour + 1}h`,
      }))
      .sort((a, b) => a.hour - b.hour);

    // Statistiques par jour
    const dailyMap = new Map<string, { interactions: number; visitors: Set<string>; dayOfWeek: string }>();
    formattedAnalytics.forEach(analytics => {
      const date = analytics.timestamp.toISOString().split('T')[0];
      const dayOfWeek = analytics.dayOfWeek || analytics.timestamp.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { interactions: 0, visitors: new Set(), dayOfWeek });
      }
      const dayData = dailyMap.get(date)!;
      dayData.interactions++;
      if (analytics.userAgent) {
        dayData.visitors.add(analytics.userAgent);
      }
    });

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        dayOfWeek: data.dayOfWeek,
        interactions: data.interactions,
        visitors: data.visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Éléments populaires
    const elementMap = new Map<string, { elementType: string; elementName: string; interactions: number }>();
    formattedAnalytics.forEach(analytics => {
      const key = `${analytics.elementType}-${analytics.elementId}`;
      if (!elementMap.has(key)) {
        elementMap.set(key, {
          elementType: analytics.elementType,
          elementName: analytics.elementName || analytics.elementId,
          interactions: 0,
        });
      }
      elementMap.get(key)!.interactions++;
    });

    const popularElements = Array.from(elementMap.values())
      .map(element => ({
        ...element,
        elementId: `${element.elementType}-${element.elementName}`,
        percentage: (element.interactions / totalInteractions) * 100,
      }))
      .sort((a, b) => b.interactions - a.interactions);

    // Sections populaires
    const sectionMap = new Map<string, { sectionName: string; openCount: number; visitors: Set<string> }>();
    formattedAnalytics
      .filter(a => a.elementType === 'section' && a.action === 'open')
      .forEach(analytics => {
        const sectionName = analytics.elementName || analytics.elementId;
        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, { sectionName, openCount: 0, visitors: new Set() });
        }
        const sectionData = sectionMap.get(sectionName)!;
        sectionData.openCount++;
        if (analytics.userAgent) {
          sectionData.visitors.add(analytics.userAgent);
        }
      });

    const popularSections = Array.from(sectionMap.values())
      .map(section => ({
        sectionId: section.sectionName.toLowerCase().replace(/\s+/g, '-'),
        sectionName: section.sectionName,
        openCount: section.openCount,
        uniqueVisitors: section.visitors.size,
      }))
      .sort((a, b) => b.openCount - a.openCount);

    // Statistiques des horaires
    const scheduleAnalytics = formattedAnalytics.filter(a => a.elementType === 'schedule');
    const scheduleHourlyMap = new Map<number, number>();
    const scheduleDailyMap = new Map<string, number>();
    
    scheduleAnalytics.forEach(analytics => {
      const hour = analytics.hour || 0;
      const day = analytics.dayOfWeek || analytics.timestamp.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      scheduleHourlyMap.set(hour, (scheduleHourlyMap.get(hour) || 0) + 1);
      scheduleDailyMap.set(day, (scheduleDailyMap.get(day) || 0) + 1);
    });

    const schedulePeakHours = Array.from(scheduleHourlyMap.entries())
      .map(([hour, views]) => ({
        hour,
        views,
        timeSlot: `${hour}h-${hour + 1}h`,
      }))
      .sort((a, b) => b.views - a.views);

    const mostViewedDay = Array.from(scheduleDailyMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Statistiques des contacts
    const contactAnalytics = formattedAnalytics.filter(a => a.elementType === 'contact');
    const contactMap = new Map<string, { contactName: string; clicks: number }>();
    
    contactAnalytics.forEach(analytics => {
      const contactType = analytics.elementId;
      const contactName = analytics.elementName || `Contact ${contactType}`;
      
      if (!contactMap.has(contactType)) {
        contactMap.set(contactType, { contactName, clicks: 0 });
      }
      contactMap.get(contactType)!.clicks++;
    });

    const totalContactClicks = Array.from(contactMap.values()).reduce((sum, contact) => sum + contact.clicks, 0);
    const contactStats = Array.from(contactMap.values())
      .map(contact => ({
        contactType: contact.contactName.split(' ')[1] || 'unknown',
        contactName: contact.contactName,
        clicks: contact.clicks,
        percentage: totalContactClicks > 0 ? (contact.clicks / totalContactClicks) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({
      totalInteractions,
      uniqueVisitors,
      averageSessionTime,
      hourlyStats,
      dailyStats,
      popularElements,
      popularSections,
      scheduleStats: {
        totalViews: scheduleAnalytics.length,
        peakHours: schedulePeakHours,
        mostViewedDay,
      },
      contactStats,
    });

  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed analytics' },
      { status: 500 }
    );
  }
}
