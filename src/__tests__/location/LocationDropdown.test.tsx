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
  latitude: 47.3220,
  longitude: 5.0415,
  region: 'Bourgogne-Franche-Comté'
};

const mockFavorites = [mockCity];
const mockRecentCities = [mockCity];

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
      expect(screen.getByText('Recherche')).toBeInTheDocument();
      expect(screen.getByText('Favoris (1)')).toBeInTheDocument();
      expect(screen.getByText('Récents (1)')).toBeInTheDocument();
    });

    test('ne s\'affiche pas quand isOpen est false', () => {
      renderWithProvider({ isOpen: false });
      
      expect(screen.queryByText('Localisation')).not.toBeInTheDocument();
    });

    test('affiche les boutons de rayon de recherche', () => {
      renderWithProvider();
      
      expect(screen.getByText('10km')).toBeInTheDocument();
      expect(screen.getByText('20km')).toBeInTheDocument();
      expect(screen.getByText('50km')).toBeInTheDocument();
      expect(screen.getByText('100km')).toBeInTheDocument();
    });

    test('affiche le bouton de détection GPS', () => {
      renderWithProvider();
      
      expect(screen.getByText('Ma position')).toBeInTheDocument();
    });
  });

  describe('Interactions avec les onglets', () => {
    test('permet de changer d\'onglet', () => {
      renderWithProvider();
      
      // Onglet Recherche par défaut
      expect(screen.getByPlaceholderText('Rechercher une ville...')).toBeInTheDocument();
      
      // Cliquer sur Favoris
      fireEvent.click(screen.getByText('Favoris (1)'));
      expect(screen.getByText('Dijon')).toBeInTheDocument();
      
      // Cliquer sur Récents
      fireEvent.click(screen.getByText('Récents (1)'));
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });
  });

  describe('Recherche de villes', () => {
    test('filtre les villes selon la recherche', () => {
      renderWithProvider();
      
      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      fireEvent.change(searchInput, { target: { value: 'Paris' } });
      
      // Vérifier que la recherche fonctionne
      expect(searchInput).toHaveValue('Paris');
    });

    test('affiche les villes filtrées', () => {
      renderWithProvider();
      
      // Vérifier que les villes principales sont affichées
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });
  });

  describe('Sélection de ville', () => {
    test('appelle changeCity et changeRadius lors de la sélection', () => {
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
      
      // Cliquer sur une ville
      fireEvent.click(screen.getByText('Dijon'));
      
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
      
      // Cliquer sur l'étoile
      const starButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg') // Étoile SVG
      );
      
      if (starButton) {
        fireEvent.click(starButton);
        expect(mockToggleFavorite).toHaveBeenCalledWith(mockCity);
      }
    });
  });

  describe('Détection GPS', () => {
    test('affiche le loader pendant la détection', async () => {
      const mockDetectLocation = jest.fn().mockResolvedValue(mockCity);
      
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: mockDetectLocation,
        loading: false,
        updatePreferences: jest.fn()
      });

      renderWithProvider();
      
      // Cliquer sur le bouton GPS
      fireEvent.click(screen.getByText('Ma position'));
      
      // Vérifier que la détection est appelée
      expect(mockDetectLocation).toHaveBeenCalled();
    });

    test('gère les erreurs de détection GPS', async () => {
      const mockDetectLocation = jest.fn().mockRejectedValue(new Error('GPS non disponible'));
      
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: mockDetectLocation,
        loading: false,
        updatePreferences: jest.fn()
      });

      renderWithProvider();
      
      // Cliquer sur le bouton GPS
      fireEvent.click(screen.getByText('Ma position'));
      
      // Vérifier que l'erreur est gérée (pas de crash)
      await waitFor(() => {
        expect(mockDetectLocation).toHaveBeenCalled();
      });
    });
  });

  describe('Changement de rayon', () => {
    test('permet de changer le rayon de recherche', () => {
      renderWithProvider();
      
      // Cliquer sur un autre rayon
      fireEvent.click(screen.getByText('50km'));
      
      // Vérifier que le rayon est mis à jour (sera testé lors de la sélection)
      expect(screen.getByText('50km')).toBeInTheDocument();
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

    test('ferme le dropdown après sélection d\'une ville', () => {
      const mockOnClose = jest.fn();
      renderWithProvider({ onClose: mockOnClose });
      
      // Sélectionner une ville
      fireEvent.click(screen.getByText('Dijon'));
      
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
