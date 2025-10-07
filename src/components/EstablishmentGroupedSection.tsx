'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Utensils, Palette, Wrench, Users, Lightbulb, Info } from 'lucide-react';
import { detectEstablishmentType, getFieldMapping, ESTABLISHMENT_TYPES } from '@/lib/establishment-field-mapper';

interface EstablishmentGroupedSectionProps {
  establishment: {
    services?: any;
    ambiance?: any;
    specialties?: any;
    atmosphere?: any;
    detailedServices?: any;
    clienteleInfo?: any;
    informationsPratiques?: any;
    activities?: any;
  };
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  establishmentType?: string;
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

// Configuration des sous-sections basée sur les champs Prisma
const getSubSections = (establishmentType: any) => [
  {
    id: 'services',
    title: establishmentType.fieldMapping.services,
    icon: <Utensils className="w-4 h-4" />,
    color: 'orange',
    field: 'services',
    description: 'Services et prestations proposés'
  },
  {
    id: 'ambiance',
    title: establishmentType.fieldMapping.ambiance,
    icon: <Palette className="w-4 h-4" />,
    color: 'purple',
    fields: ['ambiance', 'specialties', 'atmosphere'],
    description: 'Ambiance, décoration et spécialités'
  },
  {
    id: 'equipements',
    title: establishmentType.fieldMapping.detailedServices,
    icon: <Wrench className="w-4 h-4" />,
    color: 'green',
    field: 'detailedServices',
    description: 'Équipements et installations'
  },
  {
    id: 'clientele',
    title: establishmentType.fieldMapping.clienteleInfo,
    icon: <Users className="w-4 h-4" />,
    color: 'blue',
    field: 'clienteleInfo',
    description: 'Public cible et groupes'
  },
  {
    id: 'activites',
    title: establishmentType.fieldMapping.activities,
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'pink',
    field: 'activities',
    description: 'Activités et événements'
  },
  {
    id: 'pratique',
    title: establishmentType.fieldMapping.informationsPratiques,
    icon: <Info className="w-4 h-4" />,
    color: 'gray',
    field: 'informationsPratiques',
    description: 'Informations utiles pour les visiteurs'
  }
];

// Fonction pour obtenir la couleur des tags
function getTagColor(color: string): string {
  const colors = {
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    pink: 'bg-pink-100 text-pink-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export default function EstablishmentGroupedSection({ 
  establishment, 
  title,
  icon,
  className = "",
  establishmentType: providedType
}: EstablishmentGroupedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());

  // Détecter le type d'établissement
  const activities = parseJsonField(establishment.activities);
  const detectedType = detectEstablishmentType(activities);
  const establishmentType = providedType ? 
    ESTABLISHMENT_TYPES.find(t => t.id === providedType) || detectedType : 
    detectedType;

  // Titre et icône dynamiques
  const sectionTitle = title || `${establishmentType.name} - Services & Ambiance`;
  const sectionIcon = icon || <span className="text-2xl">{establishmentType.icon}</span>;

  // Obtenir les sous-sections adaptées au type d'établissement
  const SUB_SECTIONS = getSubSections(establishmentType);

  // Organiser les données par sous-sections
  const organizedData = SUB_SECTIONS.map(subSection => {
    let items: string[] = [];
    
    if (subSection.field) {
      items = parseJsonField(establishment[subSection.field as keyof typeof establishment]);
    } else if (subSection.fields) {
      // Pour ambiance, on combine ambiance + specialties + atmosphere
      subSection.fields.forEach(field => {
        items = [...items, ...parseJsonField(establishment[field as keyof typeof establishment])];
      });
    }
    
    return {
      ...subSection,
      items: [...new Set(items)] // Supprimer les doublons
    };
  }).filter(subSection => subSection.items.length > 0);

  const toggleSubSection = (subSectionId: string) => {
    const newExpanded = new Set(expandedSubSections);
    if (newExpanded.has(subSectionId)) {
      newExpanded.delete(subSectionId);
    } else {
      newExpanded.add(subSectionId);
    }
    setExpandedSubSections(newExpanded);
  };

  const totalItems = organizedData.reduce((sum, subSection) => sum + subSection.items.length, 0);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* En-tête principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-orange-500">{sectionIcon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{sectionTitle}</h3>
            <p className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? 'élément' : 'éléments'} répartis en {organizedData.length} catégories
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Contenu principal */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-gray-100">
          <div className="pt-4 space-y-4">
            {organizedData.map((subSection) => (
              <div key={subSection.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* En-tête de sous-section */}
                <button
                  onClick={() => toggleSubSection(subSection.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-${subSection.color}-500`}>
                      {subSection.icon}
                    </span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">{subSection.title}</h4>
                      <p className="text-xs text-gray-500">{subSection.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {subSection.items.length} {subSection.items.length === 1 ? 'élément' : 'éléments'}
                    </span>
                    {expandedSubSections.has(subSection.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Contenu de la sous-section */}
                {expandedSubSections.has(subSection.id) && (
                  <div className="px-4 pb-3 border-t border-gray-100">
                    <div className="pt-3">
                      <div className="flex flex-wrap gap-2">
                        {subSection.items.map((item, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(subSection.color)}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
