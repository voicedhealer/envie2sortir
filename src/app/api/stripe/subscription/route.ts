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

    // Déterminer le type d'abonnement (mensuel ou annuel)
    const priceId = subscription.items.data[0]?.price.id;
    const { STRIPE_PRICE_IDS } = await import('@/lib/stripe/config');
    let planType: 'monthly' | 'annual' = 'monthly';
    
    if (priceId === STRIPE_PRICE_IDS.annual) {
      planType = 'annual';
    } else if (priceId === STRIPE_PRICE_IDS.monthly) {
      planType = 'monthly';
    }

    // Vérifier si un changement est programmé
    let scheduledChange = null;
    if (subscription.schedule) {
      try {
        const schedule = await stripe.subscriptionSchedules.retrieve(subscription.schedule as string);
        console.log('📅 Schedule trouvé:', {
          scheduleId: schedule.id,
          phasesCount: schedule.phases.length,
          currentTime: Math.floor(Date.now() / 1000),
        });
        
        // Chercher la phase actuelle et les phases futures
        const now = Math.floor(Date.now() / 1000);
        const currentPhase = schedule.phases.find(phase => 
          phase.start_date <= now && 
          (phase.end_date === null || phase.end_date > now)
        ) || schedule.phases[0];
        
        const futurePhases = schedule.phases.filter(phase => 
          phase.start_date > now
        );
        
        console.log('📅 Phases:', {
          currentPhase: currentPhase ? {
            start: currentPhase.start_date,
            end: currentPhase.end_date,
            price: currentPhase.items[0]?.price,
          } : null,
          futurePhases: futurePhases.map(p => ({
            start: p.start_date,
            end: p.end_date,
            price: p.items[0]?.price,
          })),
        });
        
        // Prendre la première phase future
        const futurePhase = futurePhases[0];
        
        if (futurePhase && currentPhase) {
          const futurePriceId = typeof futurePhase.items[0]?.price === 'string' 
            ? futurePhase.items[0].price 
            : futurePhase.items[0]?.price?.id;
          const currentPriceIdForComparison = typeof currentPhase.items[0]?.price === 'string'
            ? currentPhase.items[0].price
            : currentPhase.items[0]?.price?.id;
          
          if (futurePriceId && futurePriceId !== currentPriceIdForComparison) {
            scheduledChange = {
              newPriceId: futurePriceId,
              effectiveDate: new Date(futurePhase.start_date * 1000).toISOString(),
              planType: futurePriceId === STRIPE_PRICE_IDS.annual ? 'annual' : 'monthly',
            };
            console.log('✅ Changement programmé détecté:', scheduledChange);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du schedule:', err);
      }
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        planType,
        scheduledChange,
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
 * Programme un changement d'abonnement (ex: mensuel vers annuel)
 * Le changement prendra effet à la fin de la période en cours
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { newPlanType } = body; // 'monthly' ou 'annual'

    if (!newPlanType || !['monthly', 'annual'].includes(newPlanType)) {
      return NextResponse.json(
        { error: 'Type de plan invalide' },
        { status: 400 }
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

    // Récupérer l'abonnement actuel
    const subscription = await stripe.subscriptions.retrieve(
      professional.stripe_subscription_id
    );

    const { STRIPE_PRICE_IDS } = await import('@/lib/stripe/config');
    const newPriceId = newPlanType === 'annual' 
      ? STRIPE_PRICE_IDS.annual 
      : STRIPE_PRICE_IDS.monthly;

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Prix non configuré pour ce plan' },
        { status: 500 }
      );
    }

    // Vérifier que c'est bien un changement
    const currentPriceId = subscription.items.data[0]?.price.id;
    if (!currentPriceId) {
      return NextResponse.json(
        { error: 'Impossible de récupérer le prix actuel de l\'abonnement' },
        { status: 400 }
      );
    }
    
    if (currentPriceId === newPriceId) {
      return NextResponse.json(
        { error: 'Vous êtes déjà sur ce plan' },
        { status: 400 }
      );
    }
    
    console.log('Changement de plan:', {
      currentPriceId,
      newPriceId,
      subscriptionId: subscription.id,
    });

    // Créer un subscription schedule pour le changement à la fin de la période
    // D'abord, vérifier s'il existe déjà un schedule
    let scheduleId = subscription.schedule as string | null;
    
    const currentSubscriptionItem = subscription.items.data[0];
    if (!currentSubscriptionItem) {
      return NextResponse.json(
        { error: 'Item d\'abonnement non trouvé' },
        { status: 400 }
      );
    }
    
    const currentPhaseEnd = subscription.current_period_end;
    
    // Vérifier que les prix sont bien récurrents
    let currentPrice, newPrice;
    try {
      currentPrice = await stripe.prices.retrieve(currentPriceId);
      newPrice = await stripe.prices.retrieve(newPriceId);
    } catch (priceError: any) {
      console.error('Erreur lors de la récupération des prix:', priceError);
      return NextResponse.json(
        { error: `Erreur lors de la récupération des prix: ${priceError.message}` },
        { status: 400 }
      );
    }
    
    console.log('Prix actuels:', {
      currentPriceId,
      currentPriceType: currentPrice.type,
      newPriceId,
      newPriceType: newPrice.type,
    });
    
    if (currentPrice.type !== 'recurring') {
      return NextResponse.json(
        { error: `Le prix actuel (${currentPriceId}) n'est pas récurrent. Type: ${currentPrice.type}` },
        { status: 400 }
      );
    }
    
    if (newPrice.type !== 'recurring') {
      return NextResponse.json(
        { error: `Le nouveau prix (${newPriceId}) n'est pas récurrent. Type: ${newPrice.type}` },
        { status: 400 }
      );
    }
    
    if (scheduleId) {
      // Mettre à jour le schedule existant
      const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
      
      // Récupérer la phase actuelle
      const currentPhase = schedule.phases.find(phase => 
        phase.start_date <= Math.floor(Date.now() / 1000) && 
        phase.end_date > Math.floor(Date.now() / 1000)
      ) || schedule.phases[0];
      
      // Modifier les phases pour inclure le changement
      await stripe.subscriptionSchedules.update(scheduleId, {
        phases: [
          {
            items: [
              {
                price: currentPriceId,
                quantity: 1,
              },
            ],
            start_date: currentPhase.start_date,
            end_date: currentPhaseEnd,
          },
          {
            items: [
              {
                price: newPriceId,
                quantity: 1,
              },
            ],
            start_date: currentPhaseEnd,
          },
        ],
        end_behavior: 'release',
      });
    } else {
      // Créer un nouveau schedule à partir de l'abonnement
      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: professional.stripe_subscription_id,
      });

      // Mettre à jour le schedule avec les phases correctes
      await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
          {
            items: [
              {
                price: currentPriceId,
                quantity: 1,
              },
            ],
            start_date: subscription.current_period_start,
            end_date: currentPhaseEnd,
          },
          {
            items: [
              {
                price: newPriceId,
                quantity: 1,
              },
            ],
            start_date: currentPhaseEnd,
          },
        ],
        end_behavior: 'release',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Changement vers le plan ${newPlanType === 'annual' ? 'annuel' : 'mensuel'} programmé. Il prendra effet le ${new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR')}.`,
      effectiveDate: new Date(subscription.current_period_end * 1000).toISOString(),
      newPlanType,
    });

  } catch (error: any) {
    console.error('Erreur lors de la programmation du changement d\'abonnement:', error);
    console.error('Détails de l\'erreur Stripe:', {
      type: error.type,
      code: error.code,
      message: error.message,
      param: error.param,
      decline_code: error.decline_code,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Erreur serveur',
        details: error.type === 'StripeInvalidRequestError' ? error.message : undefined
      },
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

