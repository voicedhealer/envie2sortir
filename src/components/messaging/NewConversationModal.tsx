"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
  isAdmin: boolean;
  professionals?: Professional[];
}

export default function NewConversationModal({
  isOpen,
  onClose,
  onCreated,
  isAdmin,
  professionals = [],
}: NewConversationModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      setError("Le sujet est requis");
      return;
    }

    if (!message.trim()) {
      setError("Le message est requis");
      return;
    }

    if (isAdmin && !selectedProfessionalId) {
      setError("Veuillez sélectionner un professionnel");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/messaging/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          initialMessage: message,
          ...(isAdmin && { professionalId: selectedProfessionalId }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubject("");
        setMessage("");
        setSelectedProfessionalId("");
        onCreated(data.conversation.id);
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la création de la conversation");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      setError("Erreur lors de la création de la conversation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Nouvelle conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professionnel
              </label>
              <select
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              >
                <option value="">Sélectionnez un professionnel</option>
                {professionals.map((pro) => (
                  <option key={pro.id} value={pro.id}>
                    {pro.companyName} - {pro.firstName} {pro.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Problème avec mon établissement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre problème..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Création..." : "Créer la conversation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

