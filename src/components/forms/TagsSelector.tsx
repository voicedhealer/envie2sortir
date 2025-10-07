"use client";

import { useState } from 'react';

// Types
interface Tag {
  id: string;
  label: string;
  category: string;
  frequency?: number;
}

interface TagsSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestedTags?: string[];
  error?: string;
}

// Import supprimé car non utilisé directement dans ce composant

// Base de données de tags populaires organisés par catégories harmonisées
const POPULAR_TAGS: Tag[] = [
  // 🍽️ Services de restauration
  { id: 'déjeuner', label: 'Déjeuner', category: 'services-restauration' },
  { id: 'dîner', label: 'Dîner', category: 'services-restauration' },
  { id: 'brunch', label: 'Brunch', category: 'services-restauration' },
  { id: 'petit-déjeuner', label: 'Petit-déjeuner', category: 'services-restauration' },
  { id: 'goûter', label: 'Goûter', category: 'services-restauration' },
  { id: 'desserts', label: 'Desserts', category: 'services-restauration' },
  { id: 'service-à-table', label: 'Service à table', category: 'services-restauration' },
  { id: 'repas-sur-place', label: 'Repas sur place', category: 'services-restauration' },
  { id: 'livraison', label: 'Livraison', category: 'services-restauration' },
  { id: 'vente-à-emporter', label: 'Vente à emporter', category: 'services-restauration' },

  // 🎨 Ambiance & Atmosphère
  { id: 'ambiance-décontractée', label: 'Ambiance décontractée', category: 'ambiance-atmosphere' },
  { id: 'ambiance-conviviale', label: 'Ambiance conviviale', category: 'ambiance-atmosphere' },
  { id: 'ambiance-chaleureuse', label: 'Ambiance chaleureuse', category: 'ambiance-atmosphere' },
  { id: 'romantique', label: 'Romantique', category: 'ambiance-atmosphere' },
  { id: 'chic', label: 'Chic', category: 'ambiance-atmosphere' },
  { id: 'élégant', label: 'Élégant', category: 'ambiance-atmosphere' },
  { id: 'cosy', label: 'Cosy', category: 'ambiance-atmosphere' },
  { id: 'intimiste', label: 'Intimiste', category: 'ambiance-atmosphere' },
  { id: 'festif', label: 'Festif', category: 'ambiance-atmosphere' },
  { id: 'branché', label: 'Branché', category: 'ambiance-atmosphere' },
  { id: 'authentique', label: 'Authentique', category: 'ambiance-atmosphere' },
  { id: 'moderne', label: 'Moderne', category: 'ambiance-atmosphere' },
  { id: 'traditionnel', label: 'Traditionnel', category: 'ambiance-atmosphere' },
  { id: 'vintage', label: 'Vintage', category: 'ambiance-atmosphere' },

  // 🔧 Commodités & Équipements
  { id: 'wifi', label: 'WiFi', category: 'commodites-equipements' },
  { id: 'climatisation', label: 'Climatisation', category: 'commodites-equipements' },
  { id: 'chauffage', label: 'Chauffage', category: 'commodites-equipements' },
  { id: 'toilettes', label: 'Toilettes', category: 'commodites-equipements' },
  { id: 'terrasse', label: 'Terrasse', category: 'commodites-equipements' },
  { id: 'parking', label: 'Parking', category: 'commodites-equipements' },
  { id: 'ascenseur', label: 'Ascenseur', category: 'commodites-equipements' },
  { id: 'vestiaire', label: 'Vestiaire', category: 'commodites-equipements' },
  { id: 'accessible-pmr', label: 'Accessible PMR', category: 'commodites-equipements' },
  { id: 'animaux-acceptés', label: 'Animaux acceptés', category: 'commodites-equipements' },
  { id: 'réservation', label: 'Réservation', category: 'commodites-equipements' },

  // 👥 Clientèle cible
  { id: 'groupes', label: 'Groupes', category: 'clientele-cible' },
  { id: 'couples', label: 'Couples', category: 'clientele-cible' },
  { id: 'familles', label: 'Familles', category: 'clientele-cible' },
  { id: 'enfants', label: 'Enfants', category: 'clientele-cible' },
  { id: 'étudiants', label: 'Étudiants', category: 'clientele-cible' },
  { id: 'seniors', label: 'Seniors', category: 'clientele-cible' },
  { id: 'professionnels', label: 'Professionnels', category: 'clientele-cible' },
  { id: 'touristes', label: 'Touristes', category: 'clientele-cible' },
  { id: 'locaux', label: 'Locaux', category: 'clientele-cible' },

  // 🎉 Activités & Événements
  { id: 'bowling', label: 'Bowling', category: 'activites-evenements' },
  { id: 'escape-game', label: 'Escape Game', category: 'activites-evenements' },
  { id: 'karaoké', label: 'Karaoké', category: 'activites-evenements' },
  { id: 'concert', label: 'Concert', category: 'activites-evenements' },
  { id: 'spectacle', label: 'Spectacle', category: 'activites-evenements' },
  { id: 'danse', label: 'Danse', category: 'activites-evenements' },
  { id: 'musique-live', label: 'Musique Live', category: 'activites-evenements' },
  { id: 'dj', label: 'DJ', category: 'activites-evenements' },
  { id: 'anniversaire', label: 'Anniversaire', category: 'activites-evenements' },
  { id: 'mariage', label: 'Mariage', category: 'activites-evenements' },
  { id: 'team-building', label: 'Team Building', category: 'activites-evenements' },

  // ℹ️ Informations pratiques
  { id: 'espace-non-fumeurs', label: 'Espace non-fumeurs', category: 'informations-pratiques' },
  { id: 'réservation-recommandée', label: 'Réservation recommandée', category: 'informations-pratiques' },
  { id: 'toilettes-pmr', label: 'Toilettes adaptées PMR', category: 'informations-pratiques' },
  { id: 'idéal-groupes', label: 'Idéal pour les groupes', category: 'informations-pratiques' },
  { id: 'handicap', label: 'Handicap', category: 'informations-pratiques' },
  { id: 'non-fumeurs', label: 'Non-fumeurs', category: 'informations-pratiques' },
  { id: 'parking-gratuit', label: 'Parking gratuit', category: 'informations-pratiques' },
  { id: 'parking-couvert', label: 'Parking couvert', category: 'informations-pratiques' },
  { id: 'parking-privé', label: 'Parking privé', category: 'informations-pratiques' },

  // 🍽️ Cuisine & Nourriture (pour les spécialités)
  { id: 'pizza', label: 'Pizza', category: 'ambiance-atmosphere' },
  { id: 'italien', label: 'Italien', category: 'ambiance-atmosphere' },
  { id: 'français', label: 'Français', category: 'ambiance-atmosphere' },
  { id: 'asiatique', label: 'Asiatique', category: 'ambiance-atmosphere' },
  { id: 'japonais', label: 'Japonais', category: 'ambiance-atmosphere' },
  { id: 'chinois', label: 'Chinois', category: 'ambiance-atmosphere' },
  { id: 'indien', label: 'Indien', category: 'ambiance-atmosphere' },
  { id: 'burger', label: 'Burger', category: 'ambiance-atmosphere' },
  { id: 'kebab', label: 'Kebab', category: 'ambiance-atmosphere' },
  { id: 'sushi', label: 'Sushi', category: 'ambiance-atmosphere' },
  { id: 'végétarien', label: 'Végétarien', category: 'ambiance-atmosphere' },
  { id: 'vegan', label: 'Vegan', category: 'ambiance-atmosphere' },
  { id: 'bio', label: 'Bio', category: 'ambiance-atmosphere' },
  { id: 'local', label: 'Local', category: 'ambiance-atmosphere' },
  { id: 'artisanal', label: 'Artisanal', category: 'ambiance-atmosphere' },

  // 🍹 Boissons (pour les spécialités)
  { id: 'cocktails', label: 'Cocktails', category: 'ambiance-atmosphere' },
  { id: 'bières', label: 'Bières', category: 'ambiance-atmosphere' },
  { id: 'vins', label: 'Vins', category: 'ambiance-atmosphere' },
  { id: 'champagne', label: 'Champagne', category: 'ambiance-atmosphere' },
  { id: 'whisky', label: 'Whisky', category: 'ambiance-atmosphere' },
  { id: 'rhum', label: 'Rhum', category: 'ambiance-atmosphere' },
  { id: 'vodka', label: 'Vodka', category: 'ambiance-atmosphere' },
  { id: 'gin', label: 'Gin', category: 'ambiance-atmosphere' },
  { id: 'café', label: 'Café', category: 'ambiance-atmosphere' },
  { id: 'thé', label: 'Thé', category: 'ambiance-atmosphere' }
];

// Fonction pour obtenir les suggestions basées sur les activités
export function getSuggestedTags(activities: string[]): string[] {
  const suggestions: string[] = [];
  
  activities.forEach(activity => {
    // Mapping des activités vers des tags suggérés
    const activitySuggestions: { [key: string]: string[] } = {
      'pizzeria': ['pizza', 'italien', 'pâtes', 'livraison', 'emporter', 'familial'],
      'restaurant_italien': ['pizza', 'italien', 'pâtes', 'antipasti', 'vins', 'familial'],
      'restaurant_français': ['français', 'traditionnel', 'terroir', 'gastronomique', 'vins'],
      'restaurant_asiatique': ['asiatique', 'sushi', 'wok', 'japonais', 'chinois', 'thé'],
      'kebab': ['kebab', 'turc', 'sandwich', 'livraison', 'rapide', 'budget'],
      'burger': ['burger', 'américain', 'frites', 'rapide', 'familial', 'budget'],
      'bar_ambiance': ['cocktails', 'ambiance', 'lounge', 'chic', 'soirée', 'romantique'],
      'pub_traditionnel': ['bières', 'pub', 'sport', 'décontracté', 'groupe', 'happy-hour'],
      'brasserie_artisanale': ['bières', 'artisanal', 'local', 'dégustation', 'authentique'],
      'bar_cocktails': ['cocktails', 'mixologie', 'sophistiqué', 'premium', 'chic'],
      'bar_vins': ['vins', 'œnologie', 'dégustation', 'raffiné', 'culturel'],
      'bar_sports': ['sport', 'bières', 'écrans', 'groupe', 'festif', 'happy-hour'],
      'discotheque': ['danse', 'dj', 'musique', 'festif', 'nuit', 'groupe'],
      'club_techno': ['électro', 'techno', 'danse', 'underground', 'nuit'],
      'bowling': ['bowling', 'famille', 'groupe', 'compétition', 'amusant'],
      'escape_game_horreur': ['escape-game', 'aventure', 'équipe', 'défi', 'énigme', 'groupe'],
      'futsal': ['football', 'sport', 'équipe', 'compétition', 'groupe']
    };
    
    if (activitySuggestions[activity]) {
      suggestions.push(...activitySuggestions[activity]);
    }
  });
  
  // Supprimer les doublons et retourner les 15 premiers
  return [...new Set(suggestions)].slice(0, 15);
}

export default function TagsSelector({ 
  selectedTags, 
  onTagsChange, 
  suggestedTags = [], 
  error 
}: TagsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Filtrer les tags selon la recherche
  const filteredTags = POPULAR_TAGS.filter(tag => 
    tag.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  ).slice(0, 10);

  // Gérer l'ajout d'un tag
  const handleAddTag = (tagId: string) => {
    if (selectedTags.length < 15 && !selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  // Gérer la suppression d'un tag
  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  // Gérer l'ajout d'un tag personnalisé
  const handleAddCustomTag = () => {
    if (customTag.trim() && selectedTags.length < 15) {
      const tagId = customTag.toLowerCase().replace(/\s+/g, '-');
      if (!selectedTags.includes(tagId)) {
        onTagsChange([...selectedTags, tagId]);
        setCustomTag('');
      }
    }
  };

  // Obtenir le label d'un tag
  const getTagLabel = (tagId: string): string => {
    const tag = POPULAR_TAGS.find(t => t.id === tagId);
    return tag ? tag.label : tagId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <p className="text-sm text-blue-600 mt-2">
          <Icons.Info /> Gardez les tags suceptibles d'être utilisés dans la barre de recherche par nos utilisateurs, supprimer le superflu !
        </p>
      </div>

      {/* Tags suggérés basés sur les activités */}
      {suggestedTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Suggestions basées sur vos activités :
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map(tagId => (
              <button
                key={tagId}
                onClick={() => handleAddTag(tagId)}
                disabled={selectedTags.includes(tagId) || selectedTags.length >= 15}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + {getTagLabel(tagId)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags sélectionnés */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Tags sélectionnés ({selectedTags.length}/15) :
        </h4>
        {selectedTags.length === 0 ? (
          <p className="text-gray-500 text-sm italic">
            Aucun tag sélectionné. Minimum 3 tags requis.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {getTagLabel(tagId)}
                <button
                  onClick={() => handleRemoveTag(tagId)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <Icons.X />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recherche de tags */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rechercher des tags :
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchTerm.length > 0)}
            placeholder="Tapez pour rechercher des tags..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {/* Suggestions */}
          {showSuggestions && filteredTags.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{tag.label}</div>
                  <div className="text-xs text-gray-500 capitalize">{tag.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tag personnalisé */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter un tag personnalisé :
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
            placeholder="Votre tag personnalisé..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddCustomTag}
            disabled={!customTag.trim() || selectedTags.length >= 15}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-500 text-sm flex items-center">
          <Icons.X />
          {error}
        </p>
      )}

      {/* Aide */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils :</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choisissez des mots que vos clients utiliseraient pour vous chercher</li>
          <li>• Mélangez cuisine, ambiance, services et activités</li>
          <li>• Minimum 3 tags, maximum 15 tags</li>
        </ul>
      </div>
    </div>
  );
}

// Icônes simples
const Icons = {
  Info: () => (
    <svg className="inline w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

