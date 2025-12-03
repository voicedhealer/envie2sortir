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

    // ✅ Utiliser le client admin pour bypasser RLS
    // Les politiques RLS peuvent être complexes, donc on utilise le service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Clés Supabase manquantes');
      return NextResponse.json({ message: 'Configuration Supabase manquante' }, { status: 500 });
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });
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
        // Soft delete - marquer comme rejeté (car 'deleted' n'existe pas dans l'enum)
        newStatus = 'rejected';
        updateData = {
          status: 'rejected',
          rejection_reason: reason || 'Supprimé par un administrateur',
          rejected_at: new Date().toISOString(),
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
      console.error('Détails de la mise à jour:', {
        establishmentId,
        updateData,
        error: updateError
      });
      return NextResponse.json({ 
        message: 'Erreur lors de la mise à jour',
        error: updateError?.message || 'Erreur inconnue'
      }, { status: 500 });
    }

    // Créer l'action administrative
    // Mapper l'action vers la valeur de l'enum
    const actionMap: Record<string, string> = {
      'approve': 'APPROVE',
      'reject': 'REJECT',
      'pending': 'PENDING',
      'delete': 'DELETE',
      'restore': 'RESTORE',
      'update': 'UPDATE'
    };
    
    const actionEnum = actionMap[action.toLowerCase()] || action.toUpperCase();
    
    const { data: adminAction, error: actionError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        establishment_id: establishmentId,
        action: actionEnum,
        reason: reason || null,
        previous_status: previousStatus || null,
        new_status: newStatus || null,
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
      console.error('Détails:', {
        admin_id: user.id,
        establishment_id: establishmentId,
        action: actionEnum,
        reason,
        previous_status: previousStatus,
        new_status: newStatus
      });
      // Ne pas échouer si l'action admin n'a pas pu être créée, mais logger l'erreur
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

    // Message de succès avec le nom de l'établissement
    const actionMessages: Record<string, string> = {
      'approve': 'approuvé',
      'reject': 'rejeté',
      'pending': 'remis en attente',
      'delete': 'supprimé'
    };
    const actionMessage = actionMessages[action] || 'modifié';
    const establishmentName = establishment.name || 'l\'établissement';

    return NextResponse.json({ 
      success: true, 
      establishment: formattedEstablishment,
      action: adminAction || null, // Peut être null si l'enregistrement a échoué
      message: `"${establishmentName}" ${actionMessage} avec succès`,
      establishmentName: establishmentName
    });

  } catch (error) {
    console.error('Erreur lors de l\'action sur l\'établissement:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      message: 'Erreur interne du serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

