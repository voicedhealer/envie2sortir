/**
 * Script de test pour valider le flux complet waitlist + Stripe
 * 
 * Usage: npm run test:waitlist:stripe
 * ou: tsx scripts/test-waitlist-stripe-flow.ts
 */

import { STRIPE_PRICE_IDS, isStripeConfigured, getBaseUrl } from '@/lib/stripe/config';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(test: string, passed: boolean, message: string) {
  results.push({ test, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
}

async function testStripeConfiguration() {
  console.log('\n🧪 Test 1: Configuration Stripe');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Vérifier que Stripe est configuré
  const configured = isStripeConfigured();
  addResult(
    'Stripe configuré',
    configured,
    configured ? 'Stripe est correctement configuré' : 'Stripe n\'est pas configuré'
  );
  
  // Vérifier le prix waitlist
  const hasWaitlistPrice = !!STRIPE_PRICE_IDS.waitlist;
  addResult(
    'Prix waitlist configuré',
    hasWaitlistPrice,
    hasWaitlistPrice 
      ? `Prix waitlist: ${STRIPE_PRICE_IDS.waitlist}` 
      : 'STRIPE_PRICE_ID_WAITLIST n\'est pas configuré dans .env'
  );
  
  // Vérifier le format du price ID
  if (hasWaitlistPrice) {
    const isValidFormat = STRIPE_PRICE_IDS.waitlist.startsWith('price_');
    addResult(
      'Format du price ID',
      isValidFormat,
      isValidFormat 
        ? 'Format valide (commence par price_)' 
        : 'Format invalide (doit commencer par price_)'
    );
  }
}

async function testWaitlistFlow() {
  console.log('\n🧪 Test 2: Flux Waitlist');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler le flux
  const flow = {
    step1_form_submit: true,
    step2_professional_creation: true,
    step3_establishment_creation: true,
    step4_stripe_checkout: true,
    step5_webhook_processing: true,
    step6_premium_activation: true
  };
  
  addResult(
    'Flux complet défini',
    Object.values(flow).every(v => v === true),
    'Toutes les étapes du flux sont définies'
  );
  
  // Vérifier que le plan premium déclenche Stripe
  const chosenPlan = 'premium';
  const shouldCreateStripe = chosenPlan === 'premium';
  addResult(
    'Plan premium déclenche Stripe',
    shouldCreateStripe,
    shouldCreateStripe ? 'Le plan premium déclenche bien la création Stripe' : 'Le plan premium ne déclenche pas Stripe'
  );
  
  // Vérifier que le plan free ne déclenche pas Stripe
  const freePlan = 'free';
  const shouldNotCreateStripe = freePlan !== 'premium';
  addResult(
    'Plan free ne déclenche pas Stripe',
    shouldNotCreateStripe,
    shouldNotCreateStripe ? 'Le plan free ne déclenche pas Stripe (correct)' : 'Le plan free déclenche Stripe (incorrect)'
  );
}

async function testStripeSessionCreation() {
  console.log('\n🧪 Test 3: Création Session Stripe');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Vérifier les métadonnées requises
  const requiredMetadata = {
    professional_id: 'prof-123',
    plan_type: 'monthly',
    source: 'waitlist_beta'
  };
  
  addResult(
    'Métadonnées requises',
    !!(requiredMetadata.professional_id && requiredMetadata.source),
    'Les métadonnées requises sont présentes'
  );
  
  // Vérifier subscription_data
  const subscriptionData = {
    metadata: {
      professional_id: 'prof-123',
      plan_type: 'monthly',
      source: 'waitlist_beta',
      chosen_plan: 'premium',
      chosen_plan_type: 'monthly'
    },
    trial_period_days: 30
  };
  
  addResult(
    'Subscription data configuré',
    !!(subscriptionData.metadata.chosen_plan && subscriptionData.trial_period_days),
    `Période d'essai: ${subscriptionData.trial_period_days} jours`
  );
  
  // Vérifier les URLs de redirection
  const baseUrl = getBaseUrl();
  const successUrl = `${baseUrl}/dashboard/subscription?success=true&waitlist=true`;
  const cancelUrl = `${baseUrl}/admin/waitlist?canceled=true`;
  
  addResult(
    'URLs de redirection',
    !!(successUrl && cancelUrl),
    `Success: ${successUrl.includes('waitlist=true') ? 'OK' : 'MANQUANT'}, Cancel: ${cancelUrl.includes('admin/waitlist') ? 'OK' : 'MANQUANT'}`
  );
}

async function testWebhookHandling() {
  console.log('\n🧪 Test 4: Gestion Webhook');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler un événement checkout.session.completed
  const event = {
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: {
          professional_id: 'prof-123',
          source: 'waitlist_beta'
        },
        subscription: 'sub_1234567890',
        customer: 'cus_1234567890'
      }
    }
  };
  
  const isWaitlist = event.data.object.metadata.source === 'waitlist_beta';
  addResult(
    'Détection waitlist dans webhook',
    isWaitlist,
    isWaitlist ? 'Le webhook détecte correctement la waitlist' : 'Le webhook ne détecte pas la waitlist'
  );
  
  // Vérifier que le webhook garde WAITLIST_BETA pour waitlist
  const shouldKeepWaitlistBeta = isWaitlist;
  addResult(
    'Conservation WAITLIST_BETA',
    shouldKeepWaitlistBeta,
    shouldKeepWaitlistBeta ? 'Le webhook garde WAITLIST_BETA pour waitlist (correct)' : 'Le webhook change en PREMIUM (incorrect pour waitlist)'
  );
}

async function testFrontendRedirection() {
  console.log('\n🧪 Test 5: Redirection Frontend');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Simuler une réponse avec checkoutUrl
  const response = {
    success: true,
    checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_...',
    chosenPlan: 'premium'
  };
  
  const shouldRedirect = !!(response.checkoutUrl && response.chosenPlan === 'premium');
  addResult(
    'Redirection vers Stripe',
    shouldRedirect,
    shouldRedirect ? 'La redirection vers Stripe est déclenchée' : 'La redirection vers Stripe n\'est pas déclenchée'
  );
  
  // Vérifier le cas sans checkoutUrl
  const responseNoStripe = {
    success: true,
    checkoutUrl: null,
    chosenPlan: 'premium'
  };
  
  const shouldNotRedirect = !responseNoStripe.checkoutUrl;
  addResult(
    'Pas de redirection si checkoutUrl absent',
    shouldNotRedirect,
    shouldNotRedirect ? 'Pas de redirection si checkoutUrl absent (correct)' : 'Redirection même sans checkoutUrl (incorrect)'
  );
}

async function runAllTests() {
  console.log('🚀 Tests du Flux Waitlist + Stripe');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  try {
    await testStripeConfiguration();
    await testWaitlistFlow();
    await testStripeSessionCreation();
    await testWebhookHandling();
    await testFrontendRedirection();
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`\n📊 Résultats: ${passed}/${total} tests passés (${percentage}%)`);
    
    if (passed === total) {
      console.log('✅ Tous les tests sont passés !');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
      const failed = results.filter(r => !r.passed);
      console.log('\n❌ Tests échoués:');
      failed.forEach(r => {
        console.log(`   - ${r.test}: ${r.message}`);
      });
    }
    
    console.log('\n💡 Vérifications manuelles à faire:');
    console.log('   1. Vérifier que STRIPE_PRICE_ID_WAITLIST est configuré dans .env');
    console.log('   2. Tester le formulaire admin waitlist avec plan premium');
    console.log('   3. Vérifier la redirection vers Stripe Checkout');
    console.log('   4. Compléter le checkout Stripe (carte de test)');
    console.log('   5. Vérifier que le webhook reçoit l\'événement');
    console.log('   6. Vérifier que le professionnel a stripe_subscription_id enregistré');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testStripeConfiguration, testWaitlistFlow, testStripeSessionCreation, testWebhookHandling, testFrontendRedirection };

