import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

// Créer une nouvelle action administrative
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 401 });
    }

    const supabase = createClient();
    const { establishmentId, action, reason, previousStatus, newStatus, details } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ message: 'ID établissement et action requis' }, { status: 400 });
    }

    // Vérifier que l'établissement existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ message: 'Établissement non trouvé' }, { status: 404 });
    }

    // Créer l'action administrative
    const { data: adminAction, error: actionError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        establishment_id: establishmentId,
        action,
        reason,
        previous_status: previousStatus,
        new_status: newStatus,
        details: details || null
      })
      .select(`
        *,
        admin:users!admin_actions_admin_id_fkey (
          first_name,
          last_name,
          email
        ),
        establishment:establishments!admin_actions_establishment_id_fkey (
          name,
          slug
        )
      `)
      .single();

    if (actionError || !adminAction) {
      console.error('Erreur création action admin:', actionError);
      return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const admin = Array.isArray(adminAction.admin) ? adminAction.admin[0] : adminAction.admin;
    const est = Array.isArray(adminAction.establishment) ? adminAction.establishment[0] : adminAction.establishment;

    const formattedAction = {
      ...adminAction,
      adminId: adminAction.admin_id,
      establishmentId: adminAction.establishment_id,
      previousStatus: adminAction.previous_status,
      newStatus: adminAction.new_status,
      createdAt: adminAction.created_at,
      admin: admin ? {
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email
      } : null,
      establishment: est ? {
        name: est.name,
        slug: est.slug
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      action: formattedAction,
      message: 'Action enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'action admin:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// Récupérer l'historique des actions
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construire la requête
    let query = supabase
      .from('admin_actions')
      .select(`
        *,
        admin:users!admin_actions_admin_id_fkey (
          first_name,
          last_name,
          email
        ),
        establishment:establishments!admin_actions_establishment_id_fkey (
          name,
          slug
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (establishmentId) {
      query = query.eq('establishment_id', establishmentId);
    }

    const { data: actions, error: actionsError, count } = await query;

    if (actionsError) {
      console.error('Erreur récupération actions admin:', actionsError);
      return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedActions = (actions || []).map((action: any) => {
      const admin = Array.isArray(action.admin) ? action.admin[0] : action.admin;
      const est = Array.isArray(action.establishment) ? action.establishment[0] : action.establishment;

      return {
        ...action,
        adminId: action.admin_id,
        establishmentId: action.establishment_id,
        previousStatus: action.previous_status,
        newStatus: action.new_status,
        createdAt: action.created_at,
        admin: admin ? {
          firstName: admin.first_name,
          lastName: admin.last_name,
          email: admin.email
        } : null,
        establishment: est ? {
          name: est.name,
          slug: est.slug
        } : null
      };
    });

    return NextResponse.json({ 
      actions: formattedActions, 
      totalCount: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actions admin:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

