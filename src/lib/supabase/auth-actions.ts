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

