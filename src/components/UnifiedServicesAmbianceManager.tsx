"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Edit3, Save, X as CloseIcon } from 'lucide-react';
import { MAIN_CATEGORIES, organizeItemsByCategories, getSmartSuggestions, categorizeItem } from '@/lib/unified-categories';

interface UnifiedServicesAmbianceManagerProps {
  services: string[];
  ambiance: string[];
  informationsPratiques?: string[];
  paymentMethods?: string[];
  onServicesChange: (services: string[]) => void;
  onAmbianceChange: (ambiance: string[]) => void;
  onInformationsPratiquesChange?: (informationsPratiques: string[]) => void;
  onPaymentMethodsChange?: (paymentMethods: string[]) => void;
  isEditMode?: boolean;
  establishmentType?: string;
}

export default function UnifiedServicesAmbianceManager({
  services,
  ambiance,
  informationsPratiques = [],
  paymentMethods = [],
  onServicesChange,
  onAmbianceChange,
  onInformationsPratiquesChange,
  onPaymentMethodsChange,
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
  console.log('🧠 RAW DATA - Moyens de paiement:', paymentMethods);
  console.log('🧠 RAW DATA - onPaymentMethodsChange:', !!onPaymentMethodsChange);


  // Combiner tous les items avec leurs catégories d'origine
  // ✅ Les moyens de paiement SONT inclus pour être gérés (ajout/suppression)
  // mais ne seront PAS affichés dans les sections de commodités (gérés séparément dans EstablishmentInfo.tsx)
  const allItems = [
    ...(Array.isArray(services) ? services : []), 
    ...(Array.isArray(ambiance) ? ambiance : []), 
    ...(Array.isArray(informationsPratiques) ? informationsPratiques : []),
    ...(Array.isArray(paymentMethods) ? paymentMethods : [])
  ];
  console.log('🧠 RAW DATA - Tous les items combinés (avec moyens de paiement):', allItems);
  
  // ✅ FONCTION PERSONNALISÉE : Organiser en respectant les rubriques choisies
  const organizeItemsByUserChoice = (items: string[]): Record<string, Record<string, string[]>> => {
    const organized: Record<string, Record<string, string[]>> = {};
    
    // Initialiser la structure
    Object.keys(MAIN_CATEGORIES).forEach(mainCat => {
      organized[mainCat] = {};
      Object.keys(MAIN_CATEGORIES[mainCat as keyof typeof MAIN_CATEGORIES].subCategories).forEach(subCat => {
        organized[mainCat][subCat] = [];
      });
    });
    
    // Organiser chaque item
    items.forEach(item => {
      // Vérifier si l'item a un marqueur de rubrique
      const rubriqueMatch = item.match(/^(.+)\|([^|]+)$/);
      
      if (rubriqueMatch) {
        // Format: "item|rubrique" - respecter le choix de l'utilisateur
        const cleanItem = rubriqueMatch[1];
        const rubrique = rubriqueMatch[2];
        
        // ✅ CORRECTION : Déterminer la section principale selon la rubrique
        let mainSection = 'ambiance-specialites'; // par défaut
        
        if (rubrique === 'services') {
          mainSection = 'equipements-services';
        } else if (rubrique === 'informations-pratiques') {
          mainSection = 'informations-pratiques';
        } else if (rubrique === 'moyens-paiement') {
          mainSection = 'moyens-paiement';
          console.log('💳 MOYEN DE PAIEMENT - Item:', cleanItem);
        } else if (rubrique === 'ambiance') {
          mainSection = 'ambiance-specialites';
        } else {
          // Fallback : utiliser l'ancienne logique si la rubrique n'est pas reconnue
          if (Array.isArray(services) && services.includes(item)) {
            mainSection = 'equipements-services';
          } else if (Array.isArray(informationsPratiques) && informationsPratiques.includes(item)) {
            mainSection = 'informations-pratiques';
          } else if (Array.isArray(paymentMethods) && paymentMethods.includes(item)) {
            mainSection = 'moyens-paiement';
          }
        }
        
        console.log('🔍 ORGANISATION - Item:', cleanItem, 'Rubrique:', rubrique, 'Section:', mainSection);
        
        // Ajouter dans la rubrique choisie par l'utilisateur
        if (organized[mainSection] && organized[mainSection][rubrique]) {
          organized[mainSection][rubrique].push(cleanItem);
        }
      } else {
        // Format ancien : utiliser la catégorisation automatique
        const { mainCategory, subCategory } = categorizeItem(item);
        if (organized[mainCategory] && organized[mainCategory][subCategory]) {
          organized[mainCategory][subCategory].push(item);
        }
      }
    });
    
    return organized;
  };

  const organizedItems = organizeItemsByUserChoice(allItems);
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
    if (!trimmedItem) {
      console.log('⚠️ AJOUT IGNORÉ - Item vide:', item);
      return;
    }

    console.log('➕ AJOUT - Section:', section, 'SubSection:', subSection, 'Item:', trimmedItem);
    console.log('➕ AJOUT - onPaymentMethodsChange disponible:', !!onPaymentMethodsChange);

    // ✅ SOLUTION : Stocker avec un marqueur pour respecter la rubrique choisie
    // Format: "item|subSection" pour conserver la rubrique d'origine
    const itemWithSubSection = `${trimmedItem}|${subSection}`;

    if (section === 'ambiance-specialites') {
      const newAmbiance = [...(Array.isArray(ambiance) ? ambiance : []), itemWithSubSection];
      onAmbianceChange(newAmbiance);
      console.log('➕ Ajouté à ambiance avec rubrique:', itemWithSubSection);
    } else if (section === 'equipements-services') {
      const newServices = [...(Array.isArray(services) ? services : []), itemWithSubSection];
      onServicesChange(newServices);
      console.log('➕ Ajouté à services avec rubrique:', itemWithSubSection);
    } else if (section === 'informations-pratiques') {
      const newInfos = [...(Array.isArray(informationsPratiques) ? informationsPratiques : []), itemWithSubSection];
      onInformationsPratiquesChange?.(newInfos);
      console.log('➕ Ajouté à informations pratiques avec rubrique:', itemWithSubSection);
    } else if (section === 'moyens-paiement') {
      const newPaymentMethods = [...(Array.isArray(paymentMethods) ? paymentMethods : []), itemWithSubSection];
      onPaymentMethodsChange?.(newPaymentMethods);
      console.log('➕ Ajouté à moyens de paiement avec rubrique:', itemWithSubSection);
    }

    setNewItem(null);
  };

  const removeItem = (section: string, subSection: string, item: string) => {
    console.log('🗑️ SUPPRESSION - Item:', item, 'Section:', section, 'SubSection:', subSection);
    
    // ✅ SOLUTION : Chercher l'item avec ou sans marqueur de rubrique
    const expectedItem = `${item}|${subSection}`;
    let found = false;
    
    // Chercher dans ambiance (avec et sans marqueur)
    if (Array.isArray(ambiance)) {
      const ambianceItem = ambiance.find(a => a === item || a === expectedItem);
      if (ambianceItem) {
        const beforeCount = ambiance.length;
        const newAmbiance = ambiance.filter(a => a !== ambianceItem);
        const afterCount = newAmbiance.length;
        onAmbianceChange(newAmbiance);
        console.log('🗑️ Retiré de ambiance:', ambianceItem, `(${beforeCount} -> ${afterCount} éléments)`);
        found = true;
      }
    }
    
    // Chercher dans services (avec et sans marqueur)
    if (Array.isArray(services)) {
      const serviceItem = services.find(s => s === item || s === expectedItem);
      if (serviceItem) {
        const beforeCount = services.length;
        const newServices = services.filter(s => s !== serviceItem);
        const afterCount = newServices.length;
        onServicesChange(newServices);
        console.log('🗑️ Retiré de services:', serviceItem, `(${beforeCount} -> ${afterCount} éléments)`);
        found = true;
      }
    }
    
    // Chercher dans informationsPratiques (avec et sans marqueur)
    if (Array.isArray(informationsPratiques)) {
      const infosItem = informationsPratiques.find(i => i === item || i === expectedItem);
      if (infosItem) {
        const beforeCount = informationsPratiques.length;
        const newInfos = informationsPratiques.filter(i => i !== infosItem);
        const afterCount = newInfos.length;
        onInformationsPratiquesChange?.(newInfos);
        console.log('🗑️ Retiré de informationsPratiques:', infosItem, `(${beforeCount} -> ${afterCount} éléments)`);
        found = true;
      }
    }
    
    // Chercher dans paymentMethods (avec et sans marqueur)
    if (Array.isArray(paymentMethods)) {
      const paymentItem = paymentMethods.find(p => p === item || p === expectedItem);
      if (paymentItem) {
        const beforeCount = paymentMethods.length;
        const newPaymentMethods = paymentMethods.filter(p => p !== paymentItem);
        const afterCount = newPaymentMethods.length;
        onPaymentMethodsChange?.(newPaymentMethods);
        console.log('🗑️ Retiré de moyens de paiement:', paymentItem, `(${beforeCount} -> ${afterCount} éléments)`);
        found = true;
      }
    }
    
    if (!found) {
      console.log('⚠️ Item non trouvé dans aucun array:', item);
    }
  };

  const startEditing = (section: string, subSection: string, item: string) => {
    setEditingItem({ section, subSection, item });
  };

  const saveEdit = (newValue: string) => {
    if (!editingItem || !newValue.trim()) return;

    console.log('✏️ MODIFICATION - Item:', editingItem.item, 'Nouvelle valeur:', newValue.trim());

    // ✅ SOLUTION : Supprimer l'ancien item (avec ou sans marqueur) et ajouter le nouveau
    const expectedOldItem = `${editingItem.item}|${editingItem.subSection}`;
    
    if (editingItem.section === 'ambiance-specialites' && Array.isArray(ambiance)) {
      const oldItem = ambiance.find(a => a === editingItem.item || a === expectedOldItem);
      if (oldItem) {
        const newAmbiance = ambiance.filter(a => a !== oldItem);
        onAmbianceChange(newAmbiance);
        console.log('🗑️ Modifié dans ambiance:', oldItem, '->', newValue.trim());
      }
    } else if (editingItem.section === 'equipements-services' && Array.isArray(services)) {
      const oldItem = services.find(s => s === editingItem.item || s === expectedOldItem);
      if (oldItem) {
        const newServices = services.filter(s => s !== oldItem);
        onServicesChange(newServices);
        console.log('🗑️ Modifié dans services:', oldItem, '->', newValue.trim());
      }
    } else if (editingItem.section === 'informations-pratiques' && Array.isArray(informationsPratiques)) {
      const oldItem = informationsPratiques.find(i => i === editingItem.item || i === expectedOldItem);
      if (oldItem) {
        const newInfos = informationsPratiques.filter(i => i !== oldItem);
        onInformationsPratiquesChange?.(newInfos);
        console.log('🗑️ Modifié dans informationsPratiques:', oldItem, '->', newValue.trim());
      }
    } else if (editingItem.section === 'moyens-paiement' && Array.isArray(paymentMethods)) {
      const oldItem = paymentMethods.find(p => p === editingItem.item || p === expectedOldItem);
      if (oldItem) {
        const newPaymentMethods = paymentMethods.filter(p => p !== oldItem);
        onPaymentMethodsChange?.(newPaymentMethods);
        console.log('🗑️ Modifié dans moyens de paiement:', oldItem, '->', newValue.trim());
      }
    }
    
    // Ajouter le nouvel item
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

