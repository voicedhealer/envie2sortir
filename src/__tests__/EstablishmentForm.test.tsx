import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';
import { useEstablishmentForm } from '@/hooks/useEstablishmentForm';

// Mock des dépendances
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'professional' } },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
}));

// Mock du composant SummaryStep pour tester les données
const MockSummaryStep = ({ data, onEdit }: any) => {
  return (
    <div data-testid="summary-step">
      <h2>Récapitulatif</h2>
      <div data-testid="establishment-name">{data.establishmentName}</div>
      <div data-testid="description">{data.description}</div>
      <div data-testid="address">{typeof data.address === 'string' ? data.address : JSON.stringify(data.address)}</div>
      <div data-testid="activities">{data.activities?.join(', ')}</div>
      <div data-testid="phone">{data.phone}</div>
      <div data-testid="email">{data.email}</div>
      <div data-testid="website">{data.website}</div>
      <div data-testid="instagram">{data.instagram}</div>
      <div data-testid="facebook">{data.facebook}</div>
      <div data-testid="tiktok">{data.tiktok}</div>
      <div data-testid="youtube">{data.youtube}</div>
      <div data-testid="services">{data.services?.join(', ')}</div>
      <div data-testid="ambiance">{data.ambiance?.join(', ')}</div>
      <div data-testid="payment-methods">{data.paymentMethods?.join(', ')}</div>
      <div data-testid="tags">{data.tags?.join(', ')}</div>
      <div data-testid="photos-count">{data.photos?.length || 0}</div>
      <button onClick={() => onEdit(1)}>Modifier</button>
    </div>
  );
};

describe('EstablishmentForm - Récupération des données', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialise correctement les données du formulaire', () => {
    render(<TestComponent />);
    
    // Vérifier que les champs sont initialisés
    expect(screen.getByTestId('establishment-name')).toHaveTextContent('');
    expect(screen.getByTestId('description')).toHaveTextContent('');
    expect(screen.getByTestId('phone')).toHaveTextContent('');
    expect(screen.getByTestId('email')).toHaveTextContent('');
    expect(screen.getByTestId('website')).toHaveTextContent('');
    expect(screen.getByTestId('instagram')).toHaveTextContent('');
    expect(screen.getByTestId('facebook')).toHaveTextContent('');
    expect(screen.getByTestId('tiktok')).toHaveTextContent('');
    expect(screen.getByTestId('youtube')).toHaveTextContent('');
  });

  it('gère correctement les données de test', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));
    
    // Simuler la saisie de données
    act(() => {
      result.current.handleInputChange('establishmentName', 'Test Bar');
      result.current.handleInputChange('description', 'Un bar de test');
      result.current.handleInputChange('phone', '03 80 55 30 83');
      result.current.handleInputChange('email', 'test@bar.fr');
      result.current.handleInputChange('website', 'https://test.bar.fr');
      result.current.handleInputChange('instagram', 'https://instagram.com/testbar');
      result.current.handleInputChange('facebook', 'https://facebook.com/testbar');
      result.current.handleInputChange('tiktok', 'https://tiktok.com/@testbar');
      result.current.handleInputChange('youtube', 'https://youtube.com/@testbar');
      result.current.handleInputChange('activities', ['bar', 'restaurant']);
      result.current.handleInputChange('services', ['WiFi', 'Terrasse']);
      result.current.handleInputChange('ambiance', ['Convivial', 'Moderne']);
      result.current.handleInputChange('paymentMethods', ['Carte', 'Espèces']);
      result.current.handleInputChange('tags', ['bar', 'convivial']);
    });

    expect(result.current.formData.establishmentName).toBe('Test Bar');
    expect(result.current.formData.description).toBe('Un bar de test');
    expect(result.current.formData.phone).toBe('03 80 55 30 83');
    expect(result.current.formData.email).toBe('test@bar.fr');
    expect(result.current.formData.website).toBe('https://test.bar.fr');
    expect(result.current.formData.instagram).toBe('https://instagram.com/testbar');
    expect(result.current.formData.facebook).toBe('https://facebook.com/testbar');
    expect(result.current.formData.tiktok).toBe('https://tiktok.com/@testbar');
    expect(result.current.formData.youtube).toBe('https://youtube.com/@testbar');
    expect(result.current.formData.activities).toEqual(['bar', 'restaurant']);
    expect(result.current.formData.services).toEqual(['WiFi', 'Terrasse']);
    expect(result.current.formData.ambiance).toEqual(['Convivial', 'Moderne']);
    expect(result.current.formData.paymentMethods).toEqual(['Carte', 'Espèces']);
    expect(result.current.formData.tags).toEqual(['bar', 'convivial']);
  });
});

// Test pour vérifier la cohérence des données entre les étapes
describe('Cohérence des données entre les étapes', () => {
  it('maintient la cohérence des données lors de la navigation', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));
    
    // Saisir des données à l'étape 1
    act(() => {
      result.current.handleInputChange('establishmentName', 'Bar Test');
      result.current.handleInputChange('description', 'Description test');
    });
    
    // Aller à l'étape suivante
    act(() => {
      result.current.nextStep();
    });
    
    // Vérifier que les données sont conservées
    expect(result.current.formData.establishmentName).toBe('Bar Test');
    expect(result.current.formData.description).toBe('Description test');
    
    // Saisir des données à l'étape des réseaux sociaux
    act(() => {
      result.current.handleInputChange('phone', '03 80 55 30 83');
      result.current.handleInputChange('youtube', 'https://youtube.com/@bartest');
    });
    
    // Aller à l'étape de résumé
    act(() => {
      result.current.nextStep();
    });
    
    // Vérifier que toutes les données sont présentes
    expect(result.current.formData.establishmentName).toBe('Bar Test');
    expect(result.current.formData.description).toBe('Description test');
    expect(result.current.formData.phone).toBe('03 80 55 30 83');
    expect(result.current.formData.youtube).toBe('https://youtube.com/@bartest');
  });
});

// Test pour vérifier la validation des données
describe('Validation des données', () => {
  it('valide correctement les champs obligatoires', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));
    
    // Essayer de valider sans données
    act(() => {
      const isValid = result.current.validateStep(1);
      expect(isValid).toBe(false);
    });
    
    // Remplir les champs obligatoires
    act(() => {
      result.current.handleInputChange('establishmentName', 'Bar Test');
      result.current.handleInputChange('description', 'Description test');
      result.current.handleInputChange('address', {
        street: '10 Rue Test',
        city: 'Test City',
        postalCode: '21000'
      });
    });
    
    // Valider à nouveau
    act(() => {
      const isValid = result.current.validateStep(1);
      expect(isValid).toBe(true);
    });
  });
});

// Test pour vérifier le mode édition
describe('Mode édition', () => {
  it('pré-remplit correctement les données en mode édition', () => {
    const existingEstablishment = {
      id: '1',
      name: 'Bar Existant',
      description: 'Description existante',
      address: 'Adresse existante',
      city: 'Ville existante',
      postalCode: '21000',
      phone: '03 80 55 30 83',
      email: 'existant@bar.fr',
      website: 'https://existant.bar.fr',
      instagram: 'https://instagram.com/existant',
      facebook: 'https://facebook.com/existant',
      tiktok: 'https://tiktok.com/@existant',
      youtube: 'https://youtube.com/@existant',
      activities: ['bar', 'restaurant'],
      services: ['WiFi'],
      ambiance: ['Convivial'],
      paymentMethods: ['Carte'],
      tags: ['bar'],
      horairesOuverture: {},
      prixMoyen: 25,
      capaciteMax: 50,
      accessibilite: false,
      parking: true,
      terrasse: true,
      status: 'approved' as const,
      subscription: 'FREE' as const,
      ownerId: 'owner1',
      rejectionReason: null,
      rejectedAt: null,
      lastModifiedAt: new Date(),
      viewsCount: 0,
      clicksCount: 0,
      avgRating: null,
      totalComments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: null,
      priceMax: null,
      priceMin: null,
      informationsPratiques: null,
      googlePlaceId: null,
      theForkLink: null,
      uberEatsLink: null,
      owner: {
        id: 'owner1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.fr',
        phone: '0767093485'
      }
    };

    const { result } = renderHook(() => 
      useEstablishmentForm({ establishment: existingEstablishment, isEditMode: true })
    );

    expect(result.current.formData.establishmentName).toBe('Bar Existant');
    expect(result.current.formData.description).toBe('Description existante');
    expect(result.current.formData.phone).toBe('03 80 55 30 83');
    expect(result.current.formData.email).toBe('existant@bar.fr');
    expect(result.current.formData.website).toBe('https://existant.bar.fr');
    expect(result.current.formData.instagram).toBe('https://instagram.com/existant');
    expect(result.current.formData.facebook).toBe('https://facebook.com/existant');
    expect(result.current.formData.tiktok).toBe('https://tiktok.com/@existant');
    expect(result.current.formData.youtube).toBe('https://youtube.com/@existant');
  });
});
