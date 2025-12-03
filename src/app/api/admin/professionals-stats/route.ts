import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { hasPremiumAccess } from '@/lib/subscription-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [Professionals Stats] Début de la récupération des statistiques...');
    
    // Vérifier l'authentification admin
    const adminCheck = await isAdmin();
    console.log('🔐 [Professionals Stats] Vérification admin:', adminCheck);
    
    if (!adminCheck) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [Professionals Stats] Configuration Supabase manquante');
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Statistiques Premium vs Free
    console.log('📊 [Professionals Stats] Récupération des établissements...');
    const { data: allEstablishments, error: establishmentsError } = await adminClient
      .from('establishments')
      .select('id, subscription, status, created_at, owner_id')
      .eq('status', 'approved');

    if (establishmentsError) {
      console.error('❌ [Professionals Stats] Erreur récupération établissements:', establishmentsError);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des données',
        details: establishmentsError.message 
      }, { status: 500 });
    }

    console.log('✅ [Professionals Stats] Établissements récupérés:', allEstablishments?.length || 0);

    const totalEstablishments = allEstablishments?.length || 0;
    const premiumCount = allEstablishments?.filter(e => {
      try {
        return hasPremiumAccess((e.subscription || 'FREE') as any);
      } catch (err) {
        console.warn('⚠️ [Professionals Stats] Erreur lors du filtrage premium:', err, e);
        return false;
      }
    }).length || 0;
    const freeCount = totalEstablishments - premiumCount;
    const conversionRate = totalEstablishments > 0 ? (premiumCount / totalEstablishments) * 100 : 0;

    // 2. Nouveaux établissements par période
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const newThisWeek = allEstablishments?.filter(e => {
      try {
        const created = new Date(e.created_at || e.createdAt);
        return !isNaN(created.getTime()) && created >= startOfWeek;
      } catch (err) {
        console.warn('⚠️ [Professionals Stats] Erreur date création (semaine):', err, e);
        return false;
      }
    }).length || 0;

    const newThisMonth = allEstablishments?.filter(e => {
      try {
        const created = new Date(e.created_at || e.createdAt);
        return !isNaN(created.getTime()) && created >= startOfMonth;
      } catch (err) {
        console.warn('⚠️ [Professionals Stats] Erreur date création (mois):', err, e);
        return false;
      }
    }).length || 0;

    const newLastMonth = allEstablishments?.filter(e => {
      try {
        const created = new Date(e.created_at || e.createdAt);
        return !isNaN(created.getTime()) && created >= startOfLastMonth && created <= endOfLastMonth;
      } catch (err) {
        console.warn('⚠️ [Professionals Stats] Erreur date création (mois dernier):', err, e);
        return false;
      }
    }).length || 0;

    // 3. Évolution mensuelle (12 derniers mois)
    const monthlyEvolution: Array<{ month: string; count: number; premium: number; free: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthEstablishments = allEstablishments?.filter(e => {
        try {
          const created = new Date(e.created_at || e.createdAt);
          return !isNaN(created.getTime()) && created >= monthStart && created <= monthEnd;
        } catch (err) {
          return false;
        }
      }) || [];

      const monthPremium = monthEstablishments.filter(e => hasPremiumAccess(e.subscription as any)).length;
      const monthFree = monthEstablishments.length - monthPremium;

      monthlyEvolution.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        count: monthEstablishments.length,
        premium: monthPremium,
        free: monthFree
      });
    }

    // 4. Évolution hebdomadaire (12 dernières semaines)
    const weeklyEvolution: Array<{ week: string; count: number; premium: number; free: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekEstablishments = allEstablishments?.filter(e => {
        try {
          const created = new Date(e.created_at || e.createdAt);
          return !isNaN(created.getTime()) && created >= weekStart && created <= weekEnd;
        } catch (err) {
          return false;
        }
      }) || [];

      const weekPremium = weekEstablishments.filter(e => hasPremiumAccess(e.subscription as any)).length;
      const weekFree = weekEstablishments.length - weekPremium;

      weeklyEvolution.push({
        week: `Sem. ${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        count: weekEstablishments.length,
        premium: weekPremium,
        free: weekFree
      });
    }

    // 5. Catégories les plus présentes (via specialites)
    console.log('📊 [Professionals Stats] Récupération des catégories...');
    const { data: establishmentsWithCategories, error: categoriesError } = await adminClient
      .from('establishments')
      .select('specialites, activities')
      .eq('status', 'approved');

    if (categoriesError) {
      console.warn('⚠️ [Professionals Stats] Erreur récupération catégories:', categoriesError);
    }

    const categoryCount: Record<string, number> = {};
    establishmentsWithCategories?.forEach(e => {
      try {
        // Traiter les spécialités (string séparée par virgules)
        if (e.specialites && typeof e.specialites === 'string') {
          const specialties = e.specialites.split(',').map(s => s.trim()).filter(s => s);
          specialties.forEach(spec => {
            categoryCount[spec] = (categoryCount[spec] || 0) + 1;
          });
        }

        // Traiter les activités (JSON)
        if (e.activities && typeof e.activities === 'object') {
          const activities = e.activities as any;
          if (Array.isArray(activities)) {
            activities.forEach((act: string) => {
              if (typeof act === 'string') {
                categoryCount[act] = (categoryCount[act] || 0) + 1;
              }
            });
          } else if (typeof activities === 'object') {
            Object.keys(activities).forEach(key => {
              if (activities[key]) {
                categoryCount[key] = (categoryCount[key] || 0) + 1;
              }
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ [Professionals Stats] Erreur traitement catégorie:', err, e);
      }
    });

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 6. Recettes estimées (basées sur les établissements premium)
    // Prix mensuel estimé : 29.90€ (à ajuster selon vos tarifs réels)
    const MONTHLY_PRICE = 29.90;
    const ANNUAL_PRICE = 299.00; // Prix annuel (si applicable)

    // Calculer les recettes mensuelles (12 derniers mois)
    const monthlyRevenue: Array<{ month: string; revenue: number; premiumCount: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      // Compter les établissements premium actifs à la fin de ce mois
      const premiumAtMonthEnd = allEstablishments?.filter(e => {
        try {
          const created = new Date(e.created_at || e.createdAt);
          return !isNaN(created.getTime()) && created <= monthEnd && hasPremiumAccess((e.subscription || 'FREE') as any);
        } catch (err) {
          return false;
        }
      }).length || 0;

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: premiumAtMonthEnd * MONTHLY_PRICE,
        premiumCount: premiumAtMonthEnd
      });
    }

    // Calculer les recettes hebdomadaires (12 dernières semaines)
    const weeklyRevenue: Array<{ week: string; revenue: number; premiumCount: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Compter les établissements premium actifs à la fin de cette semaine
      const premiumAtWeekEnd = allEstablishments?.filter(e => {
        try {
          const created = new Date(e.created_at || e.createdAt);
          return !isNaN(created.getTime()) && created <= weekEnd && hasPremiumAccess((e.subscription || 'FREE') as any);
        } catch (err) {
          return false;
        }
      }).length || 0;

      // Recette hebdomadaire = (prix mensuel / 4.33 semaines)
      weeklyRevenue.push({
        week: `Sem. ${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        revenue: premiumAtWeekEnd * (MONTHLY_PRICE / 4.33),
        premiumCount: premiumAtWeekEnd
      });
    }

    // 7. Statistiques globales
    const totalRevenueThisMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
    const totalRevenueLastMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
    const revenueGrowth = totalRevenueLastMonth > 0 
      ? ((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100 
      : 0;

    const stats = {
      overview: {
        totalEstablishments,
        premiumCount,
        freeCount,
        conversionRate: Math.round(conversionRate * 10) / 10
      },
      newEstablishments: {
        thisWeek: newThisWeek,
        thisMonth: newThisMonth,
        lastMonth: newLastMonth,
        growth: newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 : 0
      },
      monthlyEvolution,
      weeklyEvolution,
      topCategories,
      revenue: {
        monthly: monthlyRevenue,
        weekly: weeklyRevenue,
        currentMonth: totalRevenueThisMonth,
        lastMonth: totalRevenueLastMonth,
        growth: Math.round(revenueGrowth * 10) / 10
      },
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('❌ [Professionals Stats] Erreur lors de la récupération des statistiques professionnelles:', error);
    console.error('❌ [Professionals Stats] Stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des statistiques',
        details: error?.message || 'Erreur inconnue',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

