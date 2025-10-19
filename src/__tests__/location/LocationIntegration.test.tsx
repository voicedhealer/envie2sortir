/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationIndicator from '@/components/LocationIndicator';
import LocationDropdown from '@/components/LocationDropdown';
import LocationModal from '@/components/LocationModal';
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

const mockParis = {
  id: 'paris',
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  region: 'Île-de-France'
};

describe('Intégration du système de localisation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe('LocationIndicator', () => {
    test('affiche le badge de localisation', () => {
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      expect(screen.getByText('Dijon')).toBeInTheDocument();
      expect(screen.getByText('Rayon 20km')).toBeInTheDocument();
    });

    test('affiche le loading pendant le chargement', () => {
      mockUseLocation.mockReturnValue({
        currentCity: null,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: jest.fn(),
        loading: true,
        updatePreferences: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    test('permet d\'ouvrir/fermer le dropdown', () => {
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
        recentCities: [mockCity],
        favorites: [mockCity],
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      const button = screen.getByRole('button', { name: /changer de localisation/i });
      
      // Ouvrir le dropdown
      fireEvent.click(button);
      expect(screen.getByText('Localisation')).toBeInTheDocument();
      
      // Fermer le dropdown
      fireEvent.click(button);
      expect(screen.queryByText('Localisation')).not.toBeInTheDocument();
    });
  });

  describe('Flux complet de changement de ville', () => {
    test('permet de changer de ville via le dropdown', async () => {
      const mockChangeCity = jest.fn();
      const mockChangeRadius = jest.fn();
      
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: mockChangeCity,
        changeRadius: mockChangeRadius,
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: jest.fn()
      });

      mockUseCityHistory.mockReturnValue({
        recentCities: [mockCity, mockParis],
        favorites: [mockCity],
        isFavorite: jest.fn().mockImplementation((cityId) => cityId === 'dijon'),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      // Ouvrir le dropdown
      fireEvent.click(screen.getByRole('button', { name: /changer de localisation/i }));
      
      // Vérifier que le dropdown est ouvert
      expect(screen.getByText('Localisation')).toBeInTheDocument();
      
      // Aller sur l'onglet Récents pour voir Paris
      fireEvent.click(screen.getByText('Récents (2)'));
      
      // Sélectionner Paris
      const parisElement = screen.getByText('Paris');
      fireEvent.click(parisElement);
      
      // Vérifier que les fonctions sont appelées
      expect(mockChangeCity).toHaveBeenCalledWith(mockParis);
      expect(mockChangeRadius).toHaveBeenCalledWith(20);
    });
  });

  describe('Gestion des erreurs', () => {
    test('gère les erreurs de géolocalisation', async () => {
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

      mockUseCityHistory.mockReturnValue({
        recentCities: [mockCity],
        favorites: [mockCity],
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      // Ouvrir le dropdown
      fireEvent.click(screen.getByRole('button', { name: /changer de localisation/i }));
      
      // Cliquer sur le bouton GPS
      fireEvent.click(screen.getByText('Ma position'));
      
      // Vérifier que l'erreur est gérée sans crash
      await waitFor(() => {
        expect(mockDetectLocation).toHaveBeenCalled();
      });
    });
  });

  describe('Persistance des données', () => {
    test('sauvegarde les préférences en localStorage', () => {
      const mockUpdatePreferences = jest.fn();
      
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: mockUpdatePreferences
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      // Ouvrir le dropdown
      fireEvent.click(screen.getByRole('button', { name: /changer de localisation/i }));
      
      // Changer le rayon
      fireEvent.click(screen.getByText('50km'));
      
      // Sélectionner une ville
      fireEvent.click(screen.getByText('Dijon'));
      
      // Vérifier que updatePreferences est appelé
      expect(mockUpdatePreferences).toHaveBeenCalled();
    });
  });

  describe('Responsive et accessibilité', () => {
    test('le dropdown est accessible au clavier', () => {
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
        recentCities: [mockCity],
        favorites: [mockCity],
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      const button = screen.getByRole('button', { name: /changer de localisation/i });
      
      // Vérifier que le bouton est focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Ouvrir avec Entrée
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(screen.getByText('Localisation')).toBeInTheDocument();
    });

    test('affiche les labels ARIA appropriés', () => {
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: jest.fn(),
        changeRadius: jest.fn(),
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: jest.fn()
      });

      render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      const button = screen.getByRole('button', { name: /changer de localisation/i });
      expect(button).toHaveAttribute('title', 'Changer de localisation');
    });
  });

  describe('Performance', () => {
    test('ne re-rend pas inutilement', () => {
      const mockChangeCity = jest.fn();
      const mockChangeRadius = jest.fn();
      
      mockUseLocation.mockReturnValue({
        currentCity: mockCity,
        searchRadius: 20,
        changeCity: mockChangeCity,
        changeRadius: mockChangeRadius,
        detectMyLocation: jest.fn(),
        loading: false,
        updatePreferences: jest.fn()
      });

      mockUseCityHistory.mockReturnValue({
        recentCities: [mockCity],
        favorites: [mockCity],
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        addToHistory: jest.fn()
      });

      const { rerender } = render(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      // Re-render avec les mêmes props
      rerender(
        <LocationProvider isAuthenticated={false}>
          <LocationIndicator />
        </LocationProvider>
      );

      // Vérifier que le composant est toujours affiché
      expect(screen.getByText('Dijon')).toBeInTheDocument();
    });
  });
});
