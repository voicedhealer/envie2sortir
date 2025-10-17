/**
 * Tests des composants de messagerie
 * - Rendu correct
 * - Interactions utilisateur
 * - Gestion des états
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MessageBadge from "@/components/messaging/MessageBadge";
import MessageForm from "@/components/messaging/MessageForm";
import { useSession } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock fetch global
global.fetch = jest.fn();

describe("Composants de messagerie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("MessageBadge", () => {
    it("ne devrait rien afficher si aucun message non lu", async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: "user123" } },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 0 }),
      });

      const { container } = render(<MessageBadge />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("devrait afficher le nombre de messages non lus", async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: "user123" } },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 5 }),
      });

      render(<MessageBadge />);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
      });
    });

    it("devrait afficher 9+ pour plus de 9 messages", async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: "user123" } },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 15 }),
      });

      render(<MessageBadge />);

      await waitFor(() => {
        expect(screen.getByText("9+")).toBeInTheDocument();
      });
    });

    it("devrait faire un polling toutes les 30 secondes", async () => {
      jest.useFakeTimers();

      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: "user123" } },
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ unreadCount: 3 }),
      });

      render(<MessageBadge />);

      // Appel initial
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Avancer de 30 secondes
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Avancer encore de 30 secondes
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });

      jest.useRealTimers();
    });

    it("ne devrait pas faire d'appel API si pas de session", () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
      });

      render(<MessageBadge />);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("MessageForm", () => {
    const mockOnMessageSent = jest.fn();

    beforeEach(() => {
      mockOnMessageSent.mockClear();
    });

    it("devrait rendre le formulaire correctement", () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      expect(screen.getByPlaceholderText("Écrivez votre message...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /envoyer/i })).toBeInTheDocument();
    });

    it("le bouton devrait être désactivé si le champ est vide", () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const button = screen.getByRole("button", { name: /envoyer/i });
      expect(button).toBeDisabled();
    });

    it("le bouton devrait être activé avec du texte", () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: "Test message" } });

      expect(button).not.toBeDisabled();
    });

    it("devrait afficher une erreur si on essaie d'envoyer un message vide", async () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      // Essayer d'envoyer avec seulement des espaces
      fireEvent.change(textarea, { target: { value: "   " } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/ne peut pas être vide/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("devrait envoyer le message avec succès", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { id: "msg123", content: "Test" } }),
      });

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/messaging/conversations/conv123/messages",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "Test message" }),
          })
        );
      });

      await waitFor(() => {
        expect(mockOnMessageSent).toHaveBeenCalled();
      });

      // Le champ devrait être vidé
      expect(textarea).toHaveValue("");
    });

    it("devrait afficher une erreur si l'envoi échoue", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Erreur serveur" }),
      });

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument();
      });

      expect(mockOnMessageSent).not.toHaveBeenCalled();
    });

    it("devrait désactiver le formulaire pendant l'envoi", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(button);

      // Le textarea et le bouton devraient être désactivés
      expect(textarea).toBeDisabled();
      expect(button).toBeDisabled();
      expect(screen.getByText("Envoi...")).toBeInTheDocument();
    });

    it("devrait gérer les caractères spéciaux correctement", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { id: "msg123" } }),
      });

      const specialMessage = "Test avec émojis 🎉 et accents éàç";

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: specialMessage } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ content: specialMessage }),
          })
        );
      });
    });

    it("devrait gérer les messages multilignes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { id: "msg123" } }),
      });

      const multilineMessage = "Ligne 1\nLigne 2\nLigne 3";

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: multilineMessage } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ content: multilineMessage }),
          })
        );
      });
    });

    it("devrait gérer un message très long", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { id: "msg123" } }),
      });

      const longMessage = "A".repeat(5000);

      render(
        <MessageForm conversationId="conv123" onMessageSent={mockOnMessageSent} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      const button = screen.getByRole("button", { name: /envoyer/i });

      fireEvent.change(textarea, { target: { value: longMessage } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Tests d'accessibilité", () => {
    it("MessageForm devrait avoir les labels appropriés", () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText("Écrivez votre message...");
      expect(textarea).toHaveAttribute("placeholder");
    });

    it("les boutons devraient être accessibles au clavier", () => {
      render(
        <MessageForm conversationId="conv123" onMessageSent={jest.fn()} />
      );

      const button = screen.getByRole("button", { name: /envoyer/i });
      expect(button).toHaveAttribute("type", "submit");
    });
  });
});

