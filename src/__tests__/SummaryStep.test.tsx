import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryStep, { EstablishmentFormData } from '@/components/forms/SummaryStep';

// Mock des données de test
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

const mockOnEdit = jest.fn();

describe('SummaryStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche correctement le titre et la description', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Récapitulatif de votre établissement')).toBeInTheDocument();
    expect(screen.getByText('Vérifiez toutes les informations avant la validation finale')).toBeInTheDocument();
  });

  it('affiche correctement les informations générales', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Informations générales')).toBeInTheDocument();
    expect(screen.getByText('Le Central Bar')).toBeInTheDocument();
    expect(screen.getByText('Un bar convivial au cœur de la ville')).toBeInTheDocument();
    expect(screen.getByText('10 Rue Principale, Dijon, 21000')).toBeInTheDocument();
    
    // Vérifier les activités
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('restaurant')).toBeInTheDocument();
    expect(screen.getByText('soirée')).toBeInTheDocument();
  });

  it('affiche correctement les horaires d\'ouverture', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Horaires d\'ouverture')).toBeInTheDocument();
    expect(screen.getByText(/Lundi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
    expect(screen.getByText(/Mardi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
    expect(screen.getByText(/Jeudi: Soirée \(18:00-02:00\)/)).toBeInTheDocument();
  });

  it('affiche correctement les services et ambiance', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Services & Ambiance')).toBeInTheDocument();
    
    // Services
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Terrasse')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
    
    // Ambiance
    expect(screen.getByText('Convivial')).toBeInTheDocument();
    expect(screen.getByText('Moderne')).toBeInTheDocument();
    expect(screen.getByText('Chaleureux')).toBeInTheDocument();
  });

  it('affiche correctement les moyens de paiement', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Moyens de paiement')).toBeInTheDocument();
    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Espèces')).toBeInTheDocument();
    expect(screen.getByText('Tickets restaurant')).toBeInTheDocument();
  });

  it('affiche correctement les tags de recherche', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Tags de recherche')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Soirée')).toBeInTheDocument();
    expect(screen.getByText('Convivial')).toBeInTheDocument();
  });

  it('affiche correctement les photos', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('2 photo(s) sélectionnée(s)')).toBeInTheDocument();
    expect(screen.getByText('Les photos seront ajoutées sur votre page d\'établissement')).toBeInTheDocument();
  });

  it('affiche correctement les contacts', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Contact & Réseaux sociaux')).toBeInTheDocument();
    
    // Contact établissement
    expect(screen.getByText('Contact établissement')).toBeInTheDocument();
    expect(screen.getByText('Visible clients')).toBeInTheDocument();
    expect(screen.getByText('03 80 55 30 83')).toBeInTheDocument();
    expect(screen.getByText('contact@centralbar.fr')).toBeInTheDocument();
    
    // Contact professionnel
    expect(screen.getByText('Contact professionnel')).toBeInTheDocument();
    expect(screen.getByText('Admin uniquement')).toBeInTheDocument();
    expect(screen.getByText('0767093485')).toBeInTheDocument();
    expect(screen.getByText('pro@centralbar.fr')).toBeInTheDocument();
  });

  it('affiche correctement tous les réseaux sociaux', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Réseaux sociaux')).toBeInTheDocument();
    
    // Vérifier tous les réseaux sociaux
    expect(screen.getByText('Site web')).toBeInTheDocument();
    expect(screen.getByText('https://www.centralbar.fr')).toBeInTheDocument();
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('https://www.instagram.com/centralbar')).toBeInTheDocument();
    
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('https://www.facebook.com/centralbar')).toBeInTheDocument();
    
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('https://www.tiktok.com/@centralbar')).toBeInTheDocument();
    
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('https://www.youtube.com/@centralbar')).toBeInTheDocument();
  });

  it('affiche "Non renseigné" pour les champs vides', () => {
    const emptyData: EstablishmentFormData = {
      ...mockFormData,
      phone: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: ''
    };

    render(<SummaryStep data={emptyData} onEdit={mockOnEdit} />);
    
    expect(screen.getAllByText('Non renseigné')).toHaveLength(7); // 7 champs vides
  });

  it('appelle onEdit avec le bon numéro d\'étape quand on clique sur Modifier', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    const modifyButtons = screen.getAllByText('Modifier');
    
    // Cliquer sur le premier bouton (Informations générales)
    fireEvent.click(modifyButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(1);
    
    // Cliquer sur le deuxième bouton (Horaires)
    fireEvent.click(modifyButtons[1]);
    expect(mockOnEdit).toHaveBeenCalledWith(2);
    
    // Cliquer sur le dernier bouton (Contact & Réseaux sociaux)
    fireEvent.click(modifyButtons[modifyButtons.length - 1]);
    expect(mockOnEdit).toHaveBeenCalledWith(7);
  });

  it('affiche le message final de validation', () => {
    render(<SummaryStep data={mockFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Prêt pour la validation')).toBeInTheDocument();
    expect(screen.getByText('Toutes les informations sont correctes ? Vous pouvez maintenant procéder à l\'envoi final.')).toBeInTheDocument();
  });

  it('gère correctement les données manquantes', () => {
    const minimalData: Partial<EstablishmentFormData> = {
      establishmentName: 'Test Bar',
      description: '',
      address: 'Adresse test',
      activities: [],
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

    render(<SummaryStep data={minimalData as EstablishmentFormData} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Test Bar')).toBeInTheDocument();
    expect(screen.getByText('Aucune description fournie')).toBeInTheDocument();
    expect(screen.getByText('Aucune activité sélectionnée')).toBeInTheDocument();
    expect(screen.getByText('Aucun service sélectionné')).toBeInTheDocument();
    expect(screen.getByText('Aucune ambiance définie')).toBeInTheDocument();
    expect(screen.getByText('Aucun moyen de paiement défini')).toBeInTheDocument();
    expect(screen.getByText('Aucun tag sélectionné')).toBeInTheDocument();
    expect(screen.getByText('Aucune photo')).toBeInTheDocument();
  });
});
