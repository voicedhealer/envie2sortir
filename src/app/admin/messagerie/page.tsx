"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus } from "lucide-react";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationDetail from "@/components/messaging/ConversationDetail";
import NewConversationModal from "@/components/messaging/NewConversationModal";

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export default function AdminMessagingPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const hasRedirectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchProfessionals = useCallback(async () => {
    // Éviter les appels multiples
    if (hasFetchedRef.current) {
      return;
    }

    try {
      hasFetchedRef.current = true;
      const response = await fetch("/api/admin/professionals");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des professionnels:", error);
      hasFetchedRef.current = false; // Permettre de réessayer en cas d'erreur
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    // Éviter les redirections multiples
    if (!session?.user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/auth");
      return;
    }

    if (session?.user && session.user?.role !== "admin" && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/auth");
      return;
    }

    // Charger les professionnels uniquement si admin
    if (session?.user?.role === "admin" && !hasFetchedRef.current) {
      fetchProfessionals();
    }
  }, [session, loading, fetchProfessionals]);

  // Redirection si non authentifié ou pas admin
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session?.user || session.user?.role !== "admin") {
    return null; // Le useEffect gère la redirection
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
                <h1 className="text-2xl font-bold text-gray-900">Messagerie Admin</h1>
                <p className="text-sm text-gray-600">
                  Support et communication avec les professionnels
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsNewConversationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Contacter un professionnel
            </button>
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
                isAdmin={true}
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
                  isAdmin={true}
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2">ou contactez un professionnel</p>
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
        isAdmin={true}
        professionals={professionals}
      />
    </div>
  );
}

