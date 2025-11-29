import { NextRequest, NextResponse } from 'next/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/supabase/helpers';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/waitlist/count
 * Retourne le nombre de professionnels en waitlist
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Compter les professionnels en waitlist
    const { count, error } = await adminClient
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan', 'WAITLIST_BETA');

    if (error) {
      console.error('Erreur comptage waitlist:', error);
      return NextResponse.json(
        { error: error.message || 'Erreur lors du comptage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 }, { status: 200 });
  } catch (error: any) {
    console.error('❌ [Waitlist Count] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

