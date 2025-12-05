'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
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

// ✅ NOUVEAU : Singleton global pour partager la session entre toutes les instances
let globalSessionState: {
  session: any | null;
  user: SessionUser | null;
  loading: boolean;
  initialized: boolean;
  getSessionPromise: Promise<any> | null;
} = {
  session: null,
  user: null,
  loading: true,
  initialized: false,
  getSessionPromise: null,
};

// ✅ NOUVEAU : Verrouillage pour éviter les appels multiples simultanés à getSession()
let getSessionLock = false;

export function useSupabaseSession(): UseSupabaseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const loadingRef = useRef(loading);
  const sessionRef = useRef(session);
  const userRef = useRef(user);
  const sessionDetectedRef = useRef(false); // ✅ Flag pour savoir si une session a été détectée
  const isMountedRef = useRef(true); // ✅ Flag pour vérifier si le composant est monté
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ✅ Timeout de sécurité pour la synchronisation
  const initDoneRef = useRef(false); // ✅ Flag pour éviter les initialisations multiples
  const subscriptionRef = useRef<any>(null); // ✅ Référence à l'abonnement pour le nettoyer
  const immediateFallbackRef = useRef<NodeJS.Timeout | null>(null); // ✅ Référence au timeout de fallback
  
  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    loadingRef.current = loading;
    sessionRef.current = session;
    userRef.current = user;
    if (session) sessionDetectedRef.current = true;
  }, [loading, session, user]);
  
  // ✅ Nettoyer le flag de montage au démontage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // ✅ NOUVEAU : Listener pour détecter quand la page revient au focus avec rafraîchissement rapide
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // ✅ OPTIMISATION : Toujours vérifier la session au retour, même si loading
        // Cela permet de détecter rapidement les sessions expirées après une longue période
        try {
          // ✅ NOUVEAU : Essayer d'abord de rafraîchir le token si on a une session
          if (sessionRef.current) {
            try {
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && refreshedSession?.session) {
                console.log('🔄 [useSupabaseSession] Token rafraîchi au retour sur la page');
                // Mettre à jour la session
                const userMetadata = refreshedSession.session.user.user_metadata || {};
                const appMetadata = refreshedSession.session.user.app_metadata || {};
                const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
                
                const immediateUser: SessionUser = {
                  id: refreshedSession.session.user.id,
                  email: refreshedSession.session.user.email || '',
                  firstName: userMetadata.first_name || userMetadata.firstName || null,
                  lastName: userMetadata.last_name || userMetadata.lastName || null,
                  role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
                  userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
                };
                
                if (isMountedRef.current) {
                  setUser(immediateUser);
                  setSession(refreshedSession.session);
                  sessionRef.current = refreshedSession.session;
                  userRef.current = immediateUser;
                  setLoading(false);
                }
                return; // Sortir tôt si le rafraîchissement a réussi
              }
            } catch (refreshErr) {
              console.warn('⚠️ [useSupabaseSession] Erreur lors du rafraîchissement au retour:', refreshErr);
            }
          }
          
          // Si pas de session ou rafraîchissement échoué, vérifier la session actuelle
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error || !currentSession) {
            // Session expirée ou invalide
            console.log('⚠️ [useSupabaseSession] Session expirée détectée au retour sur la page');
            if (isMountedRef.current) {
              setUser(null);
              setSession(null);
              setLoading(false);
            }
          } else if (currentSession.user && (!sessionRef.current || sessionRef.current.user.id !== currentSession.user.id)) {
            // Session rafraîchie ou nouvelle session
            console.log('🔄 [useSupabaseSession] Session rafraîchie au retour sur la page');
            sessionDetectedRef.current = true;
            if (isMountedRef.current) {
              const userMetadata = currentSession.user.user_metadata || {};
              const appMetadata = currentSession.user.app_metadata || {};
              const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
              
              const immediateUser: SessionUser = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                firstName: userMetadata.first_name || userMetadata.firstName || null,
                lastName: userMetadata.last_name || userMetadata.lastName || null,
                role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
                userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
              };
              
              setUser(immediateUser);
              setSession(currentSession);
              sessionRef.current = currentSession;
              userRef.current = immediateUser;
              setLoading(false);
              
              // Rafraîchir les données utilisateur en arrière-plan
              fetchUserData(currentSession.user).catch(() => {});
            }
          }
        } catch (error) {
          console.error('❌ [useSupabaseSession] Erreur lors de la vérification de session au retour:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // ✅ NOUVEAU : Si la session globale est déjà initialisée, utiliser ses valeurs
    if (globalSessionState.initialized && globalSessionState.session) {
      console.log('✅ [useSupabaseSession] Utilisation de la session globale existante');
      setSession(globalSessionState.session);
      setUser(globalSessionState.user);
      setLoading(false);
      sessionRef.current = globalSessionState.session;
      userRef.current = globalSessionState.user;
      sessionDetectedRef.current = true;
      initDoneRef.current = true;
      return;
    }
    
    // ✅ Protection contre les initialisations multiples (par instance)
    if (initDoneRef.current) {
      console.log('⏭️ [useSupabaseSession] Initialisation déjà effectuée pour cette instance, skip');
      return;
    }
    
    // ✅ NOUVEAU : Si une autre instance est en train d'initialiser, attendre
    if (globalSessionState.getSessionPromise) {
      console.log('⏳ [useSupabaseSession] Une autre instance initialise, attente...');
      globalSessionState.getSessionPromise.then((result) => {
        if (result?.session) {
          setSession(result.session);
          setUser(globalSessionState.user);
          setLoading(false);
          sessionRef.current = result.session;
          userRef.current = globalSessionState.user;
          sessionDetectedRef.current = true;
        }
      }).catch(() => {
        // En cas d'erreur, continuer avec l'initialisation normale
      });
      initDoneRef.current = true;
      return;
    }
    
    initDoneRef.current = true;
    
    // ✅ OPTIMISATION : Timeout de sécurité réduit à 5 secondes maximum
    // Pour une reconnexion rapide après une longue période d'inactivité
    syncTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && loadingRef.current) {
        // ✅ Vérifier si une session a été détectée avant de forcer la fin
        if (sessionDetectedRef.current && (sessionRef.current || userRef.current)) {
          console.log('✅ [useSupabaseSession] Session détectée, arrêt du chargement');
          setLoading(false);
        } else {
          console.warn('⚠️ [useSupabaseSession] Timeout de sécurité: forcer la fin de synchronisation après 5s (pas de session détectée)');
          setLoading(false);
        }
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      }
    }, 5000); // ✅ Réduit de 20s à 5s pour une reconnexion plus rapide
    
    // ✅ OPTIMISATION : Fallback rapide après 2 secondes pour détecter rapidement les sessions expirées
    immediateFallbackRef.current = setTimeout(async () => {
      // ✅ CORRECTION : Ne pas annuler si une session a été détectée OU si on a déjà une session/user
      // Vérifier aussi les cookies pour éviter de perdre une session valide
      const hasCookies = typeof document !== 'undefined' && 
        document.cookie.split(';').some(c => {
          const cookie = c.trim();
          return cookie.startsWith('sb-') && !cookie.includes('deleted') && !cookie.includes('null');
        });
      
      // ✅ NOUVEAU : Vérifier rapidement si la session est vraiment expirée
      if (isMountedRef.current && loadingRef.current && !sessionRef.current && !userRef.current && !sessionDetectedRef.current) {
        try {
          // Tentative rapide de récupération de session
          const { data: { session: quickSession }, error: quickError } = await supabase.auth.getSession();
          
          if (quickSession?.user) {
            // Session trouvée rapidement, continuer
            console.log('✅ [useSupabaseSession] Session trouvée lors du fallback rapide');
            sessionDetectedRef.current = true;
            return; // Ne pas arrêter le chargement
          } else if (!hasCookies || quickError?.message?.includes('expired') || quickError?.message?.includes('JWT')) {
            // Pas de cookies valides ou session expirée - arrêter rapidement
            console.warn('⚠️ [useSupabaseSession] Fallback rapide: session expirée ou absente après 2s');
            setLoading(false);
            setUser(null);
            setSession(null);
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
            return;
          }
        } catch (error) {
          // En cas d'erreur, si pas de cookies, arrêter
          if (!hasCookies) {
            console.warn('⚠️ [useSupabaseSession] Fallback rapide: erreur et pas de cookies, arrêt');
            setLoading(false);
            setUser(null);
            setSession(null);
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
            return;
          }
        }
      }
      
      // ✅ Si on a des cookies ou une session détectée, continuer à attendre (mais avec timeout de sécurité)
      if (isMountedRef.current && loadingRef.current && (sessionDetectedRef.current || hasCookies)) {
        console.log('⏳ [useSupabaseSession] Session en cours de synchronisation, continuation du chargement...');
      }
    }, 2000); // ✅ Réduit de 20s à 2s pour une détection rapide des sessions expirées
    
    // Récupérer la session initiale
    // ✅ NOUVEAU : Utiliser un verrouillage global pour éviter les appels multiples
    const getSession = async () => {
      // ✅ Protection : ne pas appeler si une session est déjà en cours de traitement
      if (sessionDetectedRef.current && (sessionRef.current || userRef.current)) {
        console.log('⏭️ [useSupabaseSession] Session déjà détectée, skip getSession');
        if (isMountedRef.current && loadingRef.current) {
          setLoading(false);
        }
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
        return;
      }
      
      // ✅ NOUVEAU : Vérifier le verrouillage global
      if (getSessionLock) {
        console.log('⏳ [useSupabaseSession] getSession déjà en cours (verrou global), attente...');
        if (globalSessionState.getSessionPromise) {
          try {
            const result = await globalSessionState.getSessionPromise;
            // Le résultat peut être soit { data: { session } } soit directement l'erreur
            const session = result?.data?.session || result?.session;
            if (session && isMountedRef.current) {
              setSession(session);
              setUser(globalSessionState.user);
              setLoading(false);
              sessionRef.current = session;
              userRef.current = globalSessionState.user;
              sessionDetectedRef.current = true;
            }
          } catch (error) {
            console.warn('⚠️ [useSupabaseSession] Erreur lors de l\'attente de la session globale:', error);
          }
        }
        return;
      }
      
      // ✅ NOUVEAU : Acquérir le verrou
      getSessionLock = true;
      console.log('🔄 [useSupabaseSession] Getting initial session... (verrou acquis)');
      
      try {
        // ✅ OPTIMISATION : Timeout pour getSession (2 secondes max - réduit)
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout')), 2000)
        );
        
        // ✅ NOUVEAU : Stocker la promesse globalement pour que les autres instances puissent l'attendre
        const racePromise = Promise.race([
          getSessionPromise,
          timeoutPromise
        ]) as Promise<any>;
        
        globalSessionState.getSessionPromise = racePromise;
        
        let data: any;
        let error: any;
        
        try {
          const result = await racePromise;
          
          // Le résultat peut être soit { data, error } soit directement l'erreur
          if (result?.data !== undefined || result?.error) {
            data = result.data;
            error = result.error;
          } else if (result?.session) {
            // Si c'est directement la session
            data = { session: result.session };
            error = null;
          } else {
            // Sinon c'est probablement une erreur
            error = result;
            data = null;
          }
        } catch (raceError: any) {
          // ✅ OPTIMISATION : Gérer les timeouts
          if (raceError?.message?.includes('timeout')) {
            console.warn('⏱️ [useSupabaseSession] getSession timeout, vérification rapide des cookies');
            // Vérifier rapidement les cookies
            const hasCookies = typeof document !== 'undefined' && 
              document.cookie.split(';').some(c => {
                const cookie = c.trim();
                return cookie.startsWith('sb-') && !cookie.includes('deleted') && !cookie.includes('null');
              });
            
            if (hasCookies) {
              // On a des cookies, continuer à attendre onAuthStateChange
              console.log('⏳ [useSupabaseSession] Cookies présents malgré timeout, attente de onAuthStateChange');
              return;
            } else {
              // Pas de cookies, arrêter rapidement
              console.warn('⚠️ [useSupabaseSession] Pas de cookies et timeout, arrêt');
              if (isMountedRef.current) {
                setUser(null);
                setSession(null);
                setLoading(false);
              }
              if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = null;
              }
              if (immediateFallbackRef.current) {
                clearTimeout(immediateFallbackRef.current);
                immediateFallbackRef.current = null;
              }
              return;
            }
          }
          // Autre erreur, la propager
          throw raceError;
        }
        
        if (!isMountedRef.current) return;
        
        const currentSession = data?.session;
        
        console.log('📋 [useSupabaseSession] Session result:', { 
          hasSession: !!currentSession, 
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
          error: error?.message 
        });
        
        // ✅ Double vérification : si onAuthStateChange a traité la session entre-temps
        if (sessionDetectedRef.current && (sessionRef.current || userRef.current)) {
          console.log('✅ [useSupabaseSession] Session already handled by onAuthStateChange');
          if (isMountedRef.current && loadingRef.current) {
            setLoading(false);
          }
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
          }
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
            // ✅ CORRECTION : Les admins n'ont pas de userType
            userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
          };
          
          // ✅ NOUVEAU : Mettre à jour l'état global
          globalSessionState.session = currentSession;
          globalSessionState.user = immediateUser;
          globalSessionState.loading = false;
          globalSessionState.initialized = true;
          
          if (isMountedRef.current) {
            console.log('⚡ [useSupabaseSession] Displaying user immediately from JWT (getSession):', {
              firstName: immediateUser.firstName,
              role: immediateUser.role,
              userId: immediateUser.id
            });
            setUser(immediateUser);
            setSession(currentSession);
            // ✅ Mettre à jour les refs immédiatement pour éviter les race conditions
            sessionRef.current = currentSession;
            userRef.current = immediateUser;
            sessionDetectedRef.current = true;
            setLoading(false);
            // ✅ Nettoyer le timeout de sécurité
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
            console.log('✅ [useSupabaseSession] Session synchronisée avec succès (getSession)');
          }
          
          // ✅ En arrière-plan, essayer de récupérer les données complètes
          fetchUserData(currentSession.user).then((fullUser) => {
            if (fullUser) {
              globalSessionState.user = fullUser;
            }
          }).catch((err) => {
            console.log('ℹ️ [useSupabaseSession] Background fetch from getSession completed or failed:', err?.message || 'success');
          });
        } else if (!sessionDetectedRef.current) {
          // Pas de session et aucune détectée par onAuthStateChange
          console.log('⚠️ [useSupabaseSession] No session found');
          
          // ✅ NOUVEAU : Mettre à jour l'état global
          globalSessionState.session = null;
          globalSessionState.user = null;
          globalSessionState.loading = false;
          globalSessionState.initialized = true;
          
          if (isMountedRef.current) {
            setUser(null);
            setSession(null);
            setLoading(false);
            // ✅ Nettoyer le timeout de sécurité
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in getSession:', error);
        
        // ✅ NOUVEAU : Mettre à jour l'état global même en cas d'erreur
        globalSessionState.initialized = true;
        globalSessionState.loading = false;
        
        // En cas d'erreur, ne pas écraser si onAuthStateChange a déjà une session
        if (isMountedRef.current && !sessionDetectedRef.current) {
          setUser(null);
          setSession(null);
          setLoading(false);
          // ✅ Nettoyer le timeout de sécurité
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
          }
          if (immediateFallbackRef.current) {
            clearTimeout(immediateFallbackRef.current);
            immediateFallbackRef.current = null;
          }
        }
      } finally {
        // ✅ NOUVEAU : Libérer le verrou à la fin
        getSessionLock = false;
        globalSessionState.getSessionPromise = null;
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMountedRef.current) return;
      
      console.log('🔐 [useSupabaseSession] Auth state changed:', event, 'hasSession:', !!currentSession, {
        userId: currentSession?.user?.id,
        userEmail: currentSession?.user?.email
      });
      
      // ✅ NOUVEAU : Gérer spécifiquement TOKEN_REFRESHED pour éviter les problèmes de session expirée
      if (event === 'TOKEN_REFRESHED') {
        if (currentSession?.user) {
          console.log('🔄 [useSupabaseSession] Token rafraîchi, mise à jour de la session');
          sessionDetectedRef.current = true;
          
          // ✅ PROTECTION: Vérifier que l'utilisateur n'a pas changé
          if (userRef.current && userRef.current.id !== currentSession.user.id) {
            console.error('❌ [useSupabaseSession] User ID changed during token refresh!', {
              previousUserId: userRef.current.id,
              newUserId: currentSession.user.id
            });
            return;
          }
          
          // Mettre à jour la session immédiatement
          const userMetadata = currentSession.user.user_metadata || {};
          const appMetadata = currentSession.user.app_metadata || {};
          const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
          
          const immediateUser: SessionUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
          };
          
          if (isMountedRef.current) {
            setUser(immediateUser);
            setSession(currentSession);
            sessionRef.current = currentSession;
            userRef.current = immediateUser;
            setLoading(false);
            
            // Nettoyer les timeouts
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
            
            // Rafraîchir les données en arrière-plan si nécessaire
            fetchUserData(currentSession.user).catch(() => {});
          }
        }
        return; // Sortir tôt pour TOKEN_REFRESHED
      }
      
      // ✅ Marquer qu'une session a été détectée pour éviter le fallback
      if (currentSession) {
        sessionDetectedRef.current = true;
        // ✅ Nettoyer les timeouts dès qu'une session est détectée
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
        if (immediateFallbackRef.current) {
          clearTimeout(immediateFallbackRef.current);
          immediateFallbackRef.current = null;
        }
        // ✅ Arrêter immédiatement le chargement si on a déjà une session
        if (isMountedRef.current && loadingRef.current && (sessionRef.current || userRef.current)) {
          console.log('✅ [useSupabaseSession] Session déjà présente, arrêt immédiat du chargement');
          setLoading(false);
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
              // ✅ CORRECTION : Les admins n'ont pas de userType
              userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
            };
            
            // ✅ NOUVEAU : Mettre à jour l'état global
            globalSessionState.session = currentSession;
            globalSessionState.user = immediateUser;
            globalSessionState.loading = false;
            globalSessionState.initialized = true;
            
            // ✅ Afficher immédiatement avec les données JWT
            if (isMountedRef.current) {
              console.log('⚡ [useSupabaseSession] Displaying user immediately from JWT metadata:', {
                firstName: immediateUser.firstName,
                role: immediateUser.role,
                userId: immediateUser.id
              });
              setUser(immediateUser);
              setSession(currentSession);
              // ✅ Mettre à jour les refs immédiatement pour éviter les race conditions
              sessionRef.current = currentSession;
              userRef.current = immediateUser;
              sessionDetectedRef.current = true;
              setLoading(false); // ✅ Arrêter le loading immédiatement
              // ✅ Nettoyer le timeout de sécurité
              if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = null;
              }
              // ✅ Nettoyer aussi le fallback
              if (immediateFallbackRef.current) {
                clearTimeout(immediateFallbackRef.current);
                immediateFallbackRef.current = null;
              }
              console.log('✅ [useSupabaseSession] Session synchronisée avec succès');
            }
            
            // ✅ En arrière-plan, essayer de récupérer les données complètes (sans bloquer)
            fetchUserData(currentSession.user).catch((err) => {
              console.log('ℹ️ [useSupabaseSession] Background fetch completed or failed:', err?.message || 'success');
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [useSupabaseSession] User signed out');
          
          // ✅ NOUVEAU : Mettre à jour l'état global
          globalSessionState.session = null;
          globalSessionState.user = null;
          globalSessionState.loading = false;
          globalSessionState.initialized = true;
          
          if (isMountedRef.current) {
            setUser(null);
            setSession(null);
            setLoading(false);
            // ✅ Nettoyer le timeout de sécurité
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = null;
            }
            if (immediateFallbackRef.current) {
              clearTimeout(immediateFallbackRef.current);
              immediateFallbackRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in auth state change:', error);
        if (isMountedRef.current) {
          setLoading(false);
          // ✅ Nettoyer le timeout de sécurité
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
          }
          if (immediateFallbackRef.current) {
            clearTimeout(immediateFallbackRef.current);
            immediateFallbackRef.current = null;
          }
        }
      }
    });

    // ✅ Stocker la référence à l'abonnement
    subscriptionRef.current = subscription;
    
    return () => {
      isMountedRef.current = false;
      initDoneRef.current = false; // ✅ Réinitialiser pour permettre une nouvelle initialisation si nécessaire
      if (immediateFallbackRef.current) {
        clearTimeout(immediateFallbackRef.current);
        immediateFallbackRef.current = null;
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
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
          // ✅ CORRECTION : Pour les admins, utiliser directement les métadonnées JWT
          // Les admins n'ont pas besoin d'être dans la table users
          const userMetadata = authUser.user_metadata || {};
          const appMetadata = authUser.app_metadata || {};
          const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
          
          if (roleFromMetadata === 'admin') {
            console.log('👑 [useSupabaseSession] Admin détecté, utilisation des métadonnées JWT uniquement');
            const adminUser: SessionUser = {
              id: authUser.id,
              email: authUser.email || '',
              firstName: userMetadata.first_name || userMetadata.firstName || null,
              lastName: userMetadata.last_name || userMetadata.lastName || null,
              role: 'admin' as const,
              // ✅ CORRECTION : Les admins n'ont pas de userType (ils ne sont ni user ni professional)
              userType: undefined
            };
            userDataCache.set(authUser.id, { data: adminUser, timestamp: Date.now() });
            return adminUser;
          }
          
          // ✅ OPTIMISATION : Timeout réduit à 5s et gestion d'erreur améliorée
          // Si la requête prend trop de temps, on utilise directement le fallback
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
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
              // Timeout ou format inattendu - utiliser fallback
              userError = new Error('Query timeout or unexpected format');
            }
          } catch (queryError: any) {
            // ✅ Ne pas logger comme erreur si c'est juste un timeout - c'est normal si la DB est lente
            if (queryError.message?.includes('timeout')) {
              console.log('⏱️ [useSupabaseSession] Users query timeout (using fallback)');
            } else {
              console.warn('⚠️ [useSupabaseSession] Users query error:', queryError.message);
            }
            userError = queryError;
            // ✅ Ne pas bloquer - utiliser le fallback immédiatement
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
            // Réutiliser les variables déjà déclarées au début de la fonction
            
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
              // ✅ CORRECTION : Les admins n'ont pas de userType
              userType: (finalRole === 'admin' ? undefined : 'user') as 'user' | undefined
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

          // Sinon vérifier dans professionals avec timeout (seulement si pas admin)
          let professionalData: any = null;
          let profError: any = null;
          
          if (roleFromMetadata !== 'admin') {
            try {
              const profQueryPromise = supabase
                .from('professionals')
                .select('id, email, first_name, last_name')
                .eq('id', authUser.id)
                .maybeSingle();

              const profResult = await Promise.race([
                profQueryPromise,
                timeoutPromise
              ]) as any;
              
              if (profResult?.data !== undefined) {
                professionalData = profResult.data;
                profError = profResult.error;
              } else if (profResult?.error) {
                profError = profResult.error;
              }
            } catch (profQueryError: any) {
              // ✅ Ne pas logger comme erreur si c'est juste un timeout
              if (profQueryError.message?.includes('timeout')) {
                console.log('⏱️ [useSupabaseSession] Professionals query timeout (using fallback)');
              } else {
                console.warn('⚠️ [useSupabaseSession] Professionals query error:', profQueryError.message);
              }
              profError = profQueryError;
            }
          }

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
          // Réutiliser les variables déjà déclarées au début de la fonction
          
          const fallbackUser: SessionUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            // ✅ CORRECTION : Les admins n'ont pas de userType
            userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
          };
          console.log('⚠️ [useSupabaseSession] Using fallback user:', fallbackUser);
          
          // ✅ Mettre en cache
          userDataCache.set(userId, { data: fallbackUser, timestamp: Date.now() });
          return fallbackUser;
        } catch (error) {
          console.error('❌ [useSupabaseSession] Error fetching user data:', error);
          // Toujours définir un utilisateur en fallback pour éviter le blocage
          // ✅ PRIORITÉ À app_metadata.role (comme isAdmin())
          // Réutiliser les variables déjà déclarées au début du try
          
          const fallbackUser: SessionUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: userMetadata.first_name || userMetadata.firstName || null,
            lastName: userMetadata.last_name || userMetadata.lastName || null,
            role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
            // ✅ CORRECTION : Les admins n'ont pas de userType
            userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
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
      
      // ✅ NOUVEAU : Forcer le rafraîchissement du token avant de récupérer la session
      // Cela permet de rafraîchir un token expiré
      try {
        const { data: { session: refreshResult }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('⚠️ [useSupabaseSession] Error refreshing token, trying getSession:', refreshError.message);
        } else if (refreshResult?.session) {
          console.log('✅ [useSupabaseSession] Token refreshed successfully');
        }
      } catch (refreshErr) {
        console.warn('⚠️ [useSupabaseSession] Refresh token failed, continuing with getSession:', refreshErr);
      }
      
      // Récupérer la session actuelle
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [useSupabaseSession] Error refreshing session:', error);
        // Si l'erreur indique une session expirée, nettoyer l'état
        if (error.message?.includes('expired') || error.message?.includes('JWT')) {
          console.log('🚪 [useSupabaseSession] Session expirée, nettoyage de l\'état');
          setUser(null);
          setSession(null);
          setLoading(false);
        }
        return;
      }
      
      if (currentSession?.user) {
        console.log('✅ [useSupabaseSession] Refreshing user data for:', currentSession.user.id);
        
        // Mettre à jour immédiatement avec les métadonnées JWT
        const userMetadata = currentSession.user.user_metadata || {};
        const appMetadata = currentSession.user.app_metadata || {};
        const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
        
        const immediateUser: SessionUser = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          firstName: userMetadata.first_name || userMetadata.firstName || null,
          lastName: userMetadata.last_name || userMetadata.lastName || null,
          role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
          userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
        };
        
        setUser(immediateUser);
        setSession(currentSession);
        sessionRef.current = currentSession;
        userRef.current = immediateUser;
        sessionDetectedRef.current = true;
        setLoading(false);
        
        // Rafraîchir les données complètes en arrière-plan
        await fetchUserData(currentSession.user).catch(() => {});
      } else {
        console.log('⚠️ [useSupabaseSession] No session found during refresh');
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error in refreshSession:', error);
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Toujours enrichir la session avec notre user qui a le rôle
  // C'est crucial pour que AdminLayout puisse vérifier session.user.role
  const enrichedSession = useMemo(() => {
    if (!session) return null;
    
    // ✅ IMPORTANT : Toujours remplacer session.user par notre user enrichi
    // car session.user de Supabase n'a pas la propriété 'role' directement
    // Notre user enrichi a la propriété 'role' qui est nécessaire pour les vérifications
    
    // ✅ CORRECTION : Extraire la logique de création du user fallback pour éviter les problèmes d'initialisation
    let enrichedUser: SessionUser;
    
    if (user) {
      enrichedUser = user;
    } else {
      // Créer un user enrichi depuis les métadonnées si user n'est pas encore disponible
      const userMetadata = session.user?.user_metadata || {};
      const appMetadata = session.user?.app_metadata || {};
      const roleFromMetadata = appMetadata.role || userMetadata.role || 'user';
      
      enrichedUser = {
        id: session.user?.id || '',
        email: session.user?.email || '',
        role: (roleFromMetadata === 'admin' ? 'admin' : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | 'admin',
        firstName: userMetadata.first_name || userMetadata.firstName || null,
        lastName: userMetadata.last_name || userMetadata.lastName || null,
        userType: (roleFromMetadata === 'admin' ? undefined : roleFromMetadata === 'professional' ? 'professional' : 'user') as 'user' | 'professional' | undefined
      };
    }
    
    try {
      const newSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: enrichedUser
      };
      
      return newSession;
    } catch (error) {
      console.error('❌ [useSupabaseSession] Erreur lors de la création de enrichedSession:', error);
      // En cas d'erreur, retourner la session originale mais avec user enrichi si disponible
      return {
        ...session,
        user: enrichedUser
      };
    }
  }, [session, user]);

  return {
    user,
    session: enrichedSession,
    loading,
    signOut: handleSignOut,
    refreshSession // ✅ Exporter la fonction de rafraîchissement
  };
}

