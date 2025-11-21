'use client';

/**
 * AuthLayout - Layout pour les pages d'authentification
 * 
 * Le SupabaseAuthProvider est déjà inclus dans le RootLayout,
 * donc pas besoin de le ré-inclure ici (évite le double wrapping).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
