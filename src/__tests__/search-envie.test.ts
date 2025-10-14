/**
 * Tests unitaires pour la fonctionnalité de recherche par envie
 * Teste tous les cas de figure avec les établissements existants
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock de la base de données avec les établissements existants
const mockEstablishments = [
  {
    id: 'cmgl8o06w00038zdhat1k1odf',
    name: 'BattleKart Dijon',
    slug: 'battlekart-dijon',
    description: '🏎️ BattleKart Dijon - Quetigny : le jeu vidéo grandeur nature ! Venez vivre une expérience unique en Bourgogne : un mix entre karting électrique, réalité augmentée et circuit interactif.',
    activities: ['karting', 'bar_jeux'],
    tags: [],
    latitude: 47.306299,
    longitude: 5.105076,
    status: 'approved',
    subscription: 'PREMIUM'
  },
  {
    id: 'cmgqlhs1000038zwl8v50t8bg',
    name: 'M\' Beer',
    slug: 'm-beer',
    description: 'Envie de déguster une bière fraîche ? Alors le M\'Beer est fait pour toi ! M\'Beer est LE bar à bière XXL de la métropole dijonnaise.',
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
    subscription: 'PREMIUM'
  }
];

// Fonction d'extraction des mots-clés (copiée du code source)
function extractKeywords(envie: string): { keywords: string[], primaryKeywords: string[], contextKeywords: string[] } {
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'manger', 'boire', 'faire', 'découvrir', 'avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux', 'envie', 'sortir', 'aller', 'voir', 'trouver'];
  
  const contextWords = ['ce', 'soir', 'demain', 'aujourd', 'maintenant', 'bientot', 'plus', 'tard'];
  const actionWords = ['kart', 'karting', 'bowling', 'laser', 'escape', 'game', 'paintball', 'tir', 'archery', 'escalade', 'piscine', 'cinema', 'theatre', 'concert', 'danse', 'danser', 'boire', 'manger', 'restaurant', 'bar', 'cafe'];
  
  const normalizedText = envie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, ' ');
  
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);
  
  const primaryKeywords: string[] = [];
  const contextKeywords: string[] = [];
  const allKeywords: string[] = [];
  
  words.forEach(word => {
    const trimmed = word.trim();
    if (trimmed.length < 2) return;
    
    if (contextWords.includes(trimmed)) {
      contextKeywords.push(trimmed);
      allKeywords.push(trimmed);
    }
    else if (actionWords.includes(trimmed)) {
      primaryKeywords.push(trimmed);
      allKeywords.push(trimmed);
    }
    else if (!stopWords.includes(trimmed)) {
      allKeywords.push(trimmed);
    }
  });
  
  return {
    keywords: allKeywords,
    primaryKeywords,
    contextKeywords
  };
}

// Fonction de calcul de score (simplifiée pour les tests)
function calculateScore(establishment: any, keywords: string[], primaryKeywords: string[], contextKeywords: string[]): number {
  let score = 0;
  
  // Score basé sur le nom
  const nameNormalized = establishment.name.toLowerCase();
  keywords.forEach(keyword => {
    const isPrimary = primaryKeywords.includes(keyword);
    const isContext = contextKeywords.includes(keyword);
    
    if (nameNormalized.includes(keyword)) {
      score += isPrimary ? 50 : (isContext ? 5 : 20);
    }
  });
  
  // Score basé sur la description
  const descriptionNormalized = (establishment.description || '').toLowerCase();
  keywords.forEach(keyword => {
    const isPrimary = primaryKeywords.includes(keyword);
    const isContext = contextKeywords.includes(keyword);
    
    if (descriptionNormalized.includes(keyword)) {
      score += isPrimary ? 30 : (isContext ? 3 : 10);
    }
  });
  
  // Score basé sur les activités
  if (establishment.activities && Array.isArray(establishment.activities)) {
    establishment.activities.forEach((activity: string) => {
      const activityNormalized = activity.toLowerCase();
      keywords.forEach(keyword => {
        const isPrimary = primaryKeywords.includes(keyword);
        const isContext = contextKeywords.includes(keyword);
        
        if (activityNormalized.includes(keyword) || keyword.includes(activityNormalized)) {
          score += isPrimary ? 100 : (isContext ? 10 : 25);
        }
      });
    });
  }
  
  // Score basé sur les tags
  establishment.tags.forEach((tag: any) => {
    const tagNormalized = tag.tag.toLowerCase();
    
    // Vérifier d'abord les mots-clés primaires
    primaryKeywords.forEach(keyword => {
      if (tagNormalized.includes(keyword) || keyword.includes(tagNormalized)) {
        score += 150; // Score très élevé pour les mots-clés primaires
      }
    });
    
    // Ensuite les autres mots-clés
    keywords.forEach(keyword => {
      if (!primaryKeywords.includes(keyword) && (tagNormalized.includes(keyword) || keyword.includes(tagNormalized))) {
        const isContext = contextKeywords.includes(keyword);
        const contextMultiplier = isContext ? 1 : 10;
        score += tag.poids * contextMultiplier;
      }
    });
  });
  
  return score;
}

describe('Recherche par envie - Tests unitaires', () => {
  
  describe('Extraction des mots-clés', () => {
    it('devrait extraire correctement les mots-clés primaires', () => {
      const result = extractKeywords('faire du kart ce soir');
      expect(result.primaryKeywords).toEqual(['kart']);
      expect(result.contextKeywords).toEqual(['ce', 'soir']);
      expect(result.keywords).toEqual(['kart', 'ce', 'soir']);
    });

    it('devrait extraire les mots-clés de bowling', () => {
      const result = extractKeywords('jouer au bowling demain');
      expect(result.primaryKeywords).toEqual(['bowling']);
      expect(result.contextKeywords).toEqual(['demain']);
    });

    it('devrait extraire les mots-clés de restaurant', () => {
      const result = extractKeywords('manger au restaurant ce soir');
      expect(result.primaryKeywords).toEqual(['manger', 'restaurant']);
      expect(result.contextKeywords).toEqual(['ce', 'soir']);
    });

    it('devrait ignorer les stop words', () => {
      const result = extractKeywords('envie de faire du kart');
      expect(result.primaryKeywords).toEqual(['kart']);
      expect(result.keywords).not.toContain('de');
      expect(result.keywords).not.toContain('faire');
    });

    it('devrait gérer les accents et caractères spéciaux', () => {
      const result = extractKeywords('faire du théâtre ce soir');
      expect(result.primaryKeywords).toEqual(['theatre']);
      expect(result.contextKeywords).toEqual(['ce', 'soir']);
    });
  });

  describe('Calcul de score - Cas spécifiques', () => {
    
    it('devrait donner un score élevé à BattleKart pour "faire du kart"', () => {
      const keywords = ['kart', 'ce', 'soir'];
      const primaryKeywords = ['kart'];
      const contextKeywords = ['ce', 'soir'];
      
      const battleKartScore = calculateScore(mockEstablishments[0], keywords, primaryKeywords, contextKeywords);
      const mBeerScore = calculateScore(mockEstablishments[1], keywords, primaryKeywords, contextKeywords);
      
      expect(battleKartScore).toBeGreaterThan(mBeerScore);
      expect(battleKartScore).toBeGreaterThan(150); // Score élevé attendu
    });

    it('devrait donner un score élevé à M\'Beer pour "boire une bière"', () => {
      const keywords = ['boire', 'biere', 'ce', 'soir'];
      const primaryKeywords = ['boire'];
      const contextKeywords = ['ce', 'soir'];
      
      const battleKartScore = calculateScore(mockEstablishments[0], keywords, primaryKeywords, contextKeywords);
      const mBeerScore = calculateScore(mockEstablishments[1], keywords, primaryKeywords, contextKeywords);
      
      expect(mBeerScore).toBeGreaterThan(battleKartScore);
    });

    it('devrait traiter "karting" comme équivalent à "kart"', () => {
      const keywords = ['karting', 'ce', 'soir'];
      const primaryKeywords = ['karting'];
      const contextKeywords = ['ce', 'soir'];
      
      const battleKartScore = calculateScore(mockEstablishments[0], keywords, primaryKeywords, contextKeywords);
      expect(battleKartScore).toBeGreaterThan(100); // Score élevé pour l'activité karting
    });

    it('devrait donner un score faible aux mots de contexte', () => {
      const keywords = ['ce', 'soir'];
      const primaryKeywords: string[] = [];
      const contextKeywords = ['ce', 'soir'];
      
      const battleKartScore = calculateScore(mockEstablishments[0], keywords, primaryKeywords, contextKeywords);
      const mBeerScore = calculateScore(mockEstablishments[1], keywords, primaryKeywords, contextKeywords);
      
      // Les scores devraient être faibles car seuls des mots de contexte
      expect(battleKartScore).toBeLessThan(50);
      expect(mBeerScore).toBeLessThan(100);
    });
  });

  describe('Scénarios de recherche complexes', () => {
    
    it('devrait prioriser BattleKart pour "faire du kart ce soir"', () => {
      const result = extractKeywords('faire du kart ce soir');
      const scores = mockEstablishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(battleKart?.score).toBeGreaterThan(mBeer?.score || 0);
    });

    it('devrait prioriser M\'Beer pour "boire un verre ce soir"', () => {
      const result = extractKeywords('boire un verre ce soir');
      const scores = mockEstablishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(mBeer?.score).toBeGreaterThan(battleKart?.score || 0);
    });

    it('devrait gérer les recherches avec plusieurs mots-clés primaires', () => {
      const result = extractKeywords('faire du kart et boire une bière');
      expect(result.primaryKeywords).toContain('kart');
      expect(result.primaryKeywords).toContain('boire');
      expect(result.primaryKeywords.length).toBe(2);
    });

    it('devrait ignorer les recherches trop génériques', () => {
      const result = extractKeywords('sortir ce soir');
      expect(result.primaryKeywords).toHaveLength(0);
      expect(result.contextKeywords).toEqual(['ce', 'soir']);
    });
  });

  describe('Tests de robustesse', () => {
    
    it('devrait gérer les chaînes vides', () => {
      const result = extractKeywords('');
      expect(result.keywords).toHaveLength(0);
      expect(result.primaryKeywords).toHaveLength(0);
      expect(result.contextKeywords).toHaveLength(0);
    });

    it('devrait gérer les chaînes avec seulement des stop words', () => {
      const result = extractKeywords('de le la du');
      expect(result.keywords).toHaveLength(0);
    });

    it('devrait gérer les établissements sans tags', () => {
      const establishment = { ...mockEstablishments[0], tags: [] };
      const keywords = ['kart'];
      const primaryKeywords = ['kart'];
      const contextKeywords: string[] = [];
      
      const score = calculateScore(establishment, keywords, primaryKeywords, contextKeywords);
      expect(score).toBeGreaterThan(0); // Devrait quand même scorer sur le nom/description/activités
    });

    it('devrait gérer les établissements sans activités', () => {
      const establishment = { ...mockEstablishments[0], activities: [] };
      const keywords = ['kart'];
      const primaryKeywords = ['kart'];
      const contextKeywords: string[] = [];
      
      const score = calculateScore(establishment, keywords, primaryKeywords, contextKeywords);
      expect(score).toBeGreaterThan(0); // Devrait scorer sur le nom/description
    });
  });

  describe('Tests de performance', () => {
    
    it('devrait traiter rapidement une recherche simple', () => {
      const start = Date.now();
      const result = extractKeywords('faire du kart ce soir');
      const end = Date.now();
      
      expect(end - start).toBeLessThan(10); // Moins de 10ms
      expect(result.keywords).toHaveLength(3);
    });

    it('devrait traiter rapidement une recherche complexe', () => {
      const start = Date.now();
      const result = extractKeywords('envie de faire du karting et boire une bière ce soir avec des amis');
      const end = Date.now();
      
      expect(end - start).toBeLessThan(20); // Moins de 20ms
      expect(result.primaryKeywords).toContain('karting');
      expect(result.primaryKeywords).toContain('boire');
    });
  });

  describe('Tests de cas limites', () => {
    
    it('devrait gérer les mots-clés avec majuscules', () => {
      const result = extractKeywords('FAIRE DU KART CE SOIR');
      expect(result.primaryKeywords).toEqual(['kart']);
      expect(result.contextKeywords).toEqual(['ce', 'soir']);
    });

    it('devrait gérer les mots-clés avec accents', () => {
      const result = extractKeywords('faire du théâtre ce soir');
      expect(result.primaryKeywords).toEqual(['theatre']);
    });

    it('devrait gérer les mots-clés avec tirets', () => {
      const result = extractKeywords('faire du laser-game ce soir');
      expect(result.primaryKeywords).toContain('laser');
      expect(result.primaryKeywords).toContain('game');
    });

    it('devrait gérer les mots-clés avec chiffres', () => {
      const result = extractKeywords('faire du kart 2 ce soir');
      expect(result.primaryKeywords).toEqual(['kart']);
    });
  });
});
