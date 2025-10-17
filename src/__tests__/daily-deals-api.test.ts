/**
 * Tests unitaires pour l'API /api/deals/all
 * 
 * Objectif : Valider le bon fonctionnement de l'endpoint qui récupère
 * tous les bons plans actifs pour la landing page.
 */

import { GET } from '@/app/api/deals/all/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    dailyDeal: {
      findMany: jest.fn()
    }
  }
}));

// Mock deal-utils
jest.mock('@/lib/deal-utils', () => ({
  isDealActive: jest.fn((deal) => {
    const now = new Date();
    const startDate = new Date(deal.dateDebut);
    const endDate = new Date(deal.dateFin);
    return now >= startDate && now <= endDate && deal.isActive;
  })
}));

describe('API /api/deals/all - Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cas nominal - Récupération des deals', () => {
    it('devrait récupérer les deals actifs avec limite par défaut (12)', async () => {
      const mockDeals = Array.from({ length: 15 }, (_, i) => ({
        id: `deal-${i + 1}`,
        title: `Bon plan ${i + 1}`,
        description: `Description ${i + 1}`,
        modality: null,
        originalPrice: 10,
        discountedPrice: 5,
        imageUrl: `/images/deal-${i + 1}.jpg`,
        pdfUrl: null,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 24 * 60 * 60 * 1000),
        heureDebut: '10:00',
        heureFin: '18:00',
        isActive: true,
        promoUrl: null,
        createdAt: new Date(Date.now() - i * 1000),
        establishmentId: `establishment-${i + 1}`,
        establishment: {
          id: `establishment-${i + 1}`,
          name: `Restaurant ${i + 1}`,
          address: `Adresse ${i + 1}`,
          city: 'Lyon',
          category: 'Restaurant',
          imageUrl: null
        }
      }));

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals.slice(0, 12));

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deals).toHaveLength(12);
      expect(prisma.dailyDeal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 12,
          orderBy: { createdAt: 'desc' }
        })
      );
    });

    it('devrait récupérer tous les deals si limit=0', async () => {
      const mockDeals = Array.from({ length: 25 }, (_, i) => ({
        id: `deal-${i + 1}`,
        title: `Bon plan ${i + 1}`,
        description: `Description ${i + 1}`,
        modality: null,
        originalPrice: 10,
        discountedPrice: 5,
        imageUrl: `/images/deal-${i + 1}.jpg`,
        pdfUrl: null,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 24 * 60 * 60 * 1000),
        heureDebut: '10:00',
        heureFin: '18:00',
        isActive: true,
        promoUrl: null,
        createdAt: new Date(Date.now() - i * 1000),
        establishmentId: `establishment-${i + 1}`,
        establishment: {
          id: `establishment-${i + 1}`,
          name: `Restaurant ${i + 1}`,
          address: `Adresse ${i + 1}`,
          city: 'Lyon',
          category: 'Restaurant',
          imageUrl: null
        }
      }));

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);

      const request = new NextRequest('http://localhost:3000/api/deals/all?limit=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deals).toHaveLength(25);
      expect(data.total).toBe(25);
    });

    it('devrait trier les deals par date de création (plus récents en premier)', async () => {
      const now = Date.now();
      const mockDeals = [
        {
          id: 'deal-old',
          title: 'Vieux deal',
          createdAt: new Date(now - 86400000), // Hier
          dateDebut: new Date(),
          dateFin: new Date(now + 86400000),
          isActive: true,
          establishmentId: 'est-1',
          establishment: { id: 'est-1', name: 'Restaurant 1', address: 'Adresse 1', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        },
        {
          id: 'deal-new',
          title: 'Nouveau deal',
          createdAt: new Date(now), // Maintenant
          dateDebut: new Date(),
          dateFin: new Date(now + 86400000),
          isActive: true,
          establishmentId: 'est-2',
          establishment: { id: 'est-2', name: 'Restaurant 2', address: 'Adresse 2', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        }
      ];

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue([mockDeals[1], mockDeals[0]]);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(data.deals[0].id).toBe('deal-new');
      expect(data.deals[1].id).toBe('deal-old');
    });
  });

  describe('Filtrage des deals actifs', () => {
    it('devrait filtrer les deals inactifs', async () => {
      const mockDeals = [
        {
          id: 'deal-active',
          title: 'Deal actif',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          isActive: true,
          establishmentId: 'est-1',
          establishment: { id: 'est-1', name: 'Restaurant 1', address: 'Adresse 1', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        },
        {
          id: 'deal-inactive',
          title: 'Deal inactif',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          isActive: false,
          establishmentId: 'est-2',
          establishment: { id: 'est-2', name: 'Restaurant 2', address: 'Adresse 2', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        }
      ];

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(data.deals).toHaveLength(1);
      expect(data.deals[0].id).toBe('deal-active');
    });

    it('devrait exclure les deals expirés', async () => {
      const mockDeals = [
        {
          id: 'deal-valid',
          title: 'Deal valide',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          isActive: true,
          establishmentId: 'est-1',
          establishment: { id: 'est-1', name: 'Restaurant 1', address: 'Adresse 1', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        },
        {
          id: 'deal-expired',
          title: 'Deal expiré',
          dateDebut: new Date(Date.now() - 172800000), // -2 jours
          dateFin: new Date(Date.now() - 86400000), // -1 jour
          isActive: true,
          establishmentId: 'est-2',
          establishment: { id: 'est-2', name: 'Restaurant 2', address: 'Adresse 2', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        }
      ];

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(data.deals).toHaveLength(1);
      expect(data.deals[0].id).toBe('deal-valid');
    });

    it('devrait exclure les deals pas encore commencés', async () => {
      const mockDeals = [
        {
          id: 'deal-current',
          title: 'Deal en cours',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          isActive: true,
          establishmentId: 'est-1',
          establishment: { id: 'est-1', name: 'Restaurant 1', address: 'Adresse 1', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        },
        {
          id: 'deal-future',
          title: 'Deal futur',
          dateDebut: new Date(Date.now() + 172800000), // +2 jours
          dateFin: new Date(Date.now() + 259200000), // +3 jours
          isActive: true,
          establishmentId: 'est-2',
          establishment: { id: 'est-2', name: 'Restaurant 2', address: 'Adresse 2', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        }
      ];

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(data.deals).toHaveLength(1);
      expect(data.deals[0].id).toBe('deal-current');
    });
  });

  describe('Cas limites et erreurs', () => {
    it('devrait retourner un tableau vide si aucun deal actif', async () => {
      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deals).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      (prisma.dailyDeal.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erreur serveur');
    });

    it('devrait gérer un limit invalide (négatif)', async () => {
      const mockDeals = [
        {
          id: 'deal-1',
          title: 'Deal 1',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          isActive: true,
          establishmentId: 'est-1',
          establishment: { id: 'est-1', name: 'Restaurant 1', address: 'Adresse 1', city: 'Lyon', category: 'Restaurant', imageUrl: null }
        }
      ];

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/deals/all?limit=-5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deals).toEqual([]);
    });

    it('devrait gérer un limit personnalisé', async () => {
      const mockDeals = Array.from({ length: 20 }, (_, i) => ({
        id: `deal-${i + 1}`,
        title: `Deal ${i + 1}`,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        isActive: true,
        establishmentId: `est-${i + 1}`,
        establishment: { 
          id: `est-${i + 1}`, 
          name: `Restaurant ${i + 1}`, 
          address: `Adresse ${i + 1}`, 
          city: 'Lyon', 
          category: 'Restaurant', 
          imageUrl: null 
        }
      }));

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue(mockDeals.slice(0, 5));

      const request = new NextRequest('http://localhost:3000/api/deals/all?limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deals).toHaveLength(5);
      expect(prisma.dailyDeal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5
        })
      );
    });
  });

  describe('Validation des données retournées', () => {
    it('devrait inclure toutes les informations nécessaires du deal', async () => {
      const mockDeal = {
        id: 'deal-1',
        title: 'Tacos à 3€',
        description: 'Offre spéciale sur les tacos',
        modality: 'Jusqu\'à épuisement des stocks',
        originalPrice: 5,
        discountedPrice: 3,
        imageUrl: '/images/tacos.jpg',
        pdfUrl: null,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        heureDebut: '11:00',
        heureFin: '14:00',
        isActive: true,
        promoUrl: 'https://example.com/promo',
        createdAt: new Date(),
        establishmentId: 'est-1',
        establishment: {
          id: 'est-1',
          name: 'Restaurant Le Bon Goût',
          address: '123 Rue de la Paix',
          city: 'Lyon',
          category: 'Restaurant mexicain',
          imageUrl: '/images/restaurant.jpg'
        }
      };

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue([mockDeal]);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      const deal = data.deals[0];
      expect(deal).toMatchObject({
        id: 'deal-1',
        title: 'Tacos à 3€',
        description: 'Offre spéciale sur les tacos',
        modality: 'Jusqu\'à épuisement des stocks',
        originalPrice: 5,
        discountedPrice: 3,
        imageUrl: '/images/tacos.jpg',
        establishmentId: 'est-1'
      });
      expect(deal.establishment).toMatchObject({
        id: 'est-1',
        name: 'Restaurant Le Bon Goût',
        city: 'Lyon'
      });
    });

    it('devrait gérer les champs optionnels null', async () => {
      const mockDeal = {
        id: 'deal-1',
        title: 'Deal simple',
        description: 'Description simple',
        modality: null,
        originalPrice: null,
        discountedPrice: null,
        imageUrl: null,
        pdfUrl: null,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        heureDebut: null,
        heureFin: null,
        isActive: true,
        promoUrl: null,
        createdAt: new Date(),
        establishmentId: 'est-1',
        establishment: {
          id: 'est-1',
          name: 'Restaurant',
          address: 'Adresse',
          city: 'Lyon',
          category: null,
          imageUrl: null
        }
      };

      (prisma.dailyDeal.findMany as jest.Mock).mockResolvedValue([mockDeal]);

      const request = new NextRequest('http://localhost:3000/api/deals/all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deals).toHaveLength(1);
      expect(data.deals[0].modality).toBeNull();
      expect(data.deals[0].originalPrice).toBeNull();
    });
  });
});

console.log('✅ Tests API /api/deals/all - 15 scénarios de test définis');

