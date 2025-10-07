'use client';

import { useState } from 'react';
import { organizeTagsByCategory, ESTABLISHMENT_CATEGORIES } from '@/lib/establishment-categories';
import EstablishmentCategorySection from './EstablishmentCategorySection';

/**
 * Composant de démonstration pour tester le nouveau système de catégorisation
 */
export default function CategoryDemo() {
  const [testTags, setTestTags] = useState([
    'Déjeuner',
    'Dîner', 
    'Ambiance décontractée',
    'WiFi',
    'Climatisation',
    'Groupes',
    'Familles',
    'Bowling',
    'Karaoké',
    'Espace non-fumeurs',
    'Pizza',
    'Cocktails',
    'Vins',
    'Romantique',
    'Parking',
    'Livraison',
    'Service à table',
    'Desserts',
    'Étudiants',
    'Concerts'
  ]);

  const [customTag, setCustomTag] = useState('');

  // Organiser les tags par catégories
  const organizedTags = organizeTagsByCategory(testTags);

  const addCustomTag = () => {
    if (customTag.trim() && !testTags.includes(customTag)) {
      setTestTags([...testTags, customTag]);
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTestTags(testTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          🎯 Démonstration du Système de Catégorisation
        </h1>
        <p className="text-blue-700">
          Testez le nouveau système de catégorisation harmonisé pour les établissements.
          Les tags sont automatiquement organisés en catégories cohérentes.
        </p>
      </div>

      {/* Gestion des tags de test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tags de test</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {testTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
            placeholder="Ajouter un tag personnalisé..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCustomTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Affichage des catégories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Catégories organisées</h2>
        
        {Object.keys(organizedTags).length === 0 ? (
          <p className="text-gray-500 italic">Aucun tag à catégoriser</p>
        ) : (
          Object.entries(organizedTags).map(([categoryId, items]) => (
            <EstablishmentCategorySection
              key={categoryId}
              categoryId={categoryId}
              items={items}
              isCollapsible={true}
              showCount={true}
            />
          ))
        )}
      </div>

      {/* Informations sur les catégories */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Catégories disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ESTABLISHMENT_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{category.label}</h4>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Total des tags:</span>
            <span className="ml-2 text-green-700">{testTags.length}</span>
          </div>
          <div>
            <span className="font-medium">Catégories utilisées:</span>
            <span className="ml-2 text-green-700">{Object.keys(organizedTags).length}</span>
          </div>
          <div>
            <span className="font-medium">Tags non catégorisés:</span>
            <span className="ml-2 text-green-700">
              {testTags.length - Object.values(organizedTags).flat().length}
            </span>
          </div>
          <div>
            <span className="font-medium">Couverture:</span>
            <span className="ml-2 text-green-700">
              {Math.round((Object.values(organizedTags).flat().length / testTags.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
