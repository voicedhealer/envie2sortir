"use client";

import Link from "next/link";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
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
  Mail,
  Rocket,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  TrendingUp
} from "lucide-react";
import MessageBadge from "@/components/messaging/MessageBadge";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading, refreshSession } = useSupabaseSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingEstablishments, setPendingEstablishments] = useState(0);
  const [pendingModifications, setPendingModifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gestion: true,
    communication: false,
    analytics: false,
    outils: false
  });

  useEffect(() => {
    // ✅ CORRECTION : Attendre que le chargement soit terminé avant de vérifier
    if (loading) return; // En cours de chargement
    
    // ✅ NOUVEAU : Vérifier la session avec plusieurs tentatives pour gérer le rafraîchissement
    let attempts = 0;
    const maxAttempts = 3;
    const checkInterval = 500; // 500ms entre chaque tentative
    
    const checkAuth = async () => {
      attempts++;
      
      // ✅ CORRECTION : Vérifier que la session existe ET que le rôle est admin
      // Éviter les redirections en boucle en vérifiant que nous ne sommes pas déjà sur /auth
      if (!session || session.user?.role !== 'admin') {
        // ✅ NOUVEAU : Si c'est la première tentative et qu'on n'a pas de session, essayer de rafraîchir
        if (attempts === 1 && !session && pathname !== '/auth') {
          console.log('🔄 [AdminLayout] Tentative de rafraîchissement de session...');
          try {
            await refreshSession();
            // Attendre un peu pour que le rafraîchissement se propage
            setTimeout(checkAuth, checkInterval);
            return;
          } catch (error) {
            console.warn('⚠️ [AdminLayout] Erreur lors du rafraîchissement de session:', error);
          }
        }
        
        // Si on a encore des tentatives et qu'on n'est pas sur /auth, réessayer
        if (attempts < maxAttempts && pathname !== '/auth') {
          console.log(`⏳ [AdminLayout] Tentative ${attempts}/${maxAttempts} - Session en cours de synchronisation...`, {
            hasSession: !!session,
            role: session?.user?.role,
            pathname,
            loading
          });
          setTimeout(checkAuth, checkInterval);
          return;
        }
        
        // Vérifier que nous ne sommes pas déjà en train de rediriger
        if (pathname !== '/auth') {
          console.log('🚫 [AdminLayout] Accès refusé après toutes les tentatives, redirection vers /auth', {
            hasSession: !!session,
            role: session?.user?.role,
            pathname,
            loading,
            attempts
          });
          router.push('/auth?error=AccessDenied&redirect=' + encodeURIComponent(pathname));
        }
      } else {
        console.log('✅ [AdminLayout] Session admin valide', {
          userId: session.user.id,
          role: session.user.role,
          attempts
        });
      }
    };
    
    // Démarrer la vérification avec un petit délai initial
    const timeoutId = setTimeout(checkAuth, 200);
    
    return () => clearTimeout(timeoutId);
  }, [session, loading, router, pathname, refreshSession]);

  // Récupérer le nombre de demandes en attente
  useEffect(() => {
    if (session?.user?.role === 'admin' && !loading) {
      fetchPendingCounts();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchPendingCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [session, loading]);

  const fetchPendingCounts = async () => {
    // Vérifier que la session est toujours valide
    if (!session || session.user?.role !== 'admin' || loading) {
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
  if (loading) {
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
  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  // Collecter tous les chemins de navigation pour éviter les conflits
  const getAllPaths = () => {
    const paths: string[] = [];
    navigationSections.forEach(section => {
      section.items.forEach(item => {
        paths.push(item.href);
      });
    });
    return paths;
  };

  // Fonction pour déterminer si un lien est actif
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    
    // Correspondance exacte
    if (pathname === path) {
      return true;
    }
    
    // Vérifier si le pathname commence par ce path + '/'
    if (!pathname.startsWith(path + '/')) {
      return false;
    }
    
    // Si on arrive ici, le pathname commence par path + '/'
    // Mais on ne doit activer ce chemin que s'il n'y a pas de chemin plus spécifique qui correspondrait
    const allPaths = getAllPaths();
    const hasMoreSpecificPath = allPaths.some(otherPath => {
      // Ignorer le chemin actuel
      if (otherPath === path) return false;
      // Vérifier si otherPath est plus long et commence par path + '/'
      return otherPath.length > path.length && 
             otherPath.startsWith(path + '/') &&
             pathname.startsWith(otherPath);
    });
    
    // Ne pas activer si un chemin plus spécifique correspond
    return !hasMoreSpecificPath;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Navigation organisée par catégories
  const navigationSections = [
    {
      id: 'principal',
      items: [
        {
          href: '/admin',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          customBadge: false
        }
      ]
    },
    {
      id: 'gestion',
      label: 'Gestion',
      items: [
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
          href: '/admin/historique',
          label: 'Historique',
          icon: History,
          badge: null,
          customBadge: false
        },
        {
          href: '/admin/professionnels',
          label: 'Statistiques Pro',
          icon: TrendingUp,
          badge: null,
          customBadge: false
        },
        {
          href: '/admin/professionnels/historique',
          label: 'Historique Stats',
          icon: History,
          badge: null,
          customBadge: false
        }
      ]
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        {
          href: '/admin/messagerie',
          label: 'Messagerie',
          icon: MessageSquare,
          badge: null,
          customBadge: true
        },
        {
          href: '/admin/newsletter',
          label: 'Newsletter',
          icon: Mail,
          badge: null,
          customBadge: false
        }
    ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Intelligence',
      shortLabel: 'Analytics',
      items: [
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
        }
      ]
    },
    {
      id: 'outils',
      label: 'Outils',
      items: [
        {
          href: '/admin/waitlist',
          label: 'Waitlist Premium',
          icon: Rocket,
          badge: null,
          customBadge: false
        },
        {
          href: '/admin/test-email',
          label: 'Test Email',
          icon: Mail,
          badge: null,
          customBadge: false
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixe à gauche sur desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-orange-500">Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bouton Home */}
          <div className="px-4 py-2 border-b border-gray-200">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span>Retour au site</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationSections.map((section) => {
              // Section principale (Dashboard seul)
              if (section.id === 'principal') {
                return section.items.map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isCurrentActive
                          ? 'bg-orange-100 text-orange-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.customBadge ? (
                        <MessageBadge />
                      ) : item.badge ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] animate-pulse">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                });
              }

              // Sections avec catégories
              const isExpanded = expandedSections[section.id];
              
              // Trouver une icône pour la section (utiliser la première icône des items ou une icône par défaut)
              const SectionIcon = section.items.length > 0 ? section.items[0].icon : BarChart3;
              
              return (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors leading-tight"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <SectionIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate whitespace-nowrap text-xs leading-tight">{(section as any).shortLabel || section.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isCurrentActive = isActive(item.href);
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isCurrentActive
                                ? 'bg-orange-100 text-orange-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
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
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal - Avec marge pour la sidebar sur desktop */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-orange-500">Admin</h1>
            <div className="w-10" /> {/* Spacer pour centrer */}
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
