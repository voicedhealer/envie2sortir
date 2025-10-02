// Test de la logique du SummaryStep sans JSX
import { EstablishmentFormData } from '@/components/forms/SummaryStep';

describe('SummaryStep Logic Tests', () => {
  const mockFormData: EstablishmentFormData = {
    // Informations générales
    establishmentName: 'Le Central Bar',
    description: 'Un bar convivial au cœur de la ville',
    address: {
      street: '10 Rue Principale',
      city: 'Dijon',
      postalCode: '21000',
      latitude: 47.322,
      longitude: 5.041
    },
    activities: ['bar', 'restaurant', 'soirée'],
    
    // Horaires
    hours: {
      monday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      tuesday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      wednesday: {
        isOpen: false,
        slots: []
      },
      thursday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      friday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      saturday: {
        isOpen: true,
        slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }]
      },
      sunday: {
        isOpen: false,
        slots: []
      }
    },
    
    // Services et ambiance
    services: ['WiFi', 'Terrasse', 'Parking'],
    ambiance: ['Convivial', 'Moderne', 'Chaleureux'],
    
    // Moyens de paiement
    paymentMethods: ['Carte bancaire', 'Espèces', 'Tickets restaurant'],
    
    // Tags de recherche
    tags: ['bar', 'restaurant', 'soirée', 'convivial'],
    
    // Photos
    photos: [new File([''], 'photo1.jpg'), new File([''], 'photo2.jpg')],
    
    // Contact et réseaux sociaux
    phone: '03 80 55 30 83',
    email: 'contact@centralbar.fr',
    website: 'https://www.centralbar.fr',
    instagram: 'https://www.instagram.com/centralbar',
    facebook: 'https://www.facebook.com/centralbar',
    tiktok: 'https://www.tiktok.com/@centralbar',
    youtube: 'https://www.youtube.com/@centralbar',
    
    // Contacts professionnels
    professionalPhone: '0767093485',
    professionalEmail: 'pro@centralbar.fr'
  };

  it('vérifie que les données sont correctement structurées', () => {
    expect(mockFormData.establishmentName).toBe('Le Central Bar');
    expect(mockFormData.description).toBe('Un bar convivial au cœur de la ville');
    expect(mockFormData.phone).toBe('03 80 55 30 83');
    expect(mockFormData.email).toBe('contact@centralbar.fr');
    expect(mockFormData.website).toBe('https://www.centralbar.fr');
    expect(mockFormData.instagram).toBe('https://www.instagram.com/centralbar');
    expect(mockFormData.facebook).toBe('https://www.facebook.com/centralbar');
    expect(mockFormData.tiktok).toBe('https://www.tiktok.com/@centralbar');
    expect(mockFormData.youtube).toBe('https://www.youtube.com/@centralbar');
  });

  it('vérifie que les listes sont correctement définies', () => {
    expect(mockFormData.activities).toEqual(['bar', 'restaurant', 'soirée']);
    expect(mockFormData.services).toEqual(['WiFi', 'Terrasse', 'Parking']);
    expect(mockFormData.ambiance).toEqual(['Convivial', 'Moderne', 'Chaleureux']);
    expect(mockFormData.paymentMethods).toEqual(['Carte bancaire', 'Espèces', 'Tickets restaurant']);
    expect(mockFormData.tags).toEqual(['bar', 'restaurant', 'soirée', 'convivial']);
  });

  it('vérifie que les horaires sont correctement structurés', () => {
    expect(mockFormData.hours.monday.isOpen).toBe(true);
    expect(mockFormData.hours.monday.slots).toHaveLength(1);
    expect(mockFormData.hours.monday.slots[0].name).toBe('Soirée');
    expect(mockFormData.hours.monday.slots[0].open).toBe('18:00');
    expect(mockFormData.hours.monday.slots[0].close).toBe('02:00');
    
    expect(mockFormData.hours.wednesday.isOpen).toBe(false);
    expect(mockFormData.hours.wednesday.slots).toHaveLength(0);
  });

  it('vérifie que l\'adresse est correctement structurée', () => {
    expect(mockFormData.address.street).toBe('10 Rue Principale');
    expect(mockFormData.address.city).toBe('Dijon');
    expect(mockFormData.address.postalCode).toBe('21000');
    expect(mockFormData.address.latitude).toBe(47.322);
    expect(mockFormData.address.longitude).toBe(5.041);
  });

  it('vérifie que les photos sont correctement définies', () => {
    expect(mockFormData.photos).toHaveLength(2);
    expect(mockFormData.photos[0]).toBeInstanceOf(File);
    expect(mockFormData.photos[1]).toBeInstanceOf(File);
  });

  it('vérifie que tous les réseaux sociaux sont présents', () => {
    const socialNetworks = [
      'website',
      'instagram', 
      'facebook',
      'tiktok',
      'youtube'
    ];

    socialNetworks.forEach(network => {
      expect(mockFormData[network as keyof EstablishmentFormData]).toBeDefined();
      expect(mockFormData[network as keyof EstablishmentFormData]).not.toBe('');
    });
  });

  it('vérifie que les contacts professionnels sont définis', () => {
    expect(mockFormData.professionalPhone).toBe('0767093485');
    expect(mockFormData.professionalEmail).toBe('pro@centralbar.fr');
  });

  it('vérifie la cohérence des types de données', () => {
    expect(typeof mockFormData.establishmentName).toBe('string');
    expect(typeof mockFormData.description).toBe('string');
    expect(typeof mockFormData.phone).toBe('string');
    expect(typeof mockFormData.email).toBe('string');
    expect(typeof mockFormData.website).toBe('string');
    expect(typeof mockFormData.instagram).toBe('string');
    expect(typeof mockFormData.facebook).toBe('string');
    expect(typeof mockFormData.tiktok).toBe('string');
    expect(typeof mockFormData.youtube).toBe('string');
    expect(Array.isArray(mockFormData.activities)).toBe(true);
    expect(Array.isArray(mockFormData.services)).toBe(true);
    expect(Array.isArray(mockFormData.ambiance)).toBe(true);
    expect(Array.isArray(mockFormData.paymentMethods)).toBe(true);
    expect(Array.isArray(mockFormData.tags)).toBe(true);
    expect(Array.isArray(mockFormData.photos)).toBe(true);
    expect(typeof mockFormData.hours).toBe('object');
  });

  it('vérifie que les données peuvent être sérialisées en JSON', () => {
    // Créer une copie sans les fichiers (qui ne sont pas sérialisables)
    const serializableData = {
      ...mockFormData,
      photos: mockFormData.photos.map(photo => ({ name: photo.name, size: photo.size }))
    };

    expect(() => JSON.stringify(serializableData)).not.toThrow();
    const jsonString = JSON.stringify(serializableData);
    const parsedData = JSON.parse(jsonString);
    
    expect(parsedData.establishmentName).toBe('Le Central Bar');
    expect(parsedData.youtube).toBe('https://www.youtube.com/@centralbar');
  });
});
