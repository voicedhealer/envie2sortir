'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Lightbulb, Wrench, Palette, Users, Clock, Baby, Info, Car, Shield, Wifi, Utensils, Music, Gamepad2, SquareMousePointerIcon, PartyPopper } from 'lucide-react';
import { useSectionTracking } from '@/hooks/useClickTracking';

interface EstablishmentMainSectionsProps {
  establishment: {
    id?: string;
    name?: string;
    description?: string;
    services?: any;
    ambiance?: any;
    specialties?: any;
    atmosphere?: any;
    detailedServices?: any;
    clienteleInfo?: any;
    informationsPratiques?: any;
    activities?: any;
    paymentMethods?: any;
    accessibilite?: boolean;
    parking?: boolean;
    terrasse?: boolean;
    smartEnrichmentData?: any;
    enrichmentData?: any;
    // ✅ AJOUT : Propriétés pour les données d'enrichissement
    accessibilityDetails?: any;
    detailedPayments?: any;
    childrenServices?: any;
  };
  className?: string;
}

// Fonction pour parser les champs JSON
function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}

// ✅ FONCTION POUR NETTOYER LES MARQUEURS DE RUBRIQUE
function cleanItemDisplay(item: string): string {
  // Enlever les marqueurs de rubrique (ex: "Déjeuner|populaire-pour" -> "Déjeuner")
  return item.replace(/\|[^|]*$/, '');
}

// Fonction pour formater automatiquement le texte descriptif
function formatDescriptionText(text: string): string[] {
  if (!text) return [];
  
  // Nettoyer le texte
  let cleanText = text.trim();
  
  // Diviser en phrases (points, exclamations, questions)
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => sentence.trim().length > 0);
  
  // Grouper les phrases en paragraphes (3-4 phrases par paragraphe)
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    currentParagraph.push(sentences[i]);
    
    // Créer un paragraphe tous les 3-4 phrases ou à la fin
    if (currentParagraph.length >= 3 || i === sentences.length - 1) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  }
  
  return paragraphs;
}

// Configuration des 4 sections principales
const MAIN_SECTIONS = [
  {
    id: 'about',
    title: 'C\'est quoi ?',
    icon: <SquareMousePointerIcon className="w-5 h-5" />,
    color: 'blue',
  },
  {
    id: 'activities',
    title: 'Activités proposées',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'green',
  },
  {
    id: 'amenities',
    title: 'Commodités',
    icon: <Wrench className="w-5 h-5" />,
    color: 'orange',
  },
  {
    id: 'ambiance',
    title: 'Ambiance & Spécialités',
    icon: <Palette className="w-5 h-5" />,
    color: 'purple',
  }
];

// Interface pour les sous-rubriques
interface SubSection {
  id: string;
  title: string;
  icon: React.ReactElement | null;
  color: string;
  getData: (establishment: any) => string[];
  isFormatted?: boolean;
}

// Configuration des sous-rubriques pour chaque section
const SUB_SECTIONS: Record<string, SubSection[]> = {
  about: [
    {
      id: 'description',
      title: '',
      icon: null,
      color: 'blue',
      getData: (establishment: any) => {
        if (!establishment.description) return [];
        return formatDescriptionText(establishment.description);
      },
      isFormatted: true // Indicateur pour le rendu spécial
    }
  ],
  activities: [
    {
      id: 'main-activities',
      title: 'Envie de :',
      icon: <Gamepad2 className="w-4 h-4" />,
      color: 'green',
      getData: (establishment: any) => parseJsonField(establishment.activities)
    },
    {
      id: 'events',
      title: 'Événements',
      icon: <Music className="w-4 h-4" />,
      color: 'pink',
      getData: (establishment: any) => {
        // Extraire les événements des activités
        const activities = parseJsonField(establishment.activities);
        return activities.filter(activity => 
          activity.toLowerCase().includes('concert') || 
          activity.toLowerCase().includes('événement') ||
          activity.toLowerCase().includes('spectacle')
        );
      }
    }
  ],
  amenities: [
    {
      id: 'equipment',
      title: 'Équipements et services',
      icon: <Wrench className="w-4 h-4" />,
      color: 'green',
      getData: (establishment: any) => {
        const services = parseJsonField(establishment.detailedServices);
        const basicServices = parseJsonField(establishment.services);
        return [...services, ...basicServices].filter(service => 
          service.toLowerCase().includes('wifi') ||
          service.toLowerCase().includes('climatisation') ||
          service.toLowerCase().includes('chauffage') ||
          service.toLowerCase().includes('toilettes') ||
          service.toLowerCase().includes('accessible')
        );
      }
    },
    {
      id: 'parking',
      title: 'Stationnement',
      icon: <Car className="w-4 h-4" />,
      color: 'blue',
      getData: (establishment: any) => {
        const services = parseJsonField(establishment.detailedServices);
        const parkingServices = services.filter(service => 
          service.toLowerCase().includes('parking')
        );
        if (establishment.parking) {
          parkingServices.unshift('Parking disponible');
        }
        return parkingServices;
      }
    },
    {
      id: 'accessibility',
      title: 'Accessibilité',
      icon: <Shield className="w-4 h-4" />,
      color: 'orange',
      getData: (establishment: any) => {
        const services = parseJsonField(establishment.detailedServices);
        const accessibility = services.filter(service => 
          service.toLowerCase().includes('accessible') ||
          service.toLowerCase().includes('pmr') ||
          service.toLowerCase().includes('handicap')
        );
        if (establishment.accessibilite) {
          accessibility.unshift('Accessible aux personnes à mobilité réduite');
        }
        return accessibility;
      }
    },
    {
      id: 'practical',
      title: 'Informations pratiques',
      icon: <Info className="w-4 h-4" />,
      color: 'gray',
      getData: (establishment: any) => parseJsonField(establishment.informationsPratiques)
    },
    {
      id: 'health',
      title: 'Santé et sécurité',
      icon: <Shield className="w-4 h-4" />,
      color: 'red',
      getData: (establishment: any) => {
        // Récupérer les données de santé depuis smartEnrichmentData et enrichmentData
        const smartHealth = establishment.smartEnrichmentData?.servicesArray?.filter((service: string) => 
          service.toLowerCase().includes('santé') || 
          service.toLowerCase().includes('sécurité') ||
          service.toLowerCase().includes('premiers secours') ||
          service.toLowerCase().includes('⚠️') ||
          service.toLowerCase().includes('✅')
        ) || [];
        
        const enrichmentHealth = establishment.enrichmentData?.health || [];
        
        // Nettoyer les icônes d'alerte et de validation pour un affichage neutre
        const allHealth = [...smartHealth, ...enrichmentHealth];
        return allHealth.map(item => 
          item.replace(/⚠️\s*/g, '')
              .replace(/✅\s*/g, '')
              .replace(/🛡️\s*/g, '')
              .replace(/🏥\s*/g, '')
              .trim()
        ).filter(item => item.length > 0);
      }
    }
  ],
  ambiance: [
    {
      id: 'atmosphere',
      title: 'Ambiance',
      icon: <PartyPopper className="w-4 h-4" />,
      color: 'purple',
      getData: (establishment: any) => {
        const ambiance = parseJsonField(establishment.ambiance);
        // Filtrer pour garder uniquement les éléments d'ambiance
        return ambiance.filter(item => {
          const itemLower = item.toLowerCase();
          return (
            itemLower.includes('ambiance') ||
            itemLower.includes('convivial') ||
            itemLower.includes('festif') ||
            itemLower.includes('décontracté') ||
            itemLower.includes('chaleureux') ||
            itemLower.includes('cosy') ||
            itemLower.includes('cadre') ||
            itemLower.includes('atmosphère') ||
            itemLower.includes('décontractée') ||
            itemLower.includes('mystérieuse') ||
            itemLower.includes('immersif')
          ) && !itemLower.includes('accessible') && !itemLower.includes('groupes');
        });
      }
    },
    {
      id: 'specialties',
      title: 'Spécialités',
      icon: <Utensils className="w-4 h-4" />,
      color: 'orange',
      getData: (establishment: any) => {
        const ambiance = parseJsonField(establishment.ambiance);
        const specialties = parseJsonField(establishment.specialties);
        const atmosphere = parseJsonField(establishment.atmosphere);
        
        // Extraire les spécialités du champ ambiance mélangé
        const ambianceSpecialties = ambiance.filter(item => {
          const itemLower = item.toLowerCase();
          return (
            itemLower.includes('cuisine') ||
            itemLower.includes('végétarien') ||
            itemLower.includes('sain') ||
            itemLower.includes('qualité') ||
            itemLower.includes('boisson') ||
            itemLower.includes('alcool') ||
            itemLower.includes('vin') ||
            itemLower.includes('bière') ||
            itemLower.includes('cocktail') ||
            itemLower.includes('apéritif') ||
            itemLower.includes('spiritueux') ||
            itemLower.includes('déjeuner') ||
            itemLower.includes('dîner')
          );
        });
        
        return [...specialties, ...atmosphere, ...ambianceSpecialties];
      }
    },
    {
      id: 'clientele',
      title: 'Clientèles',
      icon: <Users className="w-4 h-4" />,
      color: 'blue',
      getData: (establishment: any) => {
        const ambiance = parseJsonField(establishment.ambiance);
        const clienteleInfo = parseJsonField(establishment.clienteleInfo);
        
        // Extraire les informations clientèle du champ ambiance mélangé
        const ambianceClientele = ambiance.filter(item => {
          const itemLower = item.toLowerCase();
          return (
            itemLower.includes('groupes') ||
            itemLower.includes('familles') ||
            itemLower.includes('couples') ||
            itemLower.includes('enfants') ||
            itemLower.includes('jeunes') ||
            itemLower.includes('populaire pour') ||
            itemLower.includes('convient aux')
          );
        });
        
        return [...clienteleInfo, ...ambianceClientele];
      }
    }
  ]
};

// Fonction pour obtenir la couleur des puces
function getBulletColor(color: string): string {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    gray: 'text-gray-500',
    red: 'text-red-500'
  };
  return colors[color as keyof typeof colors] || 'text-gray-500';
}

export default function EstablishmentMainSections({ establishment, className = "" }: EstablishmentMainSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['about']));
  
  // Hook de tracking des sections
  const { trackSectionOpen, trackSectionClose, trackSubsectionClick } = useSectionTracking(establishment.id || '');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    const section = MAIN_SECTIONS.find(s => s.id === sectionId);
    
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
      // Tracker la fermeture de section
      if (section) {
        trackSectionClose(sectionId, section.title);
      }
    } else {
      newExpanded.add(sectionId);
      // Tracker l'ouverture de section
      if (section) {
        trackSectionOpen(sectionId, section.title);
      }
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {MAIN_SECTIONS.map((section) => {
        const subSections = SUB_SECTIONS[section.id as keyof typeof SUB_SECTIONS] || [];
        const totalItems = subSections.reduce((sum, sub) => sum + sub.getData(establishment).length, 0);
        
        if (totalItems === 0) return null;

        return (
          <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* En-tête de la section principale */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className={`text-${section.color}-500`}>
                  {section.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                </div>
              </div>
              <div className="flex items-center">
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenu de la section principale */}
            {expandedSections.has(section.id) && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-4">
                  {subSections.map((subSection) => {
                    const items = subSection.getData(establishment);
                    if (items.length === 0) return null;

                    return (
                      <div key={subSection.id} className="space-y-2">
                        {/* En-tête de la sous-rubrique */}
                        {subSection.title && (
                          <div 
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                            onClick={() => trackSubsectionClick(subSection.id, subSection.title, section.id)}
                          >
                            <span className={getBulletColor(subSection.color)}>
                              {subSection.icon}
                            </span>
                            <h4 className="font-medium text-gray-900">{subSection.title}</h4>
                          </div>
                        )}
                        
                        {/* Liste des éléments */}
                        {subSection.isFormatted ? (
                          // Rendu spécial pour la description formatée
                          <div className={`${subSection.title ? 'ml-6' : ''} max-w-prose`}>
                            <div className="space-y-4">
                              {items.map((paragraph, index) => (
                                <p key={index} className="text-gray-700 leading-relaxed text-base font-sans">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Rendu normal pour les autres sections
                          <div className={`ml-6 ${items.length >= 2 ? 'grid grid-cols-2 gap-x-4 gap-y-1' : 'space-y-1'}`}>
                            {items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getBulletColor(subSection.color).replace('text-', 'bg-')}`}></div>
                                <span className="text-gray-700">{cleanItemDisplay(item)}</span>
                              </div>
                            ))}
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
