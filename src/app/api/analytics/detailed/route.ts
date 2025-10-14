import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getPremiumRequiredError } from '@/lib/subscription-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const period = searchParams.get('period') || '30d';

    if (!establishmentId) {
      return NextResponse.json({ error: 'establishmentId is required' }, { status: 400 });
    }

    // Vérifier l'abonnement
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { subscription: true }
    });
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

    // Récupérer toutes les données d'analytics pour l'établissement
    const analytics = await prisma.clickAnalytics.findMany({
      where: {
        establishmentId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (analytics.length === 0) {
      return NextResponse.json({
        totalInteractions: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        hourlyStats: [],
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: {
          totalViews: 0,
          peakHours: [],
          mostViewedDay: 'N/A',
        },
        contactStats: [],
      });
    }

    // Statistiques générales
    const totalInteractions = analytics.length;
    const uniqueVisitors = new Set(analytics.map(a => a.userAgent)).size;
    const averageSessionTime = Math.round(analytics.length / Math.max(uniqueVisitors, 1) * 2); // Estimation

    // Statistiques par heure
    const hourlyMap = new Map<number, { interactions: number; visitors: Set<string> }>();
    analytics.forEach(analytics => {
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
    analytics.forEach(analytics => {
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
    analytics.forEach(analytics => {
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
    analytics
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
    const scheduleAnalytics = analytics.filter(a => a.elementType === 'schedule');
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
    const contactAnalytics = analytics.filter(a => a.elementType === 'contact');
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
