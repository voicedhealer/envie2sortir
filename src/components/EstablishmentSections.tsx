'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, Utensils, Wrench, Palette, FileText } from 'lucide-react';
import UpcomingEventsSection from './UpcomingEventsSection';

interface EstablishmentSectionsProps {
  establishment: {
    slug: string;
    description?: string;
    activities?: any;
    services?: any;
    ambiance?: any;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    tags?: Array<{
      tag: string;
      typeTag: string;
      poids: number;
    }>;
  };
}

export default function EstablishmentSections({ establishment }: EstablishmentSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const parseJsonField = (field: any) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  const activities = parseJsonField(establishment.activities);
  const allServices = parseJsonField(establishment.services);
  const ambiance = parseJsonField(establishment.ambiance);
  const tags = establishment.tags || [];

  // Filtrer les moyens de paiement des services
  const paymentMethods = [
    'Espèces',
    'Carte bancaire', 
    'Carte de crédit',
    'Chèque',
    'Paiement mobile (Apple Pay, Google Pay)',
    'Virement bancaire',
    'PayPal',
    'Ticket restaurant',
    'Chèques vacances'
  ];
  
  const services = allServices.filter(service => !paymentMethods.includes(service));

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
      {activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('activities')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Utensils className="w-5 h-5 text-orange-500" />
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
                  {activities.map((activity: string, index: number) => (
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

      {/* Services & Commodités */}
      {services.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('services')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Wrench className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Services & Commodités</h3>
            </div>
            {expandedSection === 'services' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'services' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ambiance & Spécialités */}
      {ambiance.length > 0 && (
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
                  {ambiance.map((item: string, index: number) => (
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

      {/* Les réseaux sociaux sont affichés dans EstablishmentInfo.tsx */}
    </div>
  );
}
