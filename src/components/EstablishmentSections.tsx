'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Tag, Utensils, Wrench, Palette, FileText, Users, Clock, CreditCard, Baby, Lightbulb } from 'lucide-react';
import UpcomingEventsSection from './UpcomingEventsSection';
import EstablishmentCategorySection from './EstablishmentCategorySection';
import { organizeTagsByCategory } from '@/lib/establishment-categories';

interface EstablishmentSectionsProps {
  establishment: {
    name: string;
    slug: string;
    description?: string;
    activities?: any;
    services?: any;
    ambiance?: any;
    paymentMethods?: any;
    informationsPratiques?: any;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    // Champs hybrides
    accessibilityDetails?: any;
    detailedServices?: any;
    clienteleInfo?: any;
    detailedPayments?: any;
    childrenServices?: any;
    smartEnrichmentData?: any;
    enrichmentData?: any;
    tags?: Array<{
      tag: string;
      typeTag: string;
      poids: number;
    }>;
  };
  // Données d'enrichissement
  parkingOptions?: string[];
  healthOptions?: string[];
}

export default function EstablishmentSections({ establishment, parkingOptions = [], healthOptions = [] }: EstablishmentSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('description');
  const [isClient, setIsClient] = useState(false);

  // Protection contre l'erreur d'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Debug: Afficher les données hybrides
  console.log('🔍 Debug EstablishmentSections pour:', establishment.name);
  console.log('📊 activities brut:', establishment.activities);
  console.log('📊 services brut:', establishment.services);
  console.log('📊 ambiance brut:', establishment.ambiance);
  console.log('📊 informationsPratiques brut:', establishment.informationsPratiques);
  console.log('📊 accessibilityDetails brut:', establishment.accessibilityDetails);

  // Fonction générique pour parser les données hybrides JSON
  const parseHybridData = (jsonField: any): any => {
    if (!jsonField) return null;
    
    if (typeof jsonField === 'string') {
      try {
        return JSON.parse(jsonField);
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        return null;
      }
    }
    
    return jsonField;
  };

  // Fonction générique pour parser les données hybrides JSON (pour les champs Google Places)
  const parseGooglePlacesField = (field: any, fieldName: string): string[] => {
    if (!field) return [];
    
    if (Array.isArray(field)) {
      return field;
    }
    
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    if (typeof field === 'object') {
      // Pour les services Google Places, chercher les clés communes
      const commonKeys = ['service', 'services', 'amenity', 'amenities', 'feature', 'features'];
      for (const key of commonKeys) {
        if (field[key] && Array.isArray(field[key])) {
          return field[key];
        }
      }
      
      // Si pas de clé commune, retourner les valeurs de l'objet
      return Object.values(field).filter(value => typeof value === 'string');
    }
    
    return [];
  };

  // Fonction pour extraire les éléments d'accessibilité des données hybrides
  const getAccessibilityItems = (accessibilityDetails: any): string[] => {
    const items: string[] = [];
    
    if (!accessibilityDetails) return items;
    
    Object.entries(accessibilityDetails).forEach(([key, value]) => {
      if (value === true || value === 'true') {
        switch (key) {
          case 'wheelchairAccessibleEntrance':
            items.push('Entrée accessible en fauteuil roulant');
            break;
          case 'wheelchairAccessibleRestroom':
            items.push('Toilettes accessibles en fauteuil roulant');
            break;
          case 'wheelchairAccessibleSeating':
            items.push('Places assises accessibles');
            break;
          case 'wheelchairAccessibleParking':
            items.push('Parking accessible');
            break;
          case 'hearingLoop':
            items.push('Boucle magnétique');
            break;
          case 'brailleMenu':
            items.push('Menu en braille');
            break;
          case 'signLanguage':
            items.push('Langue des signes');
            break;
          default:
            if (typeof key === 'string') {
              items.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
            }
        }
      }
    });
    
    return items;
  };

  // Parser les données hybrides
  const hybridAccessibility = parseHybridData(establishment.accessibilityDetails);
  const hybridServices = parseHybridData(establishment.detailedServices);
  const hybridClientele = parseHybridData(establishment.clienteleInfo);
  const hybridChildren = parseHybridData(establishment.childrenServices);
  
  // Extraire les éléments utilisables
  const accessibilityItems = getAccessibilityItems(hybridAccessibility);
  
  // Fallback: Utiliser les données classiques si les hybrides sont vides
  const fallbackAccessibilityItems = establishment.services && Array.isArray(establishment.services)
    ? establishment.services.filter(service => 
        typeof service === 'string' && (
          service.toLowerCase().includes('accessible') || 
          service.toLowerCase().includes('fauteuil') ||
          service.toLowerCase().includes('mobilité')
        )
      )
    : [];
  
  // Utiliser les données hybrides si disponibles, sinon les données classiques
  const finalAccessibilityItems = accessibilityItems.length > 0 ? accessibilityItems : fallbackAccessibilityItems;


  const activities = parseGooglePlacesField(establishment.activities, 'activities');
  const allServices = parseGooglePlacesField(establishment.services, 'services');
  const ambiance = parseGooglePlacesField(establishment.ambiance, 'ambiance');
  const tags = establishment.tags || [];
  
  // Traiter les informations pratiques Google Places
  const informationsPratiques = parseGooglePlacesField(establishment.informationsPratiques, 'informationsPratiques');
  
  // Extraire les données d'enrichissement intelligent
  const smartEnrichmentData = parseHybridData(establishment.smartEnrichmentData);
  const enrichmentData = parseHybridData(establishment.enrichmentData);
  
  // Ajouter les données d'enrichissement aux services pour la catégorisation
  const enrichmentServices = [
    ...(smartEnrichmentData?.servicesArray || []),
    ...(enrichmentData?.services || [])
  ];
  
  // Ajouter les informations pratiques d'enrichissement
  const enrichmentPracticalInfo = [
    ...(smartEnrichmentData?.practicalInfo || [])
  ];
  
  // Combiner tous les services (Google + enrichissement)
  const allServicesCombined = [...allServices, ...enrichmentServices];
  
  // Combiner toutes les informations pratiques (Google + enrichissement)
  const allPracticalInfo = [...informationsPratiques, ...enrichmentPracticalInfo];
  
  // Logique de catégorisation intelligente des données Google Places
  const categorizeGooglePlacesData = () => {
    const categories = {
      // Services de restauration
      servicesRestauration: [] as string[],
      // Ambiance et spécialités
      ambianceSpecialites: [] as string[],
      // Informations pratiques (Planning, Paiements, Enfants, Parking)
      informationsPratiques: [] as string[],
      // Clientèle cible
      clientele: [] as string[],
      // Commodités et équipements (fusion des anciens services généraux)
      commodites: [] as string[],
      // Activités et événements
      activites: [] as string[]
    };

    // Set pour éviter les doublons
    const seenItems = new Set<string>();

    // Catégoriser les services
    allServicesCombined.forEach((service: string) => {
      if (seenItems.has(service)) return; // Éviter les doublons
      seenItems.add(service);
      
      const serviceLower = service.toLowerCase();
      
      // ✨ Exclure les moyens de paiement et le parking (ils ont leurs propres sections dédiées)
      if (serviceLower.includes('carte') || serviceLower.includes('paiement') || 
          serviceLower.includes('nfc') || serviceLower.includes('titre') ||
          serviceLower.includes('crédit') || serviceLower.includes('débit') ||
          serviceLower.includes('espèces') || serviceLower.includes('chèque') ||
          serviceLower.includes('parking')) {
        return; // Ne pas ajouter aux commodités
      }
      
      // Services de restauration
      if (serviceLower.includes('déjeuner') || serviceLower.includes('dîner') || 
          serviceLower.includes('dessert') || serviceLower.includes('traiteur') ||
          serviceLower.includes('service à table') || serviceLower.includes('repas')) {
        categories.servicesRestauration.push(service);
      }
      // Tout le reste va dans les commodités (fusion des anciens services généraux)
      else {
        categories.commodites.push(service);
      }
    });

    // Catégoriser l'ambiance
    ambiance.forEach((item: string) => {
      if (seenItems.has(item)) return; // Éviter les doublons
      seenItems.add(item);
      
      const itemLower = item.toLowerCase();
      
      if (itemLower.includes('convient aux enfants') || itemLower.includes('convient aux groupes') ||
          itemLower.includes('étudiants') || itemLower.includes('touristes')) {
        categories.clientele.push(item);
      } else {
        categories.ambianceSpecialites.push(item);
      }
    });

    // Catégoriser les informations pratiques
    allPracticalInfo.forEach((info: string) => {
      if (seenItems.has(info)) return; // Éviter les doublons
      seenItems.add(info);
      
      const infoLower = info.toLowerCase();
      
      // ✨ Exclure les moyens de paiement et le parking (ils ont leurs propres sections dédiées)
      if (infoLower.includes('carte') || infoLower.includes('paiement') || 
          infoLower.includes('nfc') || infoLower.includes('titre') ||
          infoLower.includes('crédit') || infoLower.includes('débit') ||
          infoLower.includes('espèces') || infoLower.includes('chèque') ||
          infoLower.includes('parking')) {
        return; // Ne pas ajouter aux commodités
      }
      
      // Toutes les informations pratiques vont dans la section "Informations pratiques"
      // et ne sont PAS dupliquées dans les commodités
      categories.informationsPratiques.push(info);
    });

    // Catégoriser les activités
    activities.forEach((activity: string) => {
      if (seenItems.has(activity)) return;
      seenItems.add(activity);
      categories.activites.push(activity);
    });

    // Intégrer les données hybrides d'accessibilité dans les commodités
    finalAccessibilityItems.forEach((item: string) => {
      if (seenItems.has(item)) return;
      seenItems.add(item);
      categories.commodites.push(item);
    });

    // Intégrer les services d'enrichissement dans les commodités
    enrichmentServices.forEach((service: string) => {
      if (seenItems.has(service)) return;
      seenItems.add(service);
      
      const serviceLower = service.toLowerCase();
      
      // Exclure les moyens de paiement et le parking (ils ont leurs propres sections)
      if (serviceLower.includes('carte') || serviceLower.includes('paiement') || 
          serviceLower.includes('nfc') || serviceLower.includes('titre') ||
          serviceLower.includes('crédit') || serviceLower.includes('débit') ||
          serviceLower.includes('espèces') || serviceLower.includes('chèque') ||
          serviceLower.includes('parking')) {
        return;
      }
      
      // Ajouter aux commodités
      categories.commodites.push(service);
    });

    return categories;
  };

  const categorizedData = categorizeGooglePlacesData();

  const getTagColor = (typeTag: string) => {
    switch (typeTag) {
      case 'activite':
        return 'bg-blue-100 text-blue-800';
      case 'manuel':
        return 'bg-orange-100 text-orange-800';
      case 'service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Protection contre l'erreur d'hydratation - ne pas rendre côté serveur
  if (!isClient) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Description */}
      {establishment.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('description')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">À propos</h3>
            </div>
            {expandedSection === 'description' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'description' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <p className="text-gray-700 leading-relaxed">{establishment.description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activités proposées */}
      {categorizedData.activites.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('activities')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Activités proposées</h3>
            </div>
            {expandedSection === 'activities' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'activities' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedData.activites.map((activity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700 capitalize">
                        {activity.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Ambiance & Spécialités */}
      {categorizedData.ambianceSpecialites.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('ambiance')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Ambiance & Spécialités</h3>
            </div>
            {expandedSection === 'ambiance' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'ambiance' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedData.ambianceSpecialites.map((item: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 capitalize">
                        {item.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commodités */}
      {(categorizedData.commodites.length > 0 || parkingOptions.length > 0 || healthOptions.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('commodites')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Wrench className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Commodités</h3>
            </div>
            {expandedSection === 'commodites' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'commodites' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4 space-y-6">
                {/* Commodités générales */}
                {categorizedData.commodites.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="text-lg mr-2">🔧</span>
                      Équipements et services
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categorizedData.commodites.map((commodite: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{commodite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stationnement */}
                {parkingOptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="text-lg mr-2">🅿️</span>
                      Stationnement
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {parkingOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prévention d'usage */}
                {healthOptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="text-lg mr-2">ℹ️</span>
                      Prévention d'usage
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {healthOptions.map((option, index) => {
                        // Nettoyer le texte en enlevant les icônes
                        const cleanOption = option.replace('⚠️ ', '').replace('✅ ', '');
                        const isWarning = option.includes('⚠️');
                        const isSolution = option.includes('✅');
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isWarning ? 'bg-orange-500' : 
                              isSolution ? 'bg-green-500' : 
                              'bg-blue-500'
                            }`}></div>
                            <span className="text-gray-700">{cleanOption}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Services de restauration */}
      {categorizedData.servicesRestauration.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('services-restauration')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Utensils className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Services de restauration</h3>
            </div>
            {expandedSection === 'services-restauration' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'services-restauration' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedData.servicesRestauration.map((service: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clientèle */}
      {categorizedData.clientele.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('clientele')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Clientèle</h3>
            </div>
            {expandedSection === 'clientele' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'clientele' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedData.clientele.map((client: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700">{client}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('tags')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Tag className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Tags</h3>
            </div>
            {expandedSection === 'tags' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'tags' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.typeTag)}`}
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sections harmonisées par catégories */}
      {(() => {
        // Organiser les tags par catégories harmonisées
        const organizedTags = organizeTagsByCategory([
          ...allServicesCombined,
          ...ambiance,
          ...allPracticalInfo,
          ...activities
        ]);

        return Object.entries(organizedTags).map(([categoryId, items]) => (
          <EstablishmentCategorySection
            key={categoryId}
            categoryId={categoryId}
            items={items}
            isCollapsible={true}
            showCount={true}
          />
        ));
      })()}

      {/* Les réseaux sociaux sont affichés dans EstablishmentInfo.tsx */}
    </div>
  );
}
