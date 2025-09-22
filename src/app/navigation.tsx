"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart, Menu, X } from "lucide-react";

// Composant Link personnalisé pour éviter les problèmes d'hydratation
const LinkComponent = ({ href, className, children, ...props }: any) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }
  
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
};

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug logs activés temporairement pour diagnostiquer le problème de session
  console.log('🔍 Navigation - Status:', status);
  console.log('🔍 Navigation - Session:', session);
  console.log('🔍 Navigation - isHydrated:', isHydrated);
  
  // État de chargement plus robuste
  const isLoading = !isHydrated || status === 'loading';

  // Gérer l'hydratation pour éviter les erreurs SSR
  useEffect(() => {
    // Attendre un tick pour que NextAuth ait le temps de s'initialiser
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/carte", label: "", icon: "/icone_maps_3.svg" },
    { href: "/etablissements/nouveau", label: "Ajoutez mon établissement" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <LinkComponent href="/" className="flex items-center" aria-label="Envie2Sortir - Accueil">
              <Image src="/logo.svg" alt="Envie2Sortir" width={135} height={150} priority />
            </LinkComponent>
          </div>
          
          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <LinkComponent
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === item.href
                    ? "bg-black/5 text-black"
                    : "text-gray-700 hover:text-black hover:bg-black/5"
                }`}
              >
                {item.icon && (
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={10} 
                    height={10} 
                    className="w-7 h-7"
                  />
                )}
                {item.label}
              </LinkComponent>
            ))}

            {(() => {
              console.log('🔍 Navigation - Évaluation conditionnelle:');
              console.log('  - isLoading:', isLoading);
              console.log('  - session existe:', !!session);
              
              if (isLoading) {
                console.log('🔍 Navigation - Affichage: Chargement...');
                return (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Chargement...</span>
                  </div>
                );
              } else if (session) {
                console.log('🔍 Navigation - Affichage: Utilisateur connecté');
                return (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {session.user.firstName?.charAt(0) || session.user.email?.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden md:block">{session.user.firstName || 'Utilisateur'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {session.user.role === 'user' && (
                      <>
                        <LinkComponent
                          href="/mon-compte"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Mon compte
                        </LinkComponent>
                        <LinkComponent
                          href="/mon-compte"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          Mes favoris
                        </LinkComponent>
                      </>
                    )}
                    {session.user.role === 'pro' && (
                      <LinkComponent
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard Pro
                      </LinkComponent>
                    )}
                    {session.user.role === 'admin' && (
                      <LinkComponent
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin
                      </LinkComponent>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
                );
              } else {
                console.log('🔍 Navigation - Affichage: Non connecté');
                return (
                  <>
                    <LinkComponent href="/auth" className="px-4 py-2 text-sm font-medium rounded-md btn-gradient">
                      S'inscrire
                    </LinkComponent>
                    <LinkComponent href="/auth" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black flex items-center gap-2">
                      <Image 
                        src="/connexion_user.svg" 
                        alt="Connexion" 
                        width={20} 
                        height={20} 
                        className="w-7 h-7"
                      />
                      Se connecter
                    </LinkComponent>
                  </>
                );
              }
            })()}
          </div>

          {/* Bouton Hamburger Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-black hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Liens de navigation */}
              {navItems.map((item) => (
                <LinkComponent
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-3 ${
                    pathname === item.href
                      ? "bg-black/5 text-black"
                      : "text-gray-700 hover:text-black hover:bg-black/5"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && (
                    <Image 
                      src={item.icon} 
                      alt="" 
                      width={20} 
                      height={20} 
                      className="w-5 h-5"
                    />
                  )}
                  {item.label || "Carte"}
                </LinkComponent>
              ))}

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Section utilisateur */}
              {(() => {
                if (isLoading) {
                  return (
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">Chargement...</span>
                    </div>
                  );
                } else if (session) {
                  return (
                    <>
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {session.user.firstName?.charAt(0) || session.user.email?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {session.user.firstName || 'Utilisateur'}
                        </span>
                      </div>

                      {session.user.role === 'user' && (
                        <>
                          <LinkComponent
                            href="/mon-compte"
                            className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="w-5 h-5 mr-3" />
                            Mon compte
                          </LinkComponent>
                          <LinkComponent
                            href="/mon-compte"
                            className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Heart className="w-5 h-5 mr-3" />
                            Mes favoris
                          </LinkComponent>
                        </>
                      )}

                      {session.user.role === 'pro' && (
                        <LinkComponent
                          href="/dashboard"
                          className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 mr-3" />
                          Dashboard Pro
                        </LinkComponent>
                      )}

                      {session.user.role === 'admin' && (
                        <LinkComponent
                          href="/admin"
                          className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 mr-3" />
                          Admin
                        </LinkComponent>
                      )}

                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Se déconnecter
                      </button>
                    </>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      <LinkComponent 
                        href="/auth" 
                        className="block w-full px-3 py-2 text-center text-sm font-medium rounded-md btn-gradient"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        S'inscrire
                      </LinkComponent>
                      <LinkComponent 
                        href="/auth" 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Image 
                          src="/connexion_user.svg" 
                          alt="Connexion" 
                          width={20} 
                          height={20} 
                          className="w-5 h-5"
                        />
                        Se connecter
                      </LinkComponent>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
