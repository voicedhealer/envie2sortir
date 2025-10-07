/**
 * Système de catégorisation cohérent pour les établissements
 * Utilisé dans le formulaire, le récapitulatif et la page publique
 */

export interface EstablishmentCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const ESTABLISHMENT_CATEGORIES: EstablishmentCategory[] = [
  {
    id: 'services-restauration',
    label: 'Services de restauration',
    icon: '🍽️',
    description: 'Services liés à la restauration et aux repas',
    color: 'orange'
  },
  {
    id: 'ambiance-atmosphere',
    label: 'Ambiance & Atmosphère',
    icon: '🎨',
    description: 'Ambiance, décoration et atmosphère de l\'établissement',
    color: 'purple'
  },
  {
    id: 'commodites-equipements',
    label: 'Commodités & Équipements',
    icon: '🔧',
    description: 'Équipements et services pratiques',
    color: 'green'
  },
  {
    id: 'clientele-cible',
    label: 'Clientèle cible',
    icon: '👥',
    description: 'Types de clientèle et groupes ciblés',
    color: 'blue'
  },
  {
    id: 'activites-evenements',
    label: 'Activités & Événements',
    icon: '🎉',
    description: 'Activités proposées et événements',
    color: 'pink'
  },
  {
    id: 'informations-pratiques',
    label: 'Informations pratiques',
    icon: 'ℹ️',
    description: 'Informations utiles pour les visiteurs',
    color: 'gray'
  }
];

/**
 * Fonction pour catégoriser automatiquement un tag
 */
export function categorizeTag(tag: string): string {
  const tagLower = tag.toLowerCase();
  
  // Services de restauration
  if (tagLower.includes('déjeuner') || tagLower.includes('dîner') || 
      tagLower.includes('dessert') || tagLower.includes('repas') ||
      tagLower.includes('service à table') || tagLower.includes('brunch') ||
      tagLower.includes('petit-déjeuner') || tagLower.includes('goûter')) {
    return 'services-restauration';
  }
  
  // Ambiance & Atmosphère
  if (tagLower.includes('ambiance') || tagLower.includes('atmosphère') ||
      tagLower.includes('romantique') || tagLower.includes('chaleureux') ||
      tagLower.includes('décontracté') || tagLower.includes('chic') ||
      tagLower.includes('cosy') || tagLower.includes('intimiste') ||
      tagLower.includes('festif') || tagLower.includes('branché') ||
      tagLower.includes('authentique') || tagLower.includes('moderne') ||
      tagLower.includes('traditionnel') || tagLower.includes('vintage')) {
    return 'ambiance-atmosphere';
  }
  
  // Commodités & Équipements
  if (tagLower.includes('wifi') || tagLower.includes('climatisation') ||
      tagLower.includes('chauffage') || tagLower.includes('toilettes') ||
      tagLower.includes('terrasse') || tagLower.includes('parking') ||
      tagLower.includes('ascenseur') || tagLower.includes('vestiaire') ||
      tagLower.includes('livraison') || tagLower.includes('emporter') ||
      tagLower.includes('réservation')) {
    return 'commodites-equipements';
  }
  
  // Clientèle cible
  if (tagLower.includes('groupe') || tagLower.includes('couple') ||
      tagLower.includes('famille') || tagLower.includes('enfants') ||
      tagLower.includes('étudiants') || tagLower.includes('seniors') ||
      tagLower.includes('professionnels') || tagLower.includes('touristes') ||
      tagLower.includes('locaux') || tagLower.includes('expatriés')) {
    return 'clientele-cible';
  }
  
  // Activités & Événements
  if (tagLower.includes('bowling') || tagLower.includes('escape') ||
      tagLower.includes('karaoké') || tagLower.includes('concert') ||
      tagLower.includes('spectacle') || tagLower.includes('danse') ||
      tagLower.includes('musique') || tagLower.includes('événement') ||
      tagLower.includes('anniversaire') || tagLower.includes('mariage')) {
    return 'activites-evenements';
  }
  
  // Par défaut, informations pratiques
  return 'informations-pratiques';
}

/**
 * Fonction pour organiser les tags par catégorie
 */
export function organizeTagsByCategory(tags: string[]): Record<string, string[]> {
  const organized: Record<string, string[]> = {};
  
  // Initialiser toutes les catégories
  ESTABLISHMENT_CATEGORIES.forEach(category => {
    organized[category.id] = [];
  });
  
  // Catégoriser chaque tag
  tags.forEach(tag => {
    const category = categorizeTag(tag);
    if (organized[category]) {
      organized[category].push(tag);
    }
  });
  
  // Supprimer les catégories vides
  Object.keys(organized).forEach(key => {
    if (organized[key].length === 0) {
      delete organized[key];
    }
  });
  
  return organized;
}

/**
 * Fonction pour obtenir les informations d'une catégorie
 */
export function getCategoryInfo(categoryId: string): EstablishmentCategory | undefined {
  return ESTABLISHMENT_CATEGORIES.find(cat => cat.id === categoryId);
}
