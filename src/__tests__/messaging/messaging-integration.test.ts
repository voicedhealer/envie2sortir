/**
 * Tests d'intégration pour le système de messagerie
 * - Flux complets
 * - Interactions entre composants
 * - Cohérence des données
 */

import { NextRequest } from "next/server";
import { GET as getConversations, POST as createConversation } from "@/app/api/messaging/conversations/route";
import { GET as getConversation } from "@/app/api/messaging/conversations/[id]/route";
import { POST as sendMessage } from "@/app/api/messaging/conversations/[id]/messages/route";
import { PATCH as markAsRead } from "@/app/api/messaging/conversations/[id]/read/route";
import { PATCH as changeStatus } from "@/app/api/messaging/conversations/[id]/status/route";
import { GET as getUnreadCount } from "@/app/api/messaging/unread-count/route";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const { getServerSession } = require("next-auth");

describe("Messagerie - Tests d'intégration", () => {
  let testProfessionalId: string;
  let testAdminId: string;
  let testConversationId: string;

  beforeAll(async () => {
    // Créer un professionnel de test
    try {
      const professional = await prisma.professional.create({
        data: {
          siret: "12345678901234",
          firstName: "Test",
          lastName: "Pro",
          email: "testpro@test.com",
          passwordHash: "hash",
          phone: "0123456789",
          companyName: "Test Company",
          legalStatus: "SARL",
        },
      });
      testProfessionalId = professional.id;

      // Créer un admin de test
      const admin = await prisma.user.create({
        data: {
          email: "testadmin@test.com",
          role: "admin",
          firstName: "Test",
          lastName: "Admin",
        },
      });
      testAdminId = admin.id;
    } catch (error) {
      console.error("Setup error:", error);
    }
  });

  afterAll(async () => {
    // Nettoyer
    try {
      if (testConversationId) {
        await prisma.message.deleteMany({
          where: { conversationId: testConversationId },
        });
        await prisma.conversation.delete({
          where: { id: testConversationId },
        });
      }
      if (testProfessionalId) {
        await prisma.professional.delete({
          where: { id: testProfessionalId },
        });
      }
      if (testAdminId) {
        await prisma.user.delete({
          where: { id: testAdminId },
        });
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Flux complet : Pro crée un ticket", () => {
    it("devrait créer une conversation complète avec message initial", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: "Problème avec mon établissement",
          initialMessage: "J'ai un problème avec la validation de mon établissement.",
        }),
      });

      const response = await createConversation(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.subject).toBe("Problème avec mon établissement");
      expect(data.conversation.messages).toHaveLength(1);
      expect(data.conversation.messages[0].content).toBe(
        "J'ai un problème avec la validation de mon établissement."
      );

      testConversationId = data.conversation.id;
    });

    it("le pro devrait voir sa conversation dans la liste", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations");
      const response = await getConversations(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.conversations).toBeInstanceOf(Array);
      
      const conversation = data.conversations.find(
        (c: { id: string }) => c.id === testConversationId
      );
      expect(conversation).toBeDefined();
    });

    it("l'admin devrait voir la conversation dans sa liste", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations");
      const response = await getConversations(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      const conversation = data.conversations.find(
        (c: { id: string }) => c.id === testConversationId
      );
      expect(conversation).toBeDefined();
    });
  });

  describe("2. Flux complet : Admin répond", () => {
    it("l'admin devrait pouvoir envoyer un message", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: "Bonjour, pouvez-vous me donner plus de détails ?",
          }),
        }
      );

      const response = await sendMessage(request, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.message.content).toBe(
        "Bonjour, pouvez-vous me donner plus de détails ?"
      );
      expect(data.message.senderType).toBe("ADMIN");
    });

    it("le pro devrait avoir un message non lu", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest("http://localhost/api/messaging/unread-count");
      const response = await getUnreadCount(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.unreadCount).toBeGreaterThan(0);
    });

    it("le pro devrait voir le message dans la conversation", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const response = await getConversation(request, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.conversation.messages).toHaveLength(2);
      
      const adminMessage = data.conversation.messages.find(
        (m: { senderType: string }) => m.senderType === "ADMIN"
      );
      expect(adminMessage).toBeDefined();
      expect(adminMessage.content).toBe(
        "Bonjour, pouvez-vous me donner plus de détails ?"
      );
    });
  });

  describe("3. Flux complet : Pro répond et marque comme lu", () => {
    it("le pro devrait pouvoir répondre", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content:
              "Mon établissement est en attente depuis 3 jours sans retour.",
          }),
        }
      );

      const response = await sendMessage(request, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(201);
    });

    it("le pro devrait pouvoir marquer les messages comme lus", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/read`,
        {
          method: "PATCH",
        }
      );

      const response = await markAsRead(request, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("le compteur non lu du pro devrait être à zéro", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest("http://localhost/api/messaging/unread-count");
      const response = await getUnreadCount(request);

      const data = await response.json();
      expect(data.unreadCount).toBe(0);
    });

    it("l'admin devrait avoir un message non lu", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest("http://localhost/api/messaging/unread-count");
      const response = await getUnreadCount(request);

      const data = await response.json();
      expect(data.unreadCount).toBeGreaterThan(0);
    });
  });

  describe("4. Flux complet : Admin ferme la conversation", () => {
    it("l'admin devrait pouvoir fermer la conversation", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "closed",
          }),
        }
      );

      const response = await changeStatus(request, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.conversation.status).toBe("closed");
    });

    it("la conversation devrait être marquée comme fermée", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const response = await getConversation(request, {
        params: { id: testConversationId },
      });

      const data = await response.json();
      expect(data.conversation.status).toBe("closed");
    });

    it("la conversation fermée devrait apparaître avec le filtre closed", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations?status=closed"
      );
      const response = await getConversations(request);

      const data = await response.json();
      const conversation = data.conversations.find(
        (c: { id: string }) => c.id === testConversationId
      );
      expect(conversation).toBeDefined();
      expect(conversation.status).toBe("closed");
    });
  });

  describe("5. Tests de cohérence des données", () => {
    it("lastMessageAt devrait être mis à jour à chaque message", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      // Récupérer la conversation avant
      const beforeRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const beforeResponse = await getConversation(beforeRequest, {
        params: { id: testConversationId },
      });
      const beforeData = await beforeResponse.json();
      const beforeTime = new Date(beforeData.conversation.lastMessageAt);

      // Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Rouvrir et envoyer un message
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const reopenRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "open" }),
        }
      );
      await changeStatus(reopenRequest, { params: Promise.resolve({ id: testConversationId }) });

      const messageRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: "Message pour tester lastMessageAt",
          }),
        }
      );
      await sendMessage(messageRequest, { params: Promise.resolve({ id: testConversationId }) });

      // Récupérer la conversation après
      const afterRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const afterResponse = await getConversation(afterRequest, {
        params: { id: testConversationId },
      });
      const afterData = await afterResponse.json();
      const afterTime = new Date(afterData.conversation.lastMessageAt);

      expect(afterTime.getTime()).toBeGreaterThan(beforeTime.getTime());
    });

    it("le nombre de messages devrait correspondre", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const response = await getConversation(request, {
        params: { id: testConversationId },
      });

      const data = await response.json();
      
      // Vérifier dans la base de données
      const messagesInDb = await prisma.message.count({
        where: { conversationId: testConversationId },
      });

      expect(data.conversation.messages.length).toBe(messagesInDb);
    });

    it("les messages devraient être ordonnés chronologiquement", async () => {
      getServerSession.mockResolvedValue({
        user: {
          id: testProfessionalId,
          role: "pro",
          userType: "professional",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}`
      );
      const response = await getConversation(request, {
        params: { id: testConversationId },
      });

      const data = await response.json();
      const messages = data.conversation.messages;

      for (let i = 1; i < messages.length; i++) {
        const prevTime = new Date(messages[i - 1].createdAt).getTime();
        const currTime = new Date(messages[i].createdAt).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });
  });

  describe("6. Tests de cas limites", () => {
    it("devrait gérer la réouverture d'une conversation fermée", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      // Fermer
      const closeRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "closed" }),
        }
      );
      await changeStatus(closeRequest, { params: Promise.resolve({ id: testConversationId }) });

      // Rouvrir
      const reopenRequest = new NextRequest(
        `http://localhost/api/messaging/conversations/${testConversationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "open" }),
        }
      );
      const response = await changeStatus(reopenRequest, {
        params: { id: testConversationId },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.conversation.status).toBe("open");
    });

    it("devrait gérer plusieurs marquages comme lu successifs", async () => {
      getServerSession.mockResolvedValue({
        user: { id: testAdminId, role: "admin" },
      });

      for (let i = 0; i < 5; i++) {
        const request = new NextRequest(
          `http://localhost/api/messaging/conversations/${testConversationId}/read`,
          { method: "PATCH" }
        );

        const response = await markAsRead(request, {
          params: { id: testConversationId },
        });

        expect(response.status).toBe(200);
      }
    });
  });
});

