"use client";

import { useState, useEffect } from 'react';

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

// Base de données de tags populaires organisés par catégories
const POPULAR_TAGS: Tag[] = [
  // 🍽️ Cuisine & Nourriture
  { id: 'pizza', label: 'Pizza', category: 'cuisine' },
  { id: 'italien', label: 'Italien', category: 'cuisine' },
  { id: 'français', label: 'Français', category: 'cuisine' },
  { id: 'asiatique', label: 'Asiatique', category: 'cuisine' },
  { id: 'mexicain', label: 'Mexicain', category: 'cuisine' },
  { id: 'japonais', label: 'Japonais', category: 'cuisine' },
  { id: 'chinois', label: 'Chinois', category: 'cuisine' },
  { id: 'indien', label: 'Indien', category: 'cuisine' },
  { id: 'libanais', label: 'Libanais', category: 'cuisine' },
  { id: 'grec', label: 'Grec', category: 'cuisine' },
  { id: 'burger', label: 'Burger', category: 'cuisine' },
  { id: 'kebab', label: 'Kebab', category: 'cuisine' },
  { id: 'tacos', label: 'Tacos', category: 'cuisine' },
  { id: 'sushi', label: 'Sushi', category: 'cuisine' },
  { id: 'pâtes', label: 'Pâtes', category: 'cuisine' },
  { id: 'viande', label: 'Viande', category: 'cuisine' },
  { id: 'poisson', label: 'Poisson', category: 'cuisine' },
  { id: 'végétarien', label: 'Végétarien', category: 'cuisine' },
  { id: 'vegan', label: 'Vegan', category: 'cuisine' },
  { id: 'bio', label: 'Bio', category: 'cuisine' },
  { id: 'local', label: 'Local', category: 'cuisine' },
  { id: 'artisanal', label: 'Artisanal', category: 'cuisine' },

  // 🍹 Boissons
  { id: 'cocktails', label: 'Cocktails', category: 'boissons' },
  { id: 'bières', label: 'Bières', category: 'boissons' },
  { id: 'vins', label: 'Vins', category: 'boissons' },
  { id: 'champagne', label: 'Champagne', category: 'boissons' },
  { id: 'whisky', label: 'Whisky', category: 'boissons' },
  { id: 'rhum', label: 'Rhum', category: 'boissons' },
  { id: 'vodka', label: 'Vodka', category: 'boissons' },
  { id: 'gin', label: 'Gin', category: 'boissons' },
  { id: 'tequila', label: 'Tequila', category: 'boissons' },
  { id: 'cognac', label: 'Cognac', category: 'boissons' },
  { id: 'armagnac', label: 'Armagnac', category: 'boissons' },
  { id: 'calvados', label: 'Calvados', category: 'boissons' },
  { id: 'cidre', label: 'Cidre', category: 'boissons' },
  { id: 'jus', label: 'Jus', category: 'boissons' },
  { id: 'smoothie', label: 'Smoothie', category: 'boissons' },
  { id: 'thé', label: 'Thé', category: 'boissons' },
  { id: 'café', label: 'Café', category: 'boissons' },

  // 🎯 Activités & Loisirs
  { id: 'escape-game', label: 'Escape Game', category: 'activites' },
  { id: 'karting', label: 'Karting', category: 'activites' },
  { id: 'bowling', label: 'Bowling', category: 'activites' },
  { id: 'billard', label: 'Billard', category: 'activites' },
  { id: 'fléchettes', label: 'Fléchettes', category: 'activites' },
  { id: 'ping-pong', label: 'Ping-Pong', category: 'activites' },
  { id: 'baby-foot', label: 'Baby-foot', category: 'activites' },
  { id: 'jeux-vidéo', label: 'Jeux vidéo', category: 'activites' },
  { id: 'arcade', label: 'Arcade', category: 'activites' },
  { id: 'laser-game', label: 'Laser Game', category: 'activites' },
  { id: 'paintball', label: 'Paintball', category: 'activites' },
  { id: 'airsoft', label: 'Airsoft', category: 'activites' },
  { id: 'escalade', label: 'Escalade', category: 'activites' },
  { id: 'accrobranche', label: 'Accrobranche', category: 'activites' },
  { id: 'kayak', label: 'Kayak', category: 'activites' },
  { id: 'canoë', label: 'Canoë', category: 'activites' },
  { id: 'vélo', label: 'Vélo', category: 'activites' },
  { id: 'randonnée', label: 'Randonnée', category: 'activites' },

  // 🎵 Musique & Divertissement
  { id: 'musique-live', label: 'Musique Live', category: 'divertissement' },
  { id: 'dj', label: 'DJ', category: 'divertissement' },
  { id: 'karaoké', label: 'Karaoké', category: 'divertissement' },
  { id: 'concert', label: 'Concert', category: 'divertissement' },
  { id: 'spectacle', label: 'Spectacle', category: 'divertissement' },
  { id: 'théâtre', label: 'Théâtre', category: 'divertissement' },
  { id: 'comédie', label: 'Comédie', category: 'divertissement' },
  { id: 'magie', label: 'Magie', category: 'divertissement' },
  { id: 'cirque', label: 'Cirque', category: 'divertissement' },
  { id: 'danse', label: 'Danse', category: 'divertissement' },
  { id: 'salsa', label: 'Salsa', category: 'divertissement' },
  { id: 'bachata', label: 'Bachata', category: 'divertissement' },
  { id: 'rock', label: 'Rock', category: 'divertissement' },
  { id: 'jazz', label: 'Jazz', category: 'divertissement' },
  { id: 'blues', label: 'Blues', category: 'divertissement' },
  { id: 'électro', label: 'Électro', category: 'divertissement' },
  { id: 'hip-hop', label: 'Hip-Hop', category: 'divertissement' },
  { id: 'reggae', label: 'Reggae', category: 'divertissement' },

  // 🏠 Ambiance & Services
  { id: 'familial', label: 'Familial', category: 'ambiance' },
  { id: 'romantique', label: 'Romantique', category: 'ambiance' },
  { id: 'décontracté', label: 'Décontracté', category: 'ambiance' },
  { id: 'chic', label: 'Chic', category: 'ambiance' },
  { id: 'élégant', label: 'Élégant', category: 'ambiance' },
  { id: 'cosy', label: 'Cosy', category: 'ambiance' },
  { id: 'intimiste', label: 'Intimiste', category: 'ambiance' },
  { id: 'festif', label: 'Festif', category: 'ambiance' },
  { id: 'branché', label: 'Branché', category: 'ambiance' },
  { id: 'authentique', label: 'Authentique', category: 'ambiance' },
  { id: 'moderne', label: 'Moderne', category: 'ambiance' },
  { id: 'traditionnel', label: 'Traditionnel', category: 'ambiance' },
  { id: 'vintage', label: 'Vintage', category: 'ambiance' },
  { id: 'industriel', label: 'Industriel', category: 'ambiance' },
  { id: 'naturel', label: 'Naturel', category: 'ambiance' },
  { id: 'minimaliste', label: 'Minimaliste', category: 'ambiance' },
  { id: 'coloré', label: 'Coloré', category: 'ambiance' },
  { id: 'sombre', label: 'Sombre', category: 'ambiance' },

  // 🎉 Événements & Occasions
  { id: 'anniversaire', label: 'Anniversaire', category: 'evenements' },
  { id: 'mariage', label: 'Mariage', category: 'evenements' },
  { id: 'enterrement-vie', label: 'Enterrement de vie', category: 'evenements' },
  { id: 'team-building', label: 'Team Building', category: 'evenements' },
  { id: 'séminaire', label: 'Séminaire', category: 'evenements' },
  { id: 'formation', label: 'Formation', category: 'evenements' },
  { id: 'lancement', label: 'Lancement', category: 'evenements' },
  { id: 'inauguration', label: 'Inauguration', category: 'evenements' },
  { id: 'galerie', label: 'Galerie', category: 'evenements' },
  { id: 'vernissage', label: 'Vernissage', category: 'evenements' },
  { id: 'dégustation', label: 'Dégustation', category: 'evenements' },
  { id: 'masterclass', label: 'Masterclass', category: 'evenements' },
  { id: 'atelier', label: 'Atelier', category: 'evenements' },
  { id: 'conférence', label: 'Conférence', category: 'evenements' },
  { id: 'débat', label: 'Débat', category: 'evenements' },
  { id: 'rencontre', label: 'Rencontre', category: 'evenements' },

  // 🏢 Services & Équipements
  { id: 'terrasse', label: 'Terrasse', category: 'services' },
  { id: 'parking', label: 'Parking', category: 'services' },
  { id: 'wifi', label: 'WiFi', category: 'services' },
  { id: 'climatisation', label: 'Climatisation', category: 'services' },
  { id: 'chauffage', label: 'Chauffage', category: 'services' },
  { id: 'vestiaire', label: 'Vestiaire', category: 'services' },
  { id: 'toilettes', label: 'Toilettes', category: 'services' },
  { id: 'ascenseur', label: 'Ascenseur', category: 'services' },
  { id: 'pmr', label: 'Accessible PMR', category: 'services' },
  { id: 'animaux', label: 'Animaux acceptés', category: 'services' },
  { id: 'livraison', label: 'Livraison', category: 'services' },
  { id: 'emporter', label: 'À emporter', category: 'services' },
  { id: 'réservation', label: 'Réservation', category: 'services' },
  { id: 'carte', label: 'Carte bancaire', category: 'services' },
  { id: 'espèces', label: 'Espèces', category: 'services' },
  { id: 'chèque', label: 'Chèque', category: 'services' },
  { id: 'ticket-restaurant', label: 'Ticket Restaurant', category: 'services' },
  { id: 'happy-hour', label: 'Happy Hour', category: 'services' },

  // 👥 Public & Groupe
  { id: 'groupe', label: 'Groupe', category: 'public' },
  { id: 'couple', label: 'Couple', category: 'public' },
  { id: 'solo', label: 'Solo', category: 'public' },
  { id: 'enfants', label: 'Enfants', category: 'public' },
  { id: 'ados', label: 'Ados', category: 'public' },
  { id: 'adultes', label: 'Adultes', category: 'public' },
  { id: 'seniors', label: 'Seniors', category: 'public' },
  { id: 'étudiants', label: 'Étudiants', category: 'public' },
  { id: 'professionnels', label: 'Professionnels', category: 'public' },
  { id: 'touristes', label: 'Touristes', category: 'public' },
  { id: 'locaux', label: 'Locaux', category: 'public' },
  { id: 'expatriés', label: 'Expatriés', category: 'public' },

  // ⏰ Moment & Horaires
  { id: 'déjeuner', label: 'Déjeuner', category: 'moment' },
  { id: 'dîner', label: 'Dîner', category: 'moment' },
  { id: 'brunch', label: 'Brunch', category: 'moment' },
  { id: 'goûter', label: 'Goûter', category: 'moment' },
  { id: 'apéro', label: 'Apéro', category: 'moment' },
  { id: 'soirée', label: 'Soirée', category: 'moment' },
  { id: 'nuit', label: 'Nuit', category: 'moment' },
  { id: 'weekend', label: 'Weekend', category: 'moment' },
  { id: 'semaine', label: 'Semaine', category: 'moment' },
  { id: 'vacances', label: 'Vacances', category: 'moment' },
  { id: 'fêtes', label: 'Fêtes', category: 'moment' },
  { id: 'saison', label: 'Saison', category: 'moment' },

  // 💰 Prix & Budget
  { id: 'budget', label: 'Budget', category: 'prix' },
  { id: 'moyen', label: 'Prix moyen', category: 'prix' },
  { id: 'premium', label: 'Premium', category: 'prix' },
  { id: 'luxe', label: 'Luxe', category: 'prix' },
  { id: 'accessible', label: 'Accessible', category: 'prix' },
  { id: 'gratuit', label: 'Gratuit', category: 'prix' },
  { id: 'promo', label: 'Promotions', category: 'prix' },
  { id: 'réduction', label: 'Réductions', category: 'prix' },
  { id: 'offre', label: 'Offres spéciales', category: 'prix' }
];

// Fonction pour obtenir les suggestions basées sur les activités
function getSuggestedTags(activities: string[]): string[] {
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Comment les clients vous trouvent-ils ?
        </h3>
        <p className="text-gray-600">
          Choisissez les mots-clés qui décrivent le mieux votre établissement
        </p>
        <p className="text-sm text-blue-600 mt-2">
          <Icons.Info /> Plus vous êtes précis, mieux vous serez trouvé !
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
          <li>• Les tags personnalisés sont validés par notre équipe</li>
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

