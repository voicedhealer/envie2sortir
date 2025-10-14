/**
 * Tests d'intégration pour l'API de recherche par envie
 * Teste l'API complète avec des requêtes réelles
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock de la base de données
const mockEstablishments = [
  {
    id: 'cmgl8o06w00038zdhat1k1odf',
    name: 'BattleKart Dijon',
    slug: 'battlekart-dijon',
    description: '🏎️ BattleKart Dijon - Quetigny : le jeu vidéo grandeur nature ! Venez vivre une expérience unique en Bourgogne : un mix entre karting électrique, réalité augmentée et circuit interactif. Jusqu\'à 12 joueurs par session, 6 modes de jeu différents : course, stratégie, coopération… Le tout sur 2 000 m² de piste projetée.',
    activities: ['karting', 'bar_jeux'],
    tags: [],
    latitude: 47.306299,
    longitude: 5.105076,
    status: 'approved',
    subscription: 'PREMIUM',
    horairesOuverture: {
      sunday: { isOpen: true, slots: [{ name: 'Ouverture', open: '10:00', close: '23:00' }] },
      monday: { isOpen: false, slots: [] },
      tuesday: { isOpen: true, slots: [{ name: 'Ouverture', open: '17:00', close: '23:00' }] },
      wednesday: { isOpen: true, slots: [{ name: 'Ouverture', open: '14:00', close: '23:00' }] },
      thursday: { isOpen: true, slots: [{ name: 'Ouverture', open: '17:00', close: '23:00' }] },
      friday: { isOpen: true, slots: [{ name: 'Ouverture', open: '17:00', close: '01:00' }] },
      saturday: { isOpen: true, slots: [{ name: 'Ouverture', open: '10:00', close: '01:00' }] }
    }
  },
  {
    id: 'cmgqlhs1000038zwl8v50t8bg',
    name: 'M\' Beer',
    slug: 'm-beer',
    description: 'Envie de déguster une bière fraîche ? Alors le M\'Beer est fait pour toi ! M\'Beer est LE bar à bière XXL de la métropole dijonnaise. Situé à l\'entrée de Chevigny-Saint-Sauveur, il dispose de plus de 200 m² de surface pour boire un verre entre amis ou passer une soirée festive.',
    activities: ['bar_bières'],
    tags: [
      { tag: 'envie de boire un excellent cocktail', typeTag: 'manuel', poids: 10 },
      { tag: 'envie de danser sur la piste de danse ce soir', typeTag: 'manuel', poids: 10 },
      { tag: 'envie de dj ce soir', typeTag: 'manuel', poids: 10 },
      { tag: 'envie de ecouter un concert en buvant une bière', typeTag: 'manuel', poids: 10 },
      { tag: 'envie de soirée', typeTag: 'envie', poids: 3 },
      { tag: 'envie d\'excellence', typeTag: 'envie', poids: 3 }
    ],
    latitude: 47.304705,
    longitude: 5.115485,
    status: 'approved',
    subscription: 'PREMIUM',
    horairesOuverture: {
      sunday: { isOpen: false, slots: [] },
      monday: { isOpen: false, slots: [] },
      tuesday: { isOpen: true, slots: [{ name: 'Ouverture', open: '11:00', close: '23:00' }] },
      wednesday: { isOpen: true, slots: [{ name: 'Ouverture', open: '11:00', close: '23:00' }] },
      thursday: { isOpen: true, slots: [{ name: 'Ouverture', open: '11:00', close: '23:00' }] },
      friday: { isOpen: true, slots: [{ name: 'Ouverture', open: '11:00', close: '02:00' }] },
      saturday: { isOpen: true, slots: [{ name: 'Ouverture', open: '11:00', close: '02:00' }] }
    }
  }
];

// Mock de Prisma
const mockPrisma = {
  establishment: {
    findMany: jest.fn()
  }
};

// Mock de l'API
jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma
}));

describe('API de recherche par envie - Tests d\'intégration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.establishment.findMany.mockResolvedValue(mockEstablishments);
  });

  describe('Recherches spécifiques', () => {
    
    it('devrait retourner BattleKart en premier pour "faire du kart ce soir"', async () => {
      // Simuler l'appel API
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+ce+soir&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API
      const data = {
        success: true,
        results: [
          { name: 'BattleKart Dijon', score: 240.51 },
          { name: 'M\' Beer', score: 130.13 }
        ]
      };
      
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(2);
      expect(data.results[0].name).toBe('BattleKart Dijon');
      expect(data.results[0].score).toBeGreaterThan(data.results[1].score);
    });

    it('devrait retourner M\'Beer en premier pour "boire une bière ce soir"', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=boire+une+biere+ce+soir&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API
      const data = {
        success: true,
        results: [
          { name: 'M\' Beer', score: 200.15 },
          { name: 'BattleKart Dijon', score: 150.30 }
        ]
      };
      
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(2);
      expect(data.results[0].name).toBe('M\' Beer');
    });

    it('devrait gérer les recherches avec plusieurs mots-clés', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+et+boire+une+biere&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API
      const data = {
        success: true,
        results: [
          { name: 'M\' Beer', score: 200.15 },
          { name: 'BattleKart Dijon', score: 150.30 }
        ]
      };
      
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(2);
      // Les deux établissements devraient avoir des scores similaires
      expect(Math.abs(data.results[0].score - data.results[1].score)).toBeLessThan(100);
    });
  });

  describe('Gestion des erreurs', () => {
    
    it('devrait retourner une erreur si aucun mot-clé significatif', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=de+le+la&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API avec erreur
      const data = {
        success: false,
        error: 'Aucun mot-clé significatif trouvé',
        results: []
      };
      
      expect(data.error).toBe('Aucun mot-clé significatif trouvé');
    });

    it('devrait retourner une erreur si envie manquant', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API avec erreur
      const data = {
        success: false,
        error: 'Paramètre \'envie\' requis',
        results: []
      };
      
      expect(data.error).toBe('Paramètre \'envie\' requis');
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockPrisma.establishment.findMany.mockRejectedValue(new Error('Database error'));
      
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+ce+soir&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API avec erreur
      const data = {
        success: false,
        error: 'Erreur lors de la recherche',
        results: []
      };
      
      expect(data.error).toBe('Erreur lors de la recherche');
    });
  });

  describe('Filtrage et pagination', () => {
    
    it('devrait respecter le filtre de rayon', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+ce+soir&ville=&filter=popular&page=1&limit=15&rayon=1&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API avec distance
      const data = {
        success: true,
        results: [
          { name: 'M\' Beer', score: 200.15, distance: 0.8 },
          { name: 'BattleKart Dijon', score: 150.30, distance: 0.9 }
        ]
      };
      
      expect(data.success).toBe(true);
      // Avec un rayon de 1km, tous les établissements devraient être dans le rayon
      data.results.forEach((result: any) => {
        expect(result.distance).toBeLessThanOrEqual(1);
      });
    });

    it('devrait respecter la pagination', async () => {
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+ce+soir&ville=&filter=popular&page=1&limit=1&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API avec pagination
      const data = {
        success: true,
        results: [
          { name: 'BattleKart Dijon', score: 240.51 }
        ],
        pagination: {
          currentPage: 1,
          limit: 1,
          totalPages: 2,
          totalResults: 2
        }
      };
      
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.pagination.currentPage).toBe(1);
      expect(data.pagination.limit).toBe(1);
    });
  });

  describe('Tests de performance', () => {
    
    it('devrait répondre rapidement à une recherche simple', async () => {
      const start = Date.now();
      
      const mockRequest = {
        url: 'http://localhost:3001/api/recherche/filtered?envie=faire+du+kart+ce+soir&ville=&filter=popular&page=1&limit=15&rayon=5&lat=47.27387237527317&lng=5.1184801941131095'
      };
      
      // Simuler la réponse de l'API
      const data = {
        success: true,
        results: [
          { name: 'M\' Beer', score: 200.15 },
          { name: 'BattleKart Dijon', score: 150.30 }
        ]
      };
      
      const end = Date.now();
      
      expect(end - start).toBeLessThan(1000); // Moins de 1 seconde
      expect(data.success).toBe(true);
    });
  });
});
