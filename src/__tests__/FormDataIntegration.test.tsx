import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryStep from '@/components/forms/SummaryStep';

// Test des données d'intégration
describe('Test d\'intégration des données du formulaire', () => {
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche correctement toutes les données saisies dans le formulaire', () => {
    const completeFormData = {
      // Informations générales
      establishmentName: 'Le Central Bar',
      description: 'Un bar convivial au cœur de la ville avec une ambiance chaleureuse',
      address: {
        street: '10 Rue Principale',
        city: 'Dijon',
        postalCode: '21000',
        latitude: 47.322,
        longitude: 5.041
      },
      activities: ['bar', 'restaurant', 'soirée', 'concert'],
      
      // Horaires
      hours: {
        monday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        tuesday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        wednesday: { isOpen: false, slots: [] },
        thursday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        friday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        saturday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        sunday: { isOpen: false, slots: [] }
      },
      
      // Services et ambiance
      services: ['WiFi', 'Terrasse', 'Parking', 'Climatisation'],
      ambiance: ['Convivial', 'Moderne', 'Chaleureux', 'Bruyant'],
      
      // Moyens de paiement
      paymentMethods: ['Carte bancaire', 'Espèces', 'Tickets restaurant', 'PayPal'],
      
      // Tags de recherche
      tags: ['bar', 'restaurant', 'soirée', 'convivial', 'musique'],
      
      // Photos
      photos: [
        new File([''], 'photo1.jpg', { type: 'image/jpeg' }),
        new File([''], 'photo2.jpg', { type: 'image/jpeg' }),
        new File([''], 'photo3.jpg', { type: 'image/jpeg' })
      ],
      
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

    render(<SummaryStep data={completeFormData} onEdit={mockOnEdit} />);

    // Vérifier les informations générales
    expect(screen.getByText('Le Central Bar')).toBeInTheDocument();
    expect(screen.getByText('Un bar convivial au cœur de la ville avec une ambiance chaleureuse')).toBeInTheDocument();
    expect(screen.getByText('10 Rue Principale, Dijon, 21000')).toBeInTheDocument();
    
    // Vérifier les activités
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('restaurant')).toBeInTheDocument();
    expect(screen.getByText('soirée')).toBeInTheDocument();
    expect(screen.getByText('concert')).toBeInTheDocument();
    
    // Vérifier les horaires
    expect(screen.getByText(/Lundi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
    expect(screen.getByText(/Mardi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
    expect(screen.getByText(/Jeudi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
    
    // Vérifier les services
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Terrasse')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
    expect(screen.getByText('Climatisation')).toBeInTheDocument();
    
    // Vérifier l'ambiance
    expect(screen.getByText('Convivial')).toBeInTheDocument();
    expect(screen.getByText('Moderne')).toBeInTheDocument();
    expect(screen.getByText('Chaleureux')).toBeInTheDocument();
    expect(screen.getByText('Bruyant')).toBeInTheDocument();
    
    // Vérifier les moyens de paiement
    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Espèces')).toBeInTheDocument();
    expect(screen.getByText('Tickets restaurant')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    
    // Vérifier les tags
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Soirée')).toBeInTheDocument();
    expect(screen.getByText('Convivial')).toBeInTheDocument();
    expect(screen.getByText('Musique')).toBeInTheDocument();
    
    // Vérifier les photos
    expect(screen.getByText('3 photo(s) sélectionnée(s)')).toBeInTheDocument();
    
    // Vérifier les contacts
    expect(screen.getByText('03 80 55 30 83')).toBeInTheDocument();
    expect(screen.getByText('contact@centralbar.fr')).toBeInTheDocument();
    expect(screen.getByText('0767093485')).toBeInTheDocument();
    expect(screen.getByText('pro@centralbar.fr')).toBeInTheDocument();
    
    // Vérifier tous les réseaux sociaux
    expect(screen.getByText('https://www.centralbar.fr')).toBeInTheDocument();
    expect(screen.getByText('https://www.instagram.com/centralbar')).toBeInTheDocument();
    expect(screen.getByText('https://www.facebook.com/centralbar')).toBeInTheDocument();
    expect(screen.getByText('https://www.tiktok.com/@centralbar')).toBeInTheDocument();
    expect(screen.getByText('https://www.youtube.com/@centralbar')).toBeInTheDocument();
  });

  it('gère correctement les données partielles', () => {
    const partialFormData = {
      establishmentName: 'Bar Partiel',
      description: '',
      address: 'Adresse simple',
      activities: ['bar'],
      hours: {},
      services: [],
      ambiance: [],
      paymentMethods: [],
      tags: [],
      photos: [],
      phone: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      professionalPhone: '',
      professionalEmail: ''
    };

    render(<SummaryStep data={partialFormData} onEdit={mockOnEdit} />);

    // Vérifier que les données présentes sont affichées
    expect(screen.getByText('Bar Partiel')).toBeInTheDocument();
    expect(screen.getByText('Adresse simple')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
    
    // Vérifier que les champs vides affichent "Non renseigné"
    expect(screen.getAllByText('Non renseigné')).toHaveLength(7); // 7 champs vides
    expect(screen.getByText('Aucune description fournie')).toBeInTheDocument();
    expect(screen.getByText('Aucun service sélectionné')).toBeInTheDocument();
    expect(screen.getByText('Aucune ambiance définie')).toBeInTheDocument();
    expect(screen.getByText('Aucun moyen de paiement défini')).toBeInTheDocument();
    expect(screen.getByText('Aucun tag sélectionné')).toBeInTheDocument();
    expect(screen.getByText('Aucune photo')).toBeInTheDocument();
  });

  it('teste la navigation entre les étapes', () => {
    const formData = {
      establishmentName: 'Test Navigation',
      description: 'Test description',
      address: 'Test address',
      activities: ['test'],
      hours: {},
      services: [],
      ambiance: [],
      paymentMethods: [],
      tags: [],
      photos: [],
      phone: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      professionalPhone: '',
      professionalEmail: ''
    };

    render(<SummaryStep data={formData} onEdit={mockOnEdit} />);

    // Vérifier que tous les boutons "Modifier" sont présents
    const modifyButtons = screen.getAllByText('Modifier');
    expect(modifyButtons).toHaveLength(7); // 7 sections avec boutons modifier

    // Tester le clic sur chaque bouton
    modifyButtons.forEach((button, index) => {
      fireEvent.click(button);
      expect(mockOnEdit).toHaveBeenCalledWith(index + 1);
    });
  });

  it('vérifie la cohérence des types de données', () => {
    const formDataWithMixedTypes = {
      establishmentName: 'Test Types',
      description: 'Description avec des caractères spéciaux: éàçù€£',
      address: {
        street: '10 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522
      },
      activities: ['bar', 'restaurant', 'café'],
      hours: {
        monday: { isOpen: true, slots: [{ name: 'Matin', open: '08:00', close: '12:00' }] }
      },
      services: ['WiFi gratuit', 'Terrasse chauffée'],
      ambiance: ['Familial', 'Romantique'],
      paymentMethods: ['Carte bancaire', 'Espèces', 'Chèque'],
      tags: ['bar', 'restaurant', 'café', 'familial'],
      photos: [new File([''], 'test.jpg')],
      phone: '+33 1 23 45 67 89',
      email: 'test@example.com',
      website: 'https://www.example.com',
      instagram: '@testbar',
      facebook: 'https://facebook.com/testbar',
      tiktok: 'https://tiktok.com/@testbar',
      youtube: 'https://youtube.com/@testbar',
      professionalPhone: '06 12 34 56 78',
      professionalEmail: 'pro@testbar.com'
    };

    render(<SummaryStep data={formDataWithMixedTypes} onEdit={mockOnEdit} />);

    // Vérifier que les caractères spéciaux sont correctement affichés
    expect(screen.getByText('Description avec des caractères spéciaux: éàçù€£')).toBeInTheDocument();
    
    // Vérifier que les URLs sont correctement affichées
    expect(screen.getByText('https://www.example.com')).toBeInTheDocument();
    expect(screen.getByText('@testbar')).toBeInTheDocument();
    expect(screen.getByText('https://facebook.com/testbar')).toBeInTheDocument();
    expect(screen.getByText('https://tiktok.com/@testbar')).toBeInTheDocument();
    expect(screen.getByText('https://youtube.com/@testbar')).toBeInTheDocument();
    
    // Vérifier que les numéros de téléphone sont correctement affichés
    expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
    expect(screen.getByText('06 12 34 56 78')).toBeInTheDocument();
    
    // Vérifier que les emails sont correctement affichés
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('pro@testbar.com')).toBeInTheDocument();
  });
});
