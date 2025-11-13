import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    const user = await getCurrentUser();
    
    if (!userIsAdmin || !user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabase = createClient();
    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ 
        error: 'Paramètres requis: requestId, action' 
      }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ 
        error: 'Action invalide. Doit être "approve" ou "reject"' 
      }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ 
        error: 'La raison du rejet est requise' 
      }, { status: 400 });
    }

    // Récupérer la demande
    const { data: updateRequest, error: requestError } = await supabase
      .from('professional_update_requests')
      .select(`
        *,
        professional:professionals!professional_update_requests_professional_id_fkey (
          id,
          email,
          siret,
          company_name
        )
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !updateRequest) {
      return NextResponse.json({ 
        error: 'Demande non trouvée' 
      }, { status: 404 });
    }

    if (updateRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Cette demande a déjà été traitée' 
      }, { status: 400 });
    }

    // Pour l'email, vérifier que l'email a été vérifié
    if (updateRequest.field_name === 'email' && !updateRequest.is_email_verified) {
      return NextResponse.json({ 
        error: 'Le nouvel email doit être vérifié avant approbation' 
      }, { status: 400 });
    }

    const professional = Array.isArray(updateRequest.professional) ? updateRequest.professional[0] : updateRequest.professional;

    if (action === 'approve') {
      // Mettre à jour la demande
      const { error: updateRequestError } = await supabase
        .from('professional_update_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId);

      if (updateRequestError) {
        console.error('Erreur mise à jour demande:', updateRequestError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
      }

      // Mapper les noms de champs
      const fieldMapping: Record<string, string> = {
        'email': 'email',
        'siret': 'siret',
        'companyName': 'company_name',
        'firstName': 'first_name',
        'lastName': 'last_name',
        'phone': 'phone'
      };

      const dbFieldName = fieldMapping[updateRequest.field_name] || updateRequest.field_name;
      const updateData: any = {};
      updateData[dbFieldName] = updateRequest.new_value;

      // Appliquer la modification au professionnel
      const { error: updateProError } = await supabase
        .from('professionals')
        .update(updateData)
        .eq('id', updateRequest.professional_id);

      if (updateProError) {
        console.error('Erreur mise à jour professionnel:', updateProError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du professionnel' }, { status: 500 });
      }

      console.log(`✅ Modification approuvée: ${updateRequest.field_name} de ${updateRequest.old_value} à ${updateRequest.new_value}`);
      if (professional) {
        console.log('📧 Notification à envoyer à:', professional.email);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Modification approuvée et appliquée'
      });

    } else {
      // Rejeter la demande
      const { error: rejectError } = await supabase
        .from('professional_update_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId);

      if (rejectError) {
        console.error('Erreur rejet demande:', rejectError);
        return NextResponse.json({ error: 'Erreur lors du rejet' }, { status: 500 });
      }

      console.log(`❌ Modification rejetée: ${updateRequest.field_name}`);
      console.log(`   Raison: ${rejectionReason}`);
      if (professional) {
        console.log('📧 Notification de rejet à envoyer à:', professional.email);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Modification rejetée'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la révision de la demande:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la révision de la demande' 
    }, { status: 500 });
  }
}

