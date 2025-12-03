"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationDetail from "@/components/messaging/ConversationDetail";
import NewConversationModal from "@/components/messaging/NewConversationModal";

export default function MessagingPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const hasCheckedAccessRef = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timeout de sécurité pour éviter de rester bloqué indéfiniment sur le chargement de la session
  useEffect(() => {
    if (loading) {
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ [Messagerie] Timeout de sécurité - déblocage du chargement de session');
        // Ne pas forcer le déblocage, mais loguer pour debug
      }, 10000); // 10 secondes maximum
    }

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [loading]);

  // Vérifier si l'utilisateur est un professionnel via API (plus fiable que la session côté client)
  useEffect(() => {
    // Ne vérifier qu'une seule fois si on a déjà vérifié
    if (hasCheckedAccessRef.current) {
      return;
    }
    
    // Attendre que le chargement de la session soit terminé
    if (loading) {
      return;
    }
    
    // Si pas de session après le chargement, rediriger
    if (!session?.user) {
      router.push("/auth");
      hasCheckedAccessRef.current = true;
      return;
    }

    // Vérifier l'accès en arrière-plan (ne bloque pas l'affichage)
    const checkProfessionalAccess = async () => {
      setIsCheckingAccess(true);
      
      try {
        const response = await fetch('/api/auth/verify-establishment');
        const data = await response.json();
        
        if (!response.ok || !data.hasEstablishment) {
          console.error('❌ [Messagerie] Utilisateur non professionnel ou sans établissement');
          router.push("/auth");
        }
      } catch (error) {
        console.error('❌ [Messagerie] Erreur vérification professionnel:', error);
        // En cas d'erreur, vérifier au moins que la session existe
        if (!session?.user) {
          router.push("/auth");
        }
      } finally {
        setIsCheckingAccess(false);
        hasCheckedAccessRef.current = true;
      }
    };

    checkProfessionalAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session?.user]);

  // Timeout de sécurité : si loading reste true trop longtemps, forcer l'affichage
  const [forceDisplay, setForceDisplay] = useState(false);
  
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ [Messagerie] Timeout de sécurité - affichage forcé après 2 secondes');
        setForceDisplay(true);
      }, 2000); // 2 secondes maximum
      
      return () => clearTimeout(timeout);
    } else {
      setForceDisplay(false);
    }
  }, [loading]);

  // Si on a une session, on peut afficher même si loading est encore true
  // (le hook peut mettre du temps à se mettre à jour)
  const canDisplay = !loading || forceDisplay || session?.user;

  // Affichage du chargement uniquement si on charge la session ET qu'on n'a pas de session ET qu'on n'a pas forcé l'affichage
  // La vérification d'accès se fait en arrière-plan et ne bloque pas l'affichage
  if (loading && !forceDisplay && !session?.user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Si pas de session après le chargement (ou après timeout), ne rien afficher (redirection en cours)
  if (!canDisplay || (!session?.user && !forceDisplay)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Redirection...</div>
      </div>
    );
  }

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMessageSent = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
                <p className="text-sm text-gray-600">
                  Communiquez avec l'équipe d'administration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour au dashboard
              </Link>
              <button
                onClick={() => setIsNewConversationModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  background: 'linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e66a1a 0%, #e01a96 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%)';
                }}
              >
                <Plus className="w-5 h-5" />
                Nouvelle conversation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          <div className="flex h-full">
            {/* Liste des conversations (sidebar) */}
            <div className="w-1/3 border-r">
              <ConversationList
                isAdmin={false}
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Détail de la conversation */}
            <div className="flex-1">
              {selectedConversationId ? (
                <ConversationDetail
                  conversationId={selectedConversationId}
                  isAdmin={false}
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2">ou créez-en une nouvelle</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nouvelle conversation */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onCreated={handleConversationCreated}
        isAdmin={false}
      />
    </div>
  );
}

