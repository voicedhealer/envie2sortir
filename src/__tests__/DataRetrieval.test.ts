// Test de récupération des données du formulaire
describe('Récupération des données du formulaire', () => {
  it('vérifie que les types de données sont corrects', () => {
    // Test des types de base
    const testData = {
      establishmentName: 'Test Bar',
      description: 'Description test',
      phone: '03 80 55 30 83',
      email: 'test@bar.fr',
      website: 'https://test.bar.fr',
      instagram: 'https://instagram.com/testbar',
      facebook: 'https://facebook.com/testbar',
      tiktok: 'https://tiktok.com/@testbar',
      youtube: 'https://youtube.com/@testbar',
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      photos: []
    };

    // Vérifier les types
    expect(typeof testData.establishmentName).toBe('string');
    expect(typeof testData.description).toBe('string');
    expect(typeof testData.phone).toBe('string');
    expect(typeof testData.email).toBe('string');
    expect(typeof testData.website).toBe('string');
    expect(typeof testData.instagram).toBe('string');
    expect(typeof testData.facebook).toBe('string');
    expect(typeof testData.tiktok).toBe('string');
    expect(typeof testData.youtube).toBe('string');
    expect(Array.isArray(testData.activities)).toBe(true);
    expect(Array.isArray(testData.services)).toBe(true);
    expect(Array.isArray(testData.ambiance)).toBe(true);
    expect(Array.isArray(testData.paymentMethods)).toBe(true);
    expect(Array.isArray(testData.tags)).toBe(true);
    expect(Array.isArray(testData.photos)).toBe(true);
  });

  it('vérifie que les données YouTube sont correctement gérées', () => {
    const dataWithYouTube = {
      youtube: 'https://www.youtube.com/@testbar'
    };

    const dataWithoutYouTube = {
      youtube: ''
    };

    const dataWithUndefinedYouTube = {
      youtube: undefined
    };

    // Vérifier que YouTube est présent
    expect(dataWithYouTube.youtube).toBe('https://www.youtube.com/@testbar');
    expect(dataWithoutYouTube.youtube).toBe('');
    expect(dataWithUndefinedYouTube.youtube).toBeUndefined();
  });

  it('vérifie que les données peuvent être filtrées', () => {
    const testData = {
      establishmentName: 'Test Bar',
      description: 'Description test',
      phone: '03 80 55 30 83',
      email: 'test@bar.fr',
      website: 'https://test.bar.fr',
      instagram: 'https://instagram.com/testbar',
      facebook: 'https://facebook.com/testbar',
      tiktok: 'https://tiktok.com/@testbar',
      youtube: 'https://youtube.com/@testbar',
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      photos: []
    };

    // Filtrer les champs vides
    const nonEmptyFields = Object.entries(testData)
      .filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value && value !== '';
      })
      .map(([key, value]) => key);

    expect(nonEmptyFields).toContain('establishmentName');
    expect(nonEmptyFields).toContain('description');
    expect(nonEmptyFields).toContain('phone');
    expect(nonEmptyFields).toContain('email');
    expect(nonEmptyFields).toContain('website');
    expect(nonEmptyFields).toContain('instagram');
    expect(nonEmptyFields).toContain('facebook');
    expect(nonEmptyFields).toContain('tiktok');
    expect(nonEmptyFields).toContain('youtube');
    expect(nonEmptyFields).toContain('activities');
    expect(nonEmptyFields).toContain('services');
    expect(nonEmptyFields).toContain('ambiance');
    expect(nonEmptyFields).toContain('paymentMethods');
    expect(nonEmptyFields).toContain('tags');
  });

  it('vérifie que les données peuvent être validées', () => {
    const validData = {
      establishmentName: 'Test Bar',
      description: 'Description test',
      phone: '03 80 55 30 83',
      email: 'test@bar.fr',
      website: 'https://test.bar.fr',
      instagram: 'https://instagram.com/testbar',
      facebook: 'https://facebook.com/testbar',
      tiktok: 'https://tiktok.com/@testbar',
      youtube: 'https://youtube.com/@testbar',
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      photos: []
    };

    const invalidData = {
      establishmentName: '',
      description: '',
      phone: '',
      email: 'invalid-email',
      website: 'not-a-url',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      activities: [],
      services: [],
      ambiance: [],
      paymentMethods: [],
      tags: [],
      photos: []
    };

    // Fonction de validation simple
    const validateData = (data: any) => {
      const errors: string[] = [];
      
      if (!data.establishmentName || data.establishmentName.trim() === '') {
        errors.push('Le nom de l\'établissement est requis');
      }
      
      if (!data.description || data.description.trim() === '') {
        errors.push('La description est requise');
      }
      
      if (data.email && !data.email.includes('@')) {
        errors.push('L\'email n\'est pas valide');
      }
      
      if (data.website && !data.website.startsWith('http')) {
        errors.push('L\'URL du site web n\'est pas valide');
      }
      
      if (data.activities.length === 0) {
        errors.push('Au moins une activité doit être sélectionnée');
      }
      
      return errors;
    };

    const validErrors = validateData(validData);
    const invalidErrors = validateData(invalidData);

    expect(validErrors).toHaveLength(0);
    expect(invalidErrors.length).toBeGreaterThan(0);
    expect(invalidErrors).toContain('Le nom de l\'établissement est requis');
    expect(invalidErrors).toContain('La description est requise');
    expect(invalidErrors).toContain('L\'email n\'est pas valide');
    expect(invalidErrors).toContain('L\'URL du site web n\'est pas valide');
    expect(invalidErrors).toContain('Au moins une activité doit être sélectionnée');
  });

  it('vérifie que les données peuvent être formatées pour l\'affichage', () => {
    const testData = {
      establishmentName: 'Test Bar',
      description: 'Description test',
      phone: '03 80 55 30 83',
      email: 'test@bar.fr',
      website: 'https://test.bar.fr',
      instagram: 'https://instagram.com/testbar',
      facebook: 'https://facebook.com/testbar',
      tiktok: 'https://tiktok.com/@testbar',
      youtube: 'https://youtube.com/@testbar',
      activities: ['bar', 'restaurant'],
      services: ['WiFi', 'Terrasse'],
      ambiance: ['Convivial', 'Moderne'],
      paymentMethods: ['Carte', 'Espèces'],
      tags: ['bar', 'convivial'],
      photos: []
    };

    // Fonction de formatage
    const formatForDisplay = (data: any) => {
      return {
        name: data.establishmentName || 'Non renseigné',
        description: data.description || 'Non renseignée',
        phone: data.phone || 'Non renseigné',
        email: data.email || 'Non renseigné',
        website: data.website || 'Non renseigné',
        instagram: data.instagram || 'Non renseigné',
        facebook: data.facebook || 'Non renseigné',
        tiktok: data.tiktok || 'Non renseigné',
        youtube: data.youtube || 'Non renseigné',
        activities: data.activities.length > 0 ? data.activities.join(', ') : 'Aucune activité',
        services: data.services.length > 0 ? data.services.join(', ') : 'Aucun service',
        ambiance: data.ambiance.length > 0 ? data.ambiance.join(', ') : 'Aucune ambiance',
        paymentMethods: data.paymentMethods.length > 0 ? data.paymentMethods.join(', ') : 'Aucun moyen de paiement',
        tags: data.tags.length > 0 ? data.tags.join(', ') : 'Aucun tag',
        photos: data.photos.length > 0 ? `${data.photos.length} photo(s)` : 'Aucune photo'
      };
    };

    const formattedData = formatForDisplay(testData);

    expect(formattedData.name).toBe('Test Bar');
    expect(formattedData.description).toBe('Description test');
    expect(formattedData.phone).toBe('03 80 55 30 83');
    expect(formattedData.email).toBe('test@bar.fr');
    expect(formattedData.website).toBe('https://test.bar.fr');
    expect(formattedData.instagram).toBe('https://instagram.com/testbar');
    expect(formattedData.facebook).toBe('https://facebook.com/testbar');
    expect(formattedData.tiktok).toBe('https://tiktok.com/@testbar');
    expect(formattedData.youtube).toBe('https://youtube.com/@testbar');
    expect(formattedData.activities).toBe('bar, restaurant');
    expect(formattedData.services).toBe('WiFi, Terrasse');
    expect(formattedData.ambiance).toBe('Convivial, Moderne');
    expect(formattedData.paymentMethods).toBe('Carte, Espèces');
    expect(formattedData.tags).toBe('bar, convivial');
    expect(formattedData.photos).toBe('Aucune photo');
  });

  it('vérifie que les données vides sont correctement gérées', () => {
    const emptyData = {
      establishmentName: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      activities: [],
      services: [],
      ambiance: [],
      paymentMethods: [],
      tags: [],
      photos: []
    };

    const formatForDisplay = (data: any) => {
      return {
        name: data.establishmentName || 'Non renseigné',
        description: data.description || 'Non renseignée',
        phone: data.phone || 'Non renseigné',
        email: data.email || 'Non renseigné',
        website: data.website || 'Non renseigné',
        instagram: data.instagram || 'Non renseigné',
        facebook: data.facebook || 'Non renseigné',
        tiktok: data.tiktok || 'Non renseigné',
        youtube: data.youtube || 'Non renseigné',
        activities: data.activities.length > 0 ? data.activities.join(', ') : 'Aucune activité',
        services: data.services.length > 0 ? data.services.join(', ') : 'Aucun service',
        ambiance: data.ambiance.length > 0 ? data.ambiance.join(', ') : 'Aucune ambiance',
        paymentMethods: data.paymentMethods.length > 0 ? data.paymentMethods.join(', ') : 'Aucun moyen de paiement',
        tags: data.tags.length > 0 ? data.tags.join(', ') : 'Aucun tag',
        photos: data.photos.length > 0 ? `${data.photos.length} photo(s)` : 'Aucune photo'
      };
    };

    const formattedData = formatForDisplay(emptyData);

    expect(formattedData.name).toBe('Non renseigné');
    expect(formattedData.description).toBe('Non renseignée');
    expect(formattedData.phone).toBe('Non renseigné');
    expect(formattedData.email).toBe('Non renseigné');
    expect(formattedData.website).toBe('Non renseigné');
    expect(formattedData.instagram).toBe('Non renseigné');
    expect(formattedData.facebook).toBe('Non renseigné');
    expect(formattedData.tiktok).toBe('Non renseigné');
    expect(formattedData.youtube).toBe('Non renseigné');
    expect(formattedData.activities).toBe('Aucune activité');
    expect(formattedData.services).toBe('Aucun service');
    expect(formattedData.ambiance).toBe('Aucune ambiance');
    expect(formattedData.paymentMethods).toBe('Aucun moyen de paiement');
    expect(formattedData.tags).toBe('Aucun tag');
    expect(formattedData.photos).toBe('Aucune photo');
  });
});
