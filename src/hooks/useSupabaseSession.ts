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
}

export function useSupabaseSession(): UseSupabaseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const loadingRef = useRef(loading);
  const sessionRef = useRef(session);
  const userRef = useRef(user);
  
  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    loadingRef.current = loading;
    sessionRef.current = session;
    userRef.current = user;
  }, [loading, session, user]);

  // Timeout de sécurité pour éviter que loading reste bloqué
  useEffect(() => {
    // Timeout court pour forcer l'arrêt du chargement si rien ne se passe
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [useSupabaseSession] Safety timeout: forcing loading to false after 3s');
        setLoading(false);
        // Si on n'a pas de session après le timeout, c'est qu'il n'y en a pas
        if (!session && !user) {
          setUser(null);
          setSession(null);
        }
      }
    }, 3000); // 3 secondes max - plus agressif

    return () => clearTimeout(safetyTimeout);
  }, [loading, session, user]);

  useEffect(() => {
    let isMounted = true;
    
    // Fallback immédiat : si après 1 seconde on n'a toujours pas de session, arrêter le chargement
    const immediateFallback = setTimeout(() => {
      if (isMounted && loadingRef.current && !sessionRef.current && !userRef.current) {
        console.warn('⚠️ [useSupabaseSession] Immediate fallback: no session found after 1s, stopping load');
        setLoading(false);
        setUser(null);
        setSession(null);
      }
    }, 1000);
    
    // Récupérer la session initiale
    const getSession = async () => {
      try {
        console.log('🔄 [useSupabaseSession] Getting initial session...');
        
        // Timeout court pour éviter que le chargement reste bloqué
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 2000)
        );
        
        // Lire la session (créée côté client via signInWithPassword)
        let currentSession: any = null;
        let error: any = null;
        
        try {
          const sessionResult = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise
          ]) as any;
          
          // Gérer différents formats de réponse
          if (sessionResult?.data?.session !== undefined) {
            currentSession = sessionResult.data.session;
            error = sessionResult.data.error || sessionResult.error;
          } else if (sessionResult?.session !== undefined) {
            // Format alternatif
            currentSession = sessionResult.session;
            error = sessionResult.error;
          } else if (sessionResult?.data) {
            // Format avec data direct
            currentSession = sessionResult.data;
            error = sessionResult.error;
          } else {
            // Si c'est le timeout, on a pas de session
            throw new Error('Session timeout');
          }
        } catch (timeoutError: any) {
          console.warn('⚠️ [useSupabaseSession] Session timeout or error:', timeoutError.message);
          error = timeoutError;
          // En cas de timeout, considérer qu'il n'y a pas de session
          currentSession = null;
        }
        
        if (!isMounted) return;
        
        console.log('📋 [useSupabaseSession] Session result:', { 
          hasSession: !!currentSession, 
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
          error: error?.message 
        });
        
        if (error && !currentSession) {
          console.error('❌ [useSupabaseSession] Error getting session:', error);
          if (isMounted) {
            setLoading(false);
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (currentSession?.user) {
          console.log('✅ [useSupabaseSession] Session found, fetching user data...');
          // Appeler fetchUserData avec timeout
          try {
            await Promise.race([
              fetchUserData(currentSession.user),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fetch user data timeout')), 5000)
              )
            ]);
          } catch (fetchError) {
            console.error('❌ [useSupabaseSession] Error or timeout fetching user data:', fetchError);
            // Utiliser les données auth en fallback avec métadonnées
            // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
            if (isMounted) {
              const userMetadata = currentSession.user.user_metadata || {};
              const appMetadata = currentSession.user.app_metadata || {};
              const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
              
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                firstName: userMetadata.first_name || userMetadata.firstName || null,
                lastName: userMetadata.last_name || userMetadata.lastName || null,
                role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
                userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
              });
            }
          }
          if (isMounted) {
            setSession(currentSession);
          }
        } else {
          console.log('⚠️ [useSupabaseSession] No session found');
          if (isMounted) {
            setUser(null);
            setSession(null);
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in getSession:', error);
        // En cas d'erreur, s'assurer que loading est false
        if (isMounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      
      console.log('🔐 [useSupabaseSession] Auth state changed:', event, 'hasSession:', !!currentSession);
      
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (currentSession?.user) {
            console.log('🔐 [useSupabaseSession] Session user:', currentSession.user.email);
            // Appeler fetchUserData avec timeout
            try {
              await Promise.race([
                fetchUserData(currentSession.user),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Fetch user data timeout')), 3000)
                )
              ]);
            } catch (fetchError) {
              console.error('❌ [useSupabaseSession] Error or timeout fetching user data:', fetchError);
              // Utiliser les données auth en fallback
              // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
              if (isMounted) {
                const userMetadata = currentSession.user.user_metadata || {};
                const appMetadata = currentSession.user.app_metadata || {};
                const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
                
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: userMetadata.first_name || userMetadata.firstName || null,
                  lastName: userMetadata.last_name || userMetadata.lastName || null,
                  role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
                  userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
                });
              }
            }
            if (isMounted) {
              setSession(currentSession);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [useSupabaseSession] User signed out');
          if (isMounted) {
            setUser(null);
            setSession(null);
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in auth state change:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(immediateFallback);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      console.log('👤 [useSupabaseSession] Fetching user data for:', authUser.id);
      
      // Timeout pour les requêtes Supabase
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );

      // Vérifier d'abord dans la table users avec timeout
      let userData: any = null;
      let userError: any = null;
      
      try {
        const userQueryPromise = supabase
          .from('users')
          .select('id, email, first_name, last_name, role')
          .eq('id', authUser.id)
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
        userData, 
        error: userError?.message || userError,
        hasData: !!userData
      });

      if (userData && !userError) {
        // ✅ PRIORITÉ AUX MÉTADONNÉES JWT (comme isAdmin())
        // Vérifier d'abord app_metadata.role qui est la source de vérité
        const userMetadata = authUser.user_metadata || {};
        const appMetadata = authUser.app_metadata || {};
        const roleFromMetadata = appMetadata.role || userMetadata.role;
        
        // Utiliser le rôle des métadonnées JWT s'il existe, sinon celui de la table users
        const finalRole = roleFromMetadata === 'admin' 
          ? 'admin' 
          : (userData.role === 'admin' ? 'admin' : 'user');
        
        const newUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: finalRole as 'user' | 'admin',
          userType: 'user' as const
        };
        console.log('✅ [useSupabaseSession] Setting user from users table:', newUser, {
          roleFromMetadata,
          tableRole: userData.role,
          finalRole
        });
        setUser(newUser);
        return;
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
        const newUser = {
          id: professionalData.id,
          email: professionalData.email,
          firstName: professionalData.first_name,
          lastName: professionalData.last_name,
          role: 'professional' as const,
          userType: 'professional' as const
        };
        console.log('✅ [useSupabaseSession] Setting user from professionals table:', newUser);
        setUser(newUser);
        return;
      }

      // Fallback sur les données auth
      // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
      const userMetadata = authUser.user_metadata || {};
      const appMetadata = authUser.app_metadata || {};
      const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
      
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email || '',
        firstName: userMetadata.first_name || userMetadata.firstName || null,
        lastName: userMetadata.last_name || userMetadata.lastName || null,
        role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
        userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
      };
      console.log('⚠️ [useSupabaseSession] Using fallback user:', fallbackUser);
      setUser(fallbackUser);
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error fetching user data:', error);
      // Toujours définir un utilisateur en fallback pour éviter le blocage
      // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
      const userMetadata = authUser.user_metadata || {};
      const appMetadata = authUser.app_metadata || {};
      const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        firstName: userMetadata.first_name || userMetadata.firstName || null,
        lastName: userMetadata.last_name || userMetadata.lastName || null,
        role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
        userType: (roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional'
      });
      // Propager l'erreur pour que le timeout fonctionne
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 [useSupabaseSession] Starting sign out...');
      
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

  return {
    user,
    session: session ? { ...session, user: user } : null, // Remplacer explicitement session.user par notre user enrichi
    loading,
    signOut: handleSignOut
  };
}

