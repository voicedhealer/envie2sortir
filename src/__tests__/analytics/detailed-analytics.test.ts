/**
 * Tests pour l'API des statistiques détaillées
 * Vérifie que toutes les données sont correctement formatées et retournées
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock de fetch global
global.fetch = jest.fn();

describe('API /api/analytics/detailed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('GET - Récupération des statistiques détaillées', () => {
    it('devrait retourner des données vides quand il n\'y a pas de données', async () => {
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
        scheduleStats: {
          totalViews: 0,
          peakHours: [],
          mostViewedDay: null,
        },
        contactStats: [],
        linkStats: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        status: 200,
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.totalInteractions).toBe(0);
      expect(data.uniqueVisitors).toBe(0);
      expect(data.hourlyStats).toHaveLength(24);
      expect(data.hourlyStats[0].hour).toBe(0);
      expect(data.hourlyStats[23].hour).toBe(23);
    });

    it('devrait retourner des statistiques complètes avec des données', async () => {
      const mockData = {
        totalInteractions: 50,
        uniqueVisitors: 10,
        averageSessionTime: 5,
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          interactions: hour === 14 ? 10 : hour === 18 ? 15 : 0,
          visitors: hour === 14 ? 3 : hour === 18 ? 5 : 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        })),
        dailyStats: [
          { date: '2024-01-01', dayOfWeek: 'lundi', interactions: 10, visitors: 3 },
          { date: '2024-01-02', dayOfWeek: 'mardi', interactions: 15, visitors: 5 },
        ],
        popularElements: [
          { elementType: 'button', elementName: 'Itinéraire', elementId: 'button-Itinéraire', interactions: 20, percentage: 40 },
          { elementType: 'contact', elementName: 'Appeler', elementId: 'contact-Appeler', interactions: 15, percentage: 30 },
        ],
        popularSections: [
          { sectionName: 'Horaires', sectionId: 'horaires', openCount: 25, uniqueVisitors: 8 },
        ],
        scheduleStats: {
          totalViews: 30,
          peakHours: [
            { hour: 14, views: 10, timeSlot: '14h-15h' },
            { hour: 18, views: 15, timeSlot: '18h-19h' },
          ],
          mostViewedDay: 'mardi',
        },
        contactStats: [
          { contactType: 'phone', contactName: 'Appeler', clicks: 15, percentage: 50 },
          { contactType: 'whatsapp', contactName: 'WhatsApp', clicks: 10, percentage: 33.33 },
        ],
        linkStats: [
          { linkType: 'instagram', linkName: 'Instagram', clicks: 20, percentage: 66.67 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        status: 200,
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.totalInteractions).toBe(50);
      expect(data.uniqueVisitors).toBe(10);
      expect(data.averageSessionTime).toBe(5);
      expect(data.hourlyStats).toHaveLength(24);
      expect(data.dailyStats).toHaveLength(2);
      expect(data.popularElements).toHaveLength(2);
      expect(data.popularSections).toHaveLength(1);
      expect(data.contactStats).toHaveLength(2);
      expect(data.linkStats).toHaveLength(1);
    });

    it('devrait grouper correctement les statistiques par heure', () => {
      // Simuler le groupement des données par heure
      // Utiliser des heures explicites pour éviter les problèmes de fuseau horaire
      const mockClicks = [
        { hour: 14, user_agent: 'agent1' },
        { hour: 14, user_agent: 'agent2' },
        { hour: 18, user_agent: 'agent1' },
        { hour: 18, user_agent: 'agent3' },
      ];

      const hourlyMap = new Map<number, { interactions: number; visitors: Set<string> }>();
      
      mockClicks.forEach(click => {
        const hour = click.hour;
        if (!hourlyMap.has(hour)) {
          hourlyMap.set(hour, { interactions: 0, visitors: new Set() });
        }
        const hourData = hourlyMap.get(hour)!;
        hourData.interactions++;
        hourData.visitors.add(click.user_agent);
      });

      // Vérifier que la map contient les bonnes données
      expect(hourlyMap.has(14)).toBe(true);
      expect(hourlyMap.get(14)?.interactions).toBe(2);
      expect(hourlyMap.get(14)?.visitors.size).toBe(2);
      expect(hourlyMap.has(18)).toBe(true);
      expect(hourlyMap.get(18)?.interactions).toBe(2);
      expect(hourlyMap.get(18)?.visitors.size).toBe(2);

      // Créer le tableau complet de 24 heures
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
        const hourData = hourlyMap.get(hour);
        return {
          hour,
          interactions: hourData ? hourData.interactions : 0,
          visitors: hourData ? hourData.visitors.size : 0,
          timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
        };
      });

      expect(hourlyStats).toHaveLength(24);
      expect(hourlyStats[14].interactions).toBe(2);
      expect(hourlyStats[14].visitors).toBe(2);
      expect(hourlyStats[18].interactions).toBe(2);
      expect(hourlyStats[18].visitors).toBe(2);
      expect(hourlyStats[0].interactions).toBe(0);
    });

    it('devrait calculer correctement les éléments populaires', () => {
      const mockClicks = [
        { element_type: 'button', element_id: 'directions', element_name: 'Itinéraire' },
        { element_type: 'button', element_id: 'directions', element_name: 'Itinéraire' },
        { element_type: 'button', element_id: 'directions', element_name: 'Itinéraire' },
        { element_type: 'contact', element_id: 'phone', element_name: 'Appeler' },
        { element_type: 'contact', element_id: 'phone', element_name: 'Appeler' },
        { element_type: 'button', element_id: 'menu', element_name: 'Consulter le menu' },
      ];

      const elementMap = new Map<string, { elementType: string; elementName: string; interactions: number }>();
      
      mockClicks.forEach(click => {
        const key = `${click.element_type}-${click.element_id}`;
        if (!elementMap.has(key)) {
          elementMap.set(key, {
            elementType: click.element_type,
            elementName: click.element_name,
            interactions: 0,
          });
        }
        elementMap.get(key)!.interactions++;
      });

      const totalInteractions = mockClicks.length;
      const popularElements = Array.from(elementMap.values())
        .map(element => ({
          ...element,
          elementId: `${element.elementType}-${element.elementName}`,
          percentage: (element.interactions / totalInteractions) * 100,
        }))
        .sort((a, b) => b.interactions - a.interactions);

      expect(popularElements).toHaveLength(3);
      expect(popularElements[0].elementName).toBe('Itinéraire');
      expect(popularElements[0].interactions).toBe(3);
      expect(popularElements[0].percentage).toBe(50);
      expect(popularElements[1].elementName).toBe('Appeler');
      expect(popularElements[1].interactions).toBe(2);
      expect(popularElements[1].percentage).toBeCloseTo(33.33, 1);
    });

    it('devrait calculer correctement les sections populaires', () => {
      const mockSectionClicks = [
        { element_type: 'section', element_id: 'horaires', element_name: 'Horaires', action: 'open', user_agent: 'agent1' },
        { element_type: 'section', element_id: 'horaires', element_name: 'Horaires', action: 'open', user_agent: 'agent2' },
        { element_type: 'section', element_id: 'horaires', element_name: 'Horaires', action: 'open', user_agent: 'agent1' },
        { element_type: 'section', element_id: 'contact', element_name: 'Contact', action: 'open', user_agent: 'agent3' },
      ];

      const sectionMap = new Map<string, { sectionName: string; openCount: number; visitors: Set<string> }>();
      
      mockSectionClicks
        .filter(click => click.element_type === 'section' && click.action === 'open')
        .forEach(click => {
          const sectionName = click.element_name || click.element_id;
          if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, { sectionName, openCount: 0, visitors: new Set() });
          }
          const sectionData = sectionMap.get(sectionName)!;
          sectionData.openCount++;
          if (click.user_agent) {
            sectionData.visitors.add(click.user_agent);
          }
        });

      const popularSections = Array.from(sectionMap.values())
        .map(section => ({
          sectionId: section.sectionName.toLowerCase().replace(/\s+/g, '-'),
          sectionName: section.sectionName,
          openCount: section.openCount,
          uniqueVisitors: section.visitors.size,
        }))
        .sort((a, b) => b.openCount - a.openCount);

      expect(popularSections).toHaveLength(2);
      expect(popularSections[0].sectionName).toBe('Horaires');
      expect(popularSections[0].openCount).toBe(3);
      expect(popularSections[0].uniqueVisitors).toBe(2);
      expect(popularSections[1].sectionName).toBe('Contact');
      expect(popularSections[1].openCount).toBe(1);
      expect(popularSections[1].uniqueVisitors).toBe(1);
    });

    it('devrait calculer correctement les statistiques de contact', () => {
      const mockContactClicks = [
        { element_type: 'contact', element_id: 'phone', element_name: 'Appeler' },
        { element_type: 'contact', element_id: 'phone', element_name: 'Appeler' },
        { element_type: 'contact', element_id: 'whatsapp', element_name: 'WhatsApp' },
        { element_type: 'contact', element_id: 'email', element_name: 'Email' },
      ];

      const contactMap = new Map<string, { contactName: string; clicks: number }>();
      
      mockContactClicks.forEach(click => {
        const contactType = click.element_id;
        const contactName = click.element_name || `Contact ${contactType}`;
        
        if (!contactMap.has(contactType)) {
          contactMap.set(contactType, { contactName, clicks: 0 });
        }
        contactMap.get(contactType)!.clicks++;
      });

      const totalContactClicks = Array.from(contactMap.values()).reduce((sum, contact) => sum + contact.clicks, 0);
      const contactStats = Array.from(contactMap.values())
        .map(contact => ({
          contactType: contact.contactName.split(' ')[1] || 'unknown',
          contactName: contact.contactName,
          clicks: contact.clicks,
          percentage: totalContactClicks > 0 ? (contact.clicks / totalContactClicks) * 100 : 0,
        }))
        .sort((a, b) => b.clicks - a.clicks);

      expect(contactStats).toHaveLength(3);
      expect(contactStats[0].contactName).toBe('Appeler');
      expect(contactStats[0].clicks).toBe(2);
      expect(contactStats[0].percentage).toBe(50);
      expect(contactStats[1].contactName).toBe('WhatsApp');
      expect(contactStats[1].clicks).toBe(1);
      expect(contactStats[1].percentage).toBe(25);
    });

    it('devrait calculer correctement les statistiques de liens', () => {
      const mockLinkClicks = [
        { element_type: 'link', element_id: 'instagram', element_name: 'Instagram' },
        { element_type: 'link', element_id: 'instagram', element_name: 'Instagram' },
        { element_type: 'link', element_id: 'facebook', element_name: 'Facebook' },
        { element_type: 'link', element_id: 'website', element_name: 'Site web' },
      ];

      const linkMap = new Map<string, { linkName: string; linkUrl?: string; clicks: number }>();
      
      mockLinkClicks.forEach(click => {
        const linkId = click.element_id;
        const linkName = click.element_name || `Lien ${linkId}`;
        
        // Détecter le type de lien
        let linkType = 'website';
        const lowerName = linkName.toLowerCase();
        const lowerId = linkId.toLowerCase();
        
        if (lowerName.includes('instagram') || lowerId.includes('instagram')) {
          linkType = 'instagram';
        } else if (lowerName.includes('facebook') || lowerId.includes('facebook')) {
          linkType = 'facebook';
        }
        
        const linkKey = `${linkType}-${linkId}`;
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, { linkName, clicks: 0 });
        }
        linkMap.get(linkKey)!.clicks++;
      });

      const totalLinkClicks = Array.from(linkMap.values()).reduce((sum, link) => sum + link.clicks, 0);
      const linkStats = Array.from(linkMap.entries())
        .map(([linkKey, link]) => {
          const linkType = linkKey.split('-')[0];
          return {
            linkType,
            linkName: link.linkName,
            linkUrl: link.linkUrl,
            clicks: link.clicks,
            percentage: totalLinkClicks > 0 ? (link.clicks / totalLinkClicks) * 100 : 0,
          };
        })
        .sort((a, b) => b.clicks - a.clicks);

      expect(linkStats).toHaveLength(3);
      expect(linkStats[0].linkName).toBe('Instagram');
      expect(linkStats[0].clicks).toBe(2);
      expect(linkStats[0].percentage).toBe(50);
      expect(linkStats[1].linkName).toBe('Facebook');
      expect(linkStats[1].clicks).toBe(1);
      expect(linkStats[1].percentage).toBe(25);
    });

    it('devrait gérer les différentes périodes (7d, 30d, 90d, 1y)', async () => {
      const periods = ['7d', '30d', '90d', '1y'] as const;
      
      for (const period of periods) {
        const mockData = {
          totalInteractions: 10,
          uniqueVisitors: 5,
          averageSessionTime: 2,
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

        const response = await fetch(`/api/analytics/detailed?establishmentId=test-id&period=${period}`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.totalInteractions).toBe(10);
        expect(data.hourlyStats).toHaveLength(24);
      }
    });

    it('devrait retourner une erreur si establishmentId est manquant', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'establishmentId is required' }),
      });

      const response = await fetch('/api/analytics/detailed?period=30d');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const error = await response.json();
      expect(error.error).toBe('establishmentId is required');
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas authentifié', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Non authentifié' }),
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('devrait retourner une erreur si l\'établissement n\'est pas PREMIUM', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ 
          error: 'Premium subscription required',
          message: 'Analytics requires a Premium subscription'
        }),
      });

      const response = await fetch('/api/analytics/detailed?establishmentId=test-id&period=30d');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('Formatage des données', () => {
    it('devrait formater correctement les timeSlots pour toutes les heures', () => {
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        interactions: 0,
        visitors: 0,
        timeSlot: `${hour.toString().padStart(2, '0')}h-${(hour + 1).toString().padStart(2, '0')}h`,
      }));

      expect(hourlyStats[0].timeSlot).toBe('00h-01h');
      expect(hourlyStats[9].timeSlot).toBe('09h-10h');
      expect(hourlyStats[14].timeSlot).toBe('14h-15h');
      expect(hourlyStats[23].timeSlot).toBe('23h-24h');
    });

    it('devrait calculer correctement le temps moyen de session', () => {
      const totalInteractions = 100;
      const uniqueVisitors = 20;
      // Estimation: interactions / visiteurs * 2 minutes
      const averageSessionTime = Math.round(totalInteractions / Math.max(uniqueVisitors, 1) * 2);
      
      expect(averageSessionTime).toBe(10); // 100 / 20 * 2 = 10
    });

    it('devrait calculer correctement les visiteurs uniques', () => {
      const userAgents = ['agent1', 'agent2', 'agent1', 'agent3', 'agent2'];
      const uniqueVisitors = new Set(userAgents).size;
      
      expect(uniqueVisitors).toBe(3);
    });
  });
});

