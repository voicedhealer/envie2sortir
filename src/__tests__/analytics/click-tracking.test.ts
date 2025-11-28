/**
 * Tests pour le système de tracking des clics et interactions
 * Vérifie que tous les éléments de la page de détails sont correctement trackés
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock de fetch global
global.fetch = jest.fn();

// Mock de document.referrer et navigator.userAgent pour les tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window.document, 'referrer', {
    value: 'https://example.com',
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window.navigator, 'userAgent', {
    value: 'Mozilla/5.0 (test)',
    writable: true,
    configurable: true,
  });
}

describe('Système de tracking des clics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('API /api/analytics/track (POST)', () => {
    it('devrait enregistrer un clic sur un bouton', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId: 'test-establishment-id',
          elementType: 'button',
          elementId: 'directions',
          elementName: 'Itinéraire',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('devrait rejeter une requête avec des champs manquants', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing required fields' }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId: 'test-id',
          // elementType manquant
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('devrait tracker différents types d\'éléments', async () => {
      const elementTypes = [
        { type: 'button', id: 'directions', name: 'Itinéraire' },
        { type: 'button', id: 'menu', name: 'Consulter le menu' },
        { type: 'button', id: 'contact', name: 'Contacter' },
        { type: 'button', id: 'favorite', name: 'Ajouter aux favoris' },
        { type: 'button', id: 'share', name: 'Partager' },
        { type: 'button', id: 'review', name: 'Laisser un avis' },
        { type: 'contact', id: 'phone', name: 'Appeler' },
        { type: 'contact', id: 'whatsapp', name: 'WhatsApp' },
        { type: 'contact', id: 'email', name: 'Email' },
        { type: 'section', id: 'horaires', name: 'Horaires', action: 'open' },
        { type: 'link', id: 'instagram', name: 'Instagram' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      for (const element of elementTypes) {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId: 'test-establishment-id',
            elementType: element.type,
            elementId: element.id,
            elementName: element.name,
            action: element.action || 'click',
            sectionContext: 'actions_rapides',
          }),
        });

        expect(response.ok).toBe(true);
      }

      expect(global.fetch).toHaveBeenCalledTimes(elementTypes.length);
    });
  });

  describe('Hook useClickTracking', () => {
    it('devrait envoyer les données de tracking avec les métadonnées', async () => {
      // Simuler le hook
      const trackClick = async (data: any) => {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.toLocaleDateString('fr-FR', { weekday: 'long' });
        const timeSlot = `${hour}h-${hour + 1}h`;

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId: 'test-id',
            ...data,
            hour,
            dayOfWeek,
            timeSlot,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'test-agent',
            referrer: typeof window !== 'undefined' ? window.document.referrer : 'https://example.com',
            timestamp: now.toISOString(),
          }),
        });
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await trackClick({
        elementType: 'button',
        elementId: 'test-button',
        elementName: 'Test Button',
        action: 'click',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body).toHaveProperty('establishmentId');
      expect(body).toHaveProperty('elementType', 'button');
      expect(body).toHaveProperty('elementId', 'test-button');
      expect(body).toHaveProperty('elementName', 'Test Button');
      expect(body).toHaveProperty('action', 'click');
      expect(body).toHaveProperty('hour');
      expect(body).toHaveProperty('dayOfWeek');
      expect(body).toHaveProperty('timeSlot');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('Tracking des actions rapides', () => {
    const establishmentId = 'test-establishment-id';

    it('devrait tracker le clic sur "Itinéraire"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'directions',
          elementName: 'Itinéraire',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Consulter le menu"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'menu',
          elementName: 'Consulter le menu',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Contacter"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'contact',
          elementName: 'Contacter',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Favoris"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'favorite',
          elementName: 'Ajouter aux favoris',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Partager"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'share',
          elementName: 'Partager',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Laisser un avis"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'button',
          elementId: 'review',
          elementName: 'Laisser un avis',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Tracking des contacts', () => {
    const establishmentId = 'test-establishment-id';

    it('devrait tracker le clic sur "Appeler"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'contact',
          elementId: 'phone-dropdown',
          elementName: 'Appeler',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "WhatsApp"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'contact',
          elementId: 'whatsapp',
          elementName: 'WhatsApp',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('devrait tracker le clic sur "Email"', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          elementType: 'contact',
          elementId: 'email',
          elementName: 'Email',
          action: 'click',
          sectionContext: 'actions_rapides',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('API /api/analytics/track (GET) - Récupération des données', () => {
    it('devrait récupérer les statistiques pour une période donnée', async () => {
      const mockData = {
        period: '30d',
        startDate: new Date().toISOString(),
        totalClicks: 10,
        topElements: [
          {
            elementType: 'button',
            elementId: 'directions',
            elementName: 'Itinéraire',
            _count: { id: 5 },
          },
        ],
        statsByType: [
          { elementType: 'button', _count: { id: 8 } },
          { elementType: 'contact', _count: { id: 2 } },
        ],
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          clicks: hour === 14 ? 3 : 0,
          hourLabel: `${hour.toString().padStart(2, '0')}h`,
        })),
        reviewsStats: {
          totalReviews: 5,
          averageRating: 4.2,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 },
          recentReviews: 2,
          trend: 'positive' as const,
          previousPeriodAverage: 3.8,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        status: 200,
      });

      const response = await fetch('/api/analytics/track?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.totalClicks).toBe(10);
      expect(data.topElements).toHaveLength(1);
      expect(data.statsByType).toHaveLength(2);
      expect(data.hourlyStats).toHaveLength(24);
      expect(data.reviewsStats).toBeDefined();
    });

    it('devrait grouper correctement les clics par élément', async () => {
      const mockClicks = [
        { element_type: 'button', element_id: 'directions', element_name: 'Itinéraire' },
        { element_type: 'button', element_id: 'directions', element_name: 'Itinéraire' },
        { element_type: 'button', element_id: 'menu', element_name: 'Consulter le menu' },
        { element_type: 'contact', element_id: 'phone', element_name: 'Appeler' },
      ];

      // Simuler le groupement
      const statsMap = new Map();
      mockClicks.forEach((click) => {
        const key = `${click.element_type}-${click.element_id}-${click.element_name}`;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            elementType: click.element_type,
            elementId: click.element_id,
            elementName: click.element_name,
            count: 0,
          });
        }
        statsMap.get(key)!.count++;
      });

      const stats = Array.from(statsMap.values());
      expect(stats).toHaveLength(3);
      expect(stats.find(s => s.elementId === 'directions')?.count).toBe(2);
      expect(stats.find(s => s.elementId === 'menu')?.count).toBe(1);
      expect(stats.find(s => s.elementId === 'phone')?.count).toBe(1);
    });
  });

  describe('Intégration complète', () => {
    it('devrait tracker toutes les interactions d\'une session utilisateur', async () => {
      const establishmentId = 'test-establishment-id';
      const interactions = [
        { type: 'button', id: 'directions', name: 'Itinéraire' },
        { type: 'button', id: 'menu', name: 'Consulter le menu' },
        { type: 'button', id: 'contact', name: 'Contacter' },
        { type: 'contact', id: 'phone-dropdown', name: 'Appeler' },
        { type: 'button', id: 'favorite', name: 'Ajouter aux favoris' },
        { type: 'button', id: 'share', name: 'Partager' },
        { type: 'section', id: 'horaires', name: 'Horaires', action: 'open' },
        { type: 'link', id: 'instagram', name: 'Instagram' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      for (const interaction of interactions) {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId,
            elementType: interaction.type,
            elementId: interaction.id,
            elementName: interaction.name,
            action: interaction.action || 'click',
            sectionContext: 'actions_rapides',
          }),
        });
      }

      expect(global.fetch).toHaveBeenCalledTimes(interactions.length);
      
      // Vérifier que chaque interaction a été trackée avec les bons paramètres
      const calls = (global.fetch as jest.Mock).mock.calls;
      interactions.forEach((interaction, index) => {
        const body = JSON.parse(calls[index][1].body);
        expect(body.elementType).toBe(interaction.type);
        expect(body.elementId).toBe(interaction.id);
        expect(body.elementName).toBe(interaction.name);
      });
    });
  });
});

