"use client";

import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";

/**
 * AuthProvider - Fournit le contexte d'authentification Supabase
 * 
 * Remplace l'ancien SessionProvider de NextAuth par Supabase Auth.
 * Utilise le contexte SupabaseAuthContext pour gérer les sessions.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}
