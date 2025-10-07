"use client";

import { useState } from 'react';

interface EnvieTagsInputProps {
  onEnvieTagsGenerated: (tags: string[]) => void;
  existingTags: string[];
}

/**
 * Composant pour saisir des envies et générer automatiquement des tags
 * Évite les doublons avec les tags existants
 */
export default function EnvieTagsInput({ onEnvieTagsGenerated, existingTags }: EnvieTagsInputProps) {
  const [envieInput, setEnvieInput] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  /**
   * Génère des tags à partir d'une envie saisie
   */
  const generateTagsFromEnvie = (envie: string): string[] => {
    const envieClean = envie.toLowerCase().trim();
    const tags: string[] = [];

    // Ajouter le tag principal "Envie de..."
    if (envieClean) {
      tags.push(`Envie de ${envieClean}`);
    }

    // Extraction de mots-clés spécifiques
    const keywords = {
      // Cuisine
      'manger': ['restaurant', 'cuisine', 'gastronomie'],
      'boire': ['bar', 'boisson', 'cocktail'],
      'pizza': ['italien', 'pizza', 'convivial'],
      'sushi': ['japonais', 'sushi', 'raffinement'],
      'burger': ['américain', 'rapide', 'décontracté'],
      'cocktail': ['bar', 'soirée', 'ambiance'],
      'café': ['café', 'pause', 'détente'],
      'vin': ['bar à vin', 'dégustation', 'raffinement'],
      
      // Ambiance
      'romantique': ['romantique', 'couple', 'intime'],
      'soirée': ['soirée', 'festif', 'ambiance'],
      'détente': ['détente', 'calme', 'relaxation'],
      'famille': ['familial', 'enfants', 'convivial'],
      'groupe': ['groupe', 'amis', 'convivial'],
      'luxe': ['luxe', 'prestige', 'standing'],
      
      // Activités
      'bowling': ['bowling', 'jeu', 'groupe'],
      'cinéma': ['cinéma', 'culture', 'détente'],
      'sport': ['sport', 'activité', 'groupe'],
      'jeu': ['jeu', 'amusement', 'groupe'],
      'escape': ['escape game', 'défi', 'équipe'],
      
      // Moments
      'déjeuner': ['déjeuner', 'midi', 'rapide'],
      'dîner': ['dîner', 'soirée', 'gastronomie'],
      'brunch': ['brunch', 'weekend', 'détente'],
      'petit-déjeuner': ['petit-déjeuner', 'matin', 'café']
    };

    // Rechercher des mots-clés dans l'envie
    Object.entries(keywords).forEach(([keyword, relatedTags]) => {
      if (envieClean.includes(keyword)) {
        relatedTags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    });

    return tags;
  };

  const handleAddEnvie = () => {
    if (!envieInput.trim()) return;

    const newTags = generateTagsFromEnvie(envieInput);
    
    // Filtrer les doublons avec les tags existants et générés
    const allExistingTags = [...existingTags, ...generatedTags];
    const uniqueTags = newTags.filter(tag => 
      !allExistingTags.some(existing => 
        existing.toLowerCase() === tag.toLowerCase()
      )
    );

    if (uniqueTags.length > 0) {
      const updatedGeneratedTags = [...generatedTags, ...uniqueTags];
      setGeneratedTags(updatedGeneratedTags);
      onEnvieTagsGenerated(updatedGeneratedTags);
    }

    setEnvieInput('');
  };

  const handleRemoveGeneratedTag = (tagToRemove: string) => {
    const updatedTags = generatedTags.filter(tag => tag !== tagToRemove);
    setGeneratedTags(updatedTags);
    onEnvieTagsGenerated(updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEnvie();
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">💭</span>
        <h3 className="text-xl font-bold text-orange-800">Décrivez vos envies</h3>
      </div>
      
      <p className="text-orange-700 mb-4">
      <span className="font-bold">Suggestion importante: "Décrivez vos menus, boissons, activités, en utilisant le thème l'envie de: "</span>.
      </p>

      {/* Champ de saisie des envies */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 font-medium">
            Envie de :
          </div>
          <input
            type="text"
            value={envieInput}
            onChange={(e) => setEnvieInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="manger des sushi, boire un cocktail..."
            className="w-full pl-24 pr-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAddEnvie}
          disabled={!envieInput.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-80 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Générer des tags
        </button>
      </div>

      {/* Tags générés */}
      {generatedTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-800 mb-2">
            Tags générés automatiquement ({generatedTags.length}) :
          </h4>
          <div className="flex flex-wrap gap-2">
            {generatedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveGeneratedTag(tag)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exemples */}
      <div className="mt-4 text-sm text-orange-600">
        <p className="font-medium mb-1">💡 Exemples :</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
          <span>• → Envie de: manger un trio d'oeuf poché sauce époisses</span>
        </div>
      </div>
    </div>
  );
}
