import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClientAdmin } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, type, timestamp } = body;

    // Validation des données
    if (!dealId || !type || !['liked', 'disliked'].includes(type)) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Vérifier que le bon plan existe
    const { data: deal, error: dealError } = await supabase
      .from('daily_deals')
      .select('id, establishment_id, title')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Bon plan non trouvé' },
        { status: 404 }
      );
    }

    // Obtenir l'IP de l'utilisateur pour éviter les doublons
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    // Vérifier si l'utilisateur a déjà donné son avis sur ce bon plan
    const { data: existingEngagement } = await supabase
      .from('deal_engagements')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_ip', ip)
      .single();

    if (existingEngagement) {
      // Mettre à jour l'engagement existant
      await supabase
        .from('deal_engagements')
        .update({
          type: type,
          timestamp: new Date(timestamp).toISOString()
        })
        .eq('id', existingEngagement.id);
    } else {
      // Créer un nouvel engagement
      await supabase
        .from('deal_engagements')
        .insert({
          deal_id: dealId,
          establishment_id: deal.establishment_id,
          type: type,
          user_ip: ip,
          timestamp: new Date(timestamp).toISOString()
        });
    }

    console.log(`Engagement ${type} enregistré pour le deal ${dealId} (${deal.title})`);

    return NextResponse.json({
      success: true,
      message: 'Engagement enregistré avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'engagement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les statistiques d'engagement d'un bon plan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const establishmentId = searchParams.get('establishmentId');

    if (!dealId && !establishmentId) {
      return NextResponse.json(
        { error: 'dealId ou establishmentId requis' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour bypass RLS (route utilisée par les professionnels)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('API deals/engagement - Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Construire la requête
    let query = supabase.from('deal_engagements').select('type, timestamp, deal_id');
    
    if (dealId) {
      query = query.eq('deal_id', dealId);
    } else if (establishmentId) {
      query = query.eq('establishment_id', establishmentId);
    }

    // Récupérer les statistiques d'engagement
    const { data: engagements, error: engagementsError } = await query;

    if (engagementsError) {
      console.error('Erreur récupération engagements:', engagementsError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Calculer les statistiques
    const stats = (engagements || []).reduce((acc: any, engagement: any) => {
      if (engagement.type === 'liked') {
        acc.liked++;
      } else if (engagement.type === 'disliked') {
        acc.disliked++;
      }
      return acc;
    }, { liked: 0, disliked: 0 });

    const total = stats.liked + stats.disliked;
    const engagementRate = total > 0 ? (stats.liked / total) * 100 : 0;

    // Convertir snake_case -> camelCase pour les engagements
    const formattedEngagements = (engagements || []).slice(-10).map((e: any) => ({
      type: e.type,
      timestamp: e.timestamp,
      dealId: e.deal_id
    }));

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        total,
        engagementRate: Math.round(engagementRate * 100) / 100
      },
      engagements: formattedEngagements // Derniers 10 engagements pour debugging
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



