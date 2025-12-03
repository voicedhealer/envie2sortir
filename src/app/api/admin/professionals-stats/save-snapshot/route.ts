import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [Save Stats Snapshot] Début de la sauvegarde...');
    
    // Vérifier l'authentification admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les statistiques actuelles en réutilisant la logique
    // On va directement utiliser le code de génération des stats
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

    // Appeler l'API stats pour récupérer les données
    const baseUrl = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
      : 'http://localhost:3000';
    
    const statsResponse = await fetch(`${baseUrl}/api/admin/professionals-stats`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'user-agent': request.headers.get('user-agent') || ''
      }
    });

    if (!statsResponse.ok) {
      const errorData = await statsResponse.json().catch(() => ({}));
      console.error('❌ [Save Stats Snapshot] Erreur récupération stats:', statsResponse.statusText);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques', details: errorData.error },
        { status: 500 }
      );
    }

    const stats = await statsResponse.json();
    const today = new Date();
    const snapshotDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const supabase = await createClient();
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

    // Vérifier si un snapshot existe déjà pour aujourd'hui
    const { data: existingSnapshot } = await adminClient
      .from('professional_stats_snapshots')
      .select('id')
      .eq('snapshot_date', snapshotDate)
      .maybeSingle();

    const snapshotData = {
      snapshot_date: snapshotDate,
      snapshot_timestamp: today.toISOString(),
      total_establishments: stats.overview.totalEstablishments,
      premium_count: stats.overview.premiumCount,
      free_count: stats.overview.freeCount,
      conversion_rate: stats.overview.conversionRate,
      new_this_week: stats.newEstablishments.thisWeek,
      new_this_month: stats.newEstablishments.thisMonth,
      new_last_month: stats.newEstablishments.lastMonth,
      new_growth: stats.newEstablishments.growth,
      revenue_current_month: stats.revenue.currentMonth,
      revenue_last_month: stats.revenue.lastMonth,
      revenue_growth: stats.revenue.growth,
      monthly_evolution: stats.monthlyEvolution,
      weekly_evolution: stats.weeklyEvolution,
      top_categories: stats.topCategories,
      monthly_revenue: stats.revenue.monthly,
      weekly_revenue: stats.revenue.weekly
    };

    let result;
    if (existingSnapshot) {
      // Mettre à jour le snapshot existant
      console.log('🔄 [Save Stats Snapshot] Mise à jour du snapshot existant pour', snapshotDate);
      const { data, error } = await adminClient
        .from('professional_stats_snapshots')
        .update(snapshotData)
        .eq('id', existingSnapshot.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Créer un nouveau snapshot
      console.log('✨ [Save Stats Snapshot] Création d\'un nouveau snapshot pour', snapshotDate);
      const { data, error } = await adminClient
        .from('professional_stats_snapshots')
        .insert(snapshotData)
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('❌ [Save Stats Snapshot] Erreur sauvegarde:', result.error);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du snapshot', details: result.error.message },
        { status: 500 }
      );
    }

    console.log('✅ [Save Stats Snapshot] Snapshot sauvegardé avec succès');
    return NextResponse.json({
      success: true,
      snapshot: result.data,
      message: existingSnapshot ? 'Snapshot mis à jour' : 'Snapshot créé'
    });

  } catch (error: any) {
    console.error('❌ [Save Stats Snapshot] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la sauvegarde du snapshot',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

