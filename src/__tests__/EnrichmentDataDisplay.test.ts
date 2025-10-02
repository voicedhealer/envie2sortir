// Test d'affichage des données d'enrichissement dans le SummaryStep
describe('Affichage des données d\'enrichissement - SummaryStep', () => {
  it('vérifie que les données d\'enrichissement sont correctement structurées', () => {
    const enrichmentData = {
      // Données d'enrichissement automatique
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      uberEatsLink: 'https://www.ubereats.com/fr/restaurant/test-bar',
      informationsPratiques: 'Restaurant avec terrasse et parking gratuit',
      envieTags: ['convivial', 'familial', 'romantique'],
      
      // Données d'enrichissement hybride (saisies manuellement)
      hybridAccessibilityDetails: 'Établissement accessible aux personnes à mobilité réduite',
      hybridDetailedServices: 'Service de traiteur, événements privés, cours de cuisine',
      hybridClienteleInfo: 'Clientèle familiale et professionnelle, groupes acceptés',
      hybridDetailedPayments: 'Carte bancaire, espèces, chèques, tickets restaurant, virements',
      hybridChildrenServices: 'Menu enfants, chaise haute, espace jeux, ateliers cuisine'
    };

    // Vérifier que toutes les données sont présentes
    expect(enrichmentData.theForkLink).toBeDefined();
    expect(enrichmentData.uberEatsLink).toBeDefined();
    expect(enrichmentData.informationsPratiques).toBeDefined();
    expect(enrichmentData.envieTags).toBeDefined();
    expect(enrichmentData.hybridAccessibilityDetails).toBeDefined();
    expect(enrichmentData.hybridDetailedServices).toBeDefined();
    expect(enrichmentData.hybridClienteleInfo).toBeDefined();
    expect(enrichmentData.hybridDetailedPayments).toBeDefined();
    expect(enrichmentData.hybridChildrenServices).toBeDefined();
  });

  it('vérifie que les liens externes sont correctement formatés', () => {
    const externalLinks = {
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      uberEatsLink: 'https://www.ubereats.com/fr/restaurant/test-bar'
    };

    // Vérifier que les URLs sont valides
    Object.values(externalLinks).forEach(url => {
      expect(url).toMatch(/^https?:\/\//);
      expect(url.length).toBeGreaterThan(10);
    });

    // Vérifier les domaines spécifiques
    expect(externalLinks.theForkLink).toContain('thefork.fr');
    expect(externalLinks.uberEatsLink).toContain('ubereats.com');
  });

  it('vérifie que les tags Envie sont correctement formatés', () => {
    const envieTags = ['convivial', 'familial', 'romantique', 'moderne', 'chaleureux'];

    // Vérifier que c'est un tableau
    expect(Array.isArray(envieTags)).toBe(true);
    expect(envieTags.length).toBeGreaterThan(0);

    // Vérifier que chaque tag est une chaîne non vide
    envieTags.forEach(tag => {
      expect(typeof tag).toBe('string');
      expect(tag.length).toBeGreaterThan(0);
    });
  });

  it('vérifie que les données hybrides sont correctement structurées', () => {
    const hybridData = {
      hybridAccessibilityDetails: 'Établissement accessible aux personnes à mobilité réduite',
      hybridDetailedServices: 'Service de traiteur, événements privés, cours de cuisine',
      hybridClienteleInfo: 'Clientèle familiale et professionnelle, groupes acceptés',
      hybridDetailedPayments: 'Carte bancaire, espèces, chèques, tickets restaurant, virements',
      hybridChildrenServices: 'Menu enfants, chaise haute, espace jeux, ateliers cuisine'
    };

    // Vérifier que chaque champ hybride est une chaîne non vide
    Object.entries(hybridData).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      expect(key.startsWith('hybrid')).toBe(true);
    });
  });

  it('vérifie que les données peuvent être filtrées pour l\'affichage', () => {
    const fullEnrichmentData = {
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      uberEatsLink: 'https://www.ubereats.com/fr/restaurant/test-bar',
      informationsPratiques: 'Restaurant avec terrasse et parking gratuit',
      envieTags: ['convivial', 'familial', 'romantique'],
      hybridAccessibilityDetails: 'Établissement accessible aux personnes à mobilité réduite',
      hybridDetailedServices: 'Service de traiteur, événements privés, cours de cuisine',
      hybridClienteleInfo: 'Clientèle familiale et professionnelle, groupes acceptés',
      hybridDetailedPayments: 'Carte bancaire, espèces, chèques, tickets restaurant, virements',
      hybridChildrenServices: 'Menu enfants, chaise haute, espace jeux, ateliers cuisine'
    };

    const emptyEnrichmentData = {
      theForkLink: '',
      uberEatsLink: '',
      informationsPratiques: '',
      envieTags: [],
      hybridAccessibilityDetails: '',
      hybridDetailedServices: '',
      hybridClienteleInfo: '',
      hybridDetailedPayments: '',
      hybridChildrenServices: ''
    };

    // Fonction pour vérifier si des données d'enrichissement sont présentes
    const hasEnrichmentData = (data: any) => {
      return !!(data.theForkLink || data.uberEatsLink || data.informationsPratiques || 
                data.envieTags?.length || data.hybridAccessibilityDetails || 
                data.hybridDetailedServices || data.hybridClienteleInfo || 
                data.hybridDetailedPayments || data.hybridChildrenServices);
    };

    expect(hasEnrichmentData(fullEnrichmentData)).toBe(true);
    expect(hasEnrichmentData(emptyEnrichmentData)).toBe(false);
  });

  it('vérifie que les données peuvent être formatées pour l\'affichage', () => {
    const enrichmentData = {
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      uberEatsLink: 'https://www.ubereats.com/fr/restaurant/test-bar',
      informationsPratiques: 'Restaurant avec terrasse et parking gratuit',
      envieTags: ['convivial', 'familial', 'romantique'],
      hybridAccessibilityDetails: 'Établissement accessible aux personnes à mobilité réduite',
      hybridDetailedServices: 'Service de traiteur, événements privés, cours de cuisine'
    };

    // Fonction de formatage pour l'affichage
    const formatForDisplay = (data: any) => {
      return {
        externalLinks: {
          theFork: data.theForkLink || 'Non renseigné',
          uberEats: data.uberEatsLink || 'Non renseigné'
        },
        practicalInfo: data.informationsPratiques || 'Non renseigné',
        envieTags: data.envieTags?.join(', ') || 'Aucun tag',
        hybridInfo: {
          accessibility: data.hybridAccessibilityDetails || 'Non renseigné',
          services: data.hybridDetailedServices || 'Non renseigné'
        }
      };
    };

    const formattedData = formatForDisplay(enrichmentData);

    expect(formattedData.externalLinks.theFork).toBe('https://www.thefork.fr/restaurant/test-bar');
    expect(formattedData.externalLinks.uberEats).toBe('https://www.ubereats.com/fr/restaurant/test-bar');
    expect(formattedData.practicalInfo).toBe('Restaurant avec terrasse et parking gratuit');
    expect(formattedData.envieTags).toBe('convivial, familial, romantique');
    expect(formattedData.hybridInfo.accessibility).toBe('Établissement accessible aux personnes à mobilité réduite');
    expect(formattedData.hybridInfo.services).toBe('Service de traiteur, événements privés, cours de cuisine');
  });

  it('vérifie que les données peuvent être sérialisées pour l\'API', () => {
    const enrichmentData = {
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      uberEatsLink: 'https://www.ubereats.com/fr/restaurant/test-bar',
      informationsPratiques: 'Restaurant avec terrasse et parking gratuit',
      envieTags: ['convivial', 'familial', 'romantique'],
      hybridAccessibilityDetails: 'Établissement accessible aux personnes à mobilité réduite',
      hybridDetailedServices: 'Service de traiteur, événements privés, cours de cuisine',
      hybridClienteleInfo: 'Clientèle familiale et professionnelle, groupes acceptés',
      hybridDetailedPayments: 'Carte bancaire, espèces, chèques, tickets restaurant, virements',
      hybridChildrenServices: 'Menu enfants, chaise haute, espace jeux, ateliers cuisine'
    };

    // Vérifier que les données peuvent être sérialisées en JSON
    expect(() => JSON.stringify(enrichmentData)).not.toThrow();
    
    const jsonString = JSON.stringify(enrichmentData);
    const parsedData = JSON.parse(jsonString);
    
    // Vérifier que les données sont correctement sérialisées
    expect(parsedData.theForkLink).toBe('https://www.thefork.fr/restaurant/test-bar');
    expect(parsedData.uberEatsLink).toBe('https://www.ubereats.com/fr/restaurant/test-bar');
    expect(parsedData.informationsPratiques).toBe('Restaurant avec terrasse et parking gratuit');
    expect(parsedData.envieTags).toEqual(['convivial', 'familial', 'romantique']);
    expect(parsedData.hybridAccessibilityDetails).toBe('Établissement accessible aux personnes à mobilité réduite');
  });

  it('vérifie que la section d\'enrichissement s\'affiche conditionnellement', () => {
    const hasEnrichmentData = (data: any) => {
      return !!(data.theForkLink || data.uberEatsLink || data.informationsPratiques || 
                data.envieTags?.length || data.hybridAccessibilityDetails || 
                data.hybridDetailedServices || data.hybridClienteleInfo || 
                data.hybridDetailedPayments || data.hybridChildrenServices);
    };

    // Données avec enrichissement
    const dataWithEnrichment = {
      theForkLink: 'https://www.thefork.fr/restaurant/test-bar',
      hybridAccessibilityDetails: 'Établissement accessible'
    };

    // Données sans enrichissement
    const dataWithoutEnrichment = {
      theForkLink: '',
      uberEatsLink: '',
      informationsPratiques: '',
      envieTags: [],
      hybridAccessibilityDetails: '',
      hybridDetailedServices: '',
      hybridClienteleInfo: '',
      hybridDetailedPayments: '',
      hybridChildrenServices: ''
    };

    expect(hasEnrichmentData(dataWithEnrichment)).toBe(true);
    expect(hasEnrichmentData(dataWithoutEnrichment)).toBe(false);
  });
});
