import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { stripe, STRIPE_PRICE_IDS, getBaseUrl, isStripeConfigured } from '@/lib/stripe/config';

/**
 * Crée une session de checkout Stripe pour l'abonnement Premium
 * POST /api/stripe/create-checkout-session
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que Stripe est configuré
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré. Veuillez configurer les variables d\'environnement.' },
        { status: 500 }
      );
    }

    // Vérifier que l'utilisateur est authentifié et est un professionnel
    const user = await requireEstablishment();
    if (!user || !user.establishmentId) {
      return NextResponse.json(
        { error: 'Non authentifié ou aucun établissement associé' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Récupérer le professionnel
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, email, first_name, last_name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le professionnel a déjà un abonnement actif
    if (professional.stripe_customer_id) {
      // Vérifier l'état de l'abonnement dans Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: professional.stripe_customer_id,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        return NextResponse.json(
          { error: 'Vous avez déjà un abonnement actif' },
          { status: 400 }
        );
      }
    }

    // Créer ou récupérer le customer Stripe
    let customerId = professional.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: professional.email,
        name: `${professional.first_name} ${professional.last_name}`,
        metadata: {
          professional_id: professional.id,
        },
      });

      customerId = customer.id;

      // Sauvegarder le customer_id dans Supabase
      await supabase
        .from('professionals')
        .update({ stripe_customer_id: customerId })
        .eq('id', professional.id);
    }

    // Récupérer le type de plan depuis le body (mensuel ou annuel)
    const body = await request.json().catch(() => ({}));
    const planType = (body.planType || 'monthly') as 'monthly' | 'annual';
    
    // Sélectionner le price_id selon le type de plan
    const priceId = planType === 'annual' ? STRIPE_PRICE_IDS.annual : STRIPE_PRICE_IDS.monthly;
    
    if (!priceId) {
      return NextResponse.json(
        { error: `Le plan ${planType === 'annual' ? 'annuel' : 'mensuel'} n'est pas configuré` },
        { status: 400 }
      );
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${getBaseUrl()}/dashboard/subscription?success=true`,
      cancel_url: `${getBaseUrl()}/dashboard/subscription?canceled=true`,
      metadata: {
        professional_id: professional.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          professional_id: professional.id,
          plan_type: planType,
        },
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}

