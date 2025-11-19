'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

interface SupabaseAuthContextType {
  user: SessionUser | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Récupérer la session initiale
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [SupabaseAuthProvider] Error getting session:', error);
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          await fetchUserData(currentSession.user);
          setSession(currentSession);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('❌ [SupabaseAuthProvider] Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (currentSession?.user) {
          await fetchUserData(currentSession.user);
          setSession(currentSession);
        }
      } else if (event === 'SIGNED_OUT') {
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
      // Vérifier d'abord dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userData) {
        const newUser: SessionUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role as 'user' | 'admin',
          userType: 'user' as const
        };
        setUser(newUser);
        return;
      }

      // Sinon vérifier dans professionals
      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('id, email, first_name, last_name')
        .eq('id', authUser.id)
        .maybeSingle();

      if (professionalData) {
        const newUser: SessionUser = {
          id: professionalData.id,
          email: professionalData.email,
          firstName: professionalData.first_name,
          lastName: professionalData.last_name,
          role: 'professional' as const,
          userType: 'professional' as const
        };
        setUser(newUser);
        return;
      }

      // Fallback sur les données auth
      const fallbackUser: SessionUser = {
        id: authUser.id,
        email: authUser.email || '',
        role: 'user' as const,
        userType: 'user' as const
      };
      setUser(fallbackUser);
    } catch (error) {
      console.error('❌ [SupabaseAuthProvider] Error fetching user data:', error);
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

  const value: SupabaseAuthContextType = {
    user,
    session: session ? { ...session, user: user } : null,
    loading,
    signOut: handleSignOut
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

