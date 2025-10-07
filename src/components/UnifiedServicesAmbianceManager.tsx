"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Edit3, Save, X as CloseIcon } from 'lucide-react';
import { MAIN_CATEGORIES, organizeItemsByCategories, getSmartSuggestions } from '@/lib/unified-categories';

interface UnifiedServicesAmbianceManagerProps {
  services: string[];
  ambiance: string[];
  informationsPratiques?: string[];
  onServicesChange: (services: string[]) => void;
  onAmbianceChange: (ambiance: string[]) => void;
  onInformationsPratiquesChange?: (informationsPratiques: string[]) => void;
  isEditMode?: boolean;
  establishmentType?: string;
}

export default function UnifiedServicesAmbianceManager({
  services,
  ambiance,
  informationsPratiques = [],
  onServicesChange,
  onAmbianceChange,
  onInformationsPratiquesChange,
  isEditMode = false,
  establishmentType = 'restaurant'
}: UnifiedServicesAmbianceManagerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ambiance-specialites']));
  const [editingItem, setEditingItem] = useState<{ section: string; subSection: string; item: string } | null>(null);
  const [newItem, setNewItem] = useState<{ section: string; subSection: string; value: string } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔍 DIAGNOSTIC - Logs pour voir les données brutes
  console.log('🧠 RAW DATA - Services:', services);
  console.log('🧠 RAW DATA - Ambiance:', ambiance);
  console.log('🧠 RAW DATA - Informations pratiques:', informationsPratiques);

  // Combiner tous les items
  const allItems = [...services, ...ambiance, ...informationsPratiques];
  console.log('🧠 RAW DATA - Tous les items combinés:', allItems);
  
  const organizedItems = organizeItemsByCategories(allItems);
  console.log('🧠 RAW DATA - Items organisés par catégories:', organizedItems);
  
  const smartSuggestions = getSmartSuggestions(allItems, establishmentType);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addItem = (section: string, subSection: string, item: string) => {
    const trimmedItem = item.trim();
    if (!trimmedItem) return;

    // Déterminer dans quel array ajouter l'item
    if (section === 'ambiance-specialites') {
      const newAmbiance = [...ambiance, trimmedItem];
      onAmbianceChange(newAmbiance);
    } else if (section === 'equipements-services') {
      const newServices = [...services, trimmedItem];
      onServicesChange(newServices);
    } else if (section === 'informations-pratiques') {
      const newInfos = [...informationsPratiques, trimmedItem];
      onInformationsPratiquesChange?.(newInfos);
    }

    setNewItem(null);
  };

  const removeItem = (section: string, subSection: string, item: string) => {
    console.log('🗑️ SUPPRESSION - Item:', item, 'Section:', section, 'SubSection:', subSection);
    
    // ✅ CORRECTION : Retirer l'item de TOUS les arrays où il existe
    // Car un même item peut être présent dans plusieurs arrays (services ET ambiance)
    
    // Retirer de services si présent
    if (services.includes(item)) {
      const newServices = services.filter(s => s !== item);
      onServicesChange(newServices);
      console.log('🗑️ Retiré de services:', item);
    }
    
    // Retirer de ambiance si présent
    if (ambiance.includes(item)) {
      const newAmbiance = ambiance.filter(a => a !== item);
      onAmbianceChange(newAmbiance);
      console.log('🗑️ Retiré de ambiance:', item);
    }
    
    // Retirer de informationsPratiques si présent
    if (informationsPratiques.includes(item)) {
      const newInfos = informationsPratiques.filter(i => i !== item);
      onInformationsPratiquesChange?.(newInfos);
      console.log('🗑️ Retiré de informationsPratiques:', item);
    }
  };

  const startEditing = (section: string, subSection: string, item: string) => {
    setEditingItem({ section, subSection, item });
  };

  const saveEdit = (newValue: string) => {
    if (!editingItem || !newValue.trim()) return;

    // Retirer l'ancien item et ajouter le nouveau
    removeItem(editingItem.section, editingItem.subSection, editingItem.item);
    addItem(editingItem.section, editingItem.subSection, newValue.trim());
    
    setEditingItem(null);
  };

  const addSuggestion = (suggestion: string) => {
    // Déterminer automatiquement la catégorie
    const { mainCategory, subCategory } = categorizeItem(suggestion);
    addItem(mainCategory, subCategory, suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Suggestions intelligentes - MASQUÉ */}
      {false && smartSuggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              💡 Suggestions personnalisées pour votre {establishmentType}
            </h3>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showSuggestions ? 'Masquer' : 'Voir les suggestions'}
            </button>
          </div>
          
          {showSuggestions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addSuggestion(suggestion)}
                  className="text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm text-blue-700">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sections principales */}
      {Object.entries(MAIN_CATEGORIES).map(([sectionId, section]) => {
        const isExpanded = expandedSections.has(sectionId);
        const subSections = section.subCategories;
        const hasItems = Object.values(organizedItems[sectionId] || {}).some(items => items.length > 0);

        return (
          <div key={sectionId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection(sectionId)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">
                    {hasItems ? `${Object.values(organizedItems[sectionId] || {}).flat().length} éléments` : 'Aucun élément'}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-4">
                  {Object.entries(subSections).map(([subSectionId, subSection]) => {
                    const items = organizedItems[sectionId]?.[subSectionId] || [];
                    
                    return (
                      <div key={subSectionId} className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                            <span className="mr-3 text-xl">{subSection.icon}</span>
                            {subSection.title}
                            {items.length > 0 && (
                              <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">({items.length})</span>
                            )}
                          </h4>
                          <button
                            onClick={() => setNewItem({ section: sectionId, subSection: subSectionId, value: '' })}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center transition-colors border border-gray-200"
                          >
                            <Plus className="w-4 h-4 mr-2 text-green-600" />
                            Ajouter
                          </button>
                        </div>

                        {/* Items existants */}
                        {items.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((item, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors group">
                                {editingItem?.item === item ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      defaultValue={item}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveEdit(e.currentTarget.value);
                                        } else if (e.key === 'Escape') {
                                          setEditingItem(null);
                                        }
                                      }}
                                      onBlur={(e) => saveEdit(e.target.value)}
                                      className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => setEditingItem(null)}
                                      className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                      <CloseIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-800 flex-1">{item}</span>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => startEditing(sectionId, subSectionId, item)}
                                        className="text-gray-400 hover:text-blue-600 p-1 rounded"
                                        title="Modifier"
                                      >
                                        <Edit3 className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => removeItem(sectionId, subSectionId, item)}
                                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                                        title="Supprimer"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ajout d'un nouvel item */}
                        {newItem?.section === sectionId && newItem?.subSection === subSectionId && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={newItem.value}
                                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addItem(sectionId, subSectionId, newItem.value);
                                  } else if (e.key === 'Escape') {
                                    setNewItem(null);
                                  }
                                }}
                                placeholder={`Ajouter un ${subSection.title.toLowerCase()}...`}
                                className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                autoFocus
                              />
                              <button
                                onClick={() => addItem(sectionId, subSectionId, newItem.value)}
                                className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium border border-green-200"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setNewItem(null)}
                                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                              >
                                <CloseIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Fonction helper pour catégoriser un item (importée depuis unified-categories)
function categorizeItem(item: string): { mainCategory: string; subCategory: string } {
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
