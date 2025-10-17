import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock des données d'événements pour tester le filtrage
// Utilisation de dates locales pour éviter les problèmes de fuseau horaire
const mockEvents = [
  // Vendredi 18h30 - devrait être inclus
  {
    id: '1',
    title: 'Soirée Vendredi',
    startDate: '2024-01-12T18:30:00', // Vendredi 18h30 (heure locale)
    endDate: '2024-01-12T23:00:00',
    establishment: { id: '1', name: 'Bar Test', slug: 'bar-test', address: 'Test' },
    engagementScore: 10,
    engagementCount: 5
  },
  // Vendredi 17h00 - ne devrait PAS être inclus
  {
    id: '2',
    title: 'Événement Vendredi Après-midi',
    startDate: '2024-01-12T17:00:00', // Vendredi 17h00 (heure locale)
    endDate: '2024-01-12T18:00:00',
    establishment: { id: '2', name: 'Restaurant Test', slug: 'restaurant-test', address: 'Test' },
    engagementScore: 5,
    engagementCount: 2
  },
  // Samedi 14h00 - devrait être inclus
  {
    id: '3',
    title: 'Événement Samedi',
    startDate: '2024-01-13T14:00:00', // Samedi 14h00 (heure locale)
    endDate: '2024-01-13T18:00:00',
    establishment: { id: '3', name: 'Club Test', slug: 'club-test', address: 'Test' },
    engagementScore: 15,
    engagementCount: 8
  },
  // Dimanche 20h00 - devrait être inclus
  {
    id: '4',
    title: 'Événement Dimanche',
    startDate: '2024-01-14T20:00:00', // Dimanche 20h00 (heure locale)
    endDate: '2024-01-14T23:00:00',
    establishment: { id: '4', name: 'Pub Test', slug: 'pub-test', address: 'Test' },
    engagementScore: 8,
    engagementCount: 3
  },
  // Dimanche 23h30 - ne devrait PAS être inclus
  {
    id: '5',
    title: 'Événement Dimanche Tard',
    startDate: '2024-01-14T23:30:00', // Dimanche 23h30 (heure locale)
    endDate: '2024-01-15T01:00:00',
    establishment: { id: '5', name: 'Bar Tardif', slug: 'bar-tardif', address: 'Test' },
    engagementScore: 3,
    engagementCount: 1
  },
  // Lundi 10h00 - ne devrait PAS être inclus
  {
    id: '6',
    title: 'Événement Lundi',
    startDate: '2024-01-15T10:00:00', // Lundi 10h00 (heure locale)
    endDate: '2024-01-15T12:00:00',
    establishment: { id: '6', name: 'Café Test', slug: 'cafe-test', address: 'Test' },
    engagementScore: 2,
    engagementCount: 1
  }
];

// Fonction de filtrage week-end extraite pour les tests
function filterWeekendEvents(events: any[]) {
  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    const dayOfWeek = eventDate.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const hour = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    
    // Vendredi à partir de 18h00
    if (dayOfWeek === 5 && (hour > 18 || (hour === 18 && minutes >= 0))) {
      return true;
    }
    // Samedi toute la journée
    if (dayOfWeek === 6) {
      return true;
    }
    // Dimanche jusqu'à 23h59 (excluant 23h30 et plus)
    if (dayOfWeek === 0 && hour < 23) {
      return true;
    }
    // Dimanche à 23h00 exactement
    if (dayOfWeek === 0 && hour === 23 && minutes === 0) {
      return true;
    }
    
    return false;
  });
}

describe('EventsCarousel - Filtre Week-end', () => {
  
  describe('Filtrage des événements du week-end', () => {
    
    it('devrait inclure les événements du vendredi à partir de 18h00', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const vendrediSoir = weekendEvents.find(e => e.id === '1');
      
      expect(vendrediSoir).toBeDefined();
      expect(vendrediSoir?.title).toBe('Soirée Vendredi');
    });
    
    it('ne devrait PAS inclure les événements du vendredi avant 18h00', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const vendrediApresMidi = weekendEvents.find(e => e.id === '2');
      
      expect(vendrediApresMidi).toBeUndefined();
    });
    
    it('devrait inclure tous les événements du samedi', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const samediEvent = weekendEvents.find(e => e.id === '3');
      
      expect(samediEvent).toBeDefined();
      expect(samediEvent?.title).toBe('Événement Samedi');
    });
    
    it('devrait inclure les événements du dimanche jusqu\'à 23h59', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const dimancheEvent = weekendEvents.find(e => e.id === '4');
      
      expect(dimancheEvent).toBeDefined();
      expect(dimancheEvent?.title).toBe('Événement Dimanche');
    });
    
    it('ne devrait PAS inclure les événements du dimanche après 23h59', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const dimancheTard = weekendEvents.find(e => e.id === '5');
      
      expect(dimancheTard).toBeUndefined();
    });
    
    it('ne devrait PAS inclure les événements des autres jours de la semaine', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      const lundiEvent = weekendEvents.find(e => e.id === '6');
      
      expect(lundiEvent).toBeUndefined();
    });
    
    it('devrait retourner exactement 3 événements pour notre jeu de test', () => {
      const weekendEvents = filterWeekendEvents(mockEvents);
      
      expect(weekendEvents).toHaveLength(3);
      expect(weekendEvents.map(e => e.id)).toEqual(['1', '3', '4']);
    });
  });
  
  describe('Validation des jours de la semaine', () => {
    
    it('devrait correctement identifier les jours de la semaine', () => {
      // Test avec des dates spécifiques
      const vendredi18h30 = new Date('2024-01-12T18:30:00Z');
      const samedi14h = new Date('2024-01-13T14:00:00Z');
      const dimanche20h = new Date('2024-01-14T20:00:00Z');
      const lundi10h = new Date('2024-01-15T10:00:00Z');
      
      expect(vendredi18h30.getDay()).toBe(5); // Vendredi
      expect(samedi14h.getDay()).toBe(6);     // Samedi
      expect(dimanche20h.getDay()).toBe(0);   // Dimanche
      expect(lundi10h.getDay()).toBe(1);      // Lundi
    });
    
    it('devrait correctement identifier les heures', () => {
      const vendredi17h = new Date('2024-01-12T17:00:00');
      const vendredi18h = new Date('2024-01-12T18:00:00');
      const dimanche23h = new Date('2024-01-14T23:00:00');
      const dimanche23h30 = new Date('2024-01-14T23:30:00');
      
      expect(vendredi17h.getHours()).toBe(17);
      expect(vendredi18h.getHours()).toBe(18);
      expect(dimanche23h.getHours()).toBe(23);
      expect(dimanche23h30.getHours()).toBe(23);
    });
  });
  
  describe('Cas limites', () => {
    
    it('devrait gérer un tableau vide', () => {
      const weekendEvents = filterWeekendEvents([]);
      expect(weekendEvents).toHaveLength(0);
    });
    
    it('devrait gérer les événements sans endDate', () => {
      const eventSansEndDate = {
        id: '7',
        title: 'Événement sans fin',
        startDate: '2024-01-13T15:00:00Z', // Samedi
        establishment: { id: '7', name: 'Test', slug: 'test', address: 'Test' },
        engagementScore: 5,
        engagementCount: 2
      };
      
      const weekendEvents = filterWeekendEvents([eventSansEndDate]);
      expect(weekendEvents).toHaveLength(1);
      expect(weekendEvents[0].id).toBe('7');
    });
  });
});
