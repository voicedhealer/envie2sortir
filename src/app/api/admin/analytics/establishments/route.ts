import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Accès refusé - Admin requis' },
        { status: 403 }
      );
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est admin
    // La politique RLS "Click analytics are viewable by establishment owners and admins" 
    // et "Establishments are viewable by owner, admin or if approved" garantissent 
    // que seuls les admins peuvent accéder à ces données
    const supabase = await createClient();

    // Vérifier la session pour debug
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Erreur session:', sessionError);
    }
    console.log('🔍 Session pour analytics:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userRole: user.role 
    });

    // Récupérer tous les établissements
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('id, name, slug');
    
    if (establishmentsError) {
      console.error('❌ Error fetching establishments:', establishmentsError);
      console.error('❌ Détails:', JSON.stringify(establishmentsError, null, 2));
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des établissements',
          details: establishmentsError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Établissements récupérés:', establishments?.length || 0);

    // Récupérer toutes les analytics
    // ✅ RLS vérifie automatiquement que l'utilisateur est admin
    const { data: analytics, error: analyticsError } = await supabase
      .from('click_analytics')
      .select('establishment_id, element_id, element_name, timestamp')
      .order('timestamp', { ascending: false });
    
    if (analyticsError) {
      console.error('❌ Error fetching analytics:', analyticsError);
      console.error('❌ Code:', analyticsError.code);
      console.error('❌ Message:', analyticsError.message);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des analytics',
          details: analyticsError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Analytics récupérées:', analytics?.length || 0);

    // Traiter les données pour chaque établissement
    const establishmentsWithAnalytics = (establishments || []).map(establishment => {
      const establishmentAnalytics = (analytics || []).filter(
        (a: any) => a.establishment_id === establishment.id
      );
      
      const totalClicks = establishmentAnalytics.length;
      
      // Trouver l'élément le plus cliqué
      const elementCounts = establishmentAnalytics.reduce((acc: Record<string, number>, click: any) => {
        const key = click.element_name || click.element_id;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topElement = Object.entries(elementCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      const lastActivity = establishmentAnalytics.length > 0 
        ? new Date(establishmentAnalytics[0].timestamp) 
        : new Date();

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        totalClicks,
        topElement: topElement ? topElement[0] : 'Aucune donnée',
        topElementClicks: topElement ? topElement[1] : 0,
        lastActivity: lastActivity.toISOString(),
      };
    });

    // Trier par nombre de clics (décroissant)
    establishmentsWithAnalytics.sort((a, b) => b.totalClicks - a.totalClicks);

    return NextResponse.json(establishmentsWithAnalytics);
  } catch (error) {
    console.error('Error fetching establishments analytics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
