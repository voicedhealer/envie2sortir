import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

/**
 * Route pour vérifier les statuts des établissements (debug)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabase = await createClient();

    // Récupérer tous les établissements avec leur propriétaire
    const { data: establishments, error } = await supabase
      .from('establishments')
      .select(`
        id,
        name,
        status,
        created_at,
        owner_id,
        owner:professionals!establishments_owner_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération établissements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compter par statut
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      other: 0
    };

    establishments?.forEach((est: any) => {
      if (stats[est.status as keyof typeof stats] !== undefined) {
        stats[est.status as keyof typeof stats]++;
      } else {
        stats.other++;
      }
    });

    return NextResponse.json({
      success: true,
      total: establishments?.length || 0,
      stats,
      establishments: establishments?.map((est: any) => ({
        id: est.id,
        name: est.name,
        status: est.status,
        createdAt: est.created_at,
        owner: est.owner ? {
          email: est.owner.email,
          name: `${est.owner.first_name} ${est.owner.last_name}`
        } : null
      }))
    });

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

