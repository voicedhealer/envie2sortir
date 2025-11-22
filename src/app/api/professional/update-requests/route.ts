import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = await createClient();

    // Récupérer toutes les demandes du professionnel
    const { data: requests, error: requestsError } = await supabase
      .from('professional_update_requests')
      .select('*')
      .eq('professional_id', user.id)
      .in('status', ['pending', 'rejected'])
      .order('requested_at', { ascending: false });

    if (requestsError) {
      console.error('Erreur récupération demandes:', requestsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des demandes' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedRequests = (requests || []).map((req: any) => ({
      ...req,
      professionalId: req.professional_id,
      establishmentId: req.establishment_id,
      requestedAt: req.requested_at,
      reviewedAt: req.reviewed_at,
      createdAt: req.created_at,
      updatedAt: req.updated_at
    }));

    return NextResponse.json({ 
      success: true,
      requests: formattedRequests
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des demandes' 
    }, { status: 500 });
  }
}

