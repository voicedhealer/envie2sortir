import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartEnrichmentStep from '@/components/forms/SmartEnrichmentStep';

// Mock du service d'enrichissement
jest.mock('@/lib/enrichment-system', () => ({
  enrichmentSystem: {
    triggerGoogleEnrichment: jest.fn()
  }
}));

// Mock du service d'enrichissement intelligent
jest.mock('@/lib/smart-enrichment-service', () => ({
  smartEnrichmentService: {
    analyzeEnrichmentGaps: jest.fn(),
    combineEnrichmentData: jest.fn(),
    validateEnrichmentConsistency: jest.fn()
  }
}));

const mockProps = {
  onEnrichmentComplete: jest.fn(),
  onSkip: jest.fn(),
  isVisible: true,
  onEnrichmentDataChange: jest.fn(),
  establishmentType: 'restaurant'
};

describe('SmartEnrichmentStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le formulaire de saisie', () => {
    render(<SmartEnrichmentStep {...mockProps} />);
    
    expect(screen.getByText('🚀 Enrichissement intelligent')).toBeInTheDocument();
    expect(screen.getByLabelText('🔗 Lien Google Maps de votre établissement')).toBeInTheDocument();
    expect(screen.getByLabelText('🍴 Lien TheFork (recommandé)')).toBeInTheDocument();
    expect(screen.getByLabelText('🚗 Lien Uber Eats (recommandé)')).toBeInTheDocument();
  });

  it('devrait valider les URLs TheFork', async () => {
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const theForkInput = screen.getByLabelText('🍴 Lien TheFork (recommandé)');
    
    // URL valide
    fireEvent.change(theForkInput, { target: { value: 'https://www.thefork.fr/restaurant/test' } });
    
    await waitFor(() => {
      expect(screen.getByText('✅ URL TheFork valide')).toBeInTheDocument();
    });
    
    // URL invalide
    fireEvent.change(theForkInput, { target: { value: 'https://invalid.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('❌ URL TheFork invalide')).toBeInTheDocument();
    });
  });

  it('devrait valider les URLs Uber Eats', async () => {
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const uberEatsInput = screen.getByLabelText('🚗 Lien Uber Eats (recommandé)');
    
    // URL valide
    fireEvent.change(uberEatsInput, { target: { value: 'https://www.ubereats.com/fr/store/test' } });
    
    await waitFor(() => {
      expect(screen.getByText('✅ URL Uber Eats valide')).toBeInTheDocument();
    });
    
    // URL invalide
    fireEvent.change(uberEatsInput, { target: { value: 'https://invalid.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('❌ URL Uber Eats invalide')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message d\'erreur si l\'URL Google est vide', async () => {
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir une URL Google My Business')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('devrait afficher les suggestions après enrichissement', async () => {
    const { enrichmentSystem, smartEnrichmentService } = require('@/lib/enrichment-system');
    const { smartEnrichmentService: smartService } = require('@/lib/smart-enrichment-service');
    
    const mockEnrichmentData = {
      name: 'Restaurant Test',
      establishmentType: 'restaurant',
      priceLevel: 2,
      rating: 4.2,
      googleRating: 4.2,
      googleReviewCount: 150
    };
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Service de traiteur', confidence: 0.9, source: 'suggested' },
        { category: 'payments', value: 'Carte bancaire', confidence: 0.95, source: 'suggested' }
      ],
      optional: [
        { category: 'services', value: 'Événements privés', confidence: 0.7, source: 'suggested' }
      ],
      alreadyFound: [],
      toVerify: []
    };
    
    const mockSmartData = {
      ...mockEnrichmentData,
      prioritizedData: {
        accessibility: [],
        services: [],
        payments: [],
        clientele: [],
        children: [],
        parking: []
      },
      enrichmentMetadata: {
        googleConfidence: 0.8,
        manualCompleteness: 0.5,
        totalSuggestions: 3,
        lastUpdated: new Date()
      }
    };
    
    enrichmentSystem.triggerGoogleEnrichment.mockResolvedValue(mockEnrichmentData);
    smartService.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartService.combineEnrichmentData.mockReturnValue(mockSmartData);
    smartService.validateEnrichmentConsistency.mockReturnValue({ isValid: true, warnings: [], suggestions: [] });
    
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('✅ Informations récupérées automatiquement')).toBeInTheDocument();
      expect(screen.getByText('💡 Suggestions personnalisées pour votre restaurant')).toBeInTheDocument();
      expect(screen.getByText('Service de traiteur')).toBeInTheDocument();
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait permettre de sélectionner des suggestions', async () => {
    const { enrichmentSystem, smartEnrichmentService } = require('@/lib/enrichment-system');
    const { smartEnrichmentService: smartService } = require('@/lib/smart-enrichment-service');
    
    const mockEnrichmentData = {
      name: 'Restaurant Test',
      establishmentType: 'restaurant',
      priceLevel: 2,
      rating: 4.2,
      googleRating: 4.2,
      googleReviewCount: 150
    };
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Service de traiteur', confidence: 0.9, source: 'suggested' }
      ],
      optional: [],
      alreadyFound: [],
      toVerify: []
    };
    
    const mockSmartData = {
      ...mockEnrichmentData,
      prioritizedData: {
        accessibility: [],
        services: [],
        payments: [],
        clientele: [],
        children: [],
        parking: []
      },
      enrichmentMetadata: {
        googleConfidence: 0.8,
        manualCompleteness: 0.5,
        totalSuggestions: 1,
        lastUpdated: new Date()
      }
    };
    
    enrichmentSystem.triggerGoogleEnrichment.mockResolvedValue(mockEnrichmentData);
    smartService.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartService.combineEnrichmentData.mockReturnValue(mockSmartData);
    smartService.validateEnrichmentConsistency.mockReturnValue({ isValid: true, warnings: [], suggestions: [] });
    
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    fireEvent.click(button);
    
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Service de traiteur/);
      expect(checkbox).toBeInTheDocument();
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  it('devrait continuer avec les données sélectionnées', async () => {
    const { enrichmentSystem, smartEnrichmentService } = require('@/lib/enrichment-system');
    const { smartEnrichmentService: smartService } = require('@/lib/smart-enrichment-service');
    
    const mockEnrichmentData = {
      name: 'Restaurant Test',
      establishmentType: 'restaurant',
      priceLevel: 2,
      rating: 4.2,
      googleRating: 4.2,
      googleReviewCount: 150
    };
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Service de traiteur', confidence: 0.9, source: 'suggested' }
      ],
      optional: [],
      alreadyFound: [],
      toVerify: []
    };
    
    const mockSmartData = {
      ...mockEnrichmentData,
      prioritizedData: {
        accessibility: [],
        services: [],
        payments: [],
        clientele: [],
        children: [],
        parking: []
      },
      enrichmentMetadata: {
        googleConfidence: 0.8,
        manualCompleteness: 0.5,
        totalSuggestions: 1,
        lastUpdated: new Date()
      }
    };
    
    enrichmentSystem.triggerGoogleEnrichment.mockResolvedValue(mockEnrichmentData);
    smartService.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartService.combineEnrichmentData.mockReturnValue(mockSmartData);
    smartService.validateEnrichmentConsistency.mockReturnValue({ isValid: true, warnings: [], suggestions: [] });
    
    render(<SmartEnrichmentStep {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    fireEvent.click(button);
    
    await waitFor(() => {
      const continueButton = screen.getByText('✅ Continuer avec ces informations');
      fireEvent.click(continueButton);
      
      expect(mockProps.onEnrichmentComplete).toHaveBeenCalled();
    });
  });
});
