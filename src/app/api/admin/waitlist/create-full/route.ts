import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from '@/lib/supabase/helpers';
import { signUpProfessional } from '@/lib/supabase/auth-actions';
import { geocodeAddress } from '@/lib/geocoding';
import { createTagsData } from '@/lib/category-tags-mapping';
import { logSubscriptionChange } from '@/lib/subscription-logger';
import { isPhoneVerified } from '@/lib/phone-verification';
import { createClient as createClientAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Normalise un numéro de test Twilio
 */
function normalizeTwilioTestNumber(phone: string): string {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  if (/^01500555\d{3,4}$/.test(cleaned)) {
    const normalized = cleaned.substring(0, 11);
    return '+' + normalized.substring(1);
  }
  
  if (/^\+1500555\d{3,4}$/.test(cleaned)) {
    return cleaned.length === 12 ? cleaned : cleaned.substring(0, 12);
  }
  
  return phone;
}

/**
 * POST /api/admin/waitlist/create-full
 * Crée un professionnel complet en waitlist avec toutes les étapes
 * (Version admin du formulaire complet)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Vérifier la vérification SMS
    const smsVerified = formData.get('smsVerified') === 'true';
    if (!smsVerified) {
      return NextResponse.json(
        { error: 'Vérification du numéro de téléphone requise' },
        { status: 400 }
      );
    }

    // Parser les données du formulaire (même logique que professional-registration)
    const accountData = {
      firstName: formData.get('accountFirstName') as string,
      lastName: formData.get('accountLastName') as string,
      email: formData.get('accountEmail') as string,
      password: formData.get('accountPassword') as string,
      phone: normalizeTwilioTestNumber(formData.get('accountPhone') as string),
    };

    const professionalData = {
      siret: formData.get('siret') as string,
      companyName: formData.get('companyName') as string,
      legalStatus: formData.get('legalStatus') as string,
      subscriptionPlan: 'waitlist_beta' as const, // FORCER en waitlist
      subscriptionPlanType: 'monthly' as const, // Pas utilisé en waitlist mais requis
    };

    const establishmentData = {
      name: formData.get('establishmentName') as string,
      description: formData.get('description') as string || '',
      address: formData.get('address') as string,
      activities: JSON.parse(formData.get('activities') as string || '[]'),
      services: JSON.parse(formData.get('services') as string || '[]'),
      ambiance: JSON.parse(formData.get('ambiance') as string || '[]'),
      paymentMethods: (() => {
        const paymentMethodsData = formData.get('paymentMethods');
        if (paymentMethodsData && typeof paymentMethodsData === 'string') {
          try {
            return JSON.parse(paymentMethodsData);
          } catch (e) {
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
      accessibilityDetails: (() => {
        const data = formData.get('hybridAccessibilityDetails');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
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

    // Géocodage de l'adresse
    const manualLatitude = formData.get('latitude') as string;
    const manualLongitude = formData.get('longitude') as string;
    
    let finalCoordinates = null;
    
    if (manualLatitude && manualLongitude) {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        finalCoordinates = { latitude: lat, longitude: lng };
      }
    }
    
    if (!finalCoordinates) {
      try {
        finalCoordinates = await geocodeAddress(establishmentData.address);
      } catch (geocodeError) {
        console.warn('⚠️ Erreur lors du géocodage (non-bloquant):', geocodeError);
      }
    }

    // Créer le professionnel avec signUpProfessional
    // Mais on doit modifier la fonction pour accepter WAITLIST_BETA
    // Pour l'instant, on va créer manuellement avec le client admin
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: accountData.email,
      password: accountData.password,
      email_confirm: true,
      user_metadata: {
        first_name: accountData.firstName,
        last_name: accountData.lastName,
        role: 'pro',
        userType: 'professional',
      },
    });

    if (authError || !authData.user) {
      console.error('Erreur création compte auth:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    try {
      // Créer le Professional avec WAITLIST_BETA
      const { data: professional, error: professionalError } = await adminClient
        .from('professionals')
        .insert({
          id: authUserId,
          siret: professionalData.siret,
          first_name: accountData.firstName,
          last_name: accountData.lastName,
          email: accountData.email,
          phone: accountData.phone,
          company_name: professionalData.companyName,
          legal_status: professionalData.legalStatus,
          subscription_plan: 'WAITLIST_BETA', // FORCER en waitlist
          siret_verified: false,
        })
        .select()
        .single();

      if (professionalError || !professional) {
        console.error('Erreur création professionnel:', professionalError);
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json(
          { error: professionalError?.message || 'Erreur lors de la création du professionnel' },
          { status: 500 }
        );
      }

      // Générer un slug unique pour l'établissement
      let slug = generateSlug(establishmentData.name);
      let counter = 1;
      let slugExists = true;

      while (slugExists) {
        const { data: existing } = await adminClient
          .from('establishments')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!existing) {
          slugExists = false;
        } else {
          slug = `${generateSlug(establishmentData.name)}-${counter}`;
          counter++;
        }
      }

      // Parser l'adresse pour extraire city et postal_code
      const parseAddressComponents = (fullAddress: string) => {
        if (!fullAddress) return { city: null, postalCode: null };
        
        // Pattern 1 : "19 Rue du Garet, 69001 Lyon"
        let match = fullAddress.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
        if (match) {
          return {
            city: match[3].trim(),
            postalCode: match[2].trim()
          };
        }
        
        // Pattern 2 : "19 Rue du Garet 69001 Lyon" (sans virgule)
        match = fullAddress.match(/^(.+?)\s+(\d{5})\s+(.+)$/);
        if (match) {
          return {
            city: match[3].trim(),
            postalCode: match[2].trim()
          };
        }
        
        // Pattern 3 : Avec virgules multiples
        const parts = fullAddress.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          for (let i = 0; i < parts.length; i++) {
            const postalCodeMatch = parts[i].match(/(\d{5})/);
            if (postalCodeMatch && i < parts.length - 1) {
              return {
                city: parts[i + 1].trim(),
                postalCode: postalCodeMatch[1]
              };
            }
          }
        }
        
        // Pattern 4 : Code postal à la fin
        match = fullAddress.match(/^(.+?)\s+([A-Za-zÀ-ÿ\s-]+)\s+(\d{5})$/);
        if (match) {
          return {
            city: match[2].trim(),
            postalCode: match[3].trim()
          };
        }
        
        // Fallback : Extraire n'importe quel code postal 5 chiffres
        const postalCodeMatch = fullAddress.match(/(\d{5})/);
        if (postalCodeMatch) {
          return {
            city: null,
            postalCode: postalCodeMatch[1]
          };
        }
        
        return { city: null, postalCode: null };
      };

      const addressComponents = parseAddressComponents(establishmentData.address);

      // Créer l'établissement avec WAITLIST_BETA
      const { data: establishment, error: establishmentError } = await adminClient
        .from('establishments')
        .insert({
          name: establishmentData.name,
          slug: slug,
          description: establishmentData.description,
          address: establishmentData.address,
          city: addressComponents.city,
          postal_code: addressComponents.postalCode,
          country: 'France',
          latitude: finalCoordinates?.latitude || null,
          longitude: finalCoordinates?.longitude || null,
          owner_id: professional.id,
          status: 'pending',
          subscription: 'WAITLIST_BETA', // FORCER en waitlist
          activities: establishmentData.activities,
          services: establishmentData.services,
          ambiance: establishmentData.ambiance,
          payment_methods: establishmentData.paymentMethods,
          horaires_ouverture: establishmentData.hours,
          phone: establishmentData.phone,
          whatsapp_phone: establishmentData.whatsappPhone,
          messenger_url: establishmentData.messengerUrl,
          email: establishmentData.email,
          website: establishmentData.website,
          instagram: establishmentData.instagram,
          facebook: establishmentData.facebook,
          tiktok: establishmentData.tiktok,
          youtube: establishmentData.youtube,
          prix_min: establishmentData.priceMin || null,
          prix_max: establishmentData.priceMax || null,
          informations_pratiques: establishmentData.informationsPratiques,
          the_fork_link: establishmentData.theForkLink,
          uber_eats_link: establishmentData.uberEatsLink,
          accessibility_details: establishmentData.accessibilityDetails,
          detailed_services: establishmentData.detailedServices,
          clientele_info: establishmentData.clienteleInfo,
          detailed_payments: establishmentData.detailedPayments,
          children_services: establishmentData.childrenServices,
        })
        .select()
        .single();

      if (establishmentError || !establishment) {
        console.error('Erreur création établissement:', establishmentError);
        await adminClient.from('professionals').delete().eq('id', professional.id);
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json(
          { error: establishmentError?.message || 'Erreur lors de la création de l\'établissement' },
          { status: 500 }
        );
      }

      // Créer les tags
      const tagsData = createTagsData(establishmentData.tags, establishmentData.envieTags);
      if (tagsData && tagsData.length > 0) {
        await adminClient.from('establishment_tags').insert(
          tagsData.map(tag => ({
            establishment_id: establishment.id,
            tag_name: tag,
          }))
        );
      }

      // Logger le changement de subscription
      try {
        await logSubscriptionChange(
          establishment.id,
          'WAITLIST_BETA',
          professional.id,
          'admin_waitlist_creation'
        );
      } catch (logError) {
        console.warn('Erreur lors du logging de subscription:', logError);
      }

      // Log dans subscription_logs
      await adminClient.from('subscription_logs').insert({
        professional_id: professional.id,
        old_status: null,
        new_status: 'WAITLIST_BETA',
        reason: 'admin_waitlist_full_creation',
      });

      console.log(`✅ [Admin Waitlist Full] Professionnel créé: ${accountData.email}`);

      return NextResponse.json({ 
        success: true,
        message: 'Professionnel créé en waitlist avec succès !',
        professionalId: professional.id,
        establishmentId: establishment.id,
      }, { status: 201 });

    } catch (error: any) {
      // Rollback en cas d'erreur
      try {
        await adminClient.auth.admin.deleteUser(authUserId);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression du compte auth:', deleteError);
      }
      throw error;
    }

  } catch (error: any) {
    console.error('❌ [Admin Waitlist Create Full] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du professionnel en waitlist' },
      { status: 500 }
    );
  }
}

