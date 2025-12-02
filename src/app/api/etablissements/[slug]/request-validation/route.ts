import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

/**
 * POST /api/etablissements/[slug]/request-validation
 * Permet à un professionnel de redemander une validation après un rejet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const supabase = await createClient();

    // Récupérer l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name, status, owner_id, rejection_reason, rejected_at')
      .eq('slug', slug)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    // Vérifier que l'établissement est bien rejeté
    if (establishment.status !== 'rejected') {
      return NextResponse.json(
        { 
          error: `Impossible de redemander une validation. Statut actuel: ${establishment.status}`,
          currentStatus: establishment.status
        },
        { status: 400 }
      );
    }

    // Sauvegarder la raison du rejet avant de la supprimer (pour l'historique)
    const previousRejectionReason = establishment.rejection_reason;
    const previousRejectedAt = establishment.rejected_at;

    // Remettre l'établissement en attente de validation
    const { data: updatedEstablishment, error: updateError } = await supabase
      .from('establishments')
      .update({
        status: 'pending',
        rejection_reason: null, // Masquer la raison pour l'utilisateur
        rejected_at: null, // Masquer la date de rejet
        last_modified_at: new Date().toISOString()
      })
      .eq('id', establishment.id)
      .select()
      .single();

    if (updateError || !updatedEstablishment) {
      console.error('Erreur lors de la demande de revalidation:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la demande de revalidation' },
        { status: 500 }
      );
    }

    // Créer une action admin pour tracer la demande de revalidation
    // Utiliser le client admin pour créer l'action
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
      const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      // Créer l'action admin pour tracer la demande de revalidation
      try {
        await adminClient.from('admin_actions').insert({
          admin_id: user.id, // Le professionnel qui demande
          establishment_id: establishment.id,
          action: 'UPDATE', // Type d'action pour une demande de revalidation
          reason: `Demande de revalidation après rejet. Raison précédente: ${previousRejectionReason || 'N/A'}`,
          previous_status: 'rejected',
          new_status: 'pending',
          details: {
            requestedBy: 'professional',
            previousRejectionReason: previousRejectionReason,
            previousRejectedAt: previousRejectedAt,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        // Ne pas bloquer si l'action admin échoue
        console.warn('⚠️ [Request Validation] Erreur création action admin (non-bloquant):', error);
      }
    }

    console.log(`✅ [Request Validation] Établissement ${establishment.name} (${slug}) remis en attente par ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Votre demande de validation a été envoyée. L\'établissement est maintenant en attente de révision par un administrateur.',
      establishment: {
        id: updatedEstablishment.id,
        slug: updatedEstablishment.slug,
        status: updatedEstablishment.status,
        name: updatedEstablishment.name
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la demande de revalidation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la demande de revalidation' },
      { status: 500 }
    );
  }
}

