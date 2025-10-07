'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Lightbulb, Wrench, Palette, Users, Clock, CreditCard, Baby, Info, Car, Shield, Wifi, Utensils, Music, Gamepad2, SquareMousePointerIcon, PartyPopper } from 'lucide-react';

interface EstablishmentMainSectionsProps {
  establishment: {
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

// Configuration des sous-rubriques pour chaque section
const SUB_SECTIONS = {
  about: [
    {
      id: 'description',
      title: 'Description',
      icon: <FileText className="w-4 h-4" />,
      color: 'blue',
      getData: (establishment: any) => establishment.description ? [establishment.description] : []
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
        // Exclure les éléments qui ne sont pas de l'ambiance (activités, clientèle, accessibilité)
        return ambiance.filter(item => 
          !item.toLowerCase().includes('accessible') &&
          !item.toLowerCase().includes('mobilité') &&
          !item.toLowerCase().includes('handicap') &&
          !item.toLowerCase().includes('pmr') &&
          !item.toLowerCase().includes('groupes') &&
          !item.toLowerCase().includes('familles') &&
          !item.toLowerCase().includes('couples') &&
          !item.toLowerCase().includes('escape game') &&
          !item.toLowerCase().includes('réalité virtuelle') &&
          !item.toLowerCase().includes('culture vr') &&
          !item.toLowerCase().includes('action adrénaline')
        );
      }
    },
    {
      id: 'specialties',
      title: 'Spécialités',
      icon: <Utensils className="w-4 h-4" />,
      color: 'orange',
      getData: (establishment: any) => [
        ...parseJsonField(establishment.specialties),
        ...parseJsonField(establishment.atmosphere)
      ]
    },
    {
      id: 'clientele',
      title: 'Clientèles',
      icon: <Users className="w-4 h-4" />,
      color: 'blue',
      getData: (establishment: any) => parseJsonField(establishment.clienteleInfo)
    },
    {
      id: 'payment',
      title: 'Moyens de paiement',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'green',
      getData: (establishment: any) => parseJsonField(establishment.paymentMethods)
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
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
                        <div className="flex items-center space-x-2">
                          <span className={getBulletColor(subSection.color)}>
                            {subSection.icon}
                          </span>
                          <h4 className="font-medium text-gray-900">{subSection.title}</h4>
                        </div>
                        
                        {/* Liste des éléments */}
                        <div className={`ml-6 ${items.length >= 2 ? 'grid grid-cols-2 gap-x-4 gap-y-1' : 'space-y-1'}`}>
                          {items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getBulletColor(subSection.color).replace('text-', 'bg-')}`}></div>
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
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
