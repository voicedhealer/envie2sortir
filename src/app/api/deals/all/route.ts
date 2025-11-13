import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDealActive } from '@/lib/deal-utils';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre de limite depuis l'URL (par défaut 12)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Date actuelle
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    console.log('📊 API /api/deals/all - Recherche des deals actifs...', { limit, today, tomorrow });
    
    const supabase = createClient();

    // Récupérer tous les bons plans actifs avec les informations de l'établissement
    let query = supabase
      .from('daily_deals')
      .select(`
        *,
        establishment:establishments!daily_deals_establishment_id_fkey (
          id,
          name,
          slug,
          address,
          city,
          image_url,
          activities,
          latitude,
          longitude
        )
      `)
      .eq('is_active', true)
      .lte('date_debut', tomorrow.toISOString())
      .gte('date_fin', today.toISOString())
      .order('created_at', { ascending: false });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data: activeDeals, error: dealsError } = await query;

    if (dealsError) {
      console.error('Erreur récupération deals:', dealsError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur serveur',
          details: dealsError.message
        },
        { status: 500 }
      );
    }

    console.log(`📊 API /api/deals/all - ${activeDeals.length} deals trouvés avant filtrage`);

    // Convertir snake_case -> camelCase et filtrer
    const formattedDeals = (activeDeals || []).map((deal: any) => {
      const establishment = Array.isArray(deal.establishment) ? deal.establishment[0] : deal.establishment;
      
      return {
        ...deal,
        id: deal.id,
        title: deal.title,
        description: deal.description,
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
        shortTitle: deal.short_title,
        shortDescription: deal.short_description,
        promoUrl: deal.promo_url,
        establishmentId: deal.establishment_id,
        createdAt: deal.created_at,
        updatedAt: deal.updated_at,
        establishment: establishment ? {
          id: establishment.id,
          name: establishment.name,
          slug: establishment.slug,
          address: establishment.address,
          city: establishment.city,
          imageUrl: establishment.image_url,
          activities: typeof establishment.activities === 'string' ? JSON.parse(establishment.activities) : establishment.activities,
          latitude: establishment.latitude,
          longitude: establishment.longitude
        } : null
      };
    });

    // Filtrer les bons plans qui sont actifs maintenant
    const currentActiveDeals = formattedDeals.filter((deal: any) => {
      return isDealActive(deal);
    });

    console.log(`✅ API /api/deals/all - ${currentActiveDeals.length} deals actifs retournés`);

    return NextResponse.json({
      success: true,
      deals: currentActiveDeals,
      total: currentActiveDeals.length
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de tous les bons plans actifs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

