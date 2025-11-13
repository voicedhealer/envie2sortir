'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';

/**
 * Actions d'authentification avec Supabase Auth
 */

/**
 * Créer un client admin pour les opérations nécessitant des privilèges élevés
 */
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuration Supabase manquante');
  }
  
  return createClientAdmin(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Créer un compte utilisateur
 */
export async function signUp(firstName: string, lastName: string, email: string, password: string) {
  try {
    const supabase = createClient();
    
    // Vérifier si l'utilisateur existe déjà dans la table users ou professionals
    const [existingUser, existingProfessional] = await Promise.all([
      supabase.from('users').select('id').eq('email', email).single(),
      supabase.from('professionals').select('id').eq('email', email).single()
    ]);
    
    if (existingUser.data || existingProfessional.data) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Créer le compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          userType: 'user'
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (authError) {
      throw new Error(authError.message || 'Erreur lors de la création du compte');
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Créer l'entrée dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        provider: 'local',
        role: 'user'
      })
      .select()
      .single();

    if (userError) {
      // Si erreur, supprimer le compte auth créé (nécessite admin)
      try {
        const adminClient = getAdminClient();
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression du compte auth:', deleteError);
      }
      throw new Error(userError.message || 'Erreur lors de la création du profil utilisateur');
    }

    return { 
      success: true, 
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name
      }
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    throw new Error(error.message || 'Erreur lors de la création du compte');
  }
}

/**
 * Connexion utilisateur
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();
    
    // Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw new Error(authError.message || 'Email ou mot de passe incorrect');
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la connexion');
    }

    // Récupérer les infos utilisateur depuis la table users ou professionals
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userData) {
      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          userType: 'user'
        }
      };
    }

    // Si pas trouvé dans users, chercher dans professionals
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (professionalData) {
      // Récupérer l'établissement associé
      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', professionalData.id)
        .single();

      return {
        success: true,
        user: {
          id: professionalData.id,
          email: professionalData.email,
          firstName: professionalData.first_name,
          lastName: professionalData.last_name,
          role: 'pro',
          userType: 'professional',
          establishmentId: establishment?.id || null
        }
      };
    }

    throw new Error('Profil utilisateur non trouvé');
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    throw new Error(error.message || 'Erreur lors de la connexion');
  }
}

/**
 * Connexion avec Google (OAuth)
 */
export async function signInWithGoogle() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la connexion avec Google');
    }

    return { success: true, url: data.url };
  } catch (error: any) {
    console.error('Erreur lors de la connexion Google:', error);
    throw new Error(error.message || 'Erreur lors de la connexion avec Google');
  }
}

/**
 * Connexion avec Facebook (OAuth)
 */
export async function signInWithFacebook() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la connexion avec Facebook');
    }

    return { success: true, url: data.url };
  } catch (error: any) {
    console.error('Erreur lors de la connexion Facebook:', error);
    throw new Error(error.message || 'Erreur lors de la connexion avec Facebook');
  }
}

/**
 * Déconnexion
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la déconnexion:', error);
    throw new Error(error.message || 'Erreur lors de la déconnexion');
  }
}

/**
 * Inscription professionnelle avec création d'établissement
 * Cette fonction gère toute la création : auth, professional, establishment, tags
 */
export async function signUpProfessional(
  accountData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  },
  professionalData: {
    siret: string;
    companyName: string;
    legalStatus: string;
    subscriptionPlan: string;
  },
  establishmentData: {
    name: string;
    description: string;
    address: string;
    city: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    activities: string[];
    services: any;
    ambiance: any;
    paymentMethods: any;
    hours: any;
    website: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    phone: string;
    email: string;
    priceMin: number;
    priceMax: number;
    informationsPratiques: any;
    theForkLink: string;
    uberEatsLink: string;
    tags: string[];
    envieTags: string[];
    accessibilityDetails: any;
    detailedServices: any;
    clienteleInfo: any;
    detailedPayments: any;
    childrenServices: any;
  },
  generateSlug: (name: string) => string,
  createTagsData: (establishmentId: string, categoryKey: string) => Array<{
    etablissementId: string;
    tag: string;
    typeTag: string;
    poids: number;
  }>
) {
  const adminClient = getAdminClient();
  const supabase = createClient();
  let authUserId: string | null = null;

  try {
    // 1. Vérifier si l'email existe déjà
    const [existingUser, existingProfessional] = await Promise.all([
      supabase.from('users').select('id').eq('email', accountData.email).single(),
      supabase.from('professionals').select('id').eq('email', accountData.email).single()
    ]);

    if (existingUser.data || existingProfessional.data) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // 2. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: accountData.email,
      password: accountData.password,
      options: {
        data: {
          first_name: accountData.firstName,
          last_name: accountData.lastName,
          role: 'pro',
          userType: 'professional'
        }
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erreur lors de la création du compte');
    }

    authUserId = authData.user.id;

    // 3. Créer le professional
    const { data: professional, error: professionalError } = await supabase
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
        subscription_plan: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE',
        siret_verified: false
      })
      .select()
      .single();

    if (professionalError || !professional) {
      // Rollback: supprimer le compte auth
      await adminClient.auth.admin.deleteUser(authUserId);
      throw new Error(professionalError?.message || 'Erreur lors de la création du professionnel');
    }

    // 4. Générer un slug unique
    let slug = generateSlug(establishmentData.name);
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const { data: existing } = await supabase
        .from('establishments')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) {
        slugExists = false;
      } else {
        slug = `${generateSlug(establishmentData.name)}-${counter}`;
        counter++;
      }
    }

    // 5. Créer l'établissement
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .insert({
        name: establishmentData.name,
        slug: slug,
        description: establishmentData.description,
        address: establishmentData.address,
        city: establishmentData.city,
        postal_code: establishmentData.postalCode,
        latitude: establishmentData.latitude,
        longitude: establishmentData.longitude,
        activities: JSON.stringify(establishmentData.activities),
        services: JSON.stringify(establishmentData.services),
        ambiance: JSON.stringify(establishmentData.ambiance),
        payment_methods: JSON.stringify(establishmentData.paymentMethods),
        horaires_ouverture: JSON.stringify(establishmentData.hours),
        phone: establishmentData.phone,
        email: establishmentData.email,
        website: establishmentData.website,
        instagram: establishmentData.instagram,
        facebook: establishmentData.facebook,
        tiktok: establishmentData.tiktok,
        price_min: establishmentData.priceMin,
        price_max: establishmentData.priceMax,
        informations_pratiques: JSON.stringify(establishmentData.informationsPratiques),
        the_fork_link: establishmentData.theForkLink,
        uber_eats_link: establishmentData.uberEatsLink,
        accessibility_details: establishmentData.accessibilityDetails ? JSON.stringify(establishmentData.accessibilityDetails) : null,
        detailed_services: establishmentData.detailedServices ? JSON.stringify(establishmentData.detailedServices) : null,
        clientele_info: establishmentData.clienteleInfo ? JSON.stringify(establishmentData.clienteleInfo) : null,
        detailed_payments: establishmentData.detailedPayments ? JSON.stringify(establishmentData.detailedPayments) : null,
        children_services: establishmentData.childrenServices ? JSON.stringify(establishmentData.childrenServices) : null,
        owner_id: professional.id,
        status: 'pending',
        subscription: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE'
      })
      .select()
      .single();

    if (establishmentError || !establishment) {
      // Rollback: supprimer professional et auth
      await supabase.from('professionals').delete().eq('id', professional.id);
      await adminClient.auth.admin.deleteUser(authUserId);
      throw new Error(establishmentError?.message || 'Erreur lors de la création de l\'établissement');
    }

    // 6. Créer les tags
    const allTagsData: Array<{etablissement_id: string, tag: string, type_tag: string, poids: number}> = [];

    // Tags automatiques basés sur les activités
    for (const activityKey of establishmentData.activities) {
      const tagsData = createTagsData(establishment.id, activityKey);
      // Convertir etablissementId -> etablissement_id pour Supabase
      allTagsData.push(...tagsData.map(t => ({
        etablissement_id: t.etablissementId,
        tag: t.tag,
        type_tag: t.typeTag,
        poids: t.poids
      })));
    }

    // Tags manuels
    for (const tagId of establishmentData.tags) {
      allTagsData.push({
        etablissement_id: establishment.id,
        tag: tagId.toLowerCase(),
        type_tag: 'manuel',
        poids: 10
      });
    }

    // Tags "envie de"
    for (const envieTag of establishmentData.envieTags) {
      allTagsData.push({
        etablissement_id: establishment.id,
        tag: envieTag.toLowerCase(),
        type_tag: 'envie',
        poids: 3
      });
    }

    // Supprimer les doublons
    const uniqueTags = new Map<string, {etablissement_id: string, tag: string, type_tag: string, poids: number}>();
    allTagsData.forEach(tagData => {
      const existing = uniqueTags.get(tagData.tag);
      if (!existing || tagData.poids > existing.poids) {
        uniqueTags.set(tagData.tag, tagData);
      }
    });

    // Créer les tags en base
    if (uniqueTags.size > 0) {
      const tagsToCreate = Array.from(uniqueTags.values());
      const { error: tagsError } = await supabase
        .from('etablissement_tags')
        .insert(tagsToCreate);

      if (tagsError) {
        console.error('Erreur création tags:', tagsError);
        // On continue quand même, les tags ne sont pas critiques
      }
    }

    return {
      success: true,
      professional: {
        id: professional.id,
        email: professional.email,
        firstName: professional.first_name,
        lastName: professional.last_name,
        siret: professional.siret
      },
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug
      }
    };

  } catch (error: any) {
    // Rollback complet en cas d'erreur
    if (authUserId) {
      try {
        await adminClient.auth.admin.deleteUser(authUserId);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression du compte auth:', deleteError);
      }
    }

    console.error('Erreur lors de l\'inscription professionnelle:', error);
    throw new Error(error.message || 'Erreur lors de l\'inscription professionnelle');
  }
}

