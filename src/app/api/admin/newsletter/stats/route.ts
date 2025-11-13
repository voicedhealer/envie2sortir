import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = createClient();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Statistiques générales
    const [
      totalSubscribersResult,
      activeSubscribersResult,
      verifiedSubscribersResult,
      newThisWeekResult,
      unsubscribedThisWeekResult
    ] = await Promise.all([
      // Total des abonnés (tous ceux qui ont newsletter_opt_in = true)
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('newsletter_opt_in', true),
      
      // Abonnés actifs (newsletter_opt_in = true ET is_verified = true)
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('newsletter_opt_in', true)
        .eq('is_verified', true),
      
      // Abonnés vérifiés
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true),
      
      // Nouveaux abonnés cette semaine
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('newsletter_opt_in', true)
        .gte('created_at', oneWeekAgo),
      
      // Désabonnements cette semaine (approximatif)
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('newsletter_opt_in', false)
        .gte('updated_at', oneWeekAgo)
    ]);

    const totalSubscribers = totalSubscribersResult.count || 0;
    const activeSubscribers = activeSubscribersResult.count || 0;
    const verifiedSubscribers = verifiedSubscribersResult.count || 0;
    const newThisWeek = newThisWeekResult.count || 0;
    const unsubscribedThisWeek = unsubscribedThisWeekResult.count || 0;

    const stats = {
      totalSubscribers,
      activeSubscribers,
      verifiedSubscribers,
      newThisWeek,
      unsubscribedThisWeek,
      // Calculs dérivés
      verificationRate: totalSubscribers > 0 ? Math.round((verifiedSubscribers / totalSubscribers) * 100) : 0,
      weeklyGrowth: newThisWeek,
      churnRate: totalSubscribers > 0 ? Math.round((unsubscribedThisWeek / totalSubscribers) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [Newsletter Stats] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du calcul des statistiques" },
      { status: 500 }
    );
  }
}


