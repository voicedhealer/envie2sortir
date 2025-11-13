import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Construire la requête
    let query = supabase
      .from('users')
      .select('id, email, newsletter_opt_in, is_verified, created_at, updated_at, preferences', { count: 'exact' });

    // Filtre par statut
    switch (status) {
      case 'active':
        query = query.eq('newsletter_opt_in', true).eq('is_verified', true);
        break;
      case 'inactive':
        query = query.eq('newsletter_opt_in', false);
        break;
      case 'unverified':
        query = query.eq('newsletter_opt_in', true).eq('is_verified', false);
        break;
    }

    // Recherche par email
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: subscribers, error: subscribersError, count } = await query;

    if (subscribersError) {
      console.error('Erreur récupération abonnés:', subscribersError);
      return NextResponse.json(
        { success: false, error: "Erreur lors du chargement des abonnés" },
        { status: 500 }
      );
    }

    // Convertir snake_case -> camelCase
    const formattedSubscribers = (subscribers || []).map((sub: any) => ({
      id: sub.id,
      email: sub.email,
      newsletterOptIn: sub.newsletter_opt_in,
      isVerified: sub.is_verified,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
      preferences: typeof sub.preferences === 'string' ? JSON.parse(sub.preferences || '{}') : (sub.preferences || {})
    }));

    return NextResponse.json({
      success: true,
      subscribers: formattedSubscribers,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ [Newsletter Admin] Erreur récupération abonnés:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des abonnés" },
      { status: 500 }
    );
  }
}


