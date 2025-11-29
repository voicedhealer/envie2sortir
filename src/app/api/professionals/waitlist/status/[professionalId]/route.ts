import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isLaunchActive, getDaysUntilLaunch, getTimeUntilLaunch } from '@/lib/launch';
import type { WaitlistStatusResponse } from '@/types/waitlist';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/professionals/waitlist/status/[professionalId]
 * Retourne le statut de la waitlist pour un professionnel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ professionalId: string }> }
) {
  try {
    const { professionalId } = await params;

    if (!professionalId) {
      return NextResponse.json(
        { error: 'ID professionnel requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Récupérer le professionnel
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, subscription_plan, premium_activation_date')
      .eq('id', professionalId)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    const status = professional.subscription_plan as 'FREE' | 'PREMIUM' | 'WAITLIST_BETA';
    const isLaunchActiveNow = isLaunchActive();
    const daysUntilLaunch = getDaysUntilLaunch();
    const timeUntilLaunch = getTimeUntilLaunch();

    let message = '';
    if (status === 'WAITLIST_BETA') {
      if (isLaunchActiveNow) {
        message = 'Le lancement est actif ! Votre abonnement premium sera activé prochainement.';
      } else {
        message = `Vous êtes en waitlist premium. ${daysUntilLaunch} jour${daysUntilLaunch > 1 ? 's' : ''} avant le lancement.`;
      }
    } else if (status === 'PREMIUM') {
      message = 'Vous avez un abonnement premium actif.';
      if (professional.premium_activation_date) {
        message += ` Activé le ${new Date(professional.premium_activation_date).toLocaleDateString('fr-FR')}.`;
      }
    } else {
      message = 'Vous avez un abonnement gratuit.';
    }

    const response: WaitlistStatusResponse = {
      status,
      daysUntilLaunch,
      premiumActivationDate: professional.premium_activation_date || null,
      message,
      isLaunchActive: isLaunchActiveNow,
      timeUntilLaunch,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('❌ [Waitlist Status] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}

