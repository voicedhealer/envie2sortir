import React from 'react';
import { render, screen } from '@testing-library/react';
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

// Mock des fonctions utilitaires
jest.mock('@/lib/establishment-form.utils', () => ({
  parseAddressFromGoogle: jest.fn(),
  convertAccessibilityArrayToObject: jest.fn(),
  convertServicesAvailableArrayToObject: jest.fn(),
  convertDiningServicesArrayToObject: jest.fn(),
  convertOfferingsArrayToObject: jest.fn(),
  convertAtmosphereArrayToObject: jest.fn(),
  convertGeneralServicesArrayToObject: jest.fn(),
  convertPaymentMethodsArrayToObject: jest.fn(),
  convertPaymentMethodsObjectToArray: jest.fn(),
  parseAddress: jest.fn(),
  isValidFrenchPhone: jest.fn(),
  isValidEmail: jest.fn(),
  isValidPassword: jest.fn(),
  isValidSiret: jest.fn(),
}));

describe('Récupération des données du formulaire', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialise correctement les données par défaut', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    expect(result.current.formData).toBeDefined();
    expect(result.current.formData.establishmentName).toBe('');
    expect(result.current.formData.description).toBe('');
    expect(result.current.formData.phone).toBe('');
    expect(result.current.formData.email).toBe('');
    expect(result.current.formData.website).toBe('');
    expect(result.current.formData.instagram).toBe('');
    expect(result.current.formData.facebook).toBe('');
    expect(result.current.formData.tiktok).toBe('');
    expect(result.current.formData.youtube).toBe('');
    expect(result.current.formData.activities).toEqual([]);
    expect(result.current.formData.services).toEqual([]);
    expect(result.current.formData.ambiance).toEqual([]);
    expect(result.current.formData.paymentMethods).toEqual([]);
    expect(result.current.formData.tags).toEqual([]);
    expect(result.current.formData.photos).toEqual([]);
  });

  it('met à jour correctement les données lors de la saisie', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    // Tester la saisie des informations générales
    act(() => {
      result.current.handleInputChange('establishmentName', 'Test Bar');
      result.current.handleInputChange('description', 'Description de test');
    });

    expect(result.current.formData.establishmentName).toBe('Test Bar');
    expect(result.current.formData.description).toBe('Description de test');

    // Tester la saisie des contacts
    act(() => {
      result.current.handleInputChange('phone', '03 80 55 30 83');
      result.current.handleInputChange('email', 'test@bar.fr');
    });

    expect(result.current.formData.phone).toBe('03 80 55 30 83');
    expect(result.current.formData.email).toBe('test@bar.fr');

    // Tester la saisie des réseaux sociaux
    act(() => {
      result.current.handleInputChange('website', 'https://test.bar.fr');
      result.current.handleInputChange('instagram', 'https://instagram.com/testbar');
      result.current.handleInputChange('facebook', 'https://facebook.com/testbar');
      result.current.handleInputChange('tiktok', 'https://tiktok.com/@testbar');
      result.current.handleInputChange('youtube', 'https://youtube.com/@testbar');
    });

    expect(result.current.formData.website).toBe('https://test.bar.fr');
    expect(result.current.formData.instagram).toBe('https://instagram.com/testbar');
    expect(result.current.formData.facebook).toBe('https://facebook.com/testbar');
    expect(result.current.formData.tiktok).toBe('https://tiktok.com/@testbar');
    expect(result.current.formData.youtube).toBe('https://youtube.com/@testbar');

    // Tester la saisie des listes
    act(() => {
      result.current.handleInputChange('activities', ['bar', 'restaurant']);
      result.current.handleInputChange('services', ['WiFi', 'Terrasse']);
      result.current.handleInputChange('ambiance', ['Convivial', 'Moderne']);
      result.current.handleInputChange('paymentMethods', ['Carte', 'Espèces']);
      result.current.handleInputChange('tags', ['bar', 'convivial']);
    });

    expect(result.current.formData.activities).toEqual(['bar', 'restaurant']);
    expect(result.current.formData.services).toEqual(['WiFi', 'Terrasse']);
    expect(result.current.formData.ambiance).toEqual(['Convivial', 'Moderne']);
    expect(result.current.formData.paymentMethods).toEqual(['Carte', 'Espèces']);
    expect(result.current.formData.tags).toEqual(['bar', 'convivial']);
  });

  it('gère correctement les données d\'adresse complexes', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    const complexAddress = {
      street: '10 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522
    };

    act(() => {
      result.current.handleInputChange('address', complexAddress);
    });

    expect(result.current.formData.address).toEqual(complexAddress);
  });

  it('gère correctement les horaires complexes', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    const complexHours = {
      monday: {
        isOpen: true,
        slots: [
          { name: 'Matin', open: '08:00', close: '12:00' },
          { name: 'Soirée', open: '18:00', close: '02:00' }
        ]
      },
      tuesday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      wednesday: {
        isOpen: false,
        slots: []
      }
    };

    act(() => {
      result.current.handleInputChange('hours', complexHours);
    });

    expect(result.current.formData.hours).toEqual(complexHours);
  });

  it('gère correctement les fichiers photos', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    const mockFiles = [
      new File([''], 'photo1.jpg', { type: 'image/jpeg' }),
      new File([''], 'photo2.jpg', { type: 'image/jpeg' }),
      new File([''], 'photo3.jpg', { type: 'image/jpeg' })
    ];

    act(() => {
      result.current.handleInputChange('photos', mockFiles);
    });

    expect(result.current.formData.photos).toEqual(mockFiles);
    expect(result.current.formData.photos).toHaveLength(3);
  });

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

  it('gère correctement la navigation entre les étapes', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    // Vérifier l'étape initiale
    expect(result.current.currentStep).toBe(0);

    // Aller à l'étape suivante
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);

    // Aller à l'étape précédente
    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('valide correctement les étapes', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    // Remplir les données obligatoires
    act(() => {
      result.current.handleInputChange('establishmentName', 'Test Bar');
      result.current.handleInputChange('description', 'Description test');
      result.current.handleInputChange('address', {
        street: '10 Rue Test',
        city: 'Test City',
        postalCode: '21000'
      });
    });

    // Valider l'étape
    act(() => {
      const isValid = result.current.validateStep(1);
      expect(isValid).toBe(true);
    });
  });

  it('gère correctement les erreurs de validation', () => {
    const { result } = renderHook(() => useEstablishmentForm({ isEditMode: false }));

    // Essayer de valider sans données
    act(() => {
      const isValid = result.current.validateStep(1);
      expect(isValid).toBe(false);
    });

    // Vérifier que les erreurs sont définies
    expect(result.current.errors).toBeDefined();
  });
});
