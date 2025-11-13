import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const { establishmentId } = await params;
    console.log('🔍 API GET /api/deals/by-establishment - Recherche pour:', establishmentId);

    const supabase = createClient();

    // Récupérer l'établissement pour vérifier s'il existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name')
      .eq('id', establishmentId)
      .single();

    console.log('🏢 Établissement trouvé:', establishment);

    if (establishmentError || !establishment) {
      console.error('❌ Établissement introuvable');
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Récupérer tous les bons plans de l'établissement
    const { data: deals, error: dealsError } = await supabase
      .from('daily_deals')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('date_debut', { ascending: false });

    if (dealsError) {
      console.error('Erreur récupération deals:', dealsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des bons plans' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedDeals = (deals || []).map((deal: any) => ({
      ...deal,
      establishmentId: deal.establishment_id,
      originalPrice: deal.original_price,
      discountedPrice: deal.discounted_price,
      imageUrl: deal.image_url,
      pdfUrl: deal.pdf_url,
      dateDebut: deal.date_debut,
      dateFin: deal.date_fin,
      heureDebut: deal.heure_debut,
      heureFin: deal.heure_fin,
      isActive: deal.is_active,
      isRecurring: deal.is_recurring,
      recurrenceType: deal.recurrence_type,
      recurrenceDays: deal.recurrence_days ? JSON.parse(deal.recurrence_days) : null,
      recurrenceEndDate: deal.recurrence_end_date,
      promoUrl: deal.promo_url,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    }));

    console.log('📋 Bons plans trouvés:', formattedDeals.length, 'deals');
    console.log('📋 Détails des deals:', formattedDeals.map((d: any) => ({ id: d.id, title: d.title, isActive: d.isActive })));

    return NextResponse.json({ 
      success: true,
      deals: formattedDeals
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bons plans:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des bons plans' 
    }, { status: 500 });
  }
}




