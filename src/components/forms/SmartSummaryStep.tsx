'use client';

import React from 'react';
import { SmartEnrichmentData, EnrichmentPriority } from '@/lib/smart-enrichment-service';
import { convertPaymentMethodsObjectToArray } from '@/lib/establishment-form.utils';

// Types pour les données du formulaire
export interface EstablishmentFormData {
  // Informations du compte professionnel
  accountFirstName?: string;
  accountLastName?: string;
  accountEmail?: string;
  accountPhone?: string;
  professionalEmail?: string;
  professionalPhone?: string;
  
  // Informations générales
  establishmentName: string;
  description: string;
  address: string;
  activities: string[];
  
  // Coordonnées GPS
  latitude?: number;
  longitude?: number;
  
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
  whatsappPhone?: string;
  messengerUrl?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  
  
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
  hybridParkingInfo?: string;
  
  // Données d'enrichissement intelligent
  smartEnrichmentData?: SmartEnrichmentData;
}

// Props du composant
interface SmartSummaryStepProps {
  data: EstablishmentFormData;
  onEdit: (step: number) => void;
}

export default function SmartSummaryStep({ data, onEdit }: SmartSummaryStepProps) {
  const renderPriorityData = (priorities: EnrichmentPriority[], title: string, icon: string, editStep?: number) => {
    if (!priorities || priorities.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <span>{title}</span>
          </h4>
          {editStep && (
            <button
              onClick={() => onEdit(editStep)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          )}
        </div>
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
          Résumé de l'inscription de votre établissement
        </h2>
        <p className="text-gray-600">
          Voici un aperçu de toutes vos informations
        </p>
      </div>

      {/* Informations générales */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Informations générales
            </h3>
          </div>
          <button
            onClick={() => onEdit(1)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nom de l'établissement</label>
            <p className="text-gray-900 font-medium">{data.establishmentName || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Adresse</label>
            <p className="text-gray-900">{data.address || 'Non renseigné'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
            <p className="text-gray-900 text-sm leading-relaxed">
              {data.description || 'Aucune description fournie'}
            </p>
          </div>
          {(data.latitude && data.longitude) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Coordonnées GPS</label>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📍 Latitude: {data.latitude.toFixed(6)}</span>
                <span>📍 Longitude: {data.longitude.toFixed(6)}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  ✅ Géolocalisé
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identité du propriétaire */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Identité du propriétaire
            </h3>
          </div>
          <button
            onClick={() => onEdit(0)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
            <p className="text-gray-900 font-medium">{(data as any).accountFirstName || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
            <p className="text-gray-900 font-medium">{(data as any).accountLastName || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email professionnel</label>
            <p className="text-gray-900">{(data as any).professionalEmail || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone professionnel</label>
            <p className="text-gray-900">{(data as any).professionalPhone || 'Non renseigné'}</p>
          </div>
        </div>
      </div>

      {/* Contact et réseaux sociaux */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Contact et réseaux sociaux de l'établissement
            </h3>
          </div>
          <button
            onClick={() => onEdit(7)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
            <p className="text-gray-900">{data.phone || 'Non renseigné'}</p>
            <p className="text-xs text-gray-500 mt-1"> Numéro fixe pour les appels</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{data.email || 'Non renseigné'}</p>
            <p className="text-xs text-gray-500 mt-1">Email visible par les clients</p>
          </div>
          {data.whatsappPhone && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">WhatsApp</label>
              <p className="text-gray-900">{data.whatsappPhone}</p>
              <p className="text-xs text-gray-500 mt-1">📱 Numéro mobile pour que les clients vous contactent via WhatsApp</p>
            </div>
          )}
          {data.messengerUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Messenger (Facebook)</label>
              <a href={data.messengerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {data.messengerUrl}
              </a>
              <p className="text-xs text-gray-500 mt-1">💬 Lien vers votre page Facebook Messenger</p>
            </div>
          )}
          {data.website && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Site web</label>
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {data.website}
              </a>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {data.instagram && (
              <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                 Instagram
              </a>
            )}
            {data.facebook && (
              <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Facebook
              </a>
            )}
            {data.tiktok && (
              <a href={data.tiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800">
                 TikTok
              </a>
            )}
            {data.youtube && (
              <a href={data.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                 YouTube
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Données d'enrichissement intelligent */}
      {data.smartEnrichmentData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🧠</span>
            Enrichissement intelligent importé depuis Google
          </h3>
          
          {/* Métadonnées */}
          {data.smartEnrichmentData.enrichmentMetadata && renderEnrichmentMetadata(data.smartEnrichmentData.enrichmentMetadata)}
          
          {/* Données priorisées */}
          <div className="space-y-6">
            {data.smartEnrichmentData.prioritizedData && (
              <>
                {renderPriorityData(
                  data.smartEnrichmentData.prioritizedData.accessibility,
                  'Accessibilité',
                  '♿',
                  4
                )}
                {renderPriorityData(
                  data.smartEnrichmentData.prioritizedData.services,
                  'Services',
                  '🏪',
                  4
                )}
                {renderPriorityData(
                  data.smartEnrichmentData.prioritizedData.clientele,
                  'Clientèle',
                  '👥',
                  4
                )}
                {renderPriorityData(
                  data.smartEnrichmentData.prioritizedData.children,
                  'Services enfants',
                  '👶',
                  4
                )}
                {renderPriorityData(
                  data.smartEnrichmentData.prioritizedData.parking,
                  'Parking',
                  '🅿️',
                  4
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Moyens de paiement */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Moyens de paiement
            </h3>
          </div>
          <button
            onClick={() => onEdit(2)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Moyens de paiement du formulaire */}
          {data.paymentMethods ? (
            convertPaymentMethodsObjectToArray(data.paymentMethods).map((method, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full"
              >
                {method}
              </span>
            ))
          ) : null}
          
          {/* Moyens de paiement d'enrichissement intelligent */}
          {data.smartEnrichmentData?.paymentMethodsArray && data.smartEnrichmentData.paymentMethodsArray.length > 0 ? (
            data.smartEnrichmentData.paymentMethodsArray.map((method: string, index: number) => (
              <span
                key={`enrichment-${index}`}
                className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {method}
              </span>
            ))
          ) : null}
          
          {/* Moyens de paiement d'enrichissement manuel */}
          {data.hybridDetailedPayments ? (
            Object.entries(JSON.parse(data.hybridDetailedPayments)).map(([method, enabled], index) => (
              enabled ? (
                <span
                  key={`manual-${index}`}
                  className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                >
                  {method}
                </span>
              ) : null
            ))
          ) : null}
          
          {/* Message si aucun moyen de paiement */}
          {(!data.paymentMethods || convertPaymentMethodsObjectToArray(data.paymentMethods).length === 0) && 
           (!data.smartEnrichmentData?.paymentMethodsArray || data.smartEnrichmentData.paymentMethodsArray.length === 0) &&
           (!data.hybridDetailedPayments) && (
            <span className="text-gray-500 italic text-sm">Aucun moyen de paiement défini</span>
          )}
        </div>
      </div>

      {/* Informations pratiques */}
      {data.informationsPratiques && data.informationsPratiques.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">ℹ️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Informations pratiques
              </h3>
            </div>
            <button
              onClick={() => onEdit(4)}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.informationsPratiques.map((info, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
              >
                {info}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Données d'enrichissement manuel (fallback) */}
      {(data.hybridAccessibilityDetails || data.hybridDetailedServices || data.hybridClienteleInfo || 
        data.hybridDetailedPayments || data.hybridChildrenServices || data.hybridParkingInfo) && !data.smartEnrichmentData && (
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
            {data.hybridParkingInfo && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Informations parking</label>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 text-sm">{data.hybridParkingInfo}</p>
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

      {/* Liens externes */}
      {(data.theForkLink || data.uberEatsLink) && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Liens externes
              </h3>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          </div>
          <div className="flex space-x-4">
            {data.theForkLink && (
              <a href={data.theForkLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 font-medium">
                🍴 TheFork
              </a>
            )}
            {data.uberEatsLink && (
              <a href={data.uberEatsLink} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800 font-medium">
                🚗 Uber Eats
              </a>
            )}
          </div>
        </div>
      )}

      {/* Horaires */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🕐</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Horaires d'ouverture
            </h3>
          </div>
          <button
            onClick={() => onEdit(3)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-2">
          {data.hours && Object.keys(data.hours).length > 0 ? (
            Object.entries(data.hours).map(([dayKey, dayData]) => {
              const dayLabel = {
                monday: 'Lundi',
                tuesday: 'Mardi',
                wednesday: 'Mercredi',
                thursday: 'Jeudi',
                friday: 'Vendredi',
                saturday: 'Samedi',
                sunday: 'Dimanche'
              }[dayKey] || dayKey;
              
              return (
                <div key={dayKey} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{dayLabel}</span>
                  <span className="text-gray-600">
                    {dayData.isOpen ? (
                      dayData.slots.map(slot => `${slot.name || 'Sans nom'} (${slot.open}-${slot.close})`).join(', ')
                    ) : (
                      'Fermé'
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 italic text-sm">Aucun horaire défini</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏷️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Tags de recherche
              </h3>
            </div>
            <button
              onClick={() => onEdit(5)}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Abonnement */}
      {(data as any).subscriptionPlan && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Abonnement
              </h3>
            </div>
            <button
              onClick={() => onEdit(6)}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              {(data as any).subscriptionPlan}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
