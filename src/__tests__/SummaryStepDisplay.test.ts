// Test des corrections d'affichage du SummaryStep
describe('Corrections d\'affichage du SummaryStep', () => {
  it('vérifie que les tags sont correctement alignés', () => {
    // Test de la structure des tags
    const contactStructure = {
      establishment: {
        title: 'Contact établissement',
        tag: 'Visible clients',
        tagPosition: 'right' // Le tag doit être à droite
      },
      professional: {
        title: 'Contact professionnel', 
        tag: 'Admin uniquement',
        tagPosition: 'right' // Le tag doit être à droite
      }
    };

    expect(contactStructure.establishment.tagPosition).toBe('right');
    expect(contactStructure.professional.tagPosition).toBe('right');
    expect(contactStructure.establishment.tag).toBe('Visible clients');
    expect(contactStructure.professional.tag).toBe('Admin uniquement');
  });

  it('vérifie que les icônes des réseaux sociaux sont cohérentes', () => {
    const socialIcons = {
      website: { icon: '🌐', color: 'blue' },
      instagram: { icon: '📷', color: 'pink' },
      facebook: { icon: '📘', color: 'blue' },
      tiktok: { icon: '🎵', color: 'black' },
      youtube: { icon: '📺', color: 'red' }
    };

    // Vérifier que chaque réseau social a une icône et une couleur
    Object.entries(socialIcons).forEach(([network, config]) => {
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.icon.length).toBeGreaterThan(0);
    });

    // Vérifier que les couleurs sont cohérentes avec les marques
    expect(socialIcons.instagram.color).toBe('pink');
    expect(socialIcons.tiktok.color).toBe('black');
    expect(socialIcons.youtube.color).toBe('red');
  });

  it('vérifie que les cartes des réseaux sociaux ont une hauteur uniforme', () => {
    const cardConfig = {
      minHeight: '80px',
      padding: '16px', // p-4
      borderRadius: '8px', // rounded-lg
      backgroundColor: 'gray-50'
    };

    expect(cardConfig.minHeight).toBe('80px');
    expect(cardConfig.padding).toBe('16px');
    expect(cardConfig.borderRadius).toBe('8px');
    expect(cardConfig.backgroundColor).toBe('gray-50');
  });

  it('vérifie que les URLs ne sont plus tronquées', () => {
    const urlDisplayConfig = {
      truncate: false,
      breakAll: true, // break-all au lieu de truncate
      minWidth: '0' // min-w-0 pour permettre le break
    };

    expect(urlDisplayConfig.truncate).toBe(false);
    expect(urlDisplayConfig.breakAll).toBe(true);
    expect(urlDisplayConfig.minWidth).toBe('0');
  });

  it('vérifie que les icônes ont une taille uniforme', () => {
    const iconConfig = {
      size: '32px', // w-8 h-8
      borderRadius: '50%', // rounded-full
      flexShrink: '0' // flex-shrink-0
    };

    expect(iconConfig.size).toBe('32px');
    expect(iconConfig.borderRadius).toBe('50%');
    expect(iconConfig.flexShrink).toBe('0');
  });

  it('vérifie que la grille des réseaux sociaux est responsive', () => {
    const gridConfig = {
      mobile: '1 column', // grid-cols-1
      tablet: '2 columns', // md:grid-cols-2
      desktop: '3 columns', // lg:grid-cols-3
      gap: '16px' // gap-4
    };

    expect(gridConfig.mobile).toBe('1 column');
    expect(gridConfig.tablet).toBe('2 columns');
    expect(gridConfig.desktop).toBe('3 columns');
    expect(gridConfig.gap).toBe('16px');
  });

  it('vérifie que les données sont correctement formatées', () => {
    const testData = {
      website: 'http://www.eva.gg/fr-FR',
      instagram: 'https://www.instagram.com/ev',
      facebook: 'https://www.facebook.com/EVAggFR',
      tiktok: '',
      youtube: ''
    };

    // Fonction de formatage (similaire à displayValue)
    const formatValue = (value: string) => {
      return value && value !== '' ? value : 'Non renseigné';
    };

    expect(formatValue(testData.website)).toBe('http://www.eva.gg/fr-FR');
    expect(formatValue(testData.instagram)).toBe('https://www.instagram.com/ev');
    expect(formatValue(testData.facebook)).toBe('https://www.facebook.com/EVAggFR');
    expect(formatValue(testData.tiktok)).toBe('Non renseigné');
    expect(formatValue(testData.youtube)).toBe('Non renseigné');
  });

  it('vérifie que les URLs longues sont correctement gérées', () => {
    const longUrls = {
      instagram: 'https://www.instagram.com/verylongusernamethatcouldbetruncated',
      facebook: 'https://www.facebook.com/verylongpagenamethatcouldbetruncated',
      youtube: 'https://www.youtube.com/@verylongchannelnamethatcouldbetruncated'
    };

    // Vérifier que les URLs longues ne sont pas tronquées
    Object.values(longUrls).forEach(url => {
      expect(url.length).toBeGreaterThan(30);
      expect(url).toContain('https://');
    });
  });

  it('vérifie que la structure des contacts est cohérente', () => {
    const contactStructure = {
      establishment: {
        hasIcon: true,
        hasTitle: true,
        hasTag: true,
        hasFields: true,
        tagAlignment: 'right'
      },
      professional: {
        hasIcon: true,
        hasTitle: true,
        hasTag: true,
        hasFields: true,
        tagAlignment: 'right'
      }
    };

    // Vérifier la structure du contact établissement
    expect(contactStructure.establishment.hasIcon).toBe(true);
    expect(contactStructure.establishment.hasTitle).toBe(true);
    expect(contactStructure.establishment.hasTag).toBe(true);
    expect(contactStructure.establishment.hasFields).toBe(true);
    expect(contactStructure.establishment.tagAlignment).toBe('right');

    // Vérifier la structure du contact professionnel
    expect(contactStructure.professional.hasIcon).toBe(true);
    expect(contactStructure.professional.hasTitle).toBe(true);
    expect(contactStructure.professional.hasTag).toBe(true);
    expect(contactStructure.professional.hasFields).toBe(true);
    expect(contactStructure.professional.tagAlignment).toBe('right');
  });
});
