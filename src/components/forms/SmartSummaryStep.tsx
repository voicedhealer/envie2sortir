'use client';

import React from 'react';
import { SmartEnrichmentData, EnrichmentPriority } from '@/lib/smart-enrichment-service';

// Types pour les données du formulaire
export interface EstablishmentFormData {
  // Informations générales
  establishmentName: string;
  description: string;
  address: string;
  activities: string[];
  
  // Horaires
  hours: {
    [key: string]: {
      isOpen: boolean;
      slots: Array<{
        name: string;
        open: string;
        close: string;
      }>;
    };
  };
  
  // Services et ambiance
  services: string[];
  ambiance: string[];
  
  // Moyens de paiement
  paymentMethods: string[];
  
  // Tags de recherche
  tags: string[];
  
  // Photos
  photos: File[];
  
  // Contact et réseaux sociaux
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  
  // Contacts professionnels (pour le résumé)
  professionalPhone?: string;
  professionalEmail?: string;
  
  // Données d'enrichissement
  theForkLink?: string;
  uberEatsLink?: string;
  informationsPratiques?: string[];
  envieTags?: string[];
  
  // Données d'enrichissement manuel
  hybridAccessibilityDetails?: string;
  hybridDetailedServices?: string;
  hybridClienteleInfo?: string;
  hybridDetailedPayments?: string;
  hybridChildrenServices?: string;
  
  // Données d'enrichissement intelligent
  smartEnrichmentData?: SmartEnrichmentData;
}

// Props du composant
interface SmartSummaryStepProps {
  data: EstablishmentFormData;
  onEdit: (step: number) => void;
}

export default function SmartSummaryStep({ data, onEdit }: SmartSummaryStepProps) {
  const renderPriorityData = (priorities: EnrichmentPriority[], title: string, icon: string) => {
    if (!priorities || priorities.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span>{title}</span>
        </h4>
        <div className="space-y-2">
          {priorities.map((priority, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${
                  priority.source === 'google' ? 'bg-green-500' :
                  priority.source === 'manual' ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}></span>
                <span className="font-medium text-gray-900">
                  {Array.isArray(priority.value) ? priority.value.join(', ') : priority.value}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  priority.source === 'google' ? 'bg-green-100 text-green-800' :
                  priority.source === 'manual' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {priority.source === 'google' ? 'Google' :
                   priority.source === 'manual' ? 'Manuel' : 'Suggéré'}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(priority.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEnrichmentMetadata = (metadata: any) => {
    if (!metadata) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-3">📊 Métadonnées d'enrichissement</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Confiance Google:</span>
            <span className="ml-2 text-blue-900">{Math.round(metadata.googleConfidence * 100)}%</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Complétude manuelle:</span>
            <span className="ml-2 text-blue-900">{Math.round(metadata.manualCompleteness * 100)}%</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Suggestions:</span>
            <span className="ml-2 text-blue-900">{metadata.totalSuggestions}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Dernière MAJ:</span>
            <span className="ml-2 text-blue-900">
              {new Date(metadata.lastUpdated).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Résumé intelligent de votre établissement
        </h2>
        <p className="text-gray-600">
          Voici un aperçu de toutes les informations qui seront affichées sur votre page publique
        </p>
      </div>

      {/* Informations de base */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">🏢</span>
          Informations générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Nom de l'établissement</label>
            <p className="text-gray-900 font-medium">{data.establishmentName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
            <p className="text-gray-900">{data.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Adresse</label>
            <p className="text-gray-900">{data.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Activités</label>
            <div className="flex flex-wrap gap-2">
              {data.activities.map((activity, index) => (
                <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Données d'enrichissement intelligent */}
      {data.smartEnrichmentData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🧠</span>
            Enrichissement intelligent
          </h3>
          
          {/* Métadonnées */}
          {renderEnrichmentMetadata(data.smartEnrichmentData.enrichmentMetadata)}
          
          {/* Données priorisées */}
          <div className="space-y-6">
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.accessibility,
              'Accessibilité',
              '♿'
            )}
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.services,
              'Services',
              '🏪'
            )}
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.payments,
              'Moyens de paiement',
              '💳'
            )}
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.clientele,
              'Clientèle',
              '👥'
            )}
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.children,
              'Services enfants',
              '👶'
            )}
            {renderPriorityData(
              data.smartEnrichmentData.prioritizedData.parking,
              'Parking',
              '🅿️'
            )}
          </div>
        </div>
      )}

      {/* Données d'enrichissement manuel (fallback) */}
      {(data.hybridAccessibilityDetails || data.hybridDetailedServices || data.hybridClienteleInfo || 
        data.hybridDetailedPayments || data.hybridChildrenServices) && !data.smartEnrichmentData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">✏️</span>
            Informations complémentaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.hybridAccessibilityDetails && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Accessibilité</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridAccessibilityDetails}</p>
                </div>
              </div>
            )}
            {data.hybridDetailedServices && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Services détaillés</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridDetailedServices}</p>
                </div>
              </div>
            )}
            {data.hybridClienteleInfo && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Clientèle</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridClienteleInfo}</p>
                </div>
              </div>
            )}
            {data.hybridDetailedPayments && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Paiements détaillés</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridDetailedPayments}</p>
                </div>
              </div>
            )}
            {data.hybridChildrenServices && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Services enfants</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridChildrenServices}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services et ambiance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">🎨</span>
          Services et ambiance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Services</label>
            <div className="flex flex-wrap gap-2">
              {data.services.map((service, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Ambiance</label>
            <div className="flex flex-wrap gap-2">
              {data.ambiance.map((ambiance, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {ambiance}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">💳</span>
          Moyens de paiement
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.paymentMethods.map((method, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Tags de recherche */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">🏷️</span>
          Tags de recherche
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Contact et réseaux sociaux */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">📞</span>
          Contact et réseaux sociaux
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Téléphone</label>
            <p className="text-gray-900">{data.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            <p className="text-gray-900">{data.email}</p>
          </div>
          {data.website && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Site web</label>
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {data.website}
              </a>
            </div>
          )}
          <div className="flex space-x-4">
            {data.instagram && (
              <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                📷 Instagram
              </a>
            )}
            {data.facebook && (
              <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                📘 Facebook
              </a>
            )}
            {data.tiktok && (
              <a href={data.tiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800">
                🎵 TikTok
              </a>
            )}
            {data.youtube && (
              <a href={data.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                📺 YouTube
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Liens externes */}
      {(data.theForkLink || data.uberEatsLink) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🔗</span>
            Liens externes
          </h3>
          <div className="flex space-x-4">
            {data.theForkLink && (
              <a href={data.theForkLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800">
                🍴 TheFork
              </a>
            )}
            {data.uberEatsLink && (
              <a href={data.uberEatsLink} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800">
                🚗 Uber Eats
              </a>
            )}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => onEdit(0)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Modifier
        </button>
        <button
          onClick={() => {/* Logique de soumission */}}
          className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          Publier l'établissement
        </button>
      </div>
    </div>
  );
}
