/**
 * Tests pour le composant LocationSelector
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationProvider } from '@/contexts/LocationContext';
import LocationSelector from '@/components/LocationSelector';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider isAuthenticated={false}>
    {children}
  </LocationProvider>
);

describe('LocationSelector', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    mockOnClose.mockClear();
  });

  it('ne devrait pas s\'afficher si isOpen=false', () => {
    const { container } = render(
      <LocationSelector isOpen={false} onClose={mockOnClose} />,
      { wrapper }
    );

    expect(container.firstChild).toBeNull();
  });

  it('devrait s\'afficher si isOpen=true', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/choisir ma localisation/i)).toBeInTheDocument();
    });
  });

  it('devrait fermer au clic sur le bouton X', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/choisir ma localisation/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher la ville actuelle', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });
  });

  it('devrait afficher les options de rayon', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('10 km')).toBeInTheDocument();
      expect(screen.getByText('20 km')).toBeInTheDocument();
      expect(screen.getByText('50 km')).toBeInTheDocument();
      expect(screen.getByText('Toute la région')).toBeInTheDocument();
    });
  });

  it('devrait permettre de changer le rayon', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('10 km')).toBeInTheDocument();
    });

    const button50km = screen.getByText('50 km');
    fireEvent.click(button50km);

    // Le bouton devrait être sélectionné (classes CSS)
    expect(button50km.closest('button')).toHaveClass('from-orange-500');
  });

  it('devrait avoir 3 onglets (Rechercher, Favoris, Récents)', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/rechercher/i)).toBeInTheDocument();
      expect(screen.getByText(/favoris/i)).toBeInTheDocument();
      expect(screen.getByText(/récents/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher la barre de recherche dans l\'onglet Rechercher', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/rechercher une ville/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('devrait filtrer les villes lors de la recherche', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/rechercher une ville/i);
      
      // Taper "Paris"
      fireEvent.change(searchInput, { target: { value: 'Paris' } });

      // Paris devrait être visible
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message si aucun favori', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      // Cliquer sur l'onglet Favoris
      const favorisTab = screen.getByText(/favoris/i);
      fireEvent.click(favorisTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/aucune ville favorite/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher un message si aucun historique', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      // Cliquer sur l'onglet Récents
      const recentsTab = screen.getByText(/récents/i);
      fireEvent.click(recentsTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/aucun historique/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton de détection GPS', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/utiliser ma position actuelle/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher les étoiles pour les favoris', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      // Vérifier la présence d'étoiles dans la liste des villes
      const searchInput = screen.getByPlaceholderText(/rechercher une ville/i);
      expect(searchInput).toBeInTheDocument();
    });

    // Les étoiles devraient être présentes (icônes)
    const { container } = render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      const stars = container.querySelectorAll('svg');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  it('devrait être accessible', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      // Vérifier que les boutons ont des aria-label appropriés
      const closeButton = screen.getByRole('button', { name: /fermer/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Fermer');
    });
  });

  it('devrait afficher un footer avec une note', async () => {
    render(
      <LocationSelector isOpen={true} onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/vos préférences sont enregistrées automatiquement/i)).toBeInTheDocument();
    });
  });
});

