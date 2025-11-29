import { NextRequest, NextResponse } from 'next/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/supabase/helpers';
import { getStripe, isStripeConfigured, STRIPE_PRICE_IDS } from '@/lib/stripe/config';
import { isLaunchActive } from '@/lib/launch';
import type { LaunchActivationResult } from '@/types/waitlist';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/launch-activation
 * Active le lancement officiel : convertit tous les WAITLIST_BETA en PREMIUM avec abonnements Stripe
 * 
 * Authentification :
 * - Vérifie ADMIN_API_KEY (header Authorization: Bearer {ADMIN_API_KEY})
 * - OU utilise isAdmin() si l'utilisateur est connecté
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Vérifier l'authentification admin
    let isAuthorized = false;
    let adminUserId: string | null = null;

    // Méthode 1 : Vérifier ADMIN_API_KEY
    const authHeader = request.headers.get('authorization');
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (authHeader && adminApiKey) {
      const token = authHeader.replace('Bearer ', '');
      if (token === adminApiKey) {
        isAuthorized = true;
        console.log('✅ [Launch Activation] Authentifié via ADMIN_API_KEY');
      }
    }

    // Méthode 2 : Vérifier si l'utilisateur connecté est admin
    if (!isAuthorized) {
      try {
        const userIsAdmin = await isAdmin();
        if (userIsAdmin) {
          isAuthorized = true;
          // Récupérer l'ID de l'utilisateur admin
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          adminUserId = user?.id || null;
          console.log('✅ [Launch Activation] Authentifié via isAdmin()');
        }
      } catch (error) {
        console.warn('⚠️ [Launch Activation] Erreur vérification isAdmin:', error);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      );
    }

    // Vérifier que Stripe est configuré
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe n\'est pas configuré. Impossible d\'activer les abonnements.',
        } as LaunchActivationResult,
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration Supabase manquante',
        } as LaunchActivationResult,
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Récupérer tous les professionnels en waitlist
    const { data: waitlistPros, error: fetchError } = await adminClient
      .from('professionals')
      .select('id, email, first_name, last_name, stripe_customer_id, stripe_subscription_id')
      .eq('subscription_plan', 'WAITLIST_BETA');

    if (fetchError) {
      console.error('❌ [Launch Activation] Erreur récupération waitlist:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: fetchError.message || 'Erreur lors de la récupération de la waitlist',
        } as LaunchActivationResult,
        { status: 500 }
      );
    }

    if (!waitlistPros || waitlistPros.length === 0) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          errors: [],
          message: 'Aucun professionnel en waitlist à activer',
        } as LaunchActivationResult,
        { status: 200 }
      );
    }

    console.log(`🚀 [Launch Activation] Activation de ${waitlistPros.length} professionnel(s) en waitlist`);

    const stripe = getStripe();
    const errors: Array<{ professionalId: string; error: string }> = [];
    const activatedProfessionals: Array<{
      professionalId: string;
      email: string;
      establishmentName?: string;
    }> = [];

    // Boucle sur chaque professionnel
    for (const pro of waitlistPros) {
      try {
        // 1. Créer ou récupérer le Stripe Customer
        let customerId = pro.stripe_customer_id;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: pro.email,
            name: `${pro.first_name} ${pro.last_name}`,
            metadata: {
              professional_id: pro.id,
              source: 'waitlist_beta',
            },
          });
          customerId = customer.id;
          console.log(`✅ [Launch Activation] Customer Stripe créé pour ${pro.email}: ${customerId}`);
        } else {
          console.log(`ℹ️ [Launch Activation] Customer Stripe existant pour ${pro.email}: ${customerId}`);
        }

        // 2. Créer la Stripe Subscription (utilise STRIPE_PRICE_ID_MONTHLY par défaut)
        const priceId = STRIPE_PRICE_IDS.monthly;
        if (!priceId) {
          throw new Error('STRIPE_PRICE_ID_MONTHLY non configuré');
        }

        // Vérifier si une subscription existe déjà
        let subscriptionId = pro.stripe_subscription_id;

        if (!subscriptionId) {
          const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            metadata: {
              professional_id: pro.id,
              source: 'launch_activation',
            },
            // Ne pas facturer immédiatement si on veut une période d'essai
            // billing_cycle_anchor: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Dans 30 jours
          });
          subscriptionId = subscription.id;
          console.log(`✅ [Launch Activation] Subscription Stripe créée pour ${pro.email}: ${subscriptionId}`);
        } else {
          console.log(`ℹ️ [Launch Activation] Subscription Stripe existante pour ${pro.email}: ${subscriptionId}`);
        }

        // 3. Mettre à jour le Professional
        const { error: updateProError } = await adminClient
          .from('professionals')
          .update({
            subscription_plan: 'PREMIUM',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            premium_activation_date: new Date().toISOString(),
          })
          .eq('id', pro.id);

        if (updateProError) {
          throw new Error(`Erreur mise à jour professional: ${updateProError.message}`);
        }

        // 4. Mettre à jour l'établissement associé
        const { data: establishment } = await adminClient
          .from('establishments')
          .select('id, name')
          .eq('owner_id', pro.id)
          .maybeSingle();

        if (establishment) {
          const { error: updateEstError } = await adminClient
            .from('establishments')
            .update({ subscription: 'PREMIUM' })
            .eq('id', establishment.id);

          if (updateEstError) {
            console.warn(`⚠️ [Launch Activation] Erreur mise à jour établissement pour ${pro.email}:`, updateEstError);
          }
        }

        // 5. Log dans subscription_logs
        await adminClient.from('subscription_logs').insert({
          professional_id: pro.id,
          old_status: 'WAITLIST_BETA',
          new_status: 'PREMIUM',
          reason: 'launch_activation',
        });

        // 6. TODO: Envoyer email "🎉 Tu es maintenant premium" (via Resend)
        console.log(`📧 [Launch Activation] Email à envoyer à ${pro.email}`);

        activatedProfessionals.push({
          professionalId: pro.id,
          email: pro.email,
          establishmentName: establishment?.name,
        });

        console.log(`✅ [Launch Activation] ${pro.email} activé avec succès`);
      } catch (error: any) {
        console.error(`❌ [Launch Activation] Erreur pour ${pro.email}:`, error);
        errors.push({
          professionalId: pro.id,
          error: error.message || 'Erreur inconnue',
        });
      }
    }

    const duration = Date.now() - startTime;
    const result: LaunchActivationResult = {
      success: errors.length === 0,
      count: activatedProfessionals.length,
      errors,
      activatedProfessionals,
    };

    console.log(`✅ [Launch Activation] Terminé en ${duration}ms: ${activatedProfessionals.length} activé(s), ${errors.length} erreur(s)`);

    // Log pour audit trail
    console.log(`📊 [Launch Activation] Audit - IP: ${ipAddress}, Admin: ${adminUserId || 'API_KEY'}, Count: ${activatedProfessionals.length}, Errors: ${errors.length}`);

    return NextResponse.json(result, { status: errors.length === 0 ? 200 : 207 }); // 207 = Multi-Status si certaines ont échoué
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Launch Activation] Erreur après ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'activation du lancement',
        count: 0,
        errors: [],
      } as LaunchActivationResult,
      { status: 500 }
    );
  }
}

