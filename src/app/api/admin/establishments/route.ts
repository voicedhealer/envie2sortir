import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est admin
    // La politique RLS "Establishments are viewable by owner, admin or if approved" garantit
    // que seuls les admins peuvent voir tous les établissements (y compris pending)
    const supabase = await createClient();

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Construire la requête
    let query = supabase
      .from('establishments')
      .select(`
        id,
        name,
        slug,
        description,
        address,
        city,
        phone,
        email,
        website,
        status,
        subscription,
        rejection_reason,
        rejected_at,
        last_modified_at,
        created_at,
        updated_at,
        activities,
        owner:professionals!establishments_owner_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          company_name,
          siret,
          legal_status,
          siret_verified,
          siret_verified_at,
          terms_accepted_cgv,
          terms_accepted_cgu,
          terms_accepted_cgv_at,
          terms_accepted_cgu_at,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      // Recherche dans plusieurs champs (Supabase ne supporte pas OR directement, on fait plusieurs requêtes)
      const searchLower = search.toLowerCase();
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: establishments, error: establishmentsError } = await query;

    if (establishmentsError) {
      console.error('Erreur récupération établissements:', establishmentsError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Compter le total (sans pagination)
    let countQuery = supabase.from('establishments').select('*', { count: 'exact', head: true });
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    const { count: total, error: countError } = await countQuery;

    // Statistiques par statut
    const { data: allEstablishments, error: statsError } = await supabase
      .from('establishments')
      .select('status');

    const statusStats: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    if (allEstablishments) {
      allEstablishments.forEach((est: any) => {
        statusStats[est.status] = (statusStats[est.status] || 0) + 1;
      });
    }

    // Convertir snake_case -> camelCase et calculer les compteurs
    const formattedEstablishments = await Promise.all((establishments || []).map(async (est: any) => {
      // Compter les images, événements, commentaires, favoris, menus, deals
      const [imagesCount, eventsCount, commentsCount, favoritesCount, menusCount, dealsCount] = await Promise.all([
        supabase.from('images').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id),
        supabase.from('user_comments').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id),
        supabase.from('user_favorites').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id),
        supabase.from('establishment_menus').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id),
        supabase.from('daily_deals').select('*', { count: 'exact', head: true }).eq('establishment_id', est.id)
      ]);

      const owner = est.owner ? (Array.isArray(est.owner) ? est.owner[0] : est.owner) : null;

      return {
        id: est.id,
        name: est.name,
        slug: est.slug,
        description: est.description,
        address: est.address,
        city: est.city,
        phone: est.phone,
        email: est.email,
        website: est.website,
        status: est.status,
        subscription: est.subscription,
        rejectionReason: est.rejection_reason,
        rejectedAt: est.rejected_at,
        lastModifiedAt: est.last_modified_at,
        createdAt: est.created_at,
        updatedAt: est.updated_at,
        activities: typeof est.activities === 'string' ? JSON.parse(est.activities) : est.activities,
        owner: owner ? {
          id: owner.id,
          firstName: owner.first_name,
          lastName: owner.last_name,
          email: owner.email,
          phone: owner.phone,
          companyName: owner.company_name,
          siret: owner.siret,
          legalStatus: owner.legal_status,
          siretVerified: owner.siret_verified,
          siretVerifiedAt: owner.siret_verified_at,
          // ✅ CORRECTION : Ne pas convertir false en null (false est une valeur valide)
          termsAcceptedCgv: owner.terms_accepted_cgv !== null && owner.terms_accepted_cgv !== undefined ? owner.terms_accepted_cgv : null,
          termsAcceptedCgu: owner.terms_accepted_cgu !== null && owner.terms_accepted_cgu !== undefined ? owner.terms_accepted_cgu : null,
          termsAcceptedCgvAt: owner.terms_accepted_cgv_at ?? null,
          termsAcceptedCguAt: owner.terms_accepted_cgu_at ?? null,
          createdAt: owner.created_at,
          updatedAt: owner.updated_at
        } : null,
        _count: {
          images: imagesCount.count || 0,
          events: eventsCount.count || 0,
          comments: commentsCount.count || 0,
          favorites: favoritesCount.count || 0,
          menus: menusCount.count || 0,
          deals: dealsCount.count || 0
        }
      };
    }));

    return NextResponse.json({
      establishments: formattedEstablishments,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      },
      stats: {
        pending: statusStats.pending || 0,
        approved: statusStats.approved || 0,
        rejected: statusStats.rejected || 0,
        total: total || 0
      }
    });

  } catch (error) {
    console.error('Erreur API admin établissements:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est admin
    // La politique RLS "Only owner or admin can update establishments" garantit
    // que seuls les admins peuvent modifier tous les établissements
    const supabase = await createClient();
    const { establishmentId, action, rejectionReason } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          rejection_reason: null,
          rejected_at: null
        };
        break;
      
      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json({ error: 'Raison du rejet requise' }, { status: 400 });
        }
        updateData = {
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString()
        };
        break;
      
      default:
        return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
    }

    // Mettre à jour l'établissement
    const { data: updatedEstablishment, error: updateError } = await supabase
      .from('establishments')
      .update(updateData)
      .eq('id', establishmentId)
      .select(`
        *,
        owner:professionals!establishments_owner_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          company_name,
          siret,
          legal_status,
          siret_verified,
          siret_verified_at
        )
      `)
      .single();

    if (updateError || !updatedEstablishment) {
      console.error('Erreur mise à jour établissement:', updateError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const owner = updatedEstablishment.owner ? (Array.isArray(updatedEstablishment.owner) ? updatedEstablishment.owner[0] : updatedEstablishment.owner) : null;

    const formattedEstablishment = {
      ...updatedEstablishment,
      rejectionReason: updatedEstablishment.rejection_reason,
      rejectedAt: updatedEstablishment.rejected_at,
      lastModifiedAt: updatedEstablishment.last_modified_at,
      createdAt: updatedEstablishment.created_at,
      updatedAt: updatedEstablishment.updated_at,
      owner: owner ? {
        id: owner.id,
        firstName: owner.first_name,
        lastName: owner.last_name,
        email: owner.email,
        phone: owner.phone,
        companyName: owner.company_name,
        siret: owner.siret,
        legalStatus: owner.legal_status,
        siretVerified: owner.siret_verified,
        siretVerifiedAt: owner.siret_verified_at
      } : null
    };

    // TODO: Envoyer notification au professionnel
    // - Email de notification
    // - Notification dans le dashboard

    return NextResponse.json({
      success: true,
      establishment: formattedEstablishment,
      message: action === 'approve' 
        ? 'Établissement approuvé avec succès'
        : 'Établissement rejeté avec succès'
    });

  } catch (error) {
    console.error('Erreur API admin établissements PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
