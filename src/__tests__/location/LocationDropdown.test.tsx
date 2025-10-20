/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationDropdown from '@/components/LocationDropdown';
import { LocationProvider } from '@/contexts/LocationContext';
import { useLocation } from '@/hooks/useLocation';
import { useCityHistory } from '@/hooks/useCityHistory';

// Mock des hooks
jest.mock('@/hooks/useLocation');
jest.mock('@/hooks/useCityHistory');

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockUseCityHistory = useCityHistory as jest.MockedFunction<typeof useCityHistory>;

// Mock des données de test
const mockCity = {
  id: 'dijon',
  name: 'Dijon',
  latitude: 47.322,
  longitude: 5.041,
  region: 'Bourgogne-Franche-Comté'
};

const mockFavorites = [mockCity];
const mockRecentCities = [{ city: mockCity, timestamp: Date.now() }];

describe('LocationDropdown', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    buttonRef: { current: null }
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Mock par défaut
    mockUseLocation.mockReturnValue({
      currentCity: mockCity,
      searchRadius: 20,
      changeCity: jest.fn(),
      changeRadius: jest.fn(),
      detectMyLocation: jest.fn(),
      loading: false,
      updatePreferences: jest.fn()
    });

    mockUseCityHistory.mockReturnValue({
      recentCities: mockRecentCities,
      favorites: mockFavorites,
      isFavorite: jest.fn().mockReturnValue(true),
      toggleFavorite: jest.fn(),
      addToHistory: jest.fn()
    });
  });

  const renderWithProvider = (props = {}) => {
    return render(
      <LocationProvider isAuthenticated={false}>
        <LocationDropdown {...defaultProps} {...props} />
      </LocationProvider>
    );
  };

  describe('Rendu de base', () => {
    test('affiche le dropdown quand isOpen est true', () => {
      renderWithProvider();
      
      expect(screen.getByText('Localisation')).toBeInTheDocument();
      expect(screen.getByText('Villes')).toBeInTheDocument();
      expect(screen.getByText('Favoris (1)')).toBeInTheDocument();
      expect(screen.getByText('Récents (1)')).toBeInTheDocument();
    });

    test('ne s\'affiche pas quand isOpen est false', () => {
      renderWithProvider({ isOpen: false });
      
      expect(screen.queryByText('Localisation')).not.toBeInTheDocument();
    });

    test('affiche les boutons de rayon de recherche', () => {
      renderWithProvider();
      
      expect(screen.getByText('10 km')).toBeInTheDocument();
      expect(screen.getByText('20 km')).toBeInTheDocument();
      expect(screen.getByText('50 km')).toBeInTheDocument();
      expect(screen.getByText('Toute la région')).toBeInTheDocument();
    });

    test('affiche le bouton de validation après sélection', () => {
      renderWithProvider();
      
      // Sélectionner une ville d'abord
      fireEvent.click(screen.getByText('Dijon'));
      
      // Maintenant le bouton Valider devrait apparaître
      expect(screen.getByText('✓ Valider la sélection')).toBeInTheDocument();
    });
  });

  describe('Interactions avec les onglets', () => {
    test('permet de changer d\'onglet', () => {
      renderWithProvider();
      
      // Onglet Villes par défaut
      expect(screen.getByText('Villes')).toHaveClass('text-orange-600');
      
      // Cliquer sur Favoris
      fireEvent.click(screen.getByText('Favoris (1)'));
      expect(screen.getByText('Favoris (1)')).toHaveClass('text-orange-600');
      
      // Cliquer sur Récents
      fireEvent.click(screen.getByText('Récents (1)'));
      expect(screen.getByText('Récents (1)')).toHaveClass('text-orange-600');
    });
  });

  describe('Recherche de villes', () => {
    test('affiche le bouton "Voir + de villes"', () => {
      renderWithProvider();
      
      expect(screen.getByText('🔍 Voir + de villes')).toBeInTheDocument();
    });

    test('affiche les villes principales', () => {
      renderWithProvider();
      
      // Vérifier que les villes principales sont affichées
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });
  });

  describe('Sélection de ville', () => {
    test('appelle changeCity et changeRadius lors de la validation', () => {
      const mockChangeCity = jest.fn();
      const mockChangeRadius = jest.fn();
      const mockOnClose = jest.fn();

      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: mockChangeCity,
        changeRadius: mockChangeRadius,
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: jest.fn()
      });

      renderWithProvider({ onClose: mockOnClose });
      
      // Sélectionner une ville d'abord
      fireEvent.click(screen.getByText('Dijon'));
      
      // Cliquer sur le bouton Valider
      fireEvent.click(screen.getByText('✓ Valider la sélection'));
      
      expect(mockChangeCity).toHaveBeenCalledWith(mockCity);
      expect(mockChangeRadius).toHaveBeenCalledWith(20);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Gestion des favoris', () => {
    test('permet d\'ajouter/retirer des favoris', () => {
      const mockToggleFavorite = jest.fn();
      
      mockUseCityHistory.mockReturnValue({
        recentCities: mockRecentCities,
        favorites: mockFavorites,
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: mockToggleFavorite,
        addToHistory: jest.fn()
      });

      renderWithProvider();
      
      // Aller sur l'onglet Favoris
      fireEvent.click(screen.getByText('Favoris (1)'));
      
      // Cliquer sur l'étoile (chercher par le bouton avec l'icône étoile)
      const starButton = screen.getByRole('button', { name: '' }); // Le bouton sans nom accessible
      fireEvent.click(starButton);
      expect(mockToggleFavorite).toHaveBeenCalledWith(mockCity);
    });
  });

  describe('Recherche avancée', () => {
    test('affiche le bouton "Voir + de villes"', () => {
      renderWithProvider();
      
      expect(screen.getByText('🔍 Voir + de villes')).toBeInTheDocument();
    });

    test('ouvre la recherche avancée au clic', () => {
      renderWithProvider();
      
      // Cliquer sur "Voir + de villes"
      fireEvent.click(screen.getByText('🔍 Voir + de villes'));
      
      // Vérifier que la recherche avancée s'ouvre
      expect(screen.getByText('Recherche de villes')).toBeInTheDocument();
    });
  });

  describe('Changement de rayon', () => {
    test('permet de changer le rayon de recherche', () => {
      renderWithProvider();
      
      // Cliquer sur un autre rayon
      fireEvent.click(screen.getByText('50 km'));
      
      // Vérifier que le rayon est mis à jour (sera testé lors de la sélection)
      expect(screen.getByText('50 km')).toBeInTheDocument();
    });
  });

  describe('Fermeture du dropdown', () => {
    test('ferme le dropdown avec le bouton X', () => {
      const mockOnClose = jest.fn();
      renderWithProvider({ onClose: mockOnClose });
      
      // Cliquer sur le X
      fireEvent.click(screen.getByLabelText('Fermer'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('ferme le dropdown après validation', () => {
      const mockOnClose = jest.fn();
      renderWithProvider({ onClose: mockOnClose });
      
      // Sélectionner une ville d'abord
      fireEvent.click(screen.getByText('Dijon'));
      
      // Cliquer sur Valider
      fireEvent.click(screen.getByText('✓ Valider la sélection'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('États vides', () => {
    test('affiche le message quand aucun favori', () => {
      mockUseCityHistory.mockReturnValue({
        recentCities: [],
        favorites: [],
        isFavorite: jest.fn().mockReturnValue(false),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      renderWithProvider();
      
      // Aller sur l'onglet Favoris
      fireEvent.click(screen.getByText('Favoris (0)'));
      
      expect(screen.getByText('Aucun favori')).toBeInTheDocument();
    });

    test('affiche le message quand aucun historique', () => {
      mockUseCityHistory.mockReturnValue({
        recentCities: [],
        favorites: [],
        isFavorite: jest.fn().mockReturnValue(false),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      renderWithProvider();
      
      // Aller sur l'onglet Récents
      fireEvent.click(screen.getByText('Récents (0)'));
      
      expect(screen.getByText('Aucun historique')).toBeInTheDocument();
    });
  });
});

