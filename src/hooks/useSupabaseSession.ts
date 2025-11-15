'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Récupérer la session initiale
    const getSession = async () => {
      try {
        console.log('🔄 [useSupabaseSession] Getting initial session...');
        
        // Lire la session (créée côté client via signInWithPassword)
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('📋 [useSupabaseSession] Session result:', { 
          hasSession: !!currentSession, 
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
          error: error?.message 
        });
        
        if (error) {
          console.error('❌ [useSupabaseSession] Error getting session:', error);
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          console.log('✅ [useSupabaseSession] Session found, fetching user data...');
          await fetchUserData(currentSession.user);
          setSession(currentSession);
        } else {
          console.log('⚠️ [useSupabaseSession] No session found');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('❌ [useSupabaseSession] Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔐 [useSupabaseSession] Auth state changed:', event, 'hasSession:', !!currentSession);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (currentSession?.user) {
          console.log('🔐 [useSupabaseSession] Session user:', currentSession.user.email);
          await fetchUserData(currentSession.user);
          setSession(currentSession);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 [useSupabaseSession] User signed out');
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      console.log('👤 [useSupabaseSession] Fetching user data for:', authUser.id);
      
      // Vérifier d'abord dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('🔍 [useSupabaseSession] Users table result:', { userData, error: userError });

      if (userData) {
        const newUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role as 'user' | 'admin',
          userType: 'user' as const
        };
        console.log('✅ [useSupabaseSession] Setting user from users table:', newUser);
        setUser(newUser);
        return;
      }

      // Sinon vérifier dans professionals
      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('id, email, first_name, last_name')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('🔍 [useSupabaseSession] Professionals table result:', { professionalData, error: profError });

      if (professionalData) {
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
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email || '',
        role: 'user' as const,
        userType: 'user' as const
      };
      console.log('⚠️ [useSupabaseSession] Using fallback user:', fallbackUser);
      setUser(fallbackUser);
    } catch (error) {
      console.error('❌ [useSupabaseSession] Error fetching user data:', error);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: 'user',
        userType: 'user'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    session: session ? { ...session, user: user } : null, // Remplacer explicitement session.user par notre user enrichi
    loading,
    signOut: handleSignOut
  };
}

