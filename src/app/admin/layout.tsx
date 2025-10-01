"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (status === 'loading') return; // En cours de chargement
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth?error=AccessDenied');
    }
  }, [session, status, router]);

  // Récupérer le nombre de demandes en attente
  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchPendingCount();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/admin/pending-count');
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erreur récupération compteur:', error);
    }
  };

  // Afficher un loader pendant la vérification
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si pas admin, ne rien afficher (redirection en cours)
  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                Admin Envie2Sortir
              </h1>
              <nav className="flex space-x-6">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/etablissements"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium relative"
                >
                  Gérer les établissements
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px]">
                      {pendingCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/modifications"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Modifications professionnelles
                </Link>
                <Link
                  href="/admin/historique"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Historique
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
