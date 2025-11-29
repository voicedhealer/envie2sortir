import { NextRequest, NextResponse } from 'next/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/supabase/helpers';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/waitlist/list
 * Retourne la liste des professionnels en waitlist
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

    // Récupérer les professionnels en waitlist avec leurs établissements
    const { data: professionals, error } = await adminClient
      .from('professionals')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        siret,
        company_name,
        legal_status,
        created_at,
        establishment:establishments!establishments_owner_id_fkey (
          name
        )
      `)
      .eq('subscription_plan', 'WAITLIST_BETA')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération waitlist:', error);
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la récupération' },
        { status: 500 }
      );
    }

    // Formater les données
    const formattedPros = (professionals || []).map((pro: any) => ({
      id: pro.id,
      email: pro.email,
      firstName: pro.first_name,
      lastName: pro.last_name,
      establishmentName: pro.establishment?.[0]?.name || pro.establishment?.name || 'Non défini',
      phone: pro.phone,
      siret: pro.siret,
      companyName: pro.company_name,
      legalStatus: pro.legal_status,
      createdAt: pro.created_at,
    }));

    return NextResponse.json({ professionals: formattedPros }, { status: 200 });
  } catch (error: any) {
    console.error('❌ [Waitlist List] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

