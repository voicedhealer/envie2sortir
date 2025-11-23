import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

/**
 * Route API pour définir le rôle admin dans les métadonnées JWT
 * Nécessite d'être déjà admin pour exécuter cette action
 * OU peut être utilisée avec une clé secrète pour la configuration initiale
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secretKey } = body;

    // Vérifier la clé secrète OU que l'utilisateur est déjà admin
    const userIsAdmin = await isAdmin();
    const isValidSecret = secretKey === process.env.ADMIN_SETUP_SECRET_KEY;

    if (!userIsAdmin && !isValidSecret) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous devez être admin ou fournir une clé secrète valide.' },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour modifier app_metadata
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const adminClient = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Récupérer l'utilisateur par email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erreur lors de la récupération des utilisateurs:', listError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return NextResponse.json(
        { error: `Utilisateur avec l'email ${email} non trouvé` },
        { status: 404 }
      );
    }

    // Mettre à jour app_metadata avec le rôle admin
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      {
        app_metadata: {
          ...targetUser.app_metadata,
          role: 'admin'
        }
      }
    );

    if (updateError) {
      console.error('Erreur lors de la mise à jour du rôle:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du rôle admin' },
        { status: 500 }
      );
    }

    // Mettre à jour aussi la table users pour cohérence
    const supabase = await createClient();
    const { error: tableUpdateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', targetUser.id);

    if (tableUpdateError) {
      console.warn('⚠️ Erreur lors de la mise à jour de la table users:', tableUpdateError);
      // Ne pas échouer si la table users n'est pas mise à jour, car app_metadata est la source de vérité
    }

    return NextResponse.json({
      success: true,
      message: `Rôle admin défini avec succès pour ${email}`,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: updatedUser.user.app_metadata?.role
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la définition du rôle admin:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la définition du rôle admin' },
      { status: 500 }
    );
  }
}

