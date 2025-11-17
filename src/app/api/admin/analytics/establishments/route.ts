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

    const supabase = await createClient();

    // Récupérer tous les établissements
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('id, name, slug');
    
    if (establishmentsError) {
      console.error('Error fetching establishments:', establishmentsError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

    // Récupérer toutes les analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('click_analytics')
      .select('establishment_id, element_id, element_name, timestamp')
      .order('timestamp', { ascending: false });
    
    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

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
