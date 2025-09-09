"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug logs
  console.log('🔍 Navigation - Status:', status);
  console.log('🔍 Navigation - Session:', session);

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

  const navItems = [
    { href: "/carte", label: "", icon: "/icone_maps_3.svg" },
    { href: "/etablissements/nouveau", label: "Ajoutez mon établissement" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Envie2Sortir - Accueil">
              <Image src="/logo.svg" alt="Envie2Sortir" width={135} height={150} priority />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
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
              </Link>
            ))}

            {status === 'loading' ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Chargement...</span>
              </div>
            ) : session ? (
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
                        <Link
                          href="/mon-compte"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Mon compte
                        </Link>
                        <Link
                          href="/mon-compte"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          Mes favoris
                        </Link>
                      </>
                    )}
                    {session.user.role === 'pro' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard Pro
                      </Link>
                    )}
                    {session.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin
                      </Link>
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
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 text-sm font-medium rounded-md btn-gradient">
                  S'inscrire
                </Link>
                <Link href="/auth" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black flex items-center gap-2">
                  <Image 
                    src="/connexion_user.svg" 
                    alt="Connexion" 
                    width={20} 
                    height={20} 
                    className="w-7 h-7"
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
