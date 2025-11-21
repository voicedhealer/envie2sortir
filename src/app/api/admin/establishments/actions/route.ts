import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

// Actions sur les établissements avec historique
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 401 });
    }

    // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est admin
    // La politique RLS "Only owner or admin can update establishments" garantit
    // que seuls les admins peuvent modifier tous les établissements
    const supabase = await createClient();
    const { establishmentId, action, reason } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ message: 'ID établissement et action requis' }, { status: 400 });
    }

    // Récupérer l'établissement actuel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ message: 'Établissement non trouvé' }, { status: 404 });
    }

    const previousStatus = establishment.status;
    let newStatus: string;
    let updateData: any = {};

    // Déterminer le nouveau statut selon l'action
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        updateData = {
          status: 'approved',
          rejection_reason: null,
          rejected_at: null,
          last_modified_at: new Date().toISOString()
        };
        break;
      
      case 'reject':
        if (!reason) {
          return NextResponse.json({ message: 'Raison du rejet requise' }, { status: 400 });
        }
        newStatus = 'rejected';
        updateData = {
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          last_modified_at: new Date().toISOString()
        };
        break;
      
      case 'pending':
        newStatus = 'pending';
        updateData = {
          status: 'pending',
          rejection_reason: null,
          rejected_at: null,
          last_modified_at: new Date().toISOString()
        };
        break;
      
      case 'delete':
        // Soft delete - marquer comme supprimé
        newStatus = 'deleted';
        updateData = {
          status: 'deleted',
          last_modified_at: new Date().toISOString()
        };
        break;
      
      default:
        return NextResponse.json({ message: 'Action non valide' }, { status: 400 });
    }

    // Mettre à jour l'établissement
    const { data: updatedEstablishment, error: updateError } = await supabase
      .from('establishments')
      .update(updateData)
      .eq('id', establishmentId)
      .select()
      .single();

    if (updateError || !updatedEstablishment) {
      console.error('Erreur mise à jour établissement:', updateError);
      return NextResponse.json({ message: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Créer l'action administrative
    const { data: adminAction, error: actionError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        establishment_id: establishmentId,
        action: action.toUpperCase(),
        reason,
        previous_status: previousStatus,
        new_status: newStatus,
        details: {
          establishmentName: establishment.name,
          adminEmail: user.email,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (actionError) {
      console.error('Erreur création action admin:', actionError);
      // Ne pas échouer si l'action admin n'a pas pu être créée
    }

    // Convertir snake_case -> camelCase
    const formattedEstablishment = {
      ...updatedEstablishment,
      rejectionReason: updatedEstablishment.rejection_reason,
      rejectedAt: updatedEstablishment.rejected_at,
      lastModifiedAt: updatedEstablishment.last_modified_at,
      createdAt: updatedEstablishment.created_at,
      updatedAt: updatedEstablishment.updated_at
    };

    return NextResponse.json({ 
      success: true, 
      establishment: formattedEstablishment,
      action: adminAction,
      message: `Établissement ${action === 'approve' ? 'approuvé' : 
                action === 'reject' ? 'rejeté' : 
                action === 'pending' ? 'remis en attente' : 'supprimé'} avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'action sur l\'établissement:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

