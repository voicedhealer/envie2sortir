"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import MessageForm from "./MessageForm";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderType: "PROFESSIONAL" | "ADMIN";
  senderId: string;
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
  createdAt: string;
  professional: Professional;
  admin: Admin | null;
  messages: Message[];
}

interface ConversationDetailProps {
  conversationId: string;
  isAdmin: boolean;
  onMessageSent: () => void;
}

export default function ConversationDetail({
  conversationId,
  isAdmin,
  onMessageSent,
}: ConversationDetailProps) {
  const { user } = useSupabaseSession();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
    markAsRead();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/messaging/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/messaging/conversations/${conversationId}/read`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const handleStatusChange = async (newStatus: "open" | "closed") => {
    try {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        onMessageSent();
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const handleMessageSent = () => {
    fetchConversation();
    onMessageSent();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isOwnMessage = (message: Message) => {
    if (isAdmin) {
      return message.senderType === "ADMIN";
    }
    return message.senderId === user?.id;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Conversation non trouvée</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{conversation.subject}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin
                ? `${conversation.professional.companyName} - ${conversation.professional.firstName} ${conversation.professional.lastName}`
                : conversation.admin
                ? `Admin: ${conversation.admin.firstName || ""} ${conversation.admin.lastName || ""}`
                : "En attente d'admin"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm rounded ${
                conversation.status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {conversation.status === "open" ? "Ouverte" : "Fermée"}
            </span>
            
            {conversation.status === "open" ? (
              <button
                onClick={() => handleStatusChange("closed")}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Fermer
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("open")}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Rouvrir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwnMessage(message)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    isOwnMessage(message) ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {message.senderType === "ADMIN" ? "Admin" : "Professionnel"}
                  </span>
                  <span className={`text-xs ${
                    isOwnMessage(message) ? "text-blue-100" : "text-gray-400"
                  }`}>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Formulaire d'envoi */}
      {conversation.status === "open" && (
        <div className="p-4 border-t bg-white">
          <MessageForm
            conversationId={conversation.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      )}
      
      {conversation.status === "closed" && (
        <div className="p-4 border-t bg-gray-100 text-center text-gray-600">
          Cette conversation est fermée. Réouvrez-la pour envoyer un message.
        </div>
      )}
    </div>
  );
}

