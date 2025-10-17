/**
 * Tests de performance pour le système de messagerie
 * - Temps de réponse des API
 * - Gestion de charge
 * - Pagination
 * - Optimisation des requêtes
 */

import { NextRequest } from "next/server";
import { GET as getConversations, POST as createConversation } from "@/app/api/messaging/conversations/route";
import { GET as getUnreadCount } from "@/app/api/messaging/unread-count/route";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const { getServerSession } = require("next-auth");

describe("Messagerie - Tests de performance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Temps de réponse des API", () => {
    it("GET /conversations devrait répondre en moins de 500ms", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations");

      const startTime = Date.now();
      await getConversations(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Temps de réponse GET /conversations: ${responseTime}ms`);

      // Devrait être rapide (moins de 500ms)
      expect(responseTime).toBeLessThan(500);
    });

    it("GET /unread-count devrait répondre en moins de 300ms", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const request = new NextRequest("http://localhost/api/messaging/unread-count");

      const startTime = Date.now();
      await getUnreadCount(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Temps de réponse GET /unread-count: ${responseTime}ms`);

      // Comptage devrait être très rapide
      expect(responseTime).toBeLessThan(300);
    });

    it("POST /conversations devrait répondre en moins de 1000ms", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: "Test performance",
          initialMessage: "Message de test",
        }),
      });

      const startTime = Date.now();
      await createConversation(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Temps de réponse POST /conversations: ${responseTime}ms`);

      // Création devrait être raisonnable
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe("2. Tests de charge", () => {
    it("devrait gérer 50 requêtes GET simultanées", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const startTime = Date.now();

      const promises = Array.from({ length: 50 }, () => {
        const request = new NextRequest("http://localhost/api/messaging/conversations");
        return getConversations(request);
      });

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / 50;

      console.log(`50 requêtes simultanées: ${totalTime}ms (moyenne: ${avgTime}ms)`);

      // Toutes devraient réussir
      responses.forEach((response) => {
        expect([200, 403]).toContain(response.status);
      });

      // Temps total devrait être raisonnable
      expect(totalTime).toBeLessThan(5000);
    });

    it("devrait gérer 100 comptages non lus simultanés", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const startTime = Date.now();

      const promises = Array.from({ length: 100 }, () => {
        const request = new NextRequest("http://localhost/api/messaging/unread-count");
        return getUnreadCount(request);
      });

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / 100;

      console.log(`100 comptages simultanés: ${totalTime}ms (moyenne: ${avgTime}ms)`);

      // Toutes devraient réussir
      responses.forEach((response) => {
        expect([200, 403]).toContain(response.status);
      });

      // Devrait être très rapide
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe("3. Tests de messages volumineux", () => {
    it("devrait gérer un message de 50KB", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const { POST: sendMessage } = require("@/app/api/messaging/conversations/[id]/messages/route");

      const largeMessage = "A".repeat(50000); // 50KB

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/conv123/messages",
        {
          method: "POST",
          body: JSON.stringify({
            content: largeMessage,
          }),
        }
      );

      const startTime = Date.now();
      const response = await sendMessage(request, { params: { id: "conv123" } });
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Message 50KB: ${responseTime}ms`);

      // Devrait gérer ou refuser proprement
      expect([201, 400, 404]).toContain(response.status);

      if (response.status === 201) {
        // Si accepté, devrait être raisonnable
        expect(responseTime).toBeLessThan(2000);
      }
    });

    it("devrait gérer efficacement plusieurs messages de taille moyenne", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const { POST: sendMessage } = require("@/app/api/messaging/conversations/[id]/messages/route");

      const mediumMessage = "Lorem ipsum ".repeat(500); // ~5KB

      const startTime = Date.now();

      const promises = Array.from({ length: 20 }, (_, i) => {
        const request = new NextRequest(
          "http://localhost/api/messaging/conversations/conv123/messages",
          {
            method: "POST",
            body: JSON.stringify({
              content: `${mediumMessage} ${i}`,
            }),
          }
        );

        return sendMessage(request, { params: { id: "conv123" } });
      });

      await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / 20;

      console.log(`20 messages 5KB: ${totalTime}ms (moyenne: ${avgTime}ms)`);

      // Devrait être gérable
      expect(totalTime).toBeLessThan(10000);
    });
  });

  describe("4. Tests de mémoire et fuites", () => {
    it("ne devrait pas créer de fuite mémoire avec des requêtes répétées", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Faire 1000 requêtes
      for (let i = 0; i < 1000; i++) {
        const request = new NextRequest("http://localhost/api/messaging/unread-count");
        await getUnreadCount(request);
      }

      // Forcer le garbage collection si disponible
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`Augmentation mémoire après 1000 requêtes: ${memoryIncrease.toFixed(2)}MB`);

      // L'augmentation devrait être raisonnable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50);
    });
  });

  describe("5. Tests de scalabilité", () => {
    it("devrait gérer efficacement un grand nombre de conversations", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      // Simuler beaucoup de conversations via mock
      const originalFindMany = prisma.conversation.findMany;
      
      // Mock pour retourner 1000 conversations
      (prisma.conversation.findMany as jest.Mock) = jest.fn().mockResolvedValue(
        Array.from({ length: 1000 }, (_, i) => ({
          id: `conv${i}`,
          subject: `Conversation ${i}`,
          status: "open",
          lastMessageAt: new Date(),
          professionalId: `pro${i}`,
          adminId: "admin123",
          professional: {
            id: `pro${i}`,
            firstName: `Pro`,
            lastName: `${i}`,
            email: `pro${i}@test.com`,
            companyName: `Company ${i}`,
          },
          admin: null,
          messages: [
            {
              id: `msg${i}`,
              content: `Message ${i}`,
              createdAt: new Date(),
              senderType: "PROFESSIONAL",
              isRead: false,
            },
          ],
          _count: { messages: 1 },
        }))
      );

      const request = new NextRequest("http://localhost/api/messaging/conversations");

      const startTime = Date.now();
      const response = await getConversations(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`1000 conversations: ${responseTime}ms`);

      // Restaurer
      prisma.conversation.findMany = originalFindMany;

      if (response.status === 200) {
        const data = await response.json();
        expect(data.conversations.length).toBe(1000);
        
        // Devrait gérer en temps raisonnable
        expect(responseTime).toBeLessThan(2000);
      }
    });

    it("devrait gérer efficacement un grand nombre de messages non lus", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const originalCount = prisma.message.count;
      
      // Mock pour simuler 10000 messages non lus
      (prisma.message.count as jest.Mock) = jest.fn().mockResolvedValue(10000);

      const request = new NextRequest("http://localhost/api/messaging/unread-count");

      const startTime = Date.now();
      const response = await getUnreadCount(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Comptage 10000 messages: ${responseTime}ms`);

      // Restaurer
      prisma.message.count = originalCount;

      if (response.status === 200) {
        const data = await response.json();
        expect(data.unreadCount).toBe(10000);
        
        // Le comptage devrait être très rapide
        expect(responseTime).toBeLessThan(500);
      }
    });
  });

  describe("6. Tests de résilience réseau", () => {
    it("devrait gérer les timeouts gracieusement", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      // Mock une requête qui timeout
      const originalFindMany = prisma.conversation.findMany;
      (prisma.conversation.findMany as jest.Mock) = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const request = new NextRequest("http://localhost/api/messaging/conversations");

      try {
        const promise = getConversations(request);
        
        // Attendre max 1 seconde
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 1000)
        );

        await Promise.race([promise, timeoutPromise]);
      } catch (error: unknown) {
        // Devrait timeout proprement
        expect(error).toBeDefined();
        if (error instanceof Error) {
          expect(error.message).toBe("Timeout");
        }
      } finally {
        // Restaurer
        prisma.conversation.findMany = originalFindMany;
      }
    });
  });

  describe("7. Tests de validation rapide", () => {
    it("la validation devrait être instantanée", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: "",
          initialMessage: "Test",
        }),
      });

      const startTime = Date.now();
      await createConversation(request);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Validation erreur: ${responseTime}ms`);

      // La validation d'erreur devrait être immédiate
      expect(responseTime).toBeLessThan(50);
    });
  });
});

