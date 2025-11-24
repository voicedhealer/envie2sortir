import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabase = await createClient();

    // Compter les établissements en attente
    const { count: pendingEstablishments } = await supabase
      .from('establishments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Compter les demandes de modification en attente
    const { count: pendingUpdates } = await supabase
      .from('professional_update_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total des éléments en attente
    const totalPending = (pendingEstablishments || 0) + (pendingUpdates || 0);

    return NextResponse.json({ 
      success: true,
      count: totalPending,
      details: {
        establishments: pendingEstablishments || 0,
        professionalUpdates: pendingUpdates || 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du compteur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du compteur' 
    }, { status: 500 });
  }
}

