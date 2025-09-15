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
  
  // Fonction pour traduire les valeurs boolean en français
  const translateBoolean = (value: boolean | undefined): string => {
    if (value === true) return 'Oui';
    if (value === false) return 'Non';
    return 'Non spécifié';
  };

  // Fonction pour créer une section
  const renderSection = (
    title: string,
    icon: string,
    items: Array<{ label: string; value: boolean | undefined; key: string }>
  ) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ label, value, key }) => (
          value !== undefined && (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                value === true 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : value === false
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {translateBoolean(value)}
              </span>
            </div>
          )
        ))}
      </div>
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

      {/* Services disponibles */}
      {renderSection(
        'Services disponibles',
        '🏪',
        [
          { label: 'Livraison', value: enrichmentData.servicesAvailable?.delivery, key: 'delivery' },
          { label: 'Vente à emporter', value: enrichmentData.servicesAvailable?.takeout, key: 'takeout' },
          { label: 'Repas sur place', value: enrichmentData.servicesAvailable?.dineIn, key: 'dineIn' },
          { label: 'Retrait en bordure de trottoir', value: enrichmentData.servicesAvailable?.curbsidePickup, key: 'curbsidePickup' },
          { label: 'Réservations acceptées', value: enrichmentData.servicesAvailable?.reservations, key: 'reservations' },
        ]
      )}

      {/* Accessibilité */}
      {renderSection(
        'Accessibilité',
        '♿',
        [
          { label: 'Entrée accessible PMR', value: enrichmentData.accessibilityInfo?.wheelchairAccessibleEntrance, key: 'wheelchairEntrance' },
          { label: 'Places assises accessibles PMR', value: enrichmentData.accessibilityInfo?.wheelchairAccessibleSeating, key: 'wheelchairSeating' },
          { label: 'Parking accessible PMR', value: enrichmentData.accessibilityInfo?.wheelchairAccessibleParking, key: 'wheelchairParking' },
          { label: 'Toilettes accessibles PMR', value: enrichmentData.accessibilityInfo?.wheelchairAccessibleRestroom, key: 'wheelchairRestroom' },
        ]
      )}

      {/* Moyens de paiement */}
      {renderSection(
        'Paiements',
        '💳',
        [
          { label: 'Cartes de crédit', value: enrichmentData.paymentMethods?.creditCards, key: 'creditCards' },
          { label: 'Cartes de débit', value: enrichmentData.paymentMethods?.debitCards, key: 'debitCards' },
          { label: 'Paiements mobiles NFC', value: enrichmentData.paymentMethods?.nfc, key: 'nfc' },
          { label: 'Espèces uniquement', value: enrichmentData.paymentMethods?.cashOnly, key: 'cashOnly' },
        ]
      )}

      {/* Services de restauration */}
      {renderSection(
        'Services de restauration',
        '🍽️',
        [
          { label: 'Petit-déjeuner', value: enrichmentData.diningServices?.breakfast, key: 'breakfast' },
          { label: 'Brunch', value: enrichmentData.diningServices?.brunch, key: 'brunch' },
          { label: 'Déjeuner', value: enrichmentData.diningServices?.lunch, key: 'lunch' },
          { label: 'Dîner', value: enrichmentData.diningServices?.dinner, key: 'dinner' },
          { label: 'Desserts', value: enrichmentData.diningServices?.dessert, key: 'dessert' },
          { label: 'Nourriture tardive', value: enrichmentData.diningServices?.lateNightFood, key: 'lateNightFood' },
        ]
      )}

      {/* Offres alimentaires et boissons */}
      {renderSection(
        'Offres',
        '🍻',
        [
          { label: 'Bière', value: enrichmentData.offerings?.beer, key: 'beer' },
          { label: 'Vin', value: enrichmentData.offerings?.wine, key: 'wine' },
          { label: 'Cocktails et apéritifs', value: enrichmentData.offerings?.cocktails, key: 'cocktails' },
          { label: 'Cafés', value: enrichmentData.offerings?.coffee, key: 'coffee' },
          { label: 'Convient aux végétariens', value: enrichmentData.offerings?.vegetarianFood, key: 'vegetarianFood' },
          { label: 'Happy Hour', value: enrichmentData.offerings?.happyHourFood, key: 'happyHourFood' },
        ]
      )}

      {/* Ambiance et caractéristiques */}
      {renderSection(
        'Ambiance',
        '🎵',
        [
          { label: 'Convient aux enfants', value: enrichmentData.atmosphereFeatures?.goodForChildren, key: 'goodForChildren' },
          { label: 'Convient aux groupes', value: enrichmentData.atmosphereFeatures?.goodForGroups, key: 'goodForGroups' },
          { label: 'Idéal pour regarder le sport', value: enrichmentData.atmosphereFeatures?.goodForWatchingSports, key: 'goodForWatchingSports' },
          { label: 'Musique live', value: enrichmentData.atmosphereFeatures?.liveMusic, key: 'liveMusic' },
          { label: 'Terrasse/Places en extérieur', value: enrichmentData.atmosphereFeatures?.outdoorSeating, key: 'outdoorSeating' },
        ]
      )}

      {/* Services généraux */}
      {renderSection(
        'Services',
        '🛎️',
        [
          { label: 'Wi-Fi', value: enrichmentData.generalServices?.wifi, key: 'wifi' },
          { label: 'Toilettes', value: enrichmentData.generalServices?.restroom, key: 'restroom' },
          { label: 'Parking', value: enrichmentData.generalServices?.parking, key: 'parking' },
          { label: 'Service de voiturier', value: enrichmentData.generalServices?.valetParking, key: 'valetParking' },
          { label: 'Parking payant', value: enrichmentData.generalServices?.paidParking, key: 'paidParking' },
          { label: 'Parking gratuit', value: enrichmentData.generalServices?.freeParking, key: 'freeParking' },
        ]
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
