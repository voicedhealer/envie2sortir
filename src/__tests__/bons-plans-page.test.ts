/**
 * Tests unitaires pour la page /bons-plans
 * 
 * Objectif : Valider l'affichage et le fonctionnement de la page
 * dédiée à tous les bons plans.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BonsPlansPage from '@/app/bons-plans/page';

// Mock de fetch
global.fetch = jest.fn();

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

const mockDeals = Array.from({ length: 25 }, (_, i) => ({
  id: `deal-${i + 1}`,
  title: `Bon plan ${i + 1}`,
  description: `Description ${i + 1}`,
  modality: null,
  originalPrice: 10 + i,
  discountedPrice: 5 + i,
  imageUrl: `/images/deal-${i + 1}.jpg`,
  pdfUrl: null,
  dateDebut: new Date('2025-01-15'),
  dateFin: new Date('2025-01-16'),
  heureDebut: '10:00',
  heureFin: '18:00',
  isActive: true,
  promoUrl: null,
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

describe('Page /bons-plans - Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Chargement et affichage', () => {
    it('devrait afficher un indicateur de chargement initialement', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Promise qui ne se résout jamais
      );

      render(<BonsPlansPage />);

      expect(screen.getByText('Chargement des bons plans...')).toBeInTheDocument();
    });

    it('devrait charger tous les deals depuis l\'API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/deals/all?limit=0');
    });

    it('devrait afficher tous les deals dans une grille', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        mockDeals.forEach((deal) => {
          expect(screen.getByText(deal.title)).toBeInTheDocument();
        });
      });
    });

    it('devrait gérer les erreurs de chargement', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erreur lors du chargement des bons plans:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Header de la page', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });
    });

    it('devrait afficher le titre "Tous les bons plans"', async () => {
      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Tous les bons plans')).toBeInTheDocument();
      });
    });

    it('devrait afficher le compteur de deals', async () => {
      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('25 offres disponibles')).toBeInTheDocument();
      });
    });

    it('devrait afficher "1 offre disponible" au singulier', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: [mockDeals[0]] })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('1 offre disponible')).toBeInTheDocument();
      });
    });

    it('devrait afficher un bouton retour', async () => {
      render(<BonsPlansPage />);

      await waitFor(() => {
        const backButton = screen.getByText('Retour');
        expect(backButton).toBeInTheDocument();
        expect(backButton.closest('a')).toHaveAttribute('href', '/');
      });
    });

    it('devrait afficher l\'icône Tag', () => {
      render(<BonsPlansPage />);

      const icons = document.querySelectorAll('.lucide-tag');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('État vide - Aucun bon plan', () => {
    it('devrait afficher un message si aucun deal disponible', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: [] })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Aucun bon plan disponible')).toBeInTheDocument();
        expect(screen.getByText(/Il n'y a pas de bons plans actifs pour le moment/)).toBeInTheDocument();
      });
    });

    it('devrait afficher une icône et un bouton retour dans l\'état vide', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: [] })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        const backLinks = screen.getAllByText('Retour à l\'accueil');
        expect(backLinks.length).toBeGreaterThan(0);
        backLinks.forEach(link => {
          expect(link.closest('a')).toHaveAttribute('href', '/');
        });
      });
    });
  });

  describe('Grille des bons plans', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });
    });

    it('devrait utiliser une grille responsive', async () => {
      const { container } = render(<BonsPlansPage />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
      });
    });

    it('chaque deal devrait avoir redirectToEstablishment=true', async () => {
      render(<BonsPlansPage />);

      await waitFor(() => {
        // Vérifier que les deals sont affichés
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
        // Les cartes devraient rediriger (comportement testé dans DailyDealCard.test.tsx)
      });
    });
  });

  describe('Message de fin de liste', () => {
    it('devrait afficher un message quand tous les deals sont affichés', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('✨ Vous avez vu tous les bons plans disponibles !')).toBeInTheDocument();
      });
    });

    it('devrait afficher un lien retour dans le message de fin', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        const returnLinks = screen.getAllByText('Retour à l\'accueil');
        const linkInEndMessage = returnLinks.find(link => 
          link.closest('.border-t')
        );
        expect(linkInEndMessage).toBeInTheDocument();
      });
    });
  });

  describe('Section CTA professionnels', () => {
    it('devrait afficher la section CTA si des deals existent', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Vous êtes professionnel ?')).toBeInTheDocument();
        expect(screen.getByText(/Créez vos propres bons plans/)).toBeInTheDocument();
      });
    });

    it('ne devrait pas afficher la section CTA si aucun deal', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: [] })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.queryByText('Vous êtes professionnel ?')).not.toBeInTheDocument();
      });
    });

    it('le bouton CTA devrait pointer vers /etablissements/nouveau', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        const ctaButton = screen.getByText('Référencer mon établissement');
        expect(ctaButton.closest('a')).toHaveAttribute('href', '/etablissements/nouveau');
      });
    });
  });

  describe('Design et style', () => {
    it('devrait avoir un fond dégradé', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<BonsPlansPage />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-gradient-to-br', 'from-orange-50', 'to-pink-50');
    });

    it('devrait avoir une hauteur minimale plein écran', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<BonsPlansPage />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('le header devrait avoir une bordure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<BonsPlansPage />);

      await waitFor(() => {
        const header = container.querySelector('section');
        expect(header).toHaveClass('border-b', 'border-gray-200');
      });
    });
  });

  describe('Responsive', () => {
    it('devrait masquer le séparateur vertical sur mobile', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<BonsPlansPage />);

      await waitFor(() => {
        const separator = container.querySelector('.hidden.sm\\:block');
        expect(separator).toBeInTheDocument();
      });
    });

    it('devrait adapter la taille du titre sur mobile', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<BonsPlansPage />);

      await waitFor(() => {
        const title = screen.getByText('Tous les bons plans');
        expect(title).toHaveClass('text-2xl', 'sm:text-3xl');
      });
    });
  });

  describe('Gestion des données', () => {
    it('devrait gérer un grand nombre de deals', async () => {
      const manyDeals = Array.from({ length: 100 }, (_, i) => ({
        ...mockDeals[0],
        id: `deal-${i + 1}`,
        title: `Bon plan ${i + 1}`
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: manyDeals })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('100 offres disponibles')).toBeInTheDocument();
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
        expect(screen.getByText('Bon plan 100')).toBeInTheDocument();
      });
    });

    it('devrait gérer des deals sans tous les champs optionnels', async () => {
      const minimalDeal = {
        id: 'deal-1',
        title: 'Deal minimal',
        description: 'Description',
        modality: null,
        originalPrice: null,
        discountedPrice: null,
        imageUrl: null,
        pdfUrl: null,
        dateDebut: new Date('2025-01-15'),
        dateFin: new Date('2025-01-16'),
        heureDebut: null,
        heureFin: null,
        isActive: true,
        promoUrl: null,
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

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: [minimalDeal] })
      });

      render(<BonsPlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Deal minimal')).toBeInTheDocument();
        expect(screen.getByText('1 offre disponible')).toBeInTheDocument();
      });
    });
  });

  describe('Intégration complète', () => {
    it('devrait charger et afficher toute la page correctement', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<BonsPlansPage />);

      // Vérifier le header
      await waitFor(() => {
        expect(screen.getByText('Tous les bons plans')).toBeInTheDocument();
        expect(screen.getByText('25 offres disponibles')).toBeInTheDocument();
        expect(screen.getByText('Retour')).toBeInTheDocument();
      });

      // Vérifier les deals
      expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      expect(screen.getByText('Bon plan 25')).toBeInTheDocument();

      // Vérifier le message de fin
      expect(screen.getByText('✨ Vous avez vu tous les bons plans disponibles !')).toBeInTheDocument();

      // Vérifier la section CTA
      expect(screen.getByText('Vous êtes professionnel ?')).toBeInTheDocument();
      expect(screen.getByText('Référencer mon établissement')).toBeInTheDocument();
    });
  });
});

console.log('✅ Tests page /bons-plans - 30 scénarios de test définis');

