"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderType: "PROFESSIONAL" | "ADMIN";
  isRead: boolean;
}

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
}

interface Admin {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: "open" | "closed";
  lastMessageAt: string;
  professional: Professional;
  admin: Admin | null;
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface ConversationListProps {
  isAdmin: boolean;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  refreshTrigger?: number;
}

export default function ConversationList({
  isAdmin,
  onSelectConversation,
  selectedConversationId,
  refreshTrigger = 0,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(1); // Réinitialiser la page lors du changement de filtre
    fetchConversations(1, true);
  }, [statusFilter, refreshTrigger]);

  const fetchConversations = async (pageNum: number = page, reset: boolean = false) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      params.append("page", pageNum.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/messaging/conversations?${params}`);
      if (response.ok) {
        const data = await response.json();
        const newConversations = data.conversations || [];
        
        if (reset) {
          setConversations(newConversations);
        } else {
          setConversations(prev => [...prev, ...newConversations]);
        }
        
        // S'il y a moins de 20 résultats, on a atteint la fin
        setHasMore(newConversations.length === 20);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      fetchConversations(nextPage, false);
    }
  };

  const getPreviewText = (conv: Conversation) => {
    if (conv.messages.length > 0) {
      const lastMessage = conv.messages[0];
      return lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? "..." : "");
    }
    return "Aucun message";
  };

  const hasUnreadMessages = (conv: Conversation) => {
    return conv._count.messages > 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filtres */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-sm rounded transition-all ${
              statusFilter === "all"
                ? "text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={
              statusFilter === "all"
                ? {
                    background: "linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%)",
                  }
                : undefined
            }
          >
            Toutes
          </button>
          <button
            onClick={() => setStatusFilter("open")}
            className={`px-3 py-1 text-sm rounded transition-all ${
              statusFilter === "open"
                ? "text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={
              statusFilter === "open"
                ? {
                    background: "linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%)",
                  }
                : undefined
            }
          >
            Ouvertes
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`px-3 py-1 text-sm rounded transition-all ${
              statusFilter === "closed"
                ? "text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={
              statusFilter === "closed"
                ? {
                    background: "linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%)",
                  }
                : undefined
            }
          >
            Fermées
          </button>
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Aucune conversation
          </div>
        ) : (
          <>
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedConversationId === conversation.id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : ""
                  } ${hasUnreadMessages(conversation) ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium text-gray-900 ${
                      hasUnreadMessages(conversation) ? "font-bold" : ""
                    }`}>
                      {conversation.subject}
                    </h3>
                    {hasUnreadMessages(conversation) && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {conversation._count.messages > 9 ? "9+" : conversation._count.messages}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {isAdmin
                      ? `${conversation.professional.companyName} - ${conversation.professional.firstName} ${conversation.professional.lastName}`
                      : conversation.admin
                      ? `Admin: ${conversation.admin.firstName || ""} ${conversation.admin.lastName || ""}`
                      : "En attente d'admin"}
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {getPreviewText(conversation)}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        conversation.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {conversation.status === "open" ? "Ouverte" : "Fermée"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Bouton charger plus */}
            {hasMore && !isLoading && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Charger plus...
                </button>
              </div>
            )}
            
            {isLoading && conversations.length > 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Chargement...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

