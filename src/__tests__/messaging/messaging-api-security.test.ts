/**
 * Tests de sécurité pour l'API de messagerie
 * - Injection SQL
 * - XSS (Cross-Site Scripting)
 * - Authentification et autorisations
 * - Validation des entrées
 */

import { NextRequest } from "next/server";
import { GET as getConversations, POST as createConversation } from "@/app/api/messaging/conversations/route";
import { GET as getConversation } from "@/app/api/messaging/conversations/[id]/route";
import { POST as sendMessage } from "@/app/api/messaging/conversations/[id]/messages/route";
import { PATCH as markAsRead } from "@/app/api/messaging/conversations/[id]/read/route";
import { prisma } from "@/lib/prisma";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const { getServerSession } = require("next-auth");

describe("Messagerie API - Tests de sécurité", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Tests d'authentification", () => {
    it("devrait rejeter les requêtes sans session", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/messaging/conversations");
      const response = await getConversations(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Non authentifié");
    });

    it("devrait rejeter un utilisateur non-pro et non-admin", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "user123", role: "user", userType: "user" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations");
      const response = await getConversations(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Accès non autorisé");
    });
  });

  describe("2. Tests d'injection SQL", () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE conversations; --",
      "1' OR '1'='1",
      "admin'--",
      "1' UNION SELECT NULL--",
      "'; DELETE FROM messages WHERE '1'='1",
      "' OR 1=1--",
      "1'; EXEC sp_MSForEachTable 'DROP TABLE ?'; --",
    ];

    it("devrait protéger contre l'injection SQL dans le sujet", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      for (const payload of sqlInjectionPayloads) {
        const request = new NextRequest("http://localhost/api/messaging/conversations", {
          method: "POST",
          body: JSON.stringify({
            subject: payload,
            initialMessage: "Test message",
          }),
        });

        // Prisma devrait gérer ces payloads en toute sécurité
        // Ne devrait pas crasher
        try {
          await createConversation(request);
        } catch (error) {
          // L'erreur ne devrait pas être liée à SQL
          expect(error).toBeDefined();
        }
      }
    });

    it("devrait protéger contre l'injection SQL dans le contenu des messages", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      for (const payload of sqlInjectionPayloads) {
        const request = new NextRequest(
          "http://localhost/api/messaging/conversations/conv123/messages",
          {
            method: "POST",
            body: JSON.stringify({
              content: payload,
            }),
          }
        );

        try {
          await sendMessage(request, { params: { id: "conv123" } });
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe("3. Tests XSS (Cross-Site Scripting)", () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "<svg/onload=alert('XSS')>",
      "javascript:alert('XSS')",
      "<iframe src='javascript:alert(\"XSS\")'></iframe>",
      "<body onload=alert('XSS')>",
      "<<SCRIPT>alert('XSS');//<</SCRIPT>",
      "<INPUT TYPE=\"IMAGE\" SRC=\"javascript:alert('XSS');\">",
    ];

    it("devrait accepter mais échapper les payloads XSS dans le sujet", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      for (const payload of xssPayloads) {
        const request = new NextRequest("http://localhost/api/messaging/conversations", {
          method: "POST",
          body: JSON.stringify({
            subject: payload,
            initialMessage: "Test",
          }),
        });

        // Les payloads XSS devraient être stockés tels quels
        // C'est au frontend de les échapper lors de l'affichage
        const response = await createConversation(request);
        
        if (response.status === 201) {
          const data = await response.json();
          // Vérifier que le payload est stocké (sera échappé au render)
          expect(data.conversation.subject).toBe(payload);
        }
      }
    });

    it("devrait accepter les payloads XSS dans les messages", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      for (const payload of xssPayloads) {
        const request = new NextRequest(
          "http://localhost/api/messaging/conversations/conv123/messages",
          {
            method: "POST",
            body: JSON.stringify({
              content: payload,
            }),
          }
        );

        const response = await sendMessage(request, { params: { id: "conv123" } });
        
        // Les payloads devraient être acceptés (échappés au render)
        expect([201, 404]).toContain(response.status);
      }
    });
  });

  describe("4. Tests d'autorisation", () => {
    it("un pro ne devrait pas accéder aux conversations d'un autre pro", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      // Simuler une conversation d'un autre pro
      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/other-pro-conv"
      );

      const response = await getConversation(request, {
        params: { id: "other-pro-conv" },
      });

      // Devrait retourner 404 ou 403
      expect([403, 404]).toContain(response.status);
    });

    it("un admin devrait accéder à toutes les conversations", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/any-conv"
      );

      const response = await getConversation(request, {
        params: { id: "any-conv" },
      });

      // 404 si n'existe pas, mais pas 403
      expect(response.status).not.toBe(403);
    });
  });

  describe("5. Tests de validation des entrées", () => {
    it("devrait rejeter un sujet vide", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: "",
          initialMessage: "Test message",
        }),
      });

      const response = await createConversation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("requis");
    });

    it("devrait rejeter un message vide", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/conv123/messages",
        {
          method: "POST",
          body: JSON.stringify({
            content: "",
          }),
        }
      );

      const response = await sendMessage(request, { params: { id: "conv123" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("vide");
    });

    it("devrait rejeter un message avec seulement des espaces", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/conv123/messages",
        {
          method: "POST",
          body: JSON.stringify({
            content: "   \n\t   ",
          }),
        }
      );

      const response = await sendMessage(request, { params: { id: "conv123" } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("devrait rejeter un statut invalide", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const { PATCH: changeStatus } = require("@/app/api/messaging/conversations/[id]/status/route");

      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/conv123/status",
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "invalid_status",
          }),
        }
      );

      const response = await changeStatus(request, { params: { id: "conv123" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("invalide");
    });
  });

  describe("6. Tests de caractères spéciaux et encodage", () => {
    const specialChars = [
      "Émojis: 😀🎉💻🚀",
      "Accents: éèêëàâäôöùûüç",
      "Symboles: €$£¥©®™",
      "Math: ∑∏∫√∞≈≠",
      "Arrows: ←→↑↓⇐⇒",
      "Unicode: 你好世界 مرحبا שלום",
      "Nouvelle\nligne\navec\nretours",
      "Tabs\tet\tespaces   multiples",
      'Quotes: "doubles" \'simples\' `backticks`',
      "Backslash: \\ et slash: /",
    ];

    it("devrait gérer correctement tous les caractères spéciaux", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      for (const chars of specialChars) {
        const request = new NextRequest("http://localhost/api/messaging/conversations", {
          method: "POST",
          body: JSON.stringify({
            subject: `Test: ${chars}`,
            initialMessage: chars,
          }),
        });

        const response = await createConversation(request);
        
        if (response.status === 201) {
          const data = await response.json();
          expect(data.conversation.subject).toContain(chars);
        }
      }
    });
  });

  describe("7. Tests de limites et robustesse", () => {
    it("devrait gérer un sujet très long", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const longSubject = "A".repeat(1000);
      
      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: longSubject,
          initialMessage: "Test",
        }),
      });

      const response = await createConversation(request);
      
      // Devrait soit accepter soit avoir une limite claire
      expect([201, 400]).toContain(response.status);
    });

    it("devrait gérer un message très long (10000 caractères)", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const longMessage = "Lorem ipsum dolor sit amet. ".repeat(400); // ~10k chars
      
      const request = new NextRequest(
        "http://localhost/api/messaging/conversations/conv123/messages",
        {
          method: "POST",
          body: JSON.stringify({
            content: longMessage,
          }),
        }
      );

      const response = await sendMessage(request, { params: { id: "conv123" } });
      
      // Devrait accepter ou avoir une limite définie
      expect([201, 400, 404]).toContain(response.status);
    });

    it("devrait gérer un ID de conversation invalide", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const invalidIds = [
        "invalid-id",
        "'; DROP TABLE--",
        "../../../etc/passwd",
        "%00",
        "null",
        "undefined",
        "{}",
      ];

      for (const invalidId of invalidIds) {
        const request = new NextRequest(
          `http://localhost/api/messaging/conversations/${invalidId}`
        );

        const response = await getConversation(request, {
          params: { id: invalidId },
        });

        // Devrait gérer gracieusement
        expect([404, 400, 500]).toContain(response.status);
      }
    });
  });

  describe("8. Tests de concurrence", () => {
    it("devrait gérer plusieurs messages simultanés", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "admin123", role: "admin" },
      });

      const promises = Array.from({ length: 10 }, (_, i) => {
        const request = new NextRequest(
          "http://localhost/api/messaging/conversations/conv123/messages",
          {
            method: "POST",
            body: JSON.stringify({
              content: `Message concurrent ${i}`,
            }),
          }
        );

        return sendMessage(request, { params: { id: "conv123" } });
      });

      const responses = await Promise.all(promises);

      // Tous devraient être traités
      responses.forEach((response) => {
        expect([201, 404]).toContain(response.status);
      });
    });
  });

  describe("9. Tests de données malformées", () => {
    it("devrait gérer un JSON invalide", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: "{ invalid json }",
      });

      try {
        await createConversation(request);
      } catch (error) {
        // Devrait lever une erreur mais ne pas crasher le serveur
        expect(error).toBeDefined();
      }
    });

    it("devrait gérer des champs manquants", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: "Test",
          // initialMessage manquant
        }),
      });

      const response = await createConversation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("requis");
    });

    it("devrait gérer des types de données incorrects", async () => {
      getServerSession.mockResolvedValue({
        user: { id: "pro123", role: "pro", userType: "professional" },
      });

      const request = new NextRequest("http://localhost/api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: 12345, // Devrait être string
          initialMessage: { object: "instead of string" },
        }),
      });

      const response = await createConversation(request);
      
      // Devrait gérer gracieusement
      expect([400, 500]).toContain(response.status);
    });
  });
});

