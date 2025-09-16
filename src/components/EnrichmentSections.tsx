'use client';

import React from 'react';
import { EnrichmentData } from '@/lib/enrichment-system';

interface EnrichmentSectionsProps {
  enrichmentData: EnrichmentData;
  onSectionUpdate?: (section: string, data: any) => void;
  readOnly?: boolean;
}

export default function EnrichmentSections({ 
  enrichmentData, 
  onSectionUpdate, 
  readOnly = false 
}: EnrichmentSectionsProps) {
  
  // Fonction pour créer une section avec des éléments de liste
  const renderListSection = (
    title: string,
    icon: string,
    items: string[]
  ) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-sm font-medium text-green-800">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm italic">Aucune information disponible</div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informations détaillées de l'établissement
        </h2>
        <p className="text-gray-600">
          Données enrichies automatiquement depuis Google Places
        </p>
      </div>

      {/* Accessibilité */}
      {renderListSection(
        'Accessibilité',
        '♿',
        enrichmentData.accessibilityInfo || []
      )}

      {/* Services disponibles */}
      {renderListSection(
        'Services disponibles',
        '🏪',
        enrichmentData.servicesAvailableInfo || []
      )}

      {/* Points forts */}
      {renderListSection(
        'Points forts',
        '⭐',
        enrichmentData.pointsForts || []
      )}

      {/* Populaire pour */}
      {renderListSection(
        'Populaire pour',
        '👥',
        enrichmentData.populairePour || []
      )}

      {/* Offres */}
      {renderListSection(
        'Offres',
        '🍻',
        enrichmentData.offres || []
      )}

      {/* Services de restauration */}
      {renderListSection(
        'Services de restauration',
        '🍽️',
        enrichmentData.servicesRestauration || []
      )}

      {/* Services généraux */}
      {renderListSection(
        'Services',
        '🛎️',
        enrichmentData.servicesInfo || []
      )}

      {/* Ambiance */}
      {renderListSection(
        'Ambiance',
        '🎵',
        enrichmentData.ambianceInfo || []
      )}

      {/* Clientèle */}
      {renderListSection(
        'Clientèle',
        '👥',
        enrichmentData.clientele || []
      )}

      {/* Planning */}
      {renderListSection(
        'Planning',
        '📅',
        enrichmentData.planning || []
      )}

      {/* Paiements */}
      {renderListSection(
        'Paiements',
        '💳',
        enrichmentData.paiements || []
      )}

      {/* Enfants */}
      {renderListSection(
        'Enfants',
        '👶',
        enrichmentData.enfants || []
      )}

      {/* Parking */}
      {renderListSection(
        'Parking',
        '🅿️',
        enrichmentData.parking || []
      )}

      {/* Note de pied */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informations automatiques
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Ces informations ont été récupérées automatiquement depuis Google Places. 
                Vous pouvez les modifier si nécessaire dans les étapes suivantes du formulaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
