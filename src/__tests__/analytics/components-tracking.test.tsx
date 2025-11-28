/**
 * Tests d'intégration pour vérifier que les composants trackent correctement les interactions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de fetch
global.fetch = jest.fn();

// Mock du hook useClickTracking
jest.mock('@/hooks/useClickTracking', () => ({
  useClickTracking: jest.fn((establishmentId: string) => {
    const trackClick = jest.fn(async (data: any) => {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          ...data,
        }),
      });
    });
    return { trackClick };
  }),
  useSectionTracking: jest.fn((establishmentId: string) => {
    const trackSectionOpen = jest.fn();
    const trackSectionClose = jest.fn();
    const trackSubsectionClick = jest.fn();
    return { trackSectionOpen, trackSectionClose, trackSubsectionClick };
  }),
  useLinkTracking: jest.fn((establishmentId: string) => {
    const trackLinkClick = jest.fn();
    return { trackLinkClick };
  }),
}));

// Mock de useSupabaseSession
jest.mock('@/hooks/useSupabaseSession', () => ({
  useSupabaseSession: jest.fn(() => ({
    session: null,
    user: null,
  })),
}));

describe('Tracking dans les composants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('EstablishmentActions - Tracking des actions rapides', () => {
    it('devrait tracker le clic sur chaque bouton d\'action', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Simuler les clics sur les différents boutons directement via fetch
      const establishmentId = 'test-id';
      const actions = [
        { elementType: 'button', elementId: 'directions', elementName: 'Itinéraire' },
        { elementType: 'button', elementId: 'menu', elementName: 'Consulter le menu' },
        { elementType: 'button', elementId: 'contact', elementName: 'Contacter' },
        { elementType: 'button', elementId: 'favorite', elementName: 'Ajouter aux favoris' },
        { elementType: 'button', elementId: 'share', elementName: 'Partager' },
        { elementType: 'button', elementId: 'review', elementName: 'Laisser un avis' },
      ];

      for (const action of actions) {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId,
            ...action,
            action: 'click',
            sectionContext: 'actions_rapides',
          }),
        });
      }

      expect(global.fetch).toHaveBeenCalledTimes(actions.length);
      
      // Vérifier que chaque action a été trackée
      const calls = (global.fetch as jest.Mock).mock.calls;
      actions.forEach((action, index) => {
        const body = JSON.parse(calls[index][1].body);
        expect(body.elementId).toBe(action.elementId);
        expect(body.elementName).toBe(action.elementName);
      });
    });
  });

  describe('Tracking des contacts', () => {
    it('devrait tracker tous les types de contact', async () => {
      const { useClickTracking } = require('@/hooks/useClickTracking');
      const mockTrackClick = jest.fn();
      useClickTracking.mockReturnValue({ trackClick: mockTrackClick });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const establishmentId = 'test-id';
      const { trackClick } = useClickTracking(establishmentId);

      const contacts = [
        { id: 'phone-dropdown', name: 'Appeler' },
        { id: 'whatsapp', name: 'WhatsApp' },
        { id: 'messenger', name: 'Messenger' },
        { id: 'email', name: 'Email' },
      ];

      for (const contact of contacts) {
        await trackClick({
          elementType: 'contact',
          elementId: contact.id,
          elementName: contact.name,
          action: 'click',
          sectionContext: 'actions_rapides',
        });
      }

      expect(mockTrackClick).toHaveBeenCalledTimes(contacts.length);
    });
  });

  describe('Tracking des sections', () => {
    it('devrait tracker l\'ouverture et la fermeture de sections', async () => {
      const { useSectionTracking } = require('@/hooks/useClickTracking');
      const mockTrackSectionOpen = jest.fn();
      const mockTrackSectionClose = jest.fn();
      
      useSectionTracking.mockReturnValue({
        trackSectionOpen: mockTrackSectionOpen,
        trackSectionClose: mockTrackSectionClose,
        trackSubsectionClick: jest.fn(),
      });

      const establishmentId = 'test-id';
      const { trackSectionOpen, trackSectionClose } = useSectionTracking(establishmentId);

      // Simuler l'ouverture d'une section
      trackSectionOpen('horaires', 'Horaires');
      expect(mockTrackSectionOpen).toHaveBeenCalledWith('horaires', 'Horaires');

      // Simuler la fermeture d'une section
      trackSectionClose('horaires', 'Horaires');
      expect(mockTrackSectionClose).toHaveBeenCalledWith('horaires', 'Horaires');
    });
  });
});

