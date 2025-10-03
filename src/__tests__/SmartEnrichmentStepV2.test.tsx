import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartEnrichmentStepV2 from '@/components/forms/SmartEnrichmentStepV2';

// Mock du service d'enrichissement
jest.mock('@/lib/smart-enrichment-service-v2', () => ({
  smartEnrichmentServiceV2: {
    analyzeEnrichmentGaps: jest.fn(),
    combineEnrichmentData: jest.fn(),
    validateEnrichmentConsistency: jest.fn()
  }
}));

// Mock du système d'enrichissement
jest.mock('@/lib/enrichment-system', () => ({
  enrichmentSystem: {
    enrichFromGoogle: jest.fn()
  }
}));

describe('SmartEnrichmentStepV2', () => {
  const mockProps = {
    onEnrichmentComplete: jest.fn(),
    onSkip: jest.fn(),
    isVisible: true,
    onEnrichmentDataChange: jest.fn(),
    establishmentType: 'restaurant'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le formulaire de saisie', () => {
    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    expect(screen.getByText('🚀 Enrichissement intelligent')).toBeInTheDocument();
    expect(screen.getByLabelText('🔗 Lien Google Maps de votre établissement')).toBeInTheDocument();
    expect(screen.getByLabelText('🍴 Lien TheFork (recommandé)')).toBeInTheDocument();
    expect(screen.getByLabelText('🚗 Lien Uber Eats (recommandé)')).toBeInTheDocument();
  });

  it('devrait valider les URLs Google', async () => {
    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    // URL invalide
    fireEvent.change(googleInput, { target: { value: 'https://invalid.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir une URL Google Maps valide')).toBeInTheDocument();
    });
  });

  it('devrait valider les URLs TheFork', async () => {
    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const theForkInput = screen.getByLabelText('🍴 Lien TheFork (recommandé)');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    // URL Google valide mais TheFork invalide
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.change(theForkInput, { target: { value: 'https://invalid.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir une URL TheFork valide')).toBeInTheDocument();
    });
  });

  it('devrait valider les URLs Uber Eats', async () => {
    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const uberEatsInput = screen.getByLabelText('🚗 Lien Uber Eats (recommandé)');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    // URL Google valide mais Uber Eats invalide
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.change(uberEatsInput, { target: { value: 'https://invalid.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir une URL Uber Eats valide')).toBeInTheDocument();
    });
  });

  it('devrait afficher les données Google récupérées après enrichissement', async () => {
    const { smartEnrichmentServiceV2 } = require('@/lib/smart-enrichment-service-v2');
    
    // Mock des données d'enrichissement
    const mockEnrichmentData = {
      name: 'DreamAway Dijon - Réalité Virtuelle',
      establishmentType: 'other',
      googleRating: 5.0,
      servicesArray: ['Équipements VR', 'Sessions privées', 'WiFi gratuit'],
      paymentMethodsArray: ['Carte bancaire', 'Espèces'],
      accessibilityInfo: ['Accessible PMR', 'Toilettes handicapées'],
      specialties: ['Réalité Virtuelle', 'Escape Games'],
      atmosphere: ['Moderne', 'Technologique'],
      practicalInfo: ['Équipements VR dernier cri'],
      populairePour: ['Familles', 'Groupes']
    };

    const mockSmartData = {
      establishmentType: 'vr_experience',
      enrichmentMetadata: {
        googleConfidence: 0.85,
        manualCompleteness: 0.5,
        totalSuggestions: 10,
        lastUpdated: new Date()
      }
    };

    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Casques VR', confidence: 0.95, reason: 'Recommandé pour vr_experience' },
        { category: 'payments', value: 'Tickets restaurant', confidence: 0.8, reason: 'Commodité obligatoire' }
      ],
      optional: [
        { category: 'services', value: 'Formation VR', confidence: 0.7, reason: 'Optionnel pour vr_experience' }
      ],
      alreadyFound: [],
      toVerify: []
    };

    smartEnrichmentServiceV2.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartEnrichmentServiceV2.combineEnrichmentData.mockReturnValue(mockSmartData);

    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      // Vérifier l'affichage des métadonnées
      expect(screen.getByText('DreamAway Dijon - Réalité Virtuelle')).toBeInTheDocument();
      expect(screen.getByText('vr_experience')).toBeInTheDocument();
      expect(screen.getByText('✓ Détecté')).toBeInTheDocument();
      expect(screen.getByText('5/5')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      
      // Vérifier l'affichage des services récupérés par Google
      expect(screen.getByText('Services récupérés par Google')).toBeInTheDocument();
      expect(screen.getByText('Équipements VR')).toBeInTheDocument();
      expect(screen.getByText('Sessions privées')).toBeInTheDocument();
      expect(screen.getByText('WiFi gratuit')).toBeInTheDocument();
      
      // Vérifier l'affichage des moyens de paiement récupérés par Google
      expect(screen.getByText('Moyens de paiement récupérés par Google')).toBeInTheDocument();
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
      expect(screen.getByText('Espèces')).toBeInTheDocument();
      
      // Vérifier l'affichage de l'accessibilité récupérée par Google
      expect(screen.getByText('Accessibilité récupérée par Google')).toBeInTheDocument();
      expect(screen.getByText('Accessible PMR')).toBeInTheDocument();
      expect(screen.getByText('Toilettes handicapées')).toBeInTheDocument();
      
      // Vérifier l'affichage des spécialités récupérées par Google
      expect(screen.getByText('Spécialités récupérées par Google')).toBeInTheDocument();
      expect(screen.getByText('Réalité Virtuelle')).toBeInTheDocument();
      expect(screen.getByText('Escape Games')).toBeInTheDocument();
      
      // Vérifier l'affichage de l'ambiance récupérée par Google
      expect(screen.getByText('Ambiance récupérée par Google')).toBeInTheDocument();
      expect(screen.getByText('Moderne')).toBeInTheDocument();
      expect(screen.getByText('Technologique')).toBeInTheDocument();
      
      // Vérifier l'affichage des informations pratiques récupérées par Google
      expect(screen.getByText('Informations pratiques récupérées par Google')).toBeInTheDocument();
      expect(screen.getByText('Équipements VR dernier cri')).toBeInTheDocument();
      
      // Vérifier l'affichage de la clientèle récupérée par Google
      expect(screen.getByText('Clientèle récupérée par Google')).toBeInTheDocument();
      expect(screen.getByText('Familles')).toBeInTheDocument();
      expect(screen.getByText('Groupes')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait afficher les suggestions intelligentes', async () => {
    const { smartEnrichmentServiceV2 } = require('@/lib/smart-enrichment-service-v2');
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Casques VR', confidence: 0.95, reason: 'Recommandé pour vr_experience' },
        { category: 'payments', value: 'Tickets restaurant', confidence: 0.8, reason: 'Commodité obligatoire' }
      ],
      optional: [
        { category: 'services', value: 'Formation VR', confidence: 0.7, reason: 'Optionnel pour vr_experience' }
      ],
      alreadyFound: [],
      toVerify: []
    };

    smartEnrichmentServiceV2.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartEnrichmentServiceV2.combineEnrichmentData.mockReturnValue({
      establishmentType: 'vr_experience',
      enrichmentMetadata: { googleConfidence: 0.85, manualCompleteness: 0.5, totalSuggestions: 10, lastUpdated: new Date() }
    });

    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      // Vérifier l'affichage des suggestions
      expect(screen.getByText('Suggestions personnalisées pour votre vr_experience')).toBeInTheDocument();
      expect(screen.getByText('🔵 Recommandé')).toBeInTheDocument();
      expect(screen.getByText('⚪ Optionnel')).toBeInTheDocument();
      
      // Vérifier les suggestions recommandées
      expect(screen.getByText('Casques VR')).toBeInTheDocument();
      expect(screen.getByText('Tickets restaurant')).toBeInTheDocument();
      
      // Vérifier les suggestions optionnelles
      expect(screen.getByText('Formation VR')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait permettre de sélectionner des suggestions', async () => {
    const { smartEnrichmentServiceV2 } = require('@/lib/smart-enrichment-service-v2');
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Casques VR', confidence: 0.95, reason: 'Recommandé pour vr_experience' }
      ],
      optional: [],
      alreadyFound: [],
      toVerify: []
    };

    smartEnrichmentServiceV2.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartEnrichmentServiceV2.combineEnrichmentData.mockReturnValue({
      establishmentType: 'vr_experience',
      enrichmentMetadata: { googleConfidence: 0.85, manualCompleteness: 0.5, totalSuggestions: 10, lastUpdated: new Date() }
    });

    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      const checkbox = screen.getByLabelText('Casques VR');
      expect(checkbox).toBeInTheDocument();
      
      // Sélectionner la suggestion
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      // Vérifier le compteur de suggestions sélectionnées
      expect(screen.getByText('1 suggestions sélectionnées')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait continuer avec les données sélectionnées', async () => {
    const { smartEnrichmentServiceV2 } = require('@/lib/smart-enrichment-service-v2');
    
    const mockSuggestions = {
      recommended: [
        { category: 'services', value: 'Casques VR', confidence: 0.95, reason: 'Recommandé pour vr_experience' }
      ],
      optional: [],
      alreadyFound: [],
      toVerify: []
    };

    smartEnrichmentServiceV2.analyzeEnrichmentGaps.mockReturnValue(mockSuggestions);
    smartEnrichmentServiceV2.combineEnrichmentData.mockReturnValue({
      establishmentType: 'vr_experience',
      enrichmentMetadata: { googleConfidence: 0.85, manualCompleteness: 0.5, totalSuggestions: 10, lastUpdated: new Date() }
    });
    smartEnrichmentServiceV2.validateEnrichmentConsistency.mockReturnValue({
      isValid: true,
      warnings: [],
      suggestions: []
    });

    render(<SmartEnrichmentStepV2 {...mockProps} />);
    
    const googleInput = screen.getByLabelText('🔗 Lien Google Maps de votre établissement');
    const button = screen.getByText('🚀 Lancer l\'enrichissement intelligent');
    
    fireEvent.change(googleInput, { target: { value: 'https://maps.google.com/test' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      const continueButton = screen.getByText('✅ Continuer avec ces informations');
      fireEvent.click(continueButton);
      
      expect(mockProps.onEnrichmentComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
