import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDealActive } from '@/lib/deal-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const { establishmentId } = await params;
    console.log('API deals/active - establishmentId:', establishmentId);
    
    // Vérifier que l'ID est valide
    if (!establishmentId) {
      console.error('API deals/active - establishmentId manquant');
      return NextResponse.json(
        { error: 'ID d\'établissement manquant' },
        { status: 400 }
      );
    }
    
    // Date actuelle
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Utiliser le client admin pour bypass RLS (route publique)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error('API deals/active - Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }
    
    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Récupérer les bons plans actifs
    console.log('API deals/active - Recherche des deals pour:', { establishmentId, today });
    
    // Récupérer tous les deals actifs de l'établissement
    const { data: activeDeals, error: dealsError } = await supabase
      .from('daily_deals')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (dealsError) {
      console.error('Erreur récupération deals:', dealsError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des bons plans',
          details: process.env.NODE_ENV === 'production' ? undefined : dealsError.message,
          code: process.env.NODE_ENV === 'production' ? undefined : dealsError.code
        },
        { status: 500 }
      );
    }

    console.log('API deals/active - Deals trouvés:', activeDeals?.length || 0);

    // Convertir snake_case -> camelCase
    const formattedDeals = (activeDeals || []).map((deal: any) => ({
      id: deal.id,
      establishmentId: deal.establishment_id,
      title: deal.title,
      description: deal.description,
      modality: deal.modality,
      originalPrice: deal.original_price,
      discountedPrice: deal.discounted_price,
      imageUrl: deal.image_url,
      pdfUrl: deal.pdf_url,
      dateDebut: deal.date_debut,
      dateFin: deal.date_fin,
      heureDebut: deal.heure_debut,
      heureFin: deal.heure_fin,
      isActive: deal.is_active,
      promoUrl: deal.promo_url,
      isRecurring: deal.is_recurring,
      recurrenceType: deal.recurrence_type,
      recurrenceDays: deal.recurrence_days ? JSON.parse(deal.recurrence_days) : null,
      recurrenceEndDate: deal.recurrence_end_date,
      createdAt: deal.created_at
    }));

    // Filtrer les bons plans qui sont actifs maintenant en utilisant la fonction centralisée
    const currentActiveDeals = formattedDeals.filter((deal: any) => {
      return isDealActive(deal);
    });

    console.log('API deals/active - Deals actifs maintenant:', currentActiveDeals.length, currentActiveDeals);

    return NextResponse.json({
      success: true,
      deals: currentActiveDeals
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des bons plans actifs:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'production' ? undefined : (error as Error).message
      },
      { status: 500 }
    );
  }
}