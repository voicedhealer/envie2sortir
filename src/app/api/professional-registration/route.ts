import { NextRequest, NextResponse } from "next/server";
import { signUpProfessional } from '@/lib/supabase/auth-actions';
import { geocodeAddress } from '@/lib/geocoding';
import { createTagsData } from '@/lib/category-tags-mapping';
import { logSubscriptionChange } from '@/lib/subscription-logger';
import { isPhoneVerified } from '@/lib/phone-verification';

/**
 * Normalise un numéro de test Twilio (corrige les erreurs de saisie et unifie le format)
 * Tous les formats sont normalisés vers le format international: +15005550006
 */
function normalizeTwilioTestNumber(phone: string): string {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // Si c'est un numéro de test Twilio, normaliser vers le format international +1500555XXX
  // Format français: 01500555XXX (11 chiffres) - corriger si 12 chiffres (015005550006 -> 01500555006)
  if (/^01500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 11 premiers caractères (015005550006 -> 01500555006)
    const normalized = cleaned.substring(0, 11);
    // Convertir en format international: 01500555006 -> +15005550006
    return '+' + normalized.substring(1);
  }
  
  // Format international: +1500555XXX (12 caractères) - corriger si 13 caractères
  if (/^\+1500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 12 premiers caractères (+150055500006 -> +15005550006)
    return cleaned.substring(0, 12);
  }
  
  // Format sans 0 initial: 1500555XXX (11 chiffres) - corriger si 12 chiffres
  if (/^1500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 11 premiers caractères (150055500006 -> 15005550006)
    const normalized = cleaned.substring(0, 11);
    // Convertir en format international: 15005550006 -> +15005550006
    return '+' + normalized;
  }
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Récupération des données du FormData
    let phone = formData.get('accountPhone') as string;
    
    // Normaliser le numéro de téléphone (corriger les erreurs de saisie)
    phone = normalizeTwilioTestNumber(phone);
    
    const accountData = {
      email: formData.get('accountEmail') as string,
      password: formData.get('accountPassword') as string,
      firstName: formData.get('accountFirstName') as string,
      lastName: formData.get('accountLastName') as string,
      phone: phone,
    };

    // Vérifier que le téléphone a été vérifié par SMS
    if (!accountData.phone) {
      return NextResponse.json({ 
        error: 'Numéro de téléphone requis' 
      }, { status: 400 });
    }

    // Utiliser le numéro normalisé pour vérifier
    console.log(`🔍 [Registration] Vérification du numéro ${formData.get('accountPhone')} (normalisé: ${accountData.phone})`);
    
    // ✅ Utiliser TWILIO_AUTO_VERIFY_TEST_NUMBERS pour bypasser la vérification des numéros de test
    const ALLOW_TEST_AUTO_VERIFY = process.env.TWILIO_AUTO_VERIFY_TEST_NUMBERS !== 'false';
    const isTestNumber = /^\+?1500555\d{4}$/.test(accountData.phone.replace(/\s/g, '').replace(/[^\d+]/g, ''));
    
    if (isTestNumber && ALLOW_TEST_AUTO_VERIFY) {
      console.log('🧪 [Registration] Numéro de test Twilio détecté - vérification automatique (TWILIO_AUTO_VERIFY_TEST_NUMBERS=true)');
      // Marquer automatiquement comme vérifié si c'est un numéro de test
      const { markPhoneAsVerified } = await import('@/lib/phone-verification');
      markPhoneAsVerified(accountData.phone, 60 * 60 * 1000); // 1 heure
    } else {
    const phoneIsVerified = isPhoneVerified(accountData.phone);
    if (!phoneIsVerified) {
      console.error('❌ [Registration] Numéro de téléphone non vérifié:', accountData.phone);
      return NextResponse.json({ 
        error: 'Vérification du numéro de téléphone requise. Veuillez vérifier votre numéro de téléphone via SMS avant de continuer.' 
      }, { status: 400 });
    }
    console.log('✅ [Registration] Numéro de téléphone vérifié:', accountData.phone);
    }

    const professionalData = {
      siret: formData.get('siret') as string,
      companyName: formData.get('companyName') as string,
      legalStatus: formData.get('legalStatus') as string,
      subscriptionPlan: formData.get('subscriptionPlan') as string || 'free',
      subscriptionPlanType: formData.get('subscriptionPlanType') as 'monthly' | 'annual' || 'monthly',
      termsAcceptedCGV: formData.get('termsAcceptedCGV') === 'true',
      termsAcceptedCGU: formData.get('termsAcceptedCGU') === 'true',
    };

    // Fonction pour extraire city et postalCode de l'adresse complète
    const parseAddressComponents = (fullAddress: string) => {
      if (!fullAddress) {
        console.log('⚠️ Adresse vide');
        return { city: null, postalCode: null };
      }
      
      console.log('📍 Parsing de l\'adresse:', fullAddress);
      
      // Pattern 1 : "19 Rue du Garet, 69001 Lyon" (standard)
      let match = fullAddress.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
      if (match) {
        console.log('✅ Pattern 1 réussi');
        return {
          city: match[3].trim(),
          postalCode: match[2].trim()
        };
      }
      
      // Pattern 2 : "19 Rue du Garet 69001 Lyon" (sans virgule)
      match = fullAddress.match(/^(.+?)\s+(\d{5})\s+(.+)$/);
      if (match) {
        console.log('✅ Pattern 2 réussi');
        return {
          city: match[3].trim(),
          postalCode: match[2].trim()
        };
      }
      
      // Pattern 3 : Avec virgules multiples "19 Rue du Garet, 69001, Lyon"
      const parts = fullAddress.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Chercher le code postal dans toutes les parties
        for (let i = 0; i < parts.length; i++) {
          const postalCodeMatch = parts[i].match(/(\d{5})/);
          if (postalCodeMatch && i < parts.length - 1) {
            console.log('✅ Pattern 3 réussi');
            return {
              city: parts[i + 1].trim(),
              postalCode: postalCodeMatch[1]
            };
          }
        }
      }
      
      // Pattern 4 : Code postal à la fin "19 Rue du Garet Lyon 69001"
      match = fullAddress.match(/^(.+?)\s+([A-Za-zÀ-ÿ\s-]+)\s+(\d{5})$/);
      if (match) {
        console.log('✅ Pattern 4 réussi');
        return {
          city: match[2].trim(),
          postalCode: match[3].trim()
        };
      }
      
      // Fallback : Extraire n'importe quel code postal 5 chiffres
      const postalCodeMatch = fullAddress.match(/(\d{5})/);
      if (postalCodeMatch) {
        // Chercher le nom de ville après le code postal
        const afterPostalCode = fullAddress.split(postalCodeMatch[0])[1];
        if (afterPostalCode) {
          const cityMatch = afterPostalCode.match(/([A-Za-zÀ-ÿ\s-]+)/);
          if (cityMatch) {
            console.log('✅ Fallback réussi');
            return {
              city: cityMatch[1].trim(),
              postalCode: postalCodeMatch[1]
            };
          }
        }
      }
      
      console.log('❌ Aucun pattern ne correspond');
      return { city: null, postalCode: null };
    };

    const fullAddress = formData.get('address') as string;
    const addressComponents = parseAddressComponents(fullAddress);
    console.log('🔍 Résultat du parsing:', {
      fullAddress,
      city: addressComponents.city,
      postalCode: addressComponents.postalCode
    });
    
    // Avertir si le parsing a échoué
    if (!addressComponents.city || !addressComponents.postalCode) {
      console.warn('⚠️ Parsing de l\'adresse partiel ou échoué, city/postalCode seront null');
    }

    const establishmentData = {
      name: formData.get('establishmentName') as string,
      description: formData.get('description') as string || '',
      address: fullAddress, // Adresse complète
      city: addressComponents.city,
      postalCode: addressComponents.postalCode,
      activities: JSON.parse(formData.get('activities') as string || '[]'),
      services: JSON.parse(formData.get('services') as string || '[]'),
      ambiance: JSON.parse(formData.get('ambiance') as string || '[]'),
      paymentMethods: (() => {
        const paymentMethodsData = formData.get('paymentMethods');
        console.log('🔍 paymentMethodsData type:', typeof paymentMethodsData);
        console.log('🔍 paymentMethodsData value:', paymentMethodsData);
        if (paymentMethodsData && typeof paymentMethodsData === 'string') {
          try {
            return JSON.parse(paymentMethodsData);
          } catch (e) {
            console.log('⚠️ Erreur parsing paymentMethods, utilisation de la valeur brute');
            return {};
          }
        }
        return {};
      })(),
      hours: JSON.parse(formData.get('hours') as string || '{}'),
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
      tiktok: formData.get('tiktok') as string || '',
      youtube: formData.get('youtube') as string || '',
      phone: formData.get('phone') as string || '',
      whatsappPhone: formData.get('whatsappPhone') as string || '',
      messengerUrl: formData.get('messengerUrl') as string || '',
      email: formData.get('email') as string || '',
      priceMin: parseFloat(formData.get('priceMin') as string) || 0,
      priceMax: parseFloat(formData.get('priceMax') as string) || 0,
      informationsPratiques: (() => {
        const infosData = formData.get('informationsPratiques');
        if (infosData && typeof infosData === 'string') {
          try {
            return JSON.parse(infosData);
          } catch (e) {
            return [infosData];
          }
        }
        return [];
      })(),
      theForkLink: formData.get('theForkLink') as string || '',
      uberEatsLink: formData.get('uberEatsLink') as string || '',
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      envieTags: JSON.parse(formData.get('envieTags') as string || '[]'),
      // Données hybrides
      accessibilityDetails: (() => {
        const data = formData.get('hybridAccessibilityDetails');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridAccessibilityDetails');
            return null;
          }
        }
        return null;
      })(),
      detailedServices: (() => {
        const data = formData.get('hybridDetailedServices');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridDetailedServices');
            return null;
          }
        }
        return null;
      })(),
      clienteleInfo: (() => {
        const data = formData.get('hybridClienteleInfo');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridClienteleInfo');
            return null;
          }
        }
        return null;
      })(),
      detailedPayments: (() => {
        const data = formData.get('hybridDetailedPayments');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridDetailedPayments');
            return null;
          }
        }
        return null;
      })(),
      childrenServices: (() => {
        const data = formData.get('hybridChildrenServices');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridChildrenServices');
            return null;
          }
        }
        return null;
      })(),
    };
    // Générer un slug unique
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ùû]/g, 'u')
        .replace(/[ôö]/g, 'o')
        .replace(/[îï]/g, 'i')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };
    // ✅ CORRECTION : Prioriser les coordonnées GPS du formulaire
    const manualLatitude = formData.get('latitude') as string;
    const manualLongitude = formData.get('longitude') as string;
    
    console.log('📍 Coordonnées GPS du formulaire:');
    console.log('  Latitude:', manualLatitude, 'Type:', typeof manualLatitude);
    console.log('  Longitude:', manualLongitude, 'Type:', typeof manualLongitude);
    
    let finalCoordinates = null;
    
    // Si des coordonnées GPS sont fournies manuellement, les utiliser
    if (manualLatitude && manualLongitude) {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        finalCoordinates = { latitude: lat, longitude: lng };
        console.log('✅ Utilisation des coordonnées GPS du formulaire:', finalCoordinates);
      } else {
        console.log('⚠️ Coordonnées GPS invalides, tentative de géocodage automatique');
      }
    }
    
    // Si pas de coordonnées manuelles, essayer le géocodage automatique
    if (!finalCoordinates) {
      console.log('🌍 Géocodage automatique de l\'adresse:', establishmentData.address);
      
      // Fonction de géocodage optimisée (délais réduits)
      const geocodeWithRetry = async (address, maxRetries = 2) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`🔄 Tentative de géocodage ${attempt}/${maxRetries}`);
            const result = await geocodeAddress(address);
            
            if (result) {
              console.log(`✅ Géocodage réussi (tentative ${attempt}):`, result);
              return result;
            }
            
            if (attempt < maxRetries) {
              console.log(`⏳ Attente avant retry (${attempt * 500}ms)...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 500)); // Réduit de 1000ms à 500ms
            }
          } catch (error) {
            console.warn(`⚠️ Erreur tentative ${attempt}:`, error.message);
            
            if (attempt < maxRetries) {
              console.log(`⏳ Attente avant retry (${attempt * 500}ms)...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 500)); // Réduit de 1000ms à 500ms
            }
          }
        }
        
        console.log('❌ Toutes les tentatives de géocodage ont échoué');
        return null;
      };
      
      try {
        finalCoordinates = await geocodeWithRetry(establishmentData.address);
        
        if (finalCoordinates) {
          console.log('✅ Coordonnées GPS trouvées par géocodage:', finalCoordinates);
        } else {
          console.log('⚠️ Géocodage n\'a pas retourné de coordonnées, mais on continue');
          console.log('💡 Les coordonnées pourront être ajoutées manuellement dans le dashboard');
        }
      } catch (geocodeError) {
        console.warn('⚠️ Erreur lors du géocodage (non-bloquant):', geocodeError);
        console.log('➡️  L\'établissement sera créé sans coordonnées GPS');
        // On continue quand même, les coordonnées seront null
      }
    }

    // Utiliser signUpProfessional pour créer professional + établissement + tags
    console.log('🔐 Création du compte professionnel avec Supabase...');
    
    const result = await signUpProfessional(
      accountData,
      professionalData,
      {
        ...establishmentData,
        latitude: finalCoordinates?.latitude || null,
        longitude: finalCoordinates?.longitude || null,
        whatsappPhone: establishmentData.whatsappPhone || '',
        messengerUrl: establishmentData.messengerUrl || '',
        youtube: establishmentData.youtube || ''
      },
      generateSlug,
      createTagsData
    );

    // Logger le changement de subscription (si la fonction existe encore)
    try {
      await logSubscriptionChange(
        result.establishment.id,
        'FREE', // Toujours créer en FREE, l'upgrade se fait via Stripe
        result.professional.id,
        'Inscription professionnelle'
      );
    } catch (logError) {
      console.warn('Erreur lors du logging de subscription:', logError);
      // Non bloquant
    }

    // Si premium est sélectionné, créer une session Stripe
    let checkoutUrl = null;
    if (professionalData.subscriptionPlan === 'premium') {
      console.log('💳 [Registration] Plan Premium détecté, création de la session Stripe...');
      console.log('💳 [Registration] Plan type:', professionalData.subscriptionPlanType || 'monthly');
      try {
        const { isStripeConfigured, getStripe, STRIPE_PRICE_IDS, getBaseUrl } = await import('@/lib/stripe/config');
        
        if (!isStripeConfigured()) {
          console.error('❌ [Registration] Stripe n\'est pas configuré');
          console.error('❌ [Registration] Vérifiez les variables d\'environnement STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_ANNUAL');
        } else {
          console.log('✅ [Registration] Stripe est configuré');
          const stripe = getStripe();
          const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ [Registration] Variables Supabase manquantes pour créer le customer Stripe');
          } else {
            const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
              auth: { autoRefreshToken: false, persistSession: false }
            });

            // Créer ou récupérer le customer Stripe
            let customerId = result.professional.stripe_customer_id;
            if (!customerId) {
              console.log('💳 [Registration] Création d\'un nouveau customer Stripe...');
              const customer = await stripe.customers.create({
                email: result.professional.email,
                name: `${result.professional.firstName} ${result.professional.lastName}`,
                metadata: { professional_id: result.professional.id },
              });
              customerId = customer.id;
              console.log('✅ [Registration] Customer Stripe créé:', customerId);

              // Sauvegarder le customer_id
              await adminClient
                .from('professionals')
                .update({ stripe_customer_id: customerId })
                .eq('id', result.professional.id);
            } else {
              console.log('✅ [Registration] Customer Stripe existant:', customerId);
            }

            // Créer la session de checkout avec le plan choisi (mensuel ou annuel)
            const planType = professionalData.subscriptionPlanType || 'monthly';
            const priceId = planType === 'annual' 
              ? STRIPE_PRICE_IDS.annual 
              : STRIPE_PRICE_IDS.monthly;
            
            console.log('💳 [Registration] Plan type:', planType);
            console.log('💳 [Registration] Price ID:', priceId);
            
            if (!priceId) {
              const errorMsg = `Aucun prix Stripe configuré pour le plan ${planType}`;
              console.error('❌ [Registration]', errorMsg);
              console.error('❌ [Registration] STRIPE_PRICE_IDS:', STRIPE_PRICE_IDS);
              throw new Error(errorMsg);
            }

            const baseUrl = getBaseUrl();
            console.log('💳 [Registration] Création de la session Stripe...');
            console.log('💳 [Registration] Success URL:', `${baseUrl}/dashboard/subscription?success=true`);
            console.log('💳 [Registration] Cancel URL:', `${baseUrl}/dashboard/subscription?canceled=true`);

            const session = await stripe.checkout.sessions.create({
              customer: customerId,
              mode: 'subscription',
              payment_method_types: ['card'],
              line_items: [{ price: priceId, quantity: 1 }],
              success_url: `${baseUrl}/dashboard/subscription?success=true`,
              cancel_url: `${baseUrl}/dashboard/subscription?canceled=true`,
              metadata: { 
                professional_id: result.professional.id,
                plan_type: planType,
              },
              subscription_data: { 
                metadata: { 
                  professional_id: result.professional.id,
                  plan_type: planType,
                } 
              },
            });

            checkoutUrl = session.url;
            console.log('✅ [Registration] Session Stripe créée avec succès');
            console.log('✅ [Registration] Session ID:', session.id);
            console.log('✅ [Registration] Checkout URL:', checkoutUrl);
          }
        }
      } catch (stripeError: any) {
        console.error('❌ [Registration] Erreur lors de la création de la session Stripe:', stripeError);
        console.error('❌ [Registration] Message:', stripeError?.message);
        console.error('❌ [Registration] Stack:', stripeError?.stack);
        // Ne pas bloquer l'inscription si Stripe échoue, mais logger l'erreur
      }
    } else {
      console.log('ℹ️ [Registration] Plan gratuit sélectionné, pas de session Stripe nécessaire');
    }
    
    console.log('📋 [Registration] Résultat final - checkoutUrl:', checkoutUrl);

    // TODO: Upload des photos (prochaine étape)
    // TODO: Envoyer email de confirmation (prochaine étape)

    return NextResponse.json({ 
      success: true,
      message: professionalData.subscriptionPlan === 'premium' 
        ? 'Inscription réussie ! Vous allez être redirigé vers le paiement.'
        : 'Inscription réussie ! Votre établissement sera vérifié sous 24h.',
      professional: {
        id: result.professional.id,
        email: result.professional.email,
        firstName: result.professional.firstName,
        lastName: result.professional.lastName,
        siret: result.professional.siret
      },
      establishment: {
        id: result.establishment.id,
        name: result.establishment.name,
        slug: result.establishment.slug
      },
      autoLogin: true, // Indique au client de faire la connexion automatique
      checkoutUrl // URL de checkout Stripe si premium
    });

  } catch (error) {
    console.error('❌ Erreur inscription professionnelle:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error name:', error.name);
      
      // Erreur de configuration Supabase
      if (error.message.includes('Configuration Supabase manquante')) {
        return NextResponse.json({ 
          error: 'Configuration Supabase manquante. Veuillez configurer les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env.local',
          details: error.message
        }, { status: 500 });
      }
      
      // Erreur email déjà utilisé
      if (error.message.includes('Un compte avec cet email existe déjà')) {
        return NextResponse.json({ 
          error: 'Cet email est déjà utilisé. Si vous avez déjà un compte, veuillez vous connecter.',
          suggestion: 'Si c\'était une tentative d\'inscription précédente qui a échoué, vous pouvez nettoyer les comptes de test avec: npm run cleanup:test-professionals -- --delete'
        }, { status: 400 });
      }
      
      // Vérifier les contraintes uniques spécifiques
      if (error.message.includes('Unique constraint') || error.message.includes('duplicate key')) {
        // Vérifier quel champ pose problème
        if (error.message.includes('siret') || error.message.includes('SIRET')) {
          return NextResponse.json({ 
            error: 'Ce SIRET est déjà utilisé par un autre établissement. Si vous êtes le propriétaire, veuillez vous connecter à votre compte existant.' 
          }, { status: 400 });
        }
        if (error.message.includes('email') || error.message.includes('Email')) {
          return NextResponse.json({ 
            error: 'Cet email est déjà utilisé. Si vous avez déjà un compte, veuillez vous connecter.' 
          }, { status: 400 });
        }
        // Message générique si on ne peut pas déterminer le champ
        return NextResponse.json({ 
          error: 'SIRET ou email déjà utilisé. Vérifiez vos informations ou connectez-vous si vous avez déjà un compte.',
          details: error.message
        }, { status: 400 });
      }
      
      // Erreur de validation Supabase
      if (error.message.includes('violates') || error.message.includes('constraint')) {
        return NextResponse.json({ 
          error: 'Erreur de validation des données. Vérifiez que tous les champs requis sont remplis correctement.',
          details: error.message
        }, { status: 400 });
      }
    }

    // En mode développement, renvoyer plus de détails
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({ 
      error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      details: error instanceof Error ? error.message : 'Unknown error',
      ...(isDev && { 
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
    }, { status: 500 });
  }
}
