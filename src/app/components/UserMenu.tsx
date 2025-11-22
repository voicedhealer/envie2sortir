"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart, BarChart3, Building2, History, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export default function UserMenu({ isMobile = false }: { isMobile?: boolean }) {
  const { session, loading, signOut } = useSupabaseSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminSubmenu, setShowAdminSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowAdminSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Afficher un skeleton cliquable pendant le chargement
  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${isMobile ? 'py-2' : ''}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        {!isMobile && <span className="text-sm text-gray-500">Chargement...</span>}
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className={`flex items-center gap-2 ${isMobile ? 'flex-col items-start space-y-2' : ''}`}>
        <Link 
          href="/auth" 
          className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-black flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
        >
          <Image 
            src="/connexion_user.svg" 
            alt="Connexion" 
            width={20} 
            height={20} 
            className="w-7 h-7"
          />
          Se connecter
        </Link>
      </div>
    );
  }

  // Si session existe, afficher le menu utilisateur
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 ${isMobile ? 'w-full justify-start' : ''}`}
      >
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {session.user?.firstName?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        </div>
        {!isMobile && <span className="hidden md:block">{session.user?.firstName || 'Utilisateur'}</span>}
        {isMobile && <span>{session.user?.firstName || 'Utilisateur'}</span>}
      </button>

      {showUserMenu && (
        <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50`}>
          {(session.user?.userType === 'user' || session.user?.role === 'user') && (
            <>
              <Link href="/mon-compte" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                <User className="w-4 h-4 mr-3" />
                Mon compte
              </Link>
            </>
          )}
          {(session.user?.userType === 'professional' || session.user?.role === 'professional') && (
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
              <Settings className="w-4 h-4 mr-3" />
              Dashboard Pro
            </Link>
          )}
          {session.user?.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowAdminSubmenu(!showAdminSubmenu)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-3" />
                  Admin
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${showAdminSubmenu ? 'rotate-90' : ''}`} />
              </button>
              
              {showAdminSubmenu && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    <Building2 className="w-4 h-4 mr-3" />
                    Dashboard
                  </Link>
                  <Link href="/admin/etablissements" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    <Building2 className="w-4 h-4 mr-3" />
                    Gérer les établissements
                  </Link>
                  <Link href="/admin/analytics" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </Link>
                  <Link href="/admin/modifications" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    <FileText className="w-4 h-4 mr-3" />
                    Modifications
                  </Link>
                  <Link href="/admin/historique" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    <History className="w-4 h-4 mr-3" />
                    Historique
                  </Link>
                </div>
              )}
            </div>
          )}
          <button
            onClick={async () => {
              setShowUserMenu(false);
              
              console.log('🚪 Déconnexion en cours...');
              
              // Nettoyer le localStorage immédiatement
              if (typeof window !== 'undefined') {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('sb-')) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                console.log('🧹 LocalStorage nettoyé');
              }
              
              try {
                // Appeler l'API de déconnexion pour supprimer les cookies serveur
                await fetch('/api/auth/signout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
                
                // Tenter aussi la déconnexion côté client
                await signOut().catch(e => console.warn('Client signOut error:', e));
                
                console.log('✅ Déconnexion réussie');
                
              } catch (error) {
                console.error('❌ Erreur lors de la déconnexion:', error);
              }
              
              // Redirection forcée
              console.log('🔄 Redirection...');
              window.location.replace('/');
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
}
