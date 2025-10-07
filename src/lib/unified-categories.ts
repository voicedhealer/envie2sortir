// Système de catégorisation unifié pour l'étape 4 et la page publique
// Garantit la cohérence entre le formulaire et l'affichage public

export interface CategoryItem {
  id: string;
  label: string;
  category: string;
  icon: string;
}

// Catégories principales (même structure que EstablishmentMainSections)
export const MAIN_CATEGORIES = {
  'ambiance-specialites': {
    title: 'Ambiance & Spécialités',
    icon: '🎨',
    subCategories: {
      'ambiance': { title: 'Ambiance', icon: '🎉' },
      'points-forts': { title: 'Points forts', icon: '⭐' },
      'populaire-pour': { title: 'Populaire pour', icon: '👥' },
      'offres': { title: 'Offres', icon: '🍻' },
      'clientele': { title: 'Clientèle', icon: '👥' },
      'enfants': { title: 'Enfants', icon: '👶' }
    }
  },
  'equipements-services': {
    title: 'Équipements & Services',
    icon: '🛠️',
    subCategories: {
      'services': { title: 'Services', icon: '🛎️' },
      'accessibility': { title: 'Accessibilité', icon: '♿' },
      'parking': { title: 'Parking', icon: '🅿️' },
      'health': { title: 'Santé et sécurité', icon: '🏥' }
    }
  },
  'informations-pratiques': {
    title: 'Informations pratiques',
    icon: 'ℹ️',
    subCategories: {
      'groupes-reservations': { title: 'Groupes & Réservations', icon: '👥' },
      'espaces': { title: 'Espaces', icon: '⛔' }
    }
  }
};

// Mapping des items vers les catégories
export function categorizeItem(item: string): { mainCategory: string; subCategory: string } {
  const itemLower = item.toLowerCase();
  
  // Ambiance & Spécialités
  if (itemLower.includes('ambiance') || itemLower.includes('cadre') || itemLower.includes('chaleureux') || 
      itemLower.includes('convivial') || itemLower.includes('décontracté') || itemLower.includes('romantique')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'ambiance' };
  }
  
  if (itemLower.includes('excellent') || itemLower.includes('grand choix') || itemLower.includes('café') || 
      itemLower.includes('thé') || itemLower.includes('spécialité')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'points-forts' };
  }
  
  if (itemLower.includes('déjeuner') || itemLower.includes('dîner') || itemLower.includes('solo') || 
      itemLower.includes('famille') || itemLower.includes('couple')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'populaire-pour' };
  }
  
  if (itemLower.includes('alcool') || itemLower.includes('bière') || itemLower.includes('cocktail') || 
      itemLower.includes('vin') || itemLower.includes('végétarien') || itemLower.includes('sain') || 
      itemLower.includes('portion')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'offres' };
  }
  
  if (itemLower.includes('étudiant') || itemLower.includes('groupe') || itemLower.includes('touriste') || 
      itemLower.includes('famille') || itemLower.includes('couple')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'clientele' };
  }
  
  if (itemLower.includes('enfant') || itemLower.includes('menu enfant') || itemLower.includes('famille')) {
    return { mainCategory: 'ambiance-specialites', subCategory: 'enfants' };
  }
  
  // Équipements & Services
  if (itemLower.includes('livraison') || itemLower.includes('emporter') || itemLower.includes('sur place') || 
      itemLower.includes('service') || itemLower.includes('wifi') || itemLower.includes('climatisation') || 
      itemLower.includes('chauffage') || itemLower.includes('toilettes')) {
    return { mainCategory: 'equipements-services', subCategory: 'services' };
  }
  
  if (itemLower.includes('accessible') || itemLower.includes('fauteuil') || itemLower.includes('pmr') || 
      itemLower.includes('handicap')) {
    return { mainCategory: 'equipements-services', subCategory: 'accessibility' };
  }
  
  if (itemLower.includes('parking')) {
    return { mainCategory: 'equipements-services', subCategory: 'parking' };
  }
  
  if (itemLower.includes('premiers secours') || itemLower.includes('personnel formé') || 
      itemLower.includes('casques') || itemLower.includes('lunettes') || itemLower.includes('santé')) {
    return { mainCategory: 'equipements-services', subCategory: 'health' };
  }
  
  // Informations pratiques
  if (itemLower.includes('réservation') || itemLower.includes('groupe') || itemLower.includes('booking')) {
    return { mainCategory: 'informations-pratiques', subCategory: 'groupes-reservations' };
  }
  
  if (itemLower.includes('espace') || itemLower.includes('terrasse') || itemLower.includes('salon')) {
    return { mainCategory: 'informations-pratiques', subCategory: 'espaces' };
  }
  
  // Par défaut, mettre dans "Autres" de la catégorie appropriée
  if (itemLower.includes('carte') || itemLower.includes('paiement') || itemLower.includes('nfc') || 
      itemLower.includes('pluxee') || itemLower.includes('titre')) {
    return { mainCategory: 'equipements-services', subCategory: 'services' };
  }
  
  return { mainCategory: 'ambiance-specialites', subCategory: 'ambiance' };
}

// Normaliser les items pour éviter les doublons de variantes
function normalizeItem(item: string): string {
  const itemLower = item.toLowerCase();
  
  // Normaliser les variantes avec "disponible"
  if (itemLower.includes('livraison disponible')) return 'Livraison';
  if (itemLower.includes('vente à emporter disponible')) return 'Vente à emporter';
  if (itemLower.includes('repas sur place disponible')) return 'Repas sur place';
  if (itemLower.includes('service à table disponible')) return 'Service à table';
  
  // Normaliser les variantes avec "accepté"
  if (itemLower.includes('carte bancaire acceptée')) return 'Carte bancaire';
  if (itemLower.includes('espèces acceptées')) return 'Espèces';
  
  // Normaliser les variantes avec "gratuit"
  if (itemLower.includes('wifi gratuit')) return 'WiFi';
  if (itemLower.includes('parking gratuit')) return 'Parking';
  
  return item; // Retourner l'item original si pas de normalisation
}

// Organiser les items par catégories
export function organizeItemsByCategories(items: string[]): Record<string, Record<string, string[]>> {
  const organized: Record<string, Record<string, string[]>> = {};
  
  // Initialiser la structure
  Object.keys(MAIN_CATEGORIES).forEach(mainCat => {
    organized[mainCat] = {};
    Object.keys(MAIN_CATEGORIES[mainCat as keyof typeof MAIN_CATEGORIES].subCategories).forEach(subCat => {
      organized[mainCat][subCat] = [];
    });
  });
  
  // ✅ CORRECTION : Normaliser ET dédupliquer les items
  const normalizedItems = items.map(normalizeItem);
  const uniqueItems = [...new Set(normalizedItems)];
  console.log('🔧 NORMALISATION - Items originaux:', items.length, 'Items normalisés:', uniqueItems.length);
  
  // Catégoriser chaque item unique
  uniqueItems.forEach(item => {
    const { mainCategory, subCategory } = categorizeItem(item);
    if (organized[mainCategory] && organized[mainCategory][subCategory]) {
      // Vérifier qu'on n'ajoute pas déjà cet item dans cette sous-catégorie
      if (!organized[mainCategory][subCategory].includes(item)) {
        organized[mainCategory][subCategory].push(item);
      }
    }
  });
  
  return organized;
}

// Obtenir les suggestions intelligentes basées sur les données manquantes
export function getSmartSuggestions(existingItems: string[], establishmentType: string = 'restaurant'): string[] {
  const suggestions: string[] = [];
  
  // Vérifier ce qui manque dans chaque catégorie
  const organized = organizeItemsByCategories(existingItems);
  
  // Suggestions pour Ambiance & Spécialités
  if (organized['ambiance-specialites']['ambiance'].length === 0) {
    suggestions.push('Ambiance décontractée', 'Cadre agréable', 'Ambiance chaleureuse');
  }
  
  if (organized['ambiance-specialites']['points-forts'].length === 0) {
    suggestions.push('Excellent pour les groupes', 'Grand choix de boissons');
  }
  
  if (organized['ambiance-specialites']['populaire-pour'].length === 0) {
    suggestions.push('Populaire pour les déjeuners', 'Populaire pour les dîners');
  }
  
  // Suggestions pour Équipements & Services
  if (organized['equipements-services']['services'].length === 0) {
    suggestions.push('WiFi gratuit', 'Climatisation', 'Toilettes');
  }
  
  if (organized['equipements-services']['accessibility'].length === 0) {
    suggestions.push('Accessible aux personnes à mobilité réduite');
  }
  
  if (organized['equipements-services']['parking'].length === 0) {
    suggestions.push('Parking gratuit', 'Parking payant');
  }
  
  return suggestions;
}
