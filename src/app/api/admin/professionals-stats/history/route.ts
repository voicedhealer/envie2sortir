import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [Stats History] Début de la récupération de l\'historique...');
    
    // Vérifier l'authentification admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '365'); // Par défaut 1 an
    const limit = parseInt(searchParams.get('limit') || '1000'); // Limite de résultats

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

    console.log(`📅 [Stats History] Récupération des snapshots du ${startDate.toISOString()} au ${endDate.toISOString()}`);

    // Récupérer les snapshots
    const { data: snapshots, error } = await adminClient
      .from('professional_stats_snapshots')
      .select('*')
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .lte('snapshot_date', endDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [Stats History] Erreur récupération:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'historique', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Stats History] ${snapshots?.length || 0} snapshots récupérés`);

    // Transformer les données pour l'affichage
    const history = snapshots?.map(snapshot => ({
      id: snapshot.id,
      date: snapshot.snapshot_date,
      timestamp: snapshot.snapshot_timestamp,
      overview: {
        totalEstablishments: snapshot.total_establishments,
        premiumCount: snapshot.premium_count,
        freeCount: snapshot.free_count,
        conversionRate: parseFloat(snapshot.conversion_rate) || 0
      },
      newEstablishments: {
        thisWeek: snapshot.new_this_week,
        thisMonth: snapshot.new_this_month,
        lastMonth: snapshot.new_last_month,
        growth: parseFloat(snapshot.new_growth) || 0
      },
      revenue: {
        currentMonth: parseFloat(snapshot.revenue_current_month) || 0,
        lastMonth: parseFloat(snapshot.revenue_last_month) || 0,
        growth: parseFloat(snapshot.revenue_growth) || 0,
        monthly: snapshot.monthly_revenue || [],
        weekly: snapshot.weekly_revenue || []
      },
      monthlyEvolution: snapshot.monthly_evolution || [],
      weeklyEvolution: snapshot.weekly_evolution || [],
      topCategories: snapshot.top_categories || []
    })) || [];

    return NextResponse.json({
      history,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      },
      total: history.length
    });

  } catch (error: any) {
    console.error('❌ [Stats History] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération de l\'historique',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

