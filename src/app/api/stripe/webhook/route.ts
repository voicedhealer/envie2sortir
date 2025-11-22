import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import Stripe from 'stripe';

/**
 * Webhook Stripe pour gérer les événements d'abonnement
 * POST /api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET n\'est pas configuré');
    return NextResponse.json(
      { error: 'Configuration webhook manquante' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur de vérification du webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Initialiser le client Supabase admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Variables Supabase manquantes pour le webhook');
    return NextResponse.json(
      { error: 'Configuration Supabase manquante' },
      { status: 500 }
    );
  }

  const supabase = createClientAdmin(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Gérer les différents événements Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const professionalId = session.metadata?.professional_id;

        if (professionalId && session.subscription) {
          // Mettre à jour le professionnel avec l'abonnement
          await supabase
            .from('professionals')
            .update({
              stripe_subscription_id: session.subscription as string,
              subscription_plan: 'PREMIUM',
            })
            .eq('id', professionalId);

          // Mettre à jour l'établissement
          const { data: establishment } = await supabase
            .from('establishments')
            .select('id')
            .eq('owner_id', professionalId)
            .single();

          if (establishment) {
            await supabase
              .from('establishments')
              .update({ subscription: 'PREMIUM' })
              .eq('id', establishment.id);
          }

          console.log(`✅ Abonnement activé pour le professionnel ${professionalId}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const professionalId = subscription.metadata?.professional_id;

        if (professionalId) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            // Abonnement actif
            await supabase
              .from('professionals')
              .update({ subscription_plan: 'PREMIUM' })
              .eq('id', professionalId);

            const { data: establishment } = await supabase
              .from('establishments')
              .select('id')
              .eq('owner_id', professionalId)
              .single();

            if (establishment) {
              await supabase
                .from('establishments')
                .update({ subscription: 'PREMIUM' })
                .eq('id', establishment.id);
            }
          } else {
            // Abonnement annulé ou expiré
            await supabase
              .from('professionals')
              .update({ 
                subscription_plan: 'FREE',
                stripe_subscription_id: null,
              })
              .eq('id', professionalId);

            const { data: establishment } = await supabase
              .from('establishments')
              .select('id')
              .eq('owner_id', professionalId)
              .single();

            if (establishment) {
              await supabase
                .from('establishments')
                .update({ subscription: 'FREE' })
                .eq('id', establishment.id);
            }

            console.log(`❌ Abonnement annulé pour le professionnel ${professionalId}`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          console.log(`✅ Paiement réussi pour l'abonnement ${invoice.subscription}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          console.error(`❌ Échec du paiement pour l'abonnement ${invoice.subscription}`);
        }
        break;
      }

      case 'subscription_schedule.created':
      case 'subscription_schedule.updated': {
        const schedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`📅 Subscription Schedule ${event.type}:`, schedule.id);
        
        // Récupérer l'abonnement associé
        if (schedule.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            schedule.subscription as string
          );
          const professionalId = subscription.metadata?.professional_id;
          
          if (professionalId) {
            console.log(`✅ Schedule créé/mis à jour pour le professionnel ${professionalId}`);
            // Le changement sera visible lors de la prochaine récupération de l'abonnement
          }
        }
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

