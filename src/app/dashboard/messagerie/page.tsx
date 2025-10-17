"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus } from "lucide-react";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationDetail from "@/components/messaging/ConversationDetail";
import NewConversationModal from "@/components/messaging/NewConversationModal";

export default function MessagingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirection si non authentifié ou pas pro
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session?.user || session.user.userType !== "professional") {
    router.push("/auth");
    return null;
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
            <button
              onClick={() => setIsNewConversationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle conversation
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

