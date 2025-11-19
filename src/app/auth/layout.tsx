'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

/**
 * AuthLayout - Layout pour les pages d'authentification
 * 
 * Utilise SupabaseAuthProvider au lieu de NextAuth SessionProvider.
 * Le SupabaseAuthProvider est déjà inclus dans le RootLayout,
 * mais on le ré-inclut ici pour garantir la disponibilité du contexte.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}
