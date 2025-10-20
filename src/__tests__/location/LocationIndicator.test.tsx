/**
 * Tests pour le composant LocationIndicator
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationProvider } from '@/contexts/LocationContext';
import LocationIndicator from '@/components/LocationIndicator';

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

describe('LocationIndicator', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('devrait afficher un état de chargement initialement', () => {
    render(<LocationIndicator />, { wrapper });
    
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('devrait afficher la ville et le rayon après chargement', async () => {
    render(<LocationIndicator />, { wrapper });

    await waitFor(() => {
      // Devrait afficher Dijon (ville par défaut)
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });

    // Devrait afficher le rayon par défaut (20km)
    expect(screen.getByText(/rayon 20km/i)).toBeInTheDocument();
  });

  it('devrait ouvrir le dropdown au clic', async () => {
    render(<LocationIndicator />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });

    const button = screen.getByText('Dijon').closest('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button!);

    // Le dropdown LocationDropdown devrait s'ouvrir
    await waitFor(() => {
      expect(screen.getByText('Localisation')).toBeInTheDocument();
    });
  });

  it('devrait avoir les bonnes classes CSS', async () => {
    render(<LocationIndicator />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });

    const button = screen.getByText('Dijon').closest('button');
    
    // Vérifier les classes pour le style
    expect(button).toHaveClass('from-orange-50');
    expect(button).toHaveClass('to-pink-50');
  });

  it('devrait afficher l\'icône MapPin', async () => {
    const { container } = render(<LocationIndicator />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });

    // Vérifier la présence de l'icône (via la classe ou le SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('devrait être accessible', async () => {
    render(<LocationIndicator />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });

    const button = screen.getByText('Dijon').closest('button');
    expect(button).toHaveAttribute('title', 'Changer de localisation');
  });
});

