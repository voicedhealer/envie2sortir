/**
 * Tests de scénarios spécifiques pour la recherche par envie
 * Teste tous les cas de figure avec les établissements existants
 */

import { describe, it, expect } from '@jest/globals';

// Données des établissements existants
const establishments = [
  {
    id: 'cmgl8o06w00038zdhat1k1odf',
    name: 'BattleKart Dijon',
    activities: ['karting', 'bar_jeux'],
    tags: [],
    description: 'karting électrique, réalité augmentée et circuit interactif'
  },
  {
    id: 'cmgqlhs1000038zwl8v50t8bg',
    name: 'M\' Beer',
    activities: ['bar_bières'],
    tags: [
      { tag: 'envie de boire un excellent cocktail', poids: 10 },
      { tag: 'envie de danser sur la piste de danse ce soir', poids: 10 },
      { tag: 'envie de dj ce soir', poids: 10 },
      { tag: 'envie de ecouter un concert en buvant une bière', poids: 10 },
      { tag: 'envie de soirée', poids: 3 },
      { tag: 'envie d\'excellence', poids: 3 }
    ],
    description: 'bar à bière XXL, boire un verre entre amis, soirée festive'
  }
];

// Fonction d'extraction des mots-clés
function extractKeywords(envie: string) {
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'manger', 'boire', 'faire', 'découvrir', 'avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux', 'envie', 'sortir', 'aller', 'voir', 'trouver'];
  const contextWords = ['ce', 'soir', 'demain', 'aujourd', 'maintenant', 'bientot', 'plus', 'tard'];
  const actionWords = ['kart', 'karting', 'bowling', 'laser', 'escape', 'game', 'paintball', 'tir', 'archery', 'escalade', 'piscine', 'cinema', 'theatre', 'concert', 'danse', 'danser', 'boire', 'manger', 'restaurant', 'bar', 'cafe'];
  
  const normalizedText = envie.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, ' ');
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
    } else if (actionWords.includes(trimmed)) {
      primaryKeywords.push(trimmed);
      allKeywords.push(trimmed);
    } else if (!stopWords.includes(trimmed)) {
      allKeywords.push(trimmed);
    }
  });
  
  return { keywords: allKeywords, primaryKeywords, contextKeywords };
}

// Fonction de calcul de score
function calculateScore(establishment: any, keywords: string[], primaryKeywords: string[], contextKeywords: string[]) {
  let score = 0;
  
  // Score nom
  const nameNormalized = establishment.name.toLowerCase();
  keywords.forEach(keyword => {
    const isPrimary = primaryKeywords.includes(keyword);
    const isContext = contextKeywords.includes(keyword);
    if (nameNormalized.includes(keyword)) {
      score += isPrimary ? 50 : (isContext ? 5 : 20);
    }
  });
  
  // Score description
  const descriptionNormalized = (establishment.description || '').toLowerCase();
  keywords.forEach(keyword => {
    const isPrimary = primaryKeywords.includes(keyword);
    const isContext = contextKeywords.includes(keyword);
    if (descriptionNormalized.includes(keyword)) {
      score += isPrimary ? 30 : (isContext ? 3 : 10);
    }
  });
  
  // Score activités
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
  
  // Score tags
  establishment.tags.forEach((tag: any) => {
    const tagNormalized = tag.tag.toLowerCase();
    
    primaryKeywords.forEach(keyword => {
      if (tagNormalized.includes(keyword) || keyword.includes(tagNormalized)) {
        score += 150;
      }
    });
    
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

describe('Scénarios de recherche par envie', () => {
  
  describe('Recherches spécifiques - Karting', () => {
    
    it('"faire du kart ce soir" devrait prioriser BattleKart', () => {
      const result = extractKeywords('faire du kart ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(battleKart?.score).toBeGreaterThan(mBeer?.score || 0);
      expect(battleKart?.score).toBeGreaterThan(150);
    });

    it('"faire du karting ce soir" devrait prioriser BattleKart', () => {
      const result = extractKeywords('faire du karting ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(battleKart?.score).toBeGreaterThan(mBeer?.score || 0);
    });

    it('"kart ce soir" devrait prioriser BattleKart', () => {
      const result = extractKeywords('kart ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(battleKart?.score).toBeGreaterThan(mBeer?.score || 0);
    });
  });

  describe('Recherches spécifiques - Bar/Bière', () => {
    
    it('"boire une bière ce soir" devrait prioriser M\'Beer', () => {
      const result = extractKeywords('boire une biere ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(mBeer?.score).toBeGreaterThan(battleKart?.score || 0);
    });

    it('"boire un verre ce soir" devrait prioriser M\'Beer', () => {
      const result = extractKeywords('boire un verre ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(mBeer?.score).toBeGreaterThan(battleKart?.score || 0);
    });

    it('"bar ce soir" devrait prioriser M\'Beer', () => {
      const result = extractKeywords('bar ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      expect(mBeer?.score).toBeGreaterThan(battleKart?.score || 0);
    });
  });

  describe('Recherches mixtes', () => {
    
    it('"faire du kart et boire une bière" devrait scorer les deux', () => {
      const result = extractKeywords('faire du kart et boire une biere');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      // Les deux devraient avoir des scores élevés
      expect(battleKart?.score).toBeGreaterThan(100);
      expect(mBeer?.score).toBeGreaterThan(100);
    });

    it('"sortir ce soir" devrait donner des scores faibles', () => {
      const result = extractKeywords('sortir ce soir');
      const scores = establishments.map(est => ({
        name: est.name,
        score: calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      }));
      
      const battleKart = scores.find(s => s.name === 'BattleKart Dijon');
      const mBeer = scores.find(s => s.name === 'M\' Beer');
      
      // Les scores devraient être faibles car seulement des mots de contexte
      expect(battleKart?.score).toBeLessThan(50);
      expect(mBeer?.score).toBeLessThan(100);
    });
  });

  describe('Recherches avec variations', () => {
    
    it('devrait gérer "KART" en majuscules', () => {
      const result = extractKeywords('faire du KART ce soir');
      expect(result.primaryKeywords).toEqual(['kart']);
    });

    it('devrait gérer "karting" vs "kart"', () => {
      const result1 = extractKeywords('faire du kart ce soir');
      const result2 = extractKeywords('faire du karting ce soir');
      
      expect(result1.primaryKeywords).toEqual(['kart']);
      expect(result2.primaryKeywords).toEqual(['karting']);
    });

    it('devrait gérer les accents', () => {
      const result = extractKeywords('faire du théâtre ce soir');
      expect(result.primaryKeywords).toEqual(['theatre']);
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

    it('devrait gérer les chaînes très longues', () => {
      const longQuery = 'envie de faire du karting ce soir avec des amis et boire une bière après';
      const result = extractKeywords(longQuery);
      expect(result.primaryKeywords).toContain('karting');
      expect(result.primaryKeywords).toContain('boire');
      expect(result.contextKeywords).toContain('ce');
      expect(result.contextKeywords).toContain('soir');
    });
  });

  describe('Tests de performance', () => {
    
    it('devrait traiter rapidement une recherche simple', () => {
      const start = Date.now();
      const result = extractKeywords('faire du kart ce soir');
      const scores = establishments.map(est => 
        calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      );
      const end = Date.now();
      
      expect(end - start).toBeLessThan(10);
      expect(scores).toHaveLength(2);
    });

    it('devrait traiter rapidement une recherche complexe', () => {
      const start = Date.now();
      const result = extractKeywords('envie de faire du karting et boire une bière ce soir avec des amis pour une soirée festive');
      const scores = establishments.map(est => 
        calculateScore(est, result.keywords, result.primaryKeywords, result.contextKeywords)
      );
      const end = Date.now();
      
      expect(end - start).toBeLessThan(20);
      expect(scores).toHaveLength(2);
    });
  });
});
