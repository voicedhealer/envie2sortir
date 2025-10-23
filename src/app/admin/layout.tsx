"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  History, 
  BarChart3, 
  Search,
  Brain,
  MessageSquare,
  Mail
} from "lucide-react";
import MessageBadge from "@/components/messaging/MessageBadge";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingEstablishments, setPendingEstablishments] = useState(0);
  const [pendingModifications, setPendingModifications] = useState(0);

  useEffect(() => {
    if (status === 'loading') return; // En cours de chargement
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth?error=AccessDenied');
    }
  }, [session, status, router]);

  // Récupérer le nombre de demandes en attente
  useEffect(() => {
    if (session?.user.role === 'admin' && status === 'authenticated') {
      fetchPendingCounts();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchPendingCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  const fetchPendingCounts = async () => {
    // Vérifier que la session est toujours valide
    if (!session || session.user.role !== 'admin' || status !== 'authenticated') {
      return;
    }

    try {
      const response = await fetch('/api/admin/pending-count');
      if (response.ok) {
        const data = await response.json();
        setPendingEstablishments(data.details?.establishments || 0);
        setPendingModifications(data.details?.professionalUpdates || 0);
      } else if (response.status === 401 || response.status === 403) {
        // Session expirée ou accès refusé, arrêter les requêtes
        console.log('Session expirée, arrêt des requêtes API');
        return;
      }
    } catch (error) {
      console.error('Erreur récupération compteurs:', error);
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

  // Fonction pour déterminer si un lien est actif
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  // Navigation items avec icônes
  const navigationItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      customBadge: false
    },
    {
      href: '/admin/etablissements',
      label: 'Établissements',
      icon: Building2,
      badge: pendingEstablishments > 0 ? pendingEstablishments : null,
      customBadge: false
    },
    {
      href: '/admin/modifications',
      label: 'Modifications',
      icon: FileText,
      badge: pendingModifications > 0 ? pendingModifications : null,
      customBadge: false
    },
    {
      href: '/admin/messagerie',
      label: 'Messagerie',
      icon: MessageSquare,
      badge: null,
      customBadge: true
    },
    {
      href: '/admin/historique',
      label: 'Historique',
      icon: History,
      badge: null,
      customBadge: false
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      customBadge: false
    },
    {
      href: '/admin/recherches',
      label: 'Recherches',
      icon: Search,
      badge: null,
      customBadge: false
    },
    {
      href: '/admin/learning',
      label: 'Intelligence',
      icon: Brain,
      badge: null,
      customBadge: false
    },
    {
      href: '/admin/newsletter',
      label: 'Newsletter',
      icon: Mail,
      badge: null,
      customBadge: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin Moderne */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold text-orange-500">Admin</h1>
                </div>
              </div>
              
              {/* Navigation principale */}
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isCurrentActive
                          ? 'bg-orange-100 text-orange-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.customBadge ? (
                        <MessageBadge />
                      ) : item.badge ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] animate-pulse">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Navigation mobile */}
          <div className="md:hidden border-t border-gray-200 py-2">
            <nav className="flex space-x-1 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isCurrentActive = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-fit ${
                      isCurrentActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-center">{item.label}</span>
                    {item.customBadge ? (
                      <MessageBadge />
                    ) : item.badge ? (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[16px]">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
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
