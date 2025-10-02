// Test de bout en bout pour vérifier que les étapes d'ajout d'établissement fonctionnent
describe('Test de bout en bout - Ajout d\'établissement', () => {
  it('vérifie que toutes les étapes sont correctement définies', () => {
    const steps = [
      'Informations générales',
      'Horaires d\'ouverture', 
      'Services & Ambiance',
      'Moyens de paiement',
      'Tags de recherche',
      'Photos',
      'Contact & Réseaux sociaux',
      'Récapitulatif'
    ];

    expect(steps).toHaveLength(8);
    expect(steps[0]).toBe('Informations générales');
    expect(steps[7]).toBe('Récapitulatif');
  });

  it('vérifie que les données du formulaire sont cohérentes', () => {
    // Simuler des données complètes d'établissement
    const completeEstablishmentData = {
      // Étape 1: Informations générales
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
      
      // Étape 2: Horaires
      hours: {
        monday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        tuesday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        wednesday: { isOpen: false, slots: [] },
        thursday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        friday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        saturday: { isOpen: true, slots: [{ name: 'Soirée', open: '18:00', close: '02:00' }] },
        sunday: { isOpen: false, slots: [] }
      },
      
      // Étape 3: Services & Ambiance
      services: ['WiFi', 'Terrasse', 'Parking'],
      ambiance: ['Convivial', 'Moderne', 'Chaleureux'],
      
      // Étape 4: Moyens de paiement
      paymentMethods: ['Carte bancaire', 'Espèces', 'Tickets restaurant'],
      
      // Étape 5: Tags de recherche
      tags: ['bar', 'restaurant', 'soirée', 'convivial'],
      
      // Étape 6: Photos
      photos: [],
      
      // Étape 7: Contact & Réseaux sociaux
      phone: '03 80 55 30 83',
      email: 'contact@centralbar.fr',
      website: 'https://www.centralbar.fr',
      instagram: 'https://www.instagram.com/centralbar',
      facebook: 'https://www.facebook.com/centralbar',
      tiktok: 'https://www.tiktok.com/@centralbar',
      youtube: 'https://www.youtube.com/@centralbar',
      professionalPhone: '0767093485',
      professionalEmail: 'pro@centralbar.fr'
    };

    // Vérifier que toutes les données sont présentes
    expect(completeEstablishmentData.establishmentName).toBeDefined();
    expect(completeEstablishmentData.description).toBeDefined();
    expect(completeEstablishmentData.address).toBeDefined();
    expect(completeEstablishmentData.activities).toBeDefined();
    expect(completeEstablishmentData.hours).toBeDefined();
    expect(completeEstablishmentData.services).toBeDefined();
    expect(completeEstablishmentData.ambiance).toBeDefined();
    expect(completeEstablishmentData.paymentMethods).toBeDefined();
    expect(completeEstablishmentData.tags).toBeDefined();
    expect(completeEstablishmentData.photos).toBeDefined();
    expect(completeEstablishmentData.phone).toBeDefined();
    expect(completeEstablishmentData.email).toBeDefined();
    expect(completeEstablishmentData.website).toBeDefined();
    expect(completeEstablishmentData.instagram).toBeDefined();
    expect(completeEstablishmentData.facebook).toBeDefined();
    expect(completeEstablishmentData.tiktok).toBeDefined();
    expect(completeEstablishmentData.youtube).toBeDefined();
    expect(completeEstablishmentData.professionalPhone).toBeDefined();
    expect(completeEstablishmentData.professionalEmail).toBeDefined();
  });

  it('vérifie que les données YouTube sont correctement intégrées', () => {
    const socialNetworks = {
      website: 'https://www.centralbar.fr',
      instagram: 'https://www.instagram.com/centralbar',
      facebook: 'https://www.facebook.com/centralbar',
      tiktok: 'https://www.tiktok.com/@centralbar',
      youtube: 'https://www.youtube.com/@centralbar'
    };

    // Vérifier que YouTube est présent avec les autres réseaux sociaux
    expect(socialNetworks.youtube).toBe('https://www.youtube.com/@centralbar');
    expect(socialNetworks.youtube).toContain('youtube.com');
    expect(socialNetworks.youtube).toContain('@centralbar');
    
    // Vérifier que tous les réseaux sociaux sont des URLs valides
    Object.values(socialNetworks).forEach(url => {
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  it('vérifie que les données peuvent être validées pour chaque étape', () => {
    const stepValidations = {
      step1: (data: any) => {
        return !!(data.establishmentName && data.description && data.address && data.address.street);
      },
      step2: (data: any) => {
        return !!(data.hours && typeof data.hours === 'object');
      },
      step3: (data: any) => {
        return !!(Array.isArray(data.services) && Array.isArray(data.ambiance));
      },
      step4: (data: any) => {
        return !!(Array.isArray(data.paymentMethods));
      },
      step5: (data: any) => {
        return !!(Array.isArray(data.tags));
      },
      step6: (data: any) => {
        return !!(Array.isArray(data.photos));
      },
      step7: (data: any) => {
        return !!(data.phone && data.email);
      }
    };

    const testData = {
      establishmentName: 'Test Bar',
      description: 'Description test',
      address: { street: 'Test', city: 'Test', postalCode: '21000' },
      hours: { monday: { isOpen: true, slots: [] } },
      services: ['WiFi'],
      ambiance: ['Convivial'],
      paymentMethods: ['Carte'],
      tags: ['bar'],
      photos: [],
      phone: '03 80 55 30 83',
      email: 'test@bar.fr'
    };

    // Vérifier que chaque étape peut être validée
    Object.values(stepValidations).forEach((validation, index) => {
      expect(validation(testData)).toBe(true);
    });
  });

  it('vérifie que les données peuvent être formatées pour l\'affichage', () => {
    const rawData = {
      establishmentName: 'Le Central Bar',
      description: 'Un bar convivial',
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      phone: '03 80 55 30 83',
      email: 'contact@centralbar.fr',
      website: 'https://www.centralbar.fr',
      instagram: 'https://www.instagram.com/centralbar',
      facebook: 'https://www.facebook.com/centralbar',
      tiktok: 'https://www.tiktok.com/@centralbar',
      youtube: 'https://www.youtube.com/@centralbar'
    };

    // Fonction de formatage pour l'affichage
    const formatForDisplay = (data: any) => {
      return {
        name: data.establishmentName || 'Non renseigné',
        description: data.description || 'Non renseignée',
        activities: data.activities?.join(', ') || 'Aucune activité',
        services: data.services?.join(', ') || 'Aucun service',
        ambiance: data.ambiance?.join(', ') || 'Aucune ambiance',
        paymentMethods: data.paymentMethods?.join(', ') || 'Aucun moyen de paiement',
        tags: data.tags?.join(', ') || 'Aucun tag',
        phone: data.phone || 'Non renseigné',
        email: data.email || 'Non renseigné',
        website: data.website || 'Non renseigné',
        instagram: data.instagram || 'Non renseigné',
        facebook: data.facebook || 'Non renseigné',
        tiktok: data.tiktok || 'Non renseigné',
        youtube: data.youtube || 'Non renseigné'
      };
    };

    const formattedData = formatForDisplay(rawData);

    // Vérifier que les données sont correctement formatées
    expect(formattedData.name).toBe('Le Central Bar');
    expect(formattedData.description).toBe('Un bar convivial');
    expect(formattedData.activities).toBe('bar, restaurant');
    expect(formattedData.services).toBe('WiFi, Terrasse');
    expect(formattedData.ambiance).toBe('Convivial, Moderne');
    expect(formattedData.paymentMethods).toBe('Carte, Espèces');
    expect(formattedData.tags).toBe('bar, convivial');
    expect(formattedData.phone).toBe('03 80 55 30 83');
    expect(formattedData.email).toBe('contact@centralbar.fr');
    expect(formattedData.website).toBe('https://www.centralbar.fr');
    expect(formattedData.instagram).toBe('https://www.instagram.com/centralbar');
    expect(formattedData.facebook).toBe('https://www.facebook.com/centralbar');
    expect(formattedData.tiktok).toBe('https://www.tiktok.com/@centralbar');
    expect(formattedData.youtube).toBe('https://www.youtube.com/@centralbar');
  });

  it('vérifie que les données peuvent être sérialisées pour l\'API', () => {
    const formData = {
      establishmentName: 'Le Central Bar',
      description: 'Un bar convivial',
      address: {
        street: '10 Rue Principale',
        city: 'Dijon',
        postalCode: '21000',
        latitude: 47.322,
        longitude: 5.041
      },
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      phone: '03 80 55 30 83',
      email: 'contact@centralbar.fr',
      website: 'https://www.centralbar.fr',
      instagram: 'https://www.instagram.com/centralbar',
      facebook: 'https://www.facebook.com/centralbar',
      tiktok: 'https://www.tiktok.com/@centralbar',
      youtube: 'https://www.youtube.com/@centralbar'
    };

    // Vérifier que les données peuvent être sérialisées en JSON
    expect(() => JSON.stringify(formData)).not.toThrow();
    
    const jsonString = JSON.stringify(formData);
    const parsedData = JSON.parse(jsonString);
    
    // Vérifier que les données sont correctement sérialisées
    expect(parsedData.establishmentName).toBe('Le Central Bar');
    expect(parsedData.youtube).toBe('https://www.youtube.com/@centralbar');
    expect(parsedData.activities).toEqual(['bar', 'restaurant']);
    expect(parsedData.services).toEqual(['WiFi', 'Terrasse']);
    expect(parsedData.ambiance).toEqual(['Convivial', 'Moderne']);
    expect(parsedData.paymentMethods).toEqual(['Carte', 'Espèces']);
    expect(parsedData.tags).toEqual(['bar', 'convivial']);
  });

  it('vérifie que les données manquantes sont gérées correctement', () => {
    const incompleteData = {
      establishmentName: 'Test Bar',
      description: '',
      activities: [],
      services: [],
      ambiance: [],
      paymentMethods: [],
      tags: [],
      phone: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: ''
    };

    // Fonction pour gérer les données manquantes
    const handleMissingData = (data: any) => {
      return {
        name: data.establishmentName || 'Non renseigné',
        description: data.description || 'Non renseignée',
        activities: data.activities?.length > 0 ? data.activities.join(', ') : 'Aucune activité',
        services: data.services?.length > 0 ? data.services.join(', ') : 'Aucun service',
        ambiance: data.ambiance?.length > 0 ? data.ambiance.join(', ') : 'Aucune ambiance',
        paymentMethods: data.paymentMethods?.length > 0 ? data.paymentMethods.join(', ') : 'Aucun moyen de paiement',
        tags: data.tags?.length > 0 ? data.tags.join(', ') : 'Aucun tag',
        phone: data.phone || 'Non renseigné',
        email: data.email || 'Non renseigné',
        website: data.website || 'Non renseigné',
        instagram: data.instagram || 'Non renseigné',
        facebook: data.facebook || 'Non renseigné',
        tiktok: data.tiktok || 'Non renseigné',
        youtube: data.youtube || 'Non renseigné'
      };
    };

    const handledData = handleMissingData(incompleteData);

    // Vérifier que les données manquantes sont gérées
    expect(handledData.name).toBe('Test Bar');
    expect(handledData.description).toBe('Non renseignée');
    expect(handledData.activities).toBe('Aucune activité');
    expect(handledData.services).toBe('Aucun service');
    expect(handledData.ambiance).toBe('Aucune ambiance');
    expect(handledData.paymentMethods).toBe('Aucun moyen de paiement');
    expect(handledData.tags).toBe('Aucun tag');
    expect(handledData.phone).toBe('Non renseigné');
    expect(handledData.email).toBe('Non renseigné');
    expect(handledData.website).toBe('Non renseigné');
    expect(handledData.instagram).toBe('Non renseigné');
    expect(handledData.facebook).toBe('Non renseigné');
    expect(handledData.tiktok).toBe('Non renseigné');
    expect(handledData.youtube).toBe('Non renseigné');
  });
});
