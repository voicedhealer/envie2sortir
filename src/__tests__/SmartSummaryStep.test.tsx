import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartSummaryStep from '@/components/forms/SmartSummaryStep';

const mockData = {
  establishmentName: 'Restaurant Test',
  description: 'Un restaurant de qualité',
  address: '123 Rue de la Paix, Paris',
  activities: ['Restaurant', 'Bar'],
  hours: {
    monday: { isOpen: true, slots: [{ name: 'Déjeuner', open: '12:00', close: '14:00' }] },
    tuesday: { isOpen: true, slots: [{ name: 'Déjeuner', open: '12:00', close: '14:00' }] }
  },
  services: ['WiFi', 'Terrasse'],
  ambiance: ['Convivial', 'Chaleureux'],
  paymentMethods: ['Carte bancaire', 'Espèces'],
  tags: ['convivial', 'familial'],
  photos: [],
  phone: '01 23 45 67 89',
  email: 'contact@restaurant-test.com',
  website: 'https://restaurant-test.com',
  instagram: 'https://instagram.com/restaurant-test',
  facebook: 'https://facebook.com/restaurant-test',
  tiktok: 'https://tiktok.com/@restaurant-test',
  youtube: 'https://youtube.com/restaurant-test',
  professionalPhone: '01 23 45 67 89',
  professionalEmail: 'contact@restaurant-test.com',
  theForkLink: 'https://thefork.fr/restaurant-test',
  uberEatsLink: 'https://ubereats.com/restaurant-test',
  informationsPratiques: 'WiFi gratuit, Terrasse',
  envieTags: ['convivial', 'familial'],
  smartEnrichmentData: {
    name: 'Restaurant Test',
    establishmentType: 'restaurant',
    priceLevel: 2,
    rating: 4.2,
    googleRating: 4.2,
    googleReviewCount: 150,
    prioritizedData: {
      accessibility: [
        { source: 'google', confidence: 0.8, category: 'accessibility', value: 'Accessible PMR' },
        { source: 'manual', confidence: 1.0, category: 'accessibility', value: 'Entrée accessible' }
      ],
      services: [
        { source: 'google', confidence: 0.7, category: 'services', value: ['WiFi', 'Terrasse'] },
        { source: 'manual', confidence: 1.0, category: 'services', value: 'Service de traiteur' }
      ],
      payments: [
        { source: 'manual', confidence: 1.0, category: 'payments', value: 'Carte bancaire' }
      ],
      clientele: [
        { source: 'manual', confidence: 1.0, category: 'clientele', value: 'Clientèle familiale' }
      ],
      children: [
        { source: 'suggested', confidence: 0.9, category: 'children', value: 'Menu enfants' }
      ],
      parking: [
        { source: 'suggested', confidence: 0.8, category: 'parking', value: 'Parking gratuit' }
      ]
    },
    enrichmentMetadata: {
      googleConfidence: 0.8,
      manualCompleteness: 0.6,
      totalSuggestions: 5,
      lastUpdated: new Date('2024-01-01')
    }
  }
};

const mockProps = {
  data: mockData,
  onEdit: jest.fn()
};

describe('SmartSummaryStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher les informations générales', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('🎯 Résumé intelligent de votre établissement')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Test')).toBeInTheDocument();
    expect(screen.getByText('Un restaurant de qualité')).toBeInTheDocument();
    expect(screen.getByText('123 Rue de la Paix, Paris')).toBeInTheDocument();
  });

  it('devrait afficher les activités', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });

  it('devrait afficher les services et ambiance', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Terrasse')).toBeInTheDocument();
    expect(screen.getByText('Convivial')).toBeInTheDocument();
    expect(screen.getByText('Chaleureux')).toBeInTheDocument();
  });

  it('devrait afficher les moyens de paiement', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Espèces')).toBeInTheDocument();
  });

  it('devrait afficher les tags de recherche', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('convivial')).toBeInTheDocument();
    expect(screen.getByText('familial')).toBeInTheDocument();
  });

  it('devrait afficher les informations de contact', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('01 23 45 67 89')).toBeInTheDocument();
    expect(screen.getByText('contact@restaurant-test.com')).toBeInTheDocument();
    expect(screen.getByText('restaurant-test.com')).toBeInTheDocument();
  });

  it('devrait afficher les réseaux sociaux', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('devrait afficher les liens externes', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('TheFork')).toBeInTheDocument();
    expect(screen.getByText('Uber Eats')).toBeInTheDocument();
  });

  it('devrait afficher les données d\'enrichissement intelligent', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('🧠 Enrichissement intelligent')).toBeInTheDocument();
    expect(screen.getByText('📊 Qualité des données')).toBeInTheDocument();
    expect(screen.getByText('Confiance Google:')).toBeInTheDocument();
    expect(screen.getByText('Complétude:')).toBeInTheDocument();
  });

  it('devrait afficher les données priorisées par catégorie', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('Accessibilité')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Moyens de paiement')).toBeInTheDocument();
    expect(screen.getByText('Clientèle')).toBeInTheDocument();
    expect(screen.getByText('Services enfants')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
  });

  it('devrait afficher les sources des données', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    // Vérifier que les sources sont affichées
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Manuel')).toBeInTheDocument();
    expect(screen.getByText('Suggéré')).toBeInTheDocument();
  });

  it('devrait afficher les niveaux de confiance', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    // Vérifier que les pourcentages de confiance sont affichés
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('devrait afficher les horaires d\'ouverture', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    expect(screen.getByText('Horaires d\'ouverture')).toBeInTheDocument();
    expect(screen.getByText('Lundi')).toBeInTheDocument();
    expect(screen.getByText('Mardi')).toBeInTheDocument();
    expect(screen.getByText('12:00 - 14:00')).toBeInTheDocument();
  });

  it('devrait appeler onEdit quand on clique sur Modifier', () => {
    render(<SmartSummaryStep {...mockProps} />);
    
    const editButton = screen.getByText('← Modifier');
    fireEvent.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(0);
  });

  it('devrait afficher un message si pas de données d\'enrichissement intelligent', () => {
    const dataWithoutSmart = { ...mockData };
    delete dataWithoutSmart.smartEnrichmentData;
    
    render(<SmartSummaryStep {...mockProps} data={dataWithoutSmart} />);
    
    expect(screen.getByText('🎯 Résumé intelligent de votre établissement')).toBeInTheDocument();
    // Le composant devrait toujours fonctionner sans données d'enrichissement intelligent
  });
});
