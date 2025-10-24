"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart, BarChart3, Building2, History, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserMenu({ isMobile = false }: { isMobile?: boolean }) {
  const { data: session, status } = useSession();
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

  const isLoading = status === 'loading';

  // Afficher un skeleton cliquable pendant le chargement
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${isMobile ? 'py-2' : ''}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        {!isMobile && <span className="text-sm text-gray-500">Chargement...</span>}
      </div>
    );
  }

  if (!session) {
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
            {session.user.firstName?.charAt(0) || session.user.email?.charAt(0)}
          </span>
        </div>
        {!isMobile && <span className="hidden md:block">{session.user.firstName || 'Utilisateur'}</span>}
        {isMobile && <span>{session.user.firstName || 'Utilisateur'}</span>}
      </button>

      {showUserMenu && (
        <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50`}>
          {(session.user.userType === 'user' || session.user.role === 'user') && (
            <>
              <Link href="/mon-compte" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                <User className="w-4 h-4 mr-3" />
                Mon compte
              </Link>
            </>
          )}
          {(session.user.userType === 'professional' || session.user.role === 'pro') && (
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
              <Settings className="w-4 h-4 mr-3" />
              Dashboard Pro
            </Link>
          )}
          {session.user.role === 'admin' && (
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
              
              try {
                console.log('🚪 Déconnexion en cours...');
                
                // Méthode 1: signOut avec redirection manuelle
                await signOut({ 
                  callbackUrl: '/',
                  redirect: false // Désactiver la redirection automatique
                });
                
                console.log('✅ SignOut réussi, redirection manuelle...');
                
                // Attendre un peu pour que la session soit bien nettoyée
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Redirection manuelle après signOut
                window.location.href = '/';
                
              } catch (error) {
                console.error('❌ Erreur lors de la déconnexion:', error);
                
                // Fallback: appel direct à l'API de déconnexion
                try {
                  console.log('🔄 Tentative de fallback avec API directe...');
                  await fetch('/api/auth/signout', { method: 'POST' });
                  console.log('✅ API signout appelée avec succès');
                } catch (apiError) {
                  console.error('❌ API signout échoué:', apiError);
                }
                
                // Redirection forcée dans tous les cas
                window.location.href = '/';
              }
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
