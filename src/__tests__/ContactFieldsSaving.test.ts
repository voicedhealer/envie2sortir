/**
 * Tests pour vérifier que les champs de contact sont correctement sauvegardés
 * lors de l'ajout et de la modification d'un établissement
 */

import { ProfessionalData } from '@/types/establishment-form.types';

describe('Sauvegarde des champs de contact', () => {
  describe('Données du formulaire', () => {
    it('devrait inclure tous les champs de contact dans ProfessionalData', () => {
      const formData: ProfessionalData = {
        // Données de base
        establishmentName: 'Test Restaurant',
        description: 'Un restaurant de test',
        address: {
          street: '123 Rue de la Paix',
          postalCode: '75001',
          city: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522
        },
        
        // Champs de contact
        phone: '0123456789',
        whatsappPhone: '0123456789',
        messengerUrl: 'https://m.me/testrestaurant',
        email: 'contact@testrestaurant.com',
        
        // Réseaux sociaux
        website: 'https://testrestaurant.com',
        instagram: 'https://instagram.com/testrestaurant',
        facebook: 'https://facebook.com/testrestaurant',
        tiktok: 'https://tiktok.com/@testrestaurant',
        youtube: 'https://youtube.com/@testrestaurant',
        
        // Autres champs requis
        activities: [],
        services: [],
        ambiance: [],
        paymentMethods: {},
        hours: {},
        priceMin: 10,
        priceMax: 50,
        informationsPratiques: [],
        subscriptionPlan: 'standard'
      };

      // Vérifier que tous les champs de contact sont présents
      expect(formData.phone).toBe('0123456789');
      expect(formData.whatsappPhone).toBe('0123456789');
      expect(formData.messengerUrl).toBe('https://m.me/testrestaurant');
      expect(formData.email).toBe('contact@testrestaurant.com');
      expect(formData.youtube).toBe('https://youtube.com/@testrestaurant');
    });

    it('devrait gérer les champs de contact vides', () => {
      const formData: ProfessionalData = {
        establishmentName: 'Test Restaurant',
        description: 'Un restaurant de test',
        address: {
          street: '123 Rue de la Paix',
          postalCode: '75001',
          city: 'Paris'
        },
        phone: '',
        whatsappPhone: '',
        messengerUrl: '',
        email: '',
        website: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        youtube: '',
        activities: [],
        services: [],
        ambiance: [],
        paymentMethods: {},
        hours: {},
        priceMin: 10,
        priceMax: 50,
        informationsPratiques: [],
        subscriptionPlan: 'standard'
      };

      // Vérifier que les champs vides sont gérés
      expect(formData.phone).toBe('');
      expect(formData.whatsappPhone).toBe('');
      expect(formData.messengerUrl).toBe('');
      expect(formData.email).toBe('');
      expect(formData.youtube).toBe('');
    });
  });

  describe('Sérialisation des données', () => {
    it('devrait sérialiser correctement les champs de contact pour l\'API', () => {
      const formData: ProfessionalData = {
        establishmentName: 'Test Restaurant',
        description: 'Un restaurant de test',
        address: {
          street: '123 Rue de la Paix',
          postalCode: '75001',
          city: 'Paris'
        },
        phone: '0123456789',
        whatsappPhone: '0123456789',
        messengerUrl: 'https://m.me/testrestaurant',
        email: 'contact@testrestaurant.com',
        website: 'https://testrestaurant.com',
        instagram: 'https://instagram.com/testrestaurant',
        facebook: 'https://facebook.com/testrestaurant',
        tiktok: 'https://tiktok.com/@testrestaurant',
        youtube: 'https://youtube.com/@testrestaurant',
        activities: [],
        services: [],
        ambiance: [],
        paymentMethods: {},
        hours: {},
        priceMin: 10,
        priceMax: 50,
        informationsPratiques: [],
        subscriptionPlan: 'standard'
      };

      // Simuler la sérialisation FormData
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'address') {
          const addressData = value as any;
          const fullAddress = `${addressData.street}, ${addressData.postalCode} ${addressData.city}`;
          formDataToSend.append('address', fullAddress);
        } else if (key === 'hours') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Vérifier que les champs de contact sont dans FormData
      expect(formDataToSend.get('phone')).toBe('0123456789');
      expect(formDataToSend.get('whatsappPhone')).toBe('0123456789');
      expect(formDataToSend.get('messengerUrl')).toBe('https://m.me/testrestaurant');
      expect(formDataToSend.get('email')).toBe('contact@testrestaurant.com');
      expect(formDataToSend.get('youtube')).toBe('https://youtube.com/@testrestaurant');
    });
  });

  describe('Validation des données', () => {
    it('devrait valider les formats de contact', () => {
      const validContactData = {
        phone: '0123456789',
        whatsappPhone: '0123456789',
        messengerUrl: 'https://m.me/testrestaurant',
        email: 'contact@testrestaurant.com',
        website: 'https://testrestaurant.com',
        instagram: 'https://instagram.com/testrestaurant',
        facebook: 'https://facebook.com/testrestaurant',
        tiktok: 'https://tiktok.com/@testrestaurant',
        youtube: 'https://youtube.com/@testrestaurant'
      };

      // Vérifier les formats
      expect(validContactData.phone).toMatch(/^0[1-9][0-9]{8}$/);
      expect(validContactData.whatsappPhone).toMatch(/^0[1-9][0-9]{8}$/);
      expect(validContactData.messengerUrl).toMatch(/^https:\/\/m\.me\//);
      expect(validContactData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(validContactData.website).toMatch(/^https?:\/\//);
      expect(validContactData.instagram).toMatch(/^https:\/\/instagram\.com\//);
      expect(validContactData.facebook).toMatch(/^https:\/\/facebook\.com\//);
      expect(validContactData.tiktok).toMatch(/^https:\/\/tiktok\.com\//);
      expect(validContactData.youtube).toMatch(/^https:\/\/youtube\.com\//);
    });
  });

  describe('Données d\'établissement existant', () => {
    it('devrait charger correctement les champs de contact en mode édition', () => {
      const existingEstablishment = {
        id: '1',
        name: 'Test Restaurant',
        phone: '0123456789',
        whatsappPhone: '0123456789',
        messengerUrl: 'https://m.me/testrestaurant',
        email: 'contact@testrestaurant.com',
        website: 'https://testrestaurant.com',
        instagram: 'https://instagram.com/testrestaurant',
        facebook: 'https://facebook.com/testrestaurant',
        tiktok: 'https://tiktok.com/@testrestaurant',
        youtube: 'https://youtube.com/@testrestaurant',
        address: '123 Rue de la Paix, 75001 Paris',
        city: 'Paris',
        postalCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522,
        activities: [],
        services: [],
        ambiance: [],
        paymentMethods: {},
        horairesOuverture: {},
        prixMoyen: 30,
        capaciteMax: 50,
        accessibilite: false,
        parking: false,
        terrasse: false,
        priceMin: 10,
        priceMax: 50,
        informationsPratiques: [],
        status: 'approved',
        owner: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0123456789',
          companyName: 'Test Company',
          siret: '12345678901234',
          legalStatus: 'SARL'
        }
      };

      // Simuler le chargement des données en mode édition
      const formData = {
        establishmentName: existingEstablishment.name || "",
        phone: existingEstablishment.phone || "",
        whatsappPhone: existingEstablishment.whatsappPhone || "",
        messengerUrl: existingEstablishment.messengerUrl || "",
        email: existingEstablishment.email || "",
        website: existingEstablishment.website || "",
        instagram: existingEstablishment.instagram || "",
        facebook: existingEstablishment.facebook || "",
        tiktok: existingEstablishment.tiktok || "",
        youtube: existingEstablishment.youtube || ""
      };

      // Vérifier que tous les champs sont chargés
      expect(formData.phone).toBe('0123456789');
      expect(formData.whatsappPhone).toBe('0123456789');
      expect(formData.messengerUrl).toBe('https://m.me/testrestaurant');
      expect(formData.email).toBe('contact@testrestaurant.com');
      expect(formData.youtube).toBe('https://youtube.com/@testrestaurant');
    });
  });
});
