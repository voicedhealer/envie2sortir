import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { stripe, isStripeConfigured } from '@/lib/stripe/config';

/**
 * Gère les abonnements Stripe
 * GET: Récupère les informations de l'abonnement
 * DELETE: Annule l'abonnement
 */
export async function GET(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré' },
        { status: 500 }
      );
    }

    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_plan')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    if (!professional.stripe_subscription_id) {
      return NextResponse.json({
        subscription: null,
        plan: professional.subscription_plan,
      });
    }

    // Récupérer les détails de l'abonnement depuis Stripe
    const subscription = await stripe.subscriptions.retrieve(
      professional.stripe_subscription_id
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      },
      plan: professional.subscription_plan,
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Annule l'abonnement (à la fin de la période en cours)
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré' },
        { status: 500 }
      );
    }

    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    if (!professional.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif' },
        { status: 400 }
      );
    }

    // Annuler l'abonnement à la fin de la période en cours
    const subscription = await stripe.subscriptions.update(
      professional.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé. Il restera actif jusqu\'à la fin de la période en cours.',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Réactive un abonnement annulé
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré' },
        { status: 500 }
      );
    }

    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    if (!professional.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 400 }
      );
    }

    // Réactiver l'abonnement
    const subscription = await stripe.subscriptions.update(
      professional.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Abonnement réactivé avec succès.',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

  } catch (error: any) {
    console.error('Erreur lors de la réactivation de l\'abonnement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

