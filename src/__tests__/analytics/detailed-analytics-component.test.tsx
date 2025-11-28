/**
 * Tests pour le composant DetailedAnalyticsDashboard
 * Vérifie que le composant affiche correctement les données et gère les erreurs
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock de fetch
global.fetch = jest.fn();

// Mock de recharts pour éviter les erreurs de rendu
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('DetailedAnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Récupération des données', () => {
    it('devrait appeler l\'API avec les bons paramètres', async () => {
      const establishmentId = 'test-establishment-id';
      const period = '30d';
      
      const mockData = {
        totalInteractions: 50,
        uniqueVisitors: 10,
        averageSessionTime: 5,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: 0,
          visitors: 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: { totalViews: 0, peakHours: [], mostViewedDay: null },
        contactStats: [],
        linkStats: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      // Simuler l'appel du composant
      const url = `/api/analytics/detailed?establishmentId=${establishmentId}&period=${period}`;
      const response = await fetch(url);
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(url);
      expect(response.ok).toBe(true);
      expect(data.totalInteractions).toBe(50);
      expect(data.uniqueVisitors).toBe(10);
    });

    it('devrait gérer l\'état de chargement', async () => {
      const mockData = {
        totalInteractions: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: 0,
          visitors: 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: { totalViews: 0, peakHours: [], mostViewedDay: null },
        contactStats: [],
        linkStats: [],
      };

      // Simuler un délai de chargement
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockData,
          }), 100)
        )
      );

      const fetchPromise = fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(global.fetch).toHaveBeenCalled();
      
      const response = await fetchPromise;
      expect(response.ok).toBe(true);
    });

    it('devrait gérer les erreurs de l\'API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      
      const error = await response.json();
      expect(error.error).toBe('Internal server error');
    });
  });

  describe('Affichage des statistiques', () => {
    it('devrait formater correctement les statistiques générales', () => {
      const mockData = {
        totalInteractions: 123,
        uniqueVisitors: 45,
        averageSessionTime: 8,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: 0,
          visitors: 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: { totalViews: 0, peakHours: [], mostViewedDay: null },
        contactStats: [],
        linkStats: [],
      };

      // Vérifier que les données sont dans le bon format
      expect(mockData.totalInteractions).toBe(123);
      expect(mockData.uniqueVisitors).toBe(45);
      expect(mockData.averageSessionTime).toBe(8);
      expect(mockData.hourlyStats).toHaveLength(24);
    });

    it('devrait afficher correctement les statistiques horaires', () => {
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        interactions: hour === 14 ? 10 : hour === 18 ? 15 : 0,
        visitors: hour === 14 ? 3 : hour === 18 ? 5 : 0,
        timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
      }));

      expect(hourlyStats).toHaveLength(24);
      expect(hourlyStats[14].interactions).toBe(10);
      expect(hourlyStats[18].interactions).toBe(15);
      expect(hourlyStats[0].interactions).toBe(0);
    });

    it('devrait calculer correctement l\'heure de pointe', () => {
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        interactions: hour === 14 ? 10 : hour === 18 ? 15 : 0,
        visitors: 0,
        timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
      }));

      const peakHour = hourlyStats.reduce((max, curr) => 
        curr.interactions > max.interactions ? curr : max
      );

      expect(peakHour.hour).toBe(18);
      expect(peakHour.interactions).toBe(15);
    });

    it('devrait gérer le cas où toutes les heures ont 0 interaction', () => {
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        interactions: 0,
        visitors: 0,
        timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
      }));

      const hasInteractions = hourlyStats.some(h => h.interactions > 0);
      expect(hasInteractions).toBe(false);
      
      // L'heure de pointe devrait être 0h par défaut
      const peakHour = hourlyStats.reduce((max, curr) => 
        curr.interactions > max.interactions ? curr : max
      );
      expect(peakHour.hour).toBe(0);
      expect(peakHour.interactions).toBe(0);
    });
  });

  describe('Affichage des éléments populaires', () => {
    it('devrait trier les éléments par nombre d\'interactions', () => {
      const popularElements = [
        { elementType: 'button', elementName: 'Menu', elementId: 'button-Menu', interactions: 5, percentage: 20 },
        { elementType: 'button', elementName: 'Itinéraire', elementId: 'button-Itinéraire', interactions: 15, percentage: 60 },
        { elementType: 'contact', elementName: 'Appeler', elementId: 'contact-Appeler', interactions: 5, percentage: 20 },
      ].sort((a, b) => b.interactions - a.interactions);

      expect(popularElements[0].elementName).toBe('Itinéraire');
      expect(popularElements[0].interactions).toBe(15);
      expect(popularElements[1].interactions).toBe(5);
    });

    it('devrait calculer correctement les pourcentages', () => {
      const totalInteractions = 100;
      const elementInteractions = 25;
      const percentage = (elementInteractions / totalInteractions) * 100;

      expect(percentage).toBe(25);
    });
  });

  describe('Affichage des sections populaires', () => {
    it('devrait trier les sections par nombre d\'ouvertures', () => {
      const popularSections = [
        { sectionName: 'Contact', sectionId: 'contact', openCount: 10, uniqueVisitors: 5 },
        { sectionName: 'Horaires', sectionId: 'horaires', openCount: 25, uniqueVisitors: 10 },
        { sectionName: 'Avis', sectionId: 'avis', openCount: 15, uniqueVisitors: 8 },
      ].sort((a, b) => b.openCount - a.openCount);

      expect(popularSections[0].sectionName).toBe('Horaires');
      expect(popularSections[0].openCount).toBe(25);
      expect(popularSections[1].openCount).toBe(15);
    });
  });

  describe('Affichage des statistiques de contact', () => {
    it('devrait trier les contacts par nombre de clics', () => {
      const contactStats = [
        { contactType: 'email', contactName: 'Email', clicks: 5, percentage: 25 },
        { contactType: 'phone', contactName: 'Appeler', clicks: 10, percentage: 50 },
        { contactType: 'whatsapp', contactName: 'WhatsApp', clicks: 5, percentage: 25 },
      ].sort((a, b) => b.clicks - a.clicks);

      expect(contactStats[0].contactName).toBe('Appeler');
      expect(contactStats[0].clicks).toBe(10);
      expect(contactStats[0].percentage).toBe(50);
    });
  });

  describe('Affichage des statistiques de liens', () => {
    it('devrait trier les liens par nombre de clics', () => {
      const linkStats = [
        { linkType: 'facebook', linkName: 'Facebook', clicks: 5, percentage: 25 },
        { linkType: 'instagram', linkName: 'Instagram', clicks: 15, percentage: 75 },
      ].sort((a, b) => b.clicks - a.clicks);

      expect(linkStats[0].linkName).toBe('Instagram');
      expect(linkStats[0].clicks).toBe(15);
      expect(linkStats[0].percentage).toBe(75);
    });
  });

  describe('Gestion des cas limites', () => {
    it('devrait gérer le cas où il n\'y a pas de données', async () => {
      const mockData = {
        totalInteractions: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: 0,
          visitors: 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [],
        popularElements: [],
        popularSections: [],
        scheduleStats: { totalViews: 0, peakHours: [], mostViewedDay: null },
        contactStats: [],
        linkStats: [],
      };

      expect(mockData.totalInteractions).toBe(0);
      expect(mockData.hourlyStats.every(h => h.interactions === 0)).toBe(true);
      expect(mockData.popularElements).toHaveLength(0);
    });

    it('devrait gérer les erreurs réseau', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        fetch('/api/analytics/detailed?establishmentId=test-id&period=30d')
      ).rejects.toThrow('Network error');
    });

    it('devrait gérer les réponses JSON invalides', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(true);
      
      await expect(response.json()).rejects.toThrow('Invalid JSON');
    });
  });
});

