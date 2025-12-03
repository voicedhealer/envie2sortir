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

    const supabase = await createClient();
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

      // Utiliser le client admin pour contourner les RLS
      let clientToUse = supabase;
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseServiceKey) {
          const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
          clientToUse = createClientAdmin(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });
          console.log('✅ [Review Update] Utilisation du client admin pour toutes les mises à jour');
        }
      } catch (error) {
        console.warn('⚠️ [Review Update] Impossible de créer le client admin, utilisation du client normal');
      }

      // Appliquer la modification au professionnel
      console.log(`📋 [Review Update] Mise à jour professionnel: ${updateRequest.professional_id}, champ: ${dbFieldName}, nouvelle valeur: "${updateRequest.new_value}"`);
      const { error: updateProError, data: updatedProfessional } = await clientToUse
        .from('professionals')
        .update(updateData)
        .eq('id', updateRequest.professional_id)
        .select('id, company_name');

      if (updateProError) {
        console.error('❌ [Review Update] Erreur mise à jour professionnel:', updateProError);
        console.error('   Détails:', {
          message: updateProError.message,
          code: updateProError.code,
          details: updateProError.details,
          hint: updateProError.hint
        });
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du professionnel' }, { status: 500 });
      }

      if (updatedProfessional && updatedProfessional.length > 0) {
        console.log(`✅ [Review Update] Professionnel mis à jour avec succès: ${JSON.stringify(updatedProfessional[0])}`);
      } else {
        console.warn('⚠️ [Review Update] Aucune donnée retournée après mise à jour professionnel');
      }

      // Si c'est le nom de l'entreprise, mettre à jour aussi l'établissement associé
      if (updateRequest.field_name === 'companyName') {
        console.log(`🏢 [Review Update] Mise à jour du nom de l'établissement pour professional_id: ${updateRequest.professional_id}`);

        // Récupérer l'établissement (sans .single() pour éviter les erreurs si plusieurs ou aucun)
        const { data: establishments, error: establishmentError } = await clientToUse
          .from('establishments')
          .select('id, name, owner_id')
          .eq('owner_id', updateRequest.professional_id);

        if (establishmentError) {
          console.error('❌ [Review Update] Erreur récupération établissement:', establishmentError);
          console.error('   Détails:', {
            message: establishmentError.message,
            code: establishmentError.code,
            details: establishmentError.details,
            hint: establishmentError.hint
          });
          // Ne pas bloquer si l'établissement n'existe pas encore
        } else if (establishments && establishments.length > 0) {
          // Prendre le premier établissement (relation 1:1 normalement)
          const establishment = establishments[0];
          console.log(`📋 [Review Update] Établissement trouvé: id=${establishment.id}, name actuel="${establishment.name}"`);
          console.log(`📋 [Review Update] Nouveau nom à appliquer: "${updateRequest.new_value}"`);
          console.log(`📋 [Review Update] Owner ID: ${establishment.owner_id}, Professional ID: ${updateRequest.professional_id}`);
          
          if (establishments.length > 1) {
            console.warn(`⚠️ [Review Update] Plusieurs établissements trouvés (${establishments.length}), mise à jour du premier uniquement`);
          }
          
          const { error: updateEstablishmentError, data: updatedData } = await clientToUse
            .from('establishments')
            .update({ name: updateRequest.new_value })
            .eq('id', establishment.id)
            .select('id, name');

          if (updateEstablishmentError) {
            console.error('❌ [Review Update] Erreur mise à jour établissement:', updateEstablishmentError);
            console.error('   Détails:', {
              message: updateEstablishmentError.message,
              code: updateEstablishmentError.code,
              details: updateEstablishmentError.details,
              hint: updateEstablishmentError.hint
            });
            // Ne pas bloquer, juste logger l'erreur
          } else {
            console.log(`✅ [Review Update] Nom de l'établissement mis à jour avec succès`);
            if (updatedData && updatedData.length > 0) {
              console.log(`✅ [Review Update] Vérification - Nouveau nom: "${updatedData[0].name}"`);
            }
          }
        } else {
          console.warn(`⚠️ [Review Update] Aucun établissement trouvé pour professional_id: ${updateRequest.professional_id}`);
          console.warn(`   Cela peut être normal si l'établissement n'a pas encore été créé`);
        }
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

