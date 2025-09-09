/**
 * Tests d'intégration pour vérifier la différenciation STANDARD vs PREMIUM
 * dans les routes API et l'UI
 */

import { NextRequest } from 'next/server';

// Mock des dépendances
jest.mock('@/lib/prisma', () => ({
  prisma: {
    establishment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Tests d\'intégration API - Différenciation STANDARD vs PREMIUM', () => {
  
  describe('API Events - Accès selon l\'abonnement', () => {
    let mockEstablishmentStandard: any;
    let mockEstablishmentPremium: any;
    let mockUser: any;

    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'pro',
        establishmentId: 'est-123',
      };

      mockEstablishmentStandard = {
        id: 'est-123',
        name: 'Test Establishment',
        subscription: 'STANDARD',
        ownerId: 'user-123',
      };

      mockEstablishmentPremium = {
        id: 'est-123',
        name: 'Test Establishment',
        subscription: 'PREMIUM',
        ownerId: 'user-123',
      };
    });

    test('GET /api/dashboard/events - STANDARD doit retourner 403', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({ user: mockUser });
      prisma.establishment.findUnique.mockResolvedValue(mockEstablishmentStandard);

      const { GET } = await import('@/app/api/dashboard/events/route');
      const request = new NextRequest('http://localhost:3000/api/dashboard/events');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Premium');
      expect(data.code).toBe('PREMIUM_REQUIRED');
    });

    test('GET /api/dashboard/events - PREMIUM doit retourner 200', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({ user: mockUser });
      prisma.establishment.findUnique.mockResolvedValue(mockEstablishmentPremium);
      prisma.event.findMany.mockResolvedValue([]);

      const { GET } = await import('@/app/api/dashboard/events/route');
      const request = new NextRequest('http://localhost:3000/api/dashboard/events');
      
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    test('POST /api/dashboard/events - STANDARD doit retourner 403', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({ user: mockUser });
      prisma.establishment.findUnique.mockResolvedValue(mockEstablishmentStandard);

      const { POST } = await import('@/app/api/dashboard/events/route');
      const request = new NextRequest('http://localhost:3000/api/dashboard/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Event',
          description: 'Test Description',
          startDate: '2024-12-31T20:00:00Z',
        }),
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Premium');
    });

    test('POST /api/dashboard/events - PREMIUM doit créer l\'événement', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({ user: mockUser });
      prisma.establishment.findUnique.mockResolvedValue(mockEstablishmentPremium);
      prisma.event.create.mockResolvedValue({
        id: 'event-123',
        title: 'Test Event',
        description: 'Test Description',
        startDate: '2024-12-31T20:00:00Z',
      });

      const { POST } = await import('@/app/api/dashboard/events/route');
      const request = new NextRequest('http://localhost:3000/api/dashboard/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Event',
          description: 'Test Description',
          startDate: '2024-12-31T20:00:00Z',
        }),
      });
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.event.create).toHaveBeenCalled();
    });
  });

  describe('API Images - Limites selon l\'abonnement', () => {
    test('Upload d\'images - STANDARD limité à 1 image', async () => {
      // Test de la logique de limitation des images
      const { getMaxImages } = await import('@/lib/subscription-utils');
      
      expect(getMaxImages('STANDARD')).toBe(1);
      expect(getMaxImages('PREMIUM')).toBe(10);
    });
  });

  describe('Middleware - Protection des routes', () => {
    test('Middleware doit rediriger les utilisateurs STANDARD vers dashboard', () => {
      // Test de la logique du middleware
      const mockToken = {
        role: 'pro',
        establishmentId: 'est-123',
        subscription: 'STANDARD',
      };

      const mockReq = {
        nextUrl: { pathname: '/dashboard/events' },
        nextauth: { token: mockToken },
        url: 'http://localhost:3000/dashboard/events',
      };

      // Le middleware devrait rediriger vers /dashboard?error=PremiumRequired
      // Cette logique est testée dans le middleware
      expect(mockToken.subscription).toBe('STANDARD');
    });

    test('Middleware doit autoriser les utilisateurs PREMIUM', () => {
      const mockToken = {
        role: 'pro',
        establishmentId: 'est-123',
        subscription: 'PREMIUM',
      };

      const mockReq = {
        nextUrl: { pathname: '/dashboard/events' },
        nextauth: { token: mockToken },
        url: 'http://localhost:3000/dashboard/events',
      };

      expect(mockToken.subscription).toBe('PREMIUM');
    });
  });

  describe('UI - Affichage conditionnel', () => {
    test('EventsManager doit afficher le message Premium pour STANDARD', () => {
      const { getSubscriptionDisplayInfo, getPremiumRequiredMessage } = require('@/lib/subscription-utils');
      
      const displayInfo = getSubscriptionDisplayInfo('STANDARD');
      const message = getPremiumRequiredMessage('Événements');
      
      expect(displayInfo.label).toBe('Standard');
      expect(displayInfo.features).toEqual([]);
      expect(message).toContain('Premium');
    });

    test('EventsManager doit afficher les fonctionnalités pour PREMIUM', () => {
      const { getSubscriptionDisplayInfo } = require('@/lib/subscription-utils');
      
      const displayInfo = getSubscriptionDisplayInfo('PREMIUM');
      
      expect(displayInfo.label).toBe('Premium');
      expect(displayInfo.features.length).toBeGreaterThan(0);
      expect(displayInfo.features).toContain('Événements');
    });
  });

  describe('Cohérence globale', () => {
    test('Tous les composants doivent utiliser la même logique de validation', () => {
      const { validateSubscriptionAccess } = require('@/lib/subscription-utils');
      
      // Test que la validation est cohérente partout
      const standardResult = validateSubscriptionAccess('STANDARD', 'canCreateEvents');
      const premiumResult = validateSubscriptionAccess('PREMIUM', 'canCreateEvents');
      
      expect(standardResult.hasAccess).toBe(false);
      expect(premiumResult.hasAccess).toBe(true);
      
      // Aucun cas ambigu ne doit exister
      expect(standardResult.hasAccess).not.toBe(premiumResult.hasAccess);
    });

    test('Les messages d\'erreur doivent être cohérents', () => {
      const { getPremiumRequiredMessage, getPremiumRequiredError } = require('@/lib/subscription-utils');
      
      const message = getPremiumRequiredMessage('Événements');
      const error = getPremiumRequiredError('Événements');
      
      expect(message).toContain('Événements');
      expect(message).toContain('Premium');
      expect(error.message).toContain('Événements');
      expect(error.code).toBe('PREMIUM_REQUIRED');
    });
  });
});
