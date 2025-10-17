/**
 * Tests unitaires pour le composant DailyDealCard
 * 
 * Objectif : Valider le comportement de la carte bon plan avec 
 * redirection vs modal selon le contexte d'utilisation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DailyDealCard from '@/components/DailyDealCard';

// Mock du router Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock de fetch pour l'engagement
global.fetch = jest.fn();

const mockDeal = {
  id: 'deal-1',
  title: 'Tacos à 3€',
  description: 'Profitez de nos tacos à prix réduit jusqu\'à épuisement des stocks',
  modality: 'Jusqu\'à épuisement des stocks',
  originalPrice: 5,
  discountedPrice: 3,
  imageUrl: '/images/tacos.jpg',
  pdfUrl: null,
  dateDebut: new Date('2025-01-15T10:00:00'),
  dateFin: new Date('2025-01-15T23:59:59'),
  heureDebut: '11:00',
  heureFin: '14:00',
  isActive: true,
  promoUrl: 'https://example.com/promo'
};

describe('DailyDealCard - Tests unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  describe('Affichage de base', () => {
    it('devrait afficher les informations principales du deal', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('Tacos à 3€')).toBeInTheDocument();
      expect(screen.getByText(/Profitez de nos tacos/)).toBeInTheDocument();
      expect(screen.getByText('3,00 €')).toBeInTheDocument();
      expect(screen.getByText('5,00 €')).toBeInTheDocument();
    });

    it('devrait afficher le badge "BON PLAN DU JOUR"', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('🎯 BON PLAN DU JOUR')).toBeInTheDocument();
    });

    it('devrait afficher l\'image si fournie', () => {
      render(<DailyDealCard deal={mockDeal} />);

      const image = screen.getByAltText('Tacos à 3€');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/tacos.jpg');
    });

    it('devrait calculer et afficher le pourcentage de réduction', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('-40%')).toBeInTheDocument();
    });

    it('devrait afficher les horaires si fournis', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText(/De 11:00 à 14:00/)).toBeInTheDocument();
    });

    it('devrait gérer l\'absence d\'image', () => {
      const dealWithoutImage = { ...mockDeal, imageUrl: null };
      render(<DailyDealCard deal={dealWithoutImage} />);

      expect(screen.queryByAltText('Tacos à 3€')).not.toBeInTheDocument();
      expect(screen.getByText('Tacos à 3€')).toBeInTheDocument();
    });
  });

  describe('Comportement modal (page établissement)', () => {
    it('devrait appeler onClick quand redirectToEstablishment=false', () => {
      const mockOnClick = jest.fn();
      render(
        <DailyDealCard 
          deal={mockDeal} 
          onClick={mockOnClick}
          redirectToEstablishment={false}
        />
      );

      const card = screen.getByText('Tacos à 3€').closest('.promo-card');
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas rediriger si redirectToEstablishment=false', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      const mockOnClick = jest.fn();
      render(
        <DailyDealCard 
          deal={mockDeal} 
          onClick={mockOnClick}
          redirectToEstablishment={false}
        />
      );

      const card = screen.getByText('Tacos à 3€').closest('.promo-card');
      fireEvent.click(card!);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Comportement redirection (landing page)', () => {
    it('devrait rediriger vers la page établissement quand redirectToEstablishment=true', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      render(
        <DailyDealCard 
          deal={mockDeal}
          redirectToEstablishment={true}
          establishmentId="establishment-123"
        />
      );

      const card = screen.getByText('Tacos à 3€').closest('.promo-card');
      fireEvent.click(card!);

      expect(mockPush).toHaveBeenCalledWith('/etablissement/establishment-123');
    });

    it('ne devrait pas appeler onClick si redirectToEstablishment=true', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      const mockOnClick = jest.fn();

      render(
        <DailyDealCard 
          deal={mockDeal}
          onClick={mockOnClick}
          redirectToEstablishment={true}
          establishmentId="establishment-123"
        />
      );

      const card = screen.getByText('Tacos à 3€').closest('.promo-card');
      fireEvent.click(card!);

      expect(mockPush).toHaveBeenCalled();
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('devrait gérer l\'absence d\'establishmentId', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      const mockOnClick = jest.fn();

      render(
        <DailyDealCard 
          deal={mockDeal}
          onClick={mockOnClick}
          redirectToEstablishment={true}
          // pas d'establishmentId
        />
      );

      const card = screen.getByText('Tacos à 3€').closest('.promo-card');
      fireEvent.click(card!);

      // Ne devrait ni rediriger ni appeler onClick
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Effet flip de la carte', () => {
    it('devrait afficher le bouton "Voir les détails"', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('Voir les détails')).toBeInTheDocument();
    });

    it('devrait flipper la carte au clic sur "Voir les détails"', () => {
      render(<DailyDealCard deal={mockDeal} />);

      const flipButton = screen.getByText('Voir les détails');
      fireEvent.click(flipButton);

      // Vérifier que le contenu du verso est affiché
      expect(screen.getByText('Détails de l\'offre')).toBeInTheDocument();
      expect(screen.getByText('Retour')).toBeInTheDocument();
    });

    it('ne devrait pas déclencher onClick/redirection quand la carte est flippée', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      render(
        <DailyDealCard 
          deal={mockDeal}
          redirectToEstablishment={true}
          establishmentId="establishment-123"
        />
      );

      // Flipper la carte
      const flipButton = screen.getByText('Voir les détails');
      fireEvent.click(flipButton);

      // Essayer de cliquer sur la carte flippée
      const card = screen.getByText('Détails de l\'offre').closest('.promo-card');
      fireEvent.click(card!);

      // Ne devrait pas rediriger
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('devrait afficher le lien promoUrl sur le verso si fourni', () => {
      render(<DailyDealCard deal={mockDeal} />);

      const flipButton = screen.getByText('Voir les détails');
      fireEvent.click(flipButton);

      const promoLink = screen.getByText('🔗 Voir la promotion en ligne');
      expect(promoLink).toBeInTheDocument();
      expect(promoLink).toHaveAttribute('href', 'https://example.com/promo');
    });

    it('devrait retourner au recto au clic sur "Retour"', () => {
      render(<DailyDealCard deal={mockDeal} />);

      // Flipper
      const flipButton = screen.getByText('Voir les détails');
      fireEvent.click(flipButton);

      // Retourner
      const backButton = screen.getByText('Retour');
      fireEvent.click(backButton);

      // Vérifier qu'on est revenu au recto
      expect(screen.getByText('Voir les détails')).toBeInTheDocument();
    });
  });

  describe('Système d\'engagement (likes/dislikes)', () => {
    it('devrait afficher les boutons d\'engagement', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('Intéressé')).toBeInTheDocument();
      expect(screen.getByText('Pas intéressé')).toBeInTheDocument();
    });

    it('devrait envoyer un like au clic sur "Intéressé"', async () => {
      render(<DailyDealCard deal={mockDeal} />);

      const likeButton = screen.getByText('Intéressé');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/deals/engagement',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"type":"liked"')
          })
        );
      });
    });

    it('devrait envoyer un dislike au clic sur "Pas intéressé"', async () => {
      render(<DailyDealCard deal={mockDeal} />);

      const dislikeButton = screen.getByText('Pas intéressé');
      fireEvent.click(dislikeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/deals/engagement',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"type":"disliked"')
          })
        );
      });
    });

    it('ne devrait pas déclencher onClick/redirection lors du clic sur engagement', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      render(
        <DailyDealCard 
          deal={mockDeal}
          redirectToEstablishment={true}
          establishmentId="establishment-123"
        />
      );

      const likeButton = screen.getByText('Intéressé');
      fireEvent.click(likeButton);

      // Ne devrait pas rediriger
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('devrait désactiver les boutons pendant l\'envoi', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) }), 100))
      );

      render(<DailyDealCard deal={mockDeal} />);

      const likeButton = screen.getByText('Intéressé') as HTMLButtonElement;
      fireEvent.click(likeButton);

      // Le bouton devrait être désactivé
      expect(likeButton).toBeDisabled();

      await waitFor(() => {
        expect(likeButton).not.toBeDisabled();
      });
    });
  });

  describe('Troncature du texte', () => {
    it('devrait tronquer la description si trop longue (>80 caractères)', () => {
      const longDescription = 'Ceci est une très longue description qui dépasse largement les 80 caractères et qui devrait être tronquée avec des points de suspension';
      const dealWithLongDescription = { ...mockDeal, description: longDescription };

      render(<DailyDealCard deal={dealWithLongDescription} />);

      const displayedText = screen.getByText(/Ceci est une très longue description/);
      expect(displayedText.textContent).toMatch(/\.\.\.$/);
      expect(displayedText.textContent!.length).toBeLessThan(longDescription.length);
    });

    it('ne devrait pas tronquer une description courte', () => {
      const shortDescription = 'Description courte';
      const dealWithShortDescription = { ...mockDeal, description: shortDescription };

      render(<DailyDealCard deal={dealWithShortDescription} />);

      expect(screen.getByText(shortDescription)).toBeInTheDocument();
    });
  });

  describe('Formatage des dates et prix', () => {
    it('devrait formater correctement la date en français', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText(/Le \d{2} janvier 2025/)).toBeInTheDocument();
    });

    it('devrait formater correctement les prix en euros', () => {
      render(<DailyDealCard deal={mockDeal} />);

      expect(screen.getByText('3,00 €')).toBeInTheDocument();
      expect(screen.getByText('5,00 €')).toBeInTheDocument();
    });

    it('devrait gérer l\'absence de prix', () => {
      const dealWithoutPrices = { 
        ...mockDeal, 
        originalPrice: null, 
        discountedPrice: null 
      };

      render(<DailyDealCard deal={dealWithoutPrices} />);

      expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    });
  });
});

console.log('✅ Tests DailyDealCard - 25 scénarios de test définis');

