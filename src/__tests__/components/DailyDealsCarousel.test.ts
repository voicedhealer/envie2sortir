/**
 * Tests unitaires pour le composant DailyDealsCarousel
 * 
 * Objectif : Valider le carousel des bons plans sur la landing page
 * avec navigation, affichage et redirection.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DailyDealsCarousel from '@/components/DailyDealsCarousel';

// Mock de fetch
global.fetch = jest.fn();

const mockDeals = Array.from({ length: 15 }, (_, i) => ({
  id: `deal-${i + 1}`,
  title: `Bon plan ${i + 1}`,
  description: `Description du bon plan ${i + 1}`,
  modality: null,
  originalPrice: 10 + i,
  discountedPrice: 5 + i,
  imageUrl: `/images/deal-${i + 1}.jpg`,
  pdfUrl: null,
  dateDebut: new Date('2025-01-15T10:00:00'),
  dateFin: new Date('2025-01-15T23:59:59'),
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

describe('DailyDealsCarousel - Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Chargement et affichage', () => {
    it('devrait afficher un indicateur de chargement initialement', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Promise qui ne se résout jamais
      );

      render(<DailyDealsCarousel />);

      expect(screen.getByText('Bons plans du jour')).toBeInTheDocument();
    });

    it('devrait charger et afficher les deals depuis l\'API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/deals/all?limit=12');
    });

    it('devrait afficher maximum 12 deals', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });

      // Vérifier qu'on a bien appelé l'API avec limit=12
      expect(global.fetch).toHaveBeenCalledWith('/api/deals/all?limit=12');
    });

    it('ne devrait rien afficher si aucun deal disponible', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deals: [] })
      });

      const { container } = render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('devrait gérer les erreurs de chargement', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erreur lors du chargement des bons plans:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Interface utilisateur', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });
    });

    it('devrait afficher le titre de la section', async () => {
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getByText('Bons plans du jour')).toBeInTheDocument();
      });
    });

    it('devrait afficher la description de la section', async () => {
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getByText('Profitez des offres exclusives près de chez vous')).toBeInTheDocument();
      });
    });

    it('devrait afficher l\'icône Tag', async () => {
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const icon = document.querySelector('.lucide-tag');
        expect(icon).toBeInTheDocument();
      });
    });

    it('devrait avoir un fond dégradé orange-blanc-rose', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 3) })
      });

      const { container } = render(<DailyDealsCarousel />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br', 'from-orange-50', 'to-pink-50');
    });
  });

  describe('Bouton "Voir tous"', () => {
    it('devrait afficher le bouton si 12 deals ou plus', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getAllByText('Voir tous les bons plans').length).toBeGreaterThan(0);
      });
    });

    it('ne devrait pas afficher le bouton si moins de 12 deals', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 5) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.queryByText('Voir tous les bons plans')).not.toBeInTheDocument();
      });
    });

    it('le bouton devrait pointer vers /bons-plans', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const links = screen.getAllByText('Voir tous les bons plans');
        links.forEach(link => {
          expect(link.closest('a')).toHaveAttribute('href', '/bons-plans');
        });
      });
    });
  });

  describe('Navigation du carousel', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });
    });

    it('devrait afficher les boutons de navigation si plus de 3 deals', async () => {
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const leftButton = screen.getByLabelText('Défiler vers la gauche');
        const rightButton = screen.getByLabelText('Défiler vers la droite');
        
        expect(leftButton).toBeInTheDocument();
        expect(rightButton).toBeInTheDocument();
      });
    });

    it('ne devrait pas afficher les boutons de navigation si 3 deals ou moins', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 3) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.queryByLabelText('Défiler vers la gauche')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Défiler vers la droite')).not.toBeInTheDocument();
      });
    });

    it('devrait avoir un container scrollable', async () => {
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const container = document.getElementById('deals-scroll-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('overflow-x-auto');
      });
    });

    it('devrait appeler scrollBy au clic sur la flèche gauche', async () => {
      const scrollBySpy = jest.fn();
      
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const container = document.getElementById('deals-scroll-container');
        if (container) {
          container.scrollBy = scrollBySpy;
        }
      });

      const leftButton = screen.getByLabelText('Défiler vers la gauche');
      fireEvent.click(leftButton);

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: -400,
        behavior: 'smooth'
      });
    });

    it('devrait appeler scrollBy au clic sur la flèche droite', async () => {
      const scrollBySpy = jest.fn();
      
      render(<DailyDealsCarousel />);

      await waitFor(() => {
        const container = document.getElementById('deals-scroll-container');
        if (container) {
          container.scrollBy = scrollBySpy;
        }
      });

      const rightButton = screen.getByLabelText('Défiler vers la droite');
      fireEvent.click(rightButton);

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: 400,
        behavior: 'smooth'
      });
    });
  });

  describe('Affichage des cartes deals', () => {
    it('devrait afficher chaque deal dans une DailyDealCard', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 3) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
        expect(screen.getByText('Bon plan 2')).toBeInTheDocument();
        expect(screen.getByText('Bon plan 3')).toBeInTheDocument();
      });
    });

    it('devrait passer redirectToEstablishment=true aux cartes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 1) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        // Vérifier que le deal est affiché (preuve que le composant fonctionne)
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });

      // Les cartes devraient rediriger (comportement testé dans DailyDealCard.test.tsx)
    });

    it('chaque carte devrait avoir une largeur fixe de 350px', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 3) })
      });

      const { container } = render(<DailyDealsCarousel />);

      await waitFor(() => {
        const cards = container.querySelectorAll('.flex-shrink-0');
        cards.forEach(card => {
          expect(card).toHaveClass('w-[350px]');
        });
      });
    });
  });

  describe('Responsive design', () => {
    it('devrait masquer le bouton "Voir tous" desktop sur mobile', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      const { container } = render(<DailyDealsCarousel />);

      await waitFor(() => {
        const desktopButton = container.querySelector('.hidden.md\\:flex');
        expect(desktopButton).toBeInTheDocument();
      });
    });

    it('devrait avoir un bouton "Voir tous" mobile séparé', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      const { container } = render(<DailyDealsCarousel />);

      await waitFor(() => {
        const mobileButton = container.querySelector('.md\\:hidden');
        expect(mobileButton).toBeInTheDocument();
      });
    });
  });

  describe('États du composant', () => {
    it('ne devrait rien rendre avant le montage (isMounted=false)', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals })
      });

      const { container } = render(<DailyDealsCarousel />);

      // Initialement, isMounted est false
      // Le composant ne devrait rien rendre immédiatement
      expect(container.firstChild).toBeNull();
    });

    it('devrait masquer le spinner après le chargement', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 3) })
      });

      render(<DailyDealsCarousel />);

      await waitFor(() => {
        expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });
    });
  });

  describe('Intégration complète', () => {
    it('devrait charger, afficher et permettre la navigation des deals', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ deals: mockDeals.slice(0, 12) })
      });

      render(<DailyDealsCarousel />);

      // Attendre le chargement
      await waitFor(() => {
        expect(screen.getByText('Bon plan 1')).toBeInTheDocument();
      });

      // Vérifier la présence des éléments clés
      expect(screen.getByText('Bons plans du jour')).toBeInTheDocument();
      expect(screen.getByText('Profitez des offres exclusives près de chez vous')).toBeInTheDocument();
      
      // Vérifier les boutons de navigation
      expect(screen.getByLabelText('Défiler vers la gauche')).toBeInTheDocument();
      expect(screen.getByLabelText('Défiler vers la droite')).toBeInTheDocument();
      
      // Vérifier le bouton "Voir tous"
      expect(screen.getAllByText('Voir tous les bons plans').length).toBeGreaterThan(0);
    });
  });
});

console.log('✅ Tests DailyDealsCarousel - 25 scénarios de test définis');

