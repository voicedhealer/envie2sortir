import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      searchTerm,
      resultCount,
      clickedEstablishmentId,
      clickedEstablishmentName,
      userAgent,
      referrer,
      city,
      searchedCity,
    } = body;

    // Validation des données requises
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'searchTerm is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Enregistrer la recherche
    const { error: insertError } = await supabase
      .from('search_analytics')
      .insert({
        search_term: searchTerm.trim().toLowerCase(),
        result_count: resultCount || 0,
        clicked_establishment_id: clickedEstablishmentId,
        clicked_establishment_name: clickedEstablishmentName,
        user_agent: userAgent || request.headers.get('user-agent'),
        referrer: referrer || request.headers.get('referer'),
        city,
        searched_city: searchedCity,
        timestamp: new Date().toISOString()
      });

    if (insertError) {
      console.error('Erreur enregistrement search analytics:', insertError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

