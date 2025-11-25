'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface SessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'professional' | 'admin';
  userType?: 'user' | 'professional';
}

interface UseSupabaseSessionReturn {
  user: SessionUser | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>; // ✅ Fonction pour forcer un rafraîchissement
}

// ✅ Cache global pour éviter les requêtes multiples
const userDataCache = new Map<string, { data: SessionUser | null; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 secondes
const pendingUserRequests = new Map<string, Promise<SessionUser | null>>();

export function useSupabaseSession(): UseSupabaseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const loadingRef = useRef(loading);
  const sessionRef = useRef(session);
  const userRef = useRef(user);
  const sessionDetectedRef = useRef(false); // ✅ Flag pour savoir si une session a été détectée
  
  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    loadingRef.current = loading;
    sessionRef.current = session;
    userRef.current = user;
    if (session) sessionDetectedRef.current = true;
  }, [loading, session, user]);

  // Timeout de sécurité pour éviter que loading reste bloqué
  useEffect(() => {
    // Timeout de sécurité finale (15s)
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [useSupabaseSession] Safety timeout: forcing loading to false after 15s');
        setLoading(false);
        // Si on n'a pas de session après le timeout ET qu'aucune n'a été détectée
        if (!session && !user && !sessionDetectedRef.current) {
          setUser(null);
          setSession(null);
        }
      }
    }, 15000); // 15 secondes max - timeout de sécurité finale

    return () => clearTimeout(safetyTimeout);
  }, [loading, session, user]);

  useEffect(() => {
    let isMounted = true;
    
    // Fallback : si après 10 secondes on n'a toujours pas de session ET qu'aucune session n'a été détectée
    const immediateFallback = setTimeout(() => {
      // ✅ Ne pas annuler si une session a été détectée (même si pas encore dans l'état)
      if (isMounted && loadingRef.current && !sessionRef.current && !userRef.current && !sessionDetectedRef.current) {
        console.warn('⚠️ [useSupabaseSession] Fallback: no session found after 10s, stopping load');
        setLoading(false);
        setUser(null);
        setSession(null);
      }
    }, 10000);
    
    // Récupérer la session initiale
    // ✅ SIMPLIFIÉ : On fait confiance à onAuthStateChange qui est plus fiable
    const getSession = async () => {
      try {
        console.log('🔄 [useSupabaseSession] Getting initial session...');
        
        // ✅ Appel simple sans race condition agressive
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        const currentSession = data?.session;
        
        console.log('📋 [useSupabaseSession] Session result:', { 
          hasSession: !!currentSession, 
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
          error: error?.message 
        });
        
        // ✅ Si onAuthStateChange a déjà traité la session, ne rien faire
        if (sessionDetectedRef.current && sessionRef.current) {
          console.log('✅ [useSupabaseSession] Session already handled by onAuthStateChange');
          return;
        }

        if (currentSession?.user) {
          sessionDetectedRef.current = true;
          console.log('✅ [useSupabaseSession] Session found via getSession');
          
          // ✅ OPTIMISATION: Afficher IMMÉDIATEMENT avec les métadonnées JWT
          const userMetadata = currentSession.user.user_metadata || {};
          const appMetadata = currentSession.user.app_metadata || {};
          const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
          
          const immediateUser: SessionUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
          };
          
          if (isMounted) {
            console.log('⚡ [useSupabaseSession] Displaying user immediately from JWT (getSession):', {
              firstName: immediateUser.firstName,
              role: immediateUser.role
            });
            setUser(immediateUser);
            setSession(currentSession);
            setLoading(false);
          }
          
          // ✅ En arrière-plan, essayer de récupérer les données complètes
          fetchUserData(currentSession.user).catch((err) => {
            console.log('ℹ️ [useSupabaseSession] Background fetch from getSession completed or failed:', err?.message || 'success');
          });
        } else if (!sessionDetectedRef.current) {
          // Pas de session et aucune détectée par onAuthStateChange
          console.log('⚠️ [useSupabaseSession] No session found');
          if (isMounted) {
            setUser(null);
            setSession(null);
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in getSession:', error);
        // En cas d'erreur, ne pas écraser si onAuthStateChange a déjà une session
        if (isMounted && !sessionDetectedRef.current) {
          setUser(null);
          setSession(null);
        }
      } finally {
        // ✅ Ne pas forcer loading=false si onAuthStateChange est en train de traiter
        if (isMounted && !sessionDetectedRef.current) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      
      console.log('🔐 [useSupabaseSession] Auth state changed:', event, 'hasSession:', !!currentSession, {
        userId: currentSession?.user?.id,
        userEmail: currentSession?.user?.email
      });
      
      // ✅ Marquer qu'une session a été détectée pour éviter le fallback
      if (currentSession) {
        sessionDetectedRef.current = true;
      }
      
      // ✅ PROTECTION: Vérifier que l'utilisateur n'a pas changé lors d'un TOKEN_REFRESHED
      if (event === 'TOKEN_REFRESHED' && userRef.current && currentSession?.user) {
        if (userRef.current.id !== currentSession.user.id) {
          console.error('❌ [useSupabaseSession] User ID changed during token refresh!', {
            previousUserId: userRef.current.id,
            newUserId: currentSession.user.id,
            previousUserEmail: userRef.current.email,
            newUserEmail: currentSession.user.email
          });
          // Ne pas mettre à jour si l'utilisateur a changé (probablement un problème de session)
          return;
        }
      }
      
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (currentSession?.user) {
            console.log('🔐 [useSupabaseSession] Session user:', {
              id: currentSession.user.id,
              email: currentSession.user.email,
              appMetadataRole: currentSession.user.app_metadata?.role
            });
            
            // ✅ OPTIMISATION: Afficher IMMÉDIATEMENT l'utilisateur avec les métadonnées JWT
            const userMetadata = currentSession.user.user_metadata || {};
            const appMetadata = currentSession.user.app_metadata || {};
            const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
            
            const immediateUser: SessionUser = {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              firstName: userMetadata.first_name || userMetadata.firstName || null,
              lastName: userMetadata.last_name || userMetadata.lastName || null,
              role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
              userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
            };
            
            // ✅ Afficher immédiatement avec les données JWT
            if (isMounted) {
              console.log('⚡ [useSupabaseSession] Displaying user immediately from JWT metadata:', {
                firstName: immediateUser.firstName,
                role: immediateUser.role
              });
              setUser(immediateUser);
              setSession(currentSession);
              setLoading(false); // ✅ Arrêter le loading immédiatement
            }
            
            // ✅ En arrière-plan, essayer de récupérer les données complètes (sans bloquer)
            fetchUserData(currentSession.user).catch((err) => {
              console.log('ℹ️ [useSupabaseSession] Background fetch completed or failed:', err?.message || 'success');
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [useSupabaseSession] User signed out');
          if (isMounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in auth state change:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
      // ✅ Pas de finally avec setLoading - déjà géré dans chaque cas
    });

    return () => {
      isMounted = false;
      clearTimeout(immediateFallback);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      const userId = authUser.id;
      
      // ✅ Vérifier le cache d'abord
      const cached = userDataCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ [useSupabaseSession] Cache hit for user:', userId);
        setUser(cached.data);
        return;
      }

      // ✅ Éviter les requêtes multiples simultanées
      if (pendingUserRequests.has(userId)) {
        console.log('⏳ [useSupabaseSession] Request already in progress for:', userId);
        const cachedResult = await pendingUserRequests.get(userId)!;
        setUser(cachedResult);
        return;
      }

      console.log('👤 [useSupabaseSession] Fetching user data for:', {
        authUserId: authUser.id,
        authUserEmail: authUser.email,
        appMetadataRole: authUser.app_metadata?.role,
        userMetadataRole: authUser.user_metadata?.role
      });
      
      // Créer la promesse de requête
      const requestPromise = (async (): Promise<SessionUser | null> => {
        try {
          // Timeout pour les requêtes Supabase (15s pour laisser le temps aux requêtes lentes)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 15000)
          );

          // Vérifier d'abord dans la table users avec timeout
          // ✅ IMPORTANT: Utiliser l'ID de l'auth user pour éviter les conflits
          let userData: any = null;
          let userError: any = null;
          
          try {
            const userQueryPromise = supabase
              .from('users')
              .select('id, email, first_name, last_name, role')
              .eq('id', authUser.id) // ✅ Utiliser l'ID exact de l'auth user
              .maybeSingle();

            const result = await Promise.race([
              userQueryPromise,
              timeoutPromise
            ]) as any;
            
            if (result?.data !== undefined) {
              userData = result.data;
              userError = result.error;
            } else if (result?.error) {
              userError = result.error;
            } else {
              // Timeout ou format inattendu
              throw new Error('Query timeout or unexpected format');
            }
          } catch (queryError: any) {
            console.warn('⚠️ [useSupabaseSession] Users query error or timeout:', queryError.message);
            userError = queryError;
          }

          console.log('🔍 [useSupabaseSession] Users table result:', { 
            userData: userData ? {
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              role: userData.role
            } : null,
            error: userError?.message || userError,
            hasData: !!userData,
            // ✅ Vérifier que l'ID correspond bien
            idMatch: userData ? userData.id === authUser.id : false,
            emailMatch: userData ? userData.email === authUser.email : false
          });

          if (userData && !userError) {
            // ✅ VÉRIFICATION DE SÉCURITÉ: S'assurer que l'ID et l'email correspondent
            if (userData.id !== authUser.id) {
              console.error('❌ [useSupabaseSession] ID mismatch!', {
                authUserId: authUser.id,
                tableUserId: userData.id,
                authUserEmail: authUser.email,
                tableUserEmail: userData.email
              });
              // Ne pas utiliser ces données, utiliser le fallback
              throw new Error('ID mismatch between auth user and table user');
            }
            
            if (userData.email !== authUser.email) {
              console.warn('⚠️ [useSupabaseSession] Email mismatch!', {
                authUserEmail: authUser.email,
                tableUserEmail: userData.email
              });
              // Utiliser l'email de l'auth user qui est la source de vérité
            }
            
            // ✅ PRIORITÉ AUX MÉTADONNÉES JWT (comme isAdmin())
            // Vérifier d'abord app_metadata.role qui est la source de vérité
            const userMetadata = authUser.user_metadata || {};
            const appMetadata = authUser.app_metadata || {};
            const roleFromMetadata = appMetadata.role || userMetadata.role;
            
            // Utiliser le rôle des métadonnées JWT s'il existe, sinon celui de la table users
            const finalRole = roleFromMetadata === 'admin' 
              ? 'admin' 
              : (userData.role === 'admin' ? 'admin' : 'user');
            
            const newUser: SessionUser = {
              id: authUser.id, // ✅ Utiliser l'ID de l'auth user (source de vérité)
              email: authUser.email || userData.email, // ✅ Priorité à l'email de l'auth user
              firstName: userData.first_name,
              lastName: userData.last_name,
              role: finalRole as 'user' | 'admin',
              userType: 'user' as const
            };
            console.log('✅ [useSupabaseSession] Setting user from users table:', newUser, {
              roleFromMetadata,
              tableRole: userData.role,
              finalRole,
              authUserId: authUser.id,
              authUserEmail: authUser.email
            });
            
            // ✅ Mettre en cache
            userDataCache.set(userId, { data: newUser, timestamp: Date.now() });
            return newUser;
          }

          // Sinon vérifier dans professionals avec timeout
          const profQueryPromise = supabase
            .from('professionals')
            .select('id, email, first_name, last_name')
            .eq('id', authUser.id)
            .maybeSingle();

          const { data: professionalData, error: profError } = await Promise.race([
            profQueryPromise,
            timeoutPromise
          ]) as any;

          console.log('🔍 [useSupabaseSession] Professionals table result:', { professionalData, error: profError });

          if (professionalData && !profError) {
            const newUser: SessionUser = {
              id: professionalData.id,
              email: professionalData.email,
              firstName: professionalData.first_name,
              lastName: professionalData.last_name,
              role: 'professional' as const,
              userType: 'professional' as const
            };
            console.log('✅ [useSupabaseSession] Setting user from professionals table:', newUser);
            
            // ✅ Mettre en cache
            userDataCache.set(userId, { data: newUser, timestamp: Date.now() });
            return newUser;
          }

          // Fallback sur les données auth
          // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
          const userMetadata = authUser.user_metadata || {};
          const appMetadata = authUser.app_metadata || {};
          const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
          
          const fallbackUser: SessionUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
          };
          console.log('⚠️ [useSupabaseSession] Using fallback user:', fallbackUser);
          
          // ✅ Mettre en cache
          userDataCache.set(userId, { data: fallbackUser, timestamp: Date.now() });
          return fallbackUser;
        } catch (error) {
          console.error('❌ [useSupabaseSession] Error fetching user data:', error);
          // Toujours définir un utilisateur en fallback pour éviter le blocage
          // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
          const userMetadata = authUser.user_metadata || {};
          const appMetadata = authUser.app_metadata || {};
          const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
          
          const fallbackUser: SessionUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
          };
          
          // ✅ Mettre en cache même en cas d'erreur
          userDataCache.set(userId, { data: fallbackUser, timestamp: Date.now() });
          return fallbackUser;
        } finally {
          // ✅ Nettoyer la requête en cours
          pendingUserRequests.delete(userId);
        }
      })();

      pendingUserRequests.set(userId, requestPromise);
      const result = await requestPromise;
      setUser(result);
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error in fetchUserData wrapper:', error);
      // Propager l'erreur pour que le timeout fonctionne
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 [useSupabaseSession] Starting sign out...');
      
      // ✅ Nettoyer le cache
      if (user?.id) {
        userDataCache.delete(user.id);
        pendingUserRequests.delete(user.id);
      }
      
      // Nettoyer l'état local immédiatement
      setUser(null);
      setSession(null);
      
      // Nettoyer le localStorage
      if (typeof window !== 'undefined') {
        // Supprimer tous les items Supabase du localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 [useSupabaseSession] LocalStorage cleaned');
      }
      
      // Tenter la déconnexion Supabase avec timeout et scope global
      const signOutPromise = supabase.auth.signOut({ scope: 'global' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 1000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise])
        .catch(error => {
          console.warn('⚠️ [useSupabaseSession] SignOut timeout or error:', error);
          // Continuer quand même
        });
      
      console.log('✅ [useSupabaseSession] Sign out completed');
      
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error signing out:', error);
      // Même en cas d'erreur, nettoyer l'état local
      setUser(null);
      setSession(null);
    }
  };

  // Fonction pour forcer un rafraîchissement de la session
  const refreshSession = async () => {
    console.log('🔄 [useSupabaseSession] Forcing session refresh...');
    try {
      // ✅ Nettoyer le cache pour forcer un rafraîchissement
      if (user?.id) {
        userDataCache.delete(user.id);
        pendingUserRequests.delete(user.id);
      }
      
      // Récupérer la session actuelle
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [useSupabaseSession] Error refreshing session:', error);
        return;
      }
      
      if (currentSession?.user) {
        console.log('✅ [useSupabaseSession] Refreshing user data for:', currentSession.user.id);
        await fetchUserData(currentSession.user);
        setSession(currentSession);
      } else {
        console.log('⚠️ [useSupabaseSession] No session found during refresh');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error in refreshSession:', error);
    }
  };

  return {
    user,
    session: session ? { ...session, user: user } : null, // Remplacer explicitement session.user par notre user enrichi
    loading,
    signOut: handleSignOut,
    refreshSession // ✅ Exporter la fonction de rafraîchissement
  };
}

