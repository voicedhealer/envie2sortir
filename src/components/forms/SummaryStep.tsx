'use client';

import React from 'react';
import SmartSummaryStep from './SmartSummaryStep';
import ParkingInfo from '../ParkingInfo';
import HealthInfo from '../HealthInfo';

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
  informationsPratiques?: string[];
  
  // Moyens de paiement
  paymentMethods: string[];
  
  // Parking
  parkingOptions?: string[];
  
  // Santé et sécurité
  healthOptions?: string[];
  
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
  envieTags?: string[];
  
  // Données d'enrichissement manuel
  hybridAccessibilityDetails?: string;
  hybridDetailedServices?: string;
  hybridClienteleInfo?: string;
  hybridDetailedPayments?: string;
  hybridChildrenServices?: string;
  
  // Données d'enrichissement intelligent (depuis l'API Google)
  smartEnrichmentData?: any;
}

// Props du composant
interface SummaryStepProps {
  data: EstablishmentFormData;
  onEdit: (step: number) => void;
  useSmartSummary?: boolean;
}

// Configuration des étapes pour la navigation
const STEPS_CONFIG = [
  { step: 1, title: 'Informations générales', key: 'general' },
  { step: 2, title: 'Horaires', key: 'hours' },
  { step: 3, title: 'Services & Ambiance', key: 'services' },
  { step: 4, title: 'Moyens de paiement', key: 'payment' },
  { step: 5, title: 'Tags & Mots-clés', key: 'tags' },
  { step: 6, title: 'Abonnement', key: 'subscription' },
  { step: 7, title: 'Contact & Réseaux', key: 'contact' },
];

// Configuration des jours de la semaine
const DAYS_LABELS = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export default function SummaryStep({ data, onEdit, useSmartSummary = true }: SummaryStepProps) {
  // Utiliser le résumé intelligent si activé
  if (useSmartSummary) {
    return <SmartSummaryStep data={data} onEdit={onEdit} />;
  }
  // Fonction pour formater les horaires
  const formatHours = (hours: EstablishmentFormData['hours']) => {
    if (!hours || Object.keys(hours).length === 0) {
      return 'Aucun horaire défini';
    }

    return Object.entries(hours)
      .filter(([_, dayData]) => dayData.isOpen)
      .map(([dayKey, dayData]) => {
        const dayLabel = DAYS_LABELS[dayKey as keyof typeof DAYS_LABELS] || dayKey;
        const slotsText = dayData.slots
          .map(slot => `${slot.name || 'Sans nom'} (${slot.open}-${slot.close})`)
          .join(', ');
        return `${dayLabel}: ${slotsText}`;
      })
      .join(' | ');
  };

  // Fonction pour formater les services et ambiance
  const formatList = (items: string[]) => {
    if (!items || items.length === 0) return 'Aucun élément sélectionné';
    return items.join(', ');
  };

  // Fonction pour formater les photos
  const formatPhotos = (photos: File[]) => {
    if (!photos || photos.length === 0) return 'Aucune photo';
    return `${photos.length} photo(s) sélectionnée(s)`;
  };

  // Fonction pour formater l'adresse
  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      const parts = [address.street, address.city, address.postalCode].filter(Boolean);
      return parts.join(', ');
    }
    return 'Non renseignée';
  };

  // Fonction pour vérifier si une valeur est renseignée
  const isValueProvided = (value: any) => {
    return value && value !== '' && value !== null && value !== undefined;
  };

  // Fonction pour afficher une valeur ou "Non renseigné"
  const displayValue = (value: any, fallback: string = 'Non renseigné') => {
    return isValueProvided(value) ? value : fallback;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Récapitulatif de votre établissement
        </h2>
        <p className="text-lg text-gray-600">
          Vérifiez toutes les informations avant la validation finale
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nom de l'établissement</label>
              <p className="text-gray-900 font-medium">{displayValue(data.establishmentName)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Adresse</label>
              <p className="text-gray-900">{formatAddress(data.address)}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
              <p className="text-gray-900 text-sm leading-relaxed">
                {displayValue(data.description, 'Aucune description fournie')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Activités</label>
              <div className="flex flex-wrap gap-2">
                {data.activities && data.activities.length > 0 ? (
                  data.activities.map((activity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                    >
                      {activity}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">Aucune activité sélectionnée</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
            onClick={() => onEdit(2)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 text-sm leading-relaxed">
            {formatHours(data.hours)}
          </p>
        </div>
      </div>

      {/* Services et Ambiance */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Services & Ambiance
            </h3>
          </div>
          <button
            onClick={() => onEdit(3)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Services proposés</label>
            <div className="flex flex-wrap gap-2">
              {data.services && data.services.length > 0 ? (
                data.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic text-sm">Aucun service sélectionné</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Ambiance</label>
            <div className="flex flex-wrap gap-2">
              {data.ambiance && data.ambiance.length > 0 ? (
                data.ambiance.map((ambiance, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-xs bg-pink-100 text-pink-800 rounded-full"
                  >
                    {ambiance}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic text-sm">Aucune ambiance définie</span>
              )}
            </div>
          </div>
        </div>
      </div>

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
            onClick={() => onEdit(4)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Moyens de paiement du formulaire */}
          {data.paymentMethods && data.paymentMethods.length > 0 ? (
            data.paymentMethods.map((method, index) => (
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
                {method} (Google)
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
                  {method} (Manuel)
                </span>
              ) : null
            ))
          ) : null}
          
          {/* Message si aucun moyen de paiement */}
          {(!data.paymentMethods || data.paymentMethods.length === 0) && 
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

      {/* Parking */}
      <ParkingInfo 
        parkingOptions={[
          ...(data.parkingOptions || []),
          ...(data.smartEnrichmentData?.servicesArray?.filter((service: string) => 
            service.toLowerCase().includes('parking')
          ) || [])
        ]} 
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-8"
      />

      {/* Santé et sécurité */}
      <HealthInfo 
        healthOptions={[
          ...(data.healthOptions || []),
          ...(data.smartEnrichmentData?.servicesArray?.filter((service: string) => 
            service.toLowerCase().includes('santé') || 
            service.toLowerCase().includes('sécurité') ||
            service.toLowerCase().includes('premiers secours')
          ) || [])
        ]} 
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-8"
      />

      {/* Tags de recherche */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
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
          {data.tags && data.tags.length > 0 ? (
            data.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
              >
                {tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic text-sm">Aucun tag sélectionné</span>
          )}
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Photos
            </h3>
          </div>
          <button
            onClick={() => onEdit(6)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 text-sm">
            {formatPhotos(data.photos)}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Les photos seront ajoutées sur votre page d'établissement
          </p>
        </div>
      </div>

      {/* Contact et Réseaux sociaux */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Contact & Réseaux sociaux
            </h3>
          </div>
          <button
            onClick={() => onEdit(7)}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Modifier
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact de l'établissement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">📞</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900">Contact établissement</h4>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Visible clients</span>
            </div>
            <div className="space-y-3 pl-8">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                <p className="text-gray-900">{displayValue(data.phone)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{displayValue(data.email)}</p>
              </div>
            </div>
          </div>

          {/* Contact professionnel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900">Contact professionnel</h4>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Admin uniquement</span>
            </div>
            <div className="space-y-3 pl-8">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                <p className="text-gray-900">{displayValue(data.professionalPhone)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{displayValue(data.professionalEmail)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <span className="text-xl">🌐</span>
            <span>Réseaux sociaux</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Site web */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg min-h-[80px]">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🌐</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">Site web</p>
                <p className="text-sm text-gray-600 break-all">{displayValue(data.website)}</p>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg min-h-[80px]">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📷</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">Instagram</p>
                <p className="text-sm text-gray-600 break-all">{displayValue(data.instagram)}</p>
              </div>
            </div>

            {/* Facebook */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg min-h-[80px]">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📘</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">Facebook</p>
                <p className="text-sm text-gray-600 break-all">{displayValue(data.facebook)}</p>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg min-h-[80px]">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg text-white">🎵</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">TikTok</p>
                <p className="text-sm text-gray-600 break-all">{displayValue(data.tiktok)}</p>
              </div>
            </div>

            {/* YouTube */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg min-h-[80px]">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📺</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">YouTube</p>
                <p className="text-sm text-gray-600 break-all">{displayValue(data.youtube)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Données d'enrichissement */}
      {(data.theForkLink || data.uberEatsLink || data.informationsPratiques || data.envieTags?.length || 
        data.hybridAccessibilityDetails || data.hybridDetailedServices || data.hybridClienteleInfo || 
        data.hybridDetailedPayments || data.hybridChildrenServices) && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Données d'enrichissement
              </h3>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liens externes */}
            {(data.theForkLink || data.uberEatsLink) && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <span className="text-lg">🔗</span>
                  <span>Liens externes</span>
                </h4>
                <div className="space-y-3">
                  {data.theForkLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">TheFork</label>
                      <p className="text-gray-900 break-all">{data.theForkLink}</p>
                    </div>
                  )}
                  {data.uberEatsLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Uber Eats</label>
                      <p className="text-gray-900 break-all">{data.uberEatsLink}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations pratiques */}
            {data.informationsPratiques && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <span className="text-lg">ℹ️</span>
                  <span>Informations pratiques</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 text-sm leading-relaxed">{data.informationsPratiques}</p>
                </div>
              </div>
            )}

            {/* Tags Envie */}
            {data.envieTags && data.envieTags.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <span className="text-lg">🏷️</span>
                  <span>Tags Envie</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.envieTags.map((tag, index) => (
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
          </div>

          {/* Données d'enrichissement manuel */}
          {(data.hybridAccessibilityDetails || data.hybridDetailedServices || data.hybridClienteleInfo || 
            data.hybridDetailedPayments || data.hybridChildrenServices) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <span className="text-xl">✏️</span>
                <span>Informations complémentaires (saisies manuellement)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.hybridAccessibilityDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Accessibilité</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 text-sm">{data.hybridAccessibilityDetails}</p>
                    </div>
                  </div>
                )}
                {data.hybridDetailedServices && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Services détaillés</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 text-sm">{data.hybridDetailedServices}</p>
                    </div>
                  </div>
                )}
                {data.hybridClienteleInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Clientèle</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 text-sm">{data.hybridClienteleInfo}</p>
                    </div>
                  </div>
                )}
                {data.hybridDetailedPayments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Paiements détaillés</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 text-sm">{data.hybridDetailedPayments}</p>
                    </div>
                  </div>
                )}
                {data.hybridChildrenServices && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Services enfants</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 text-sm">{data.hybridChildrenServices}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message final */}
      <div className="text-center py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl">✅</span>
            <h3 className="text-lg font-semibold text-green-800">Prêt pour la validation</h3>
          </div>
          <p className="text-green-700">
            Toutes les informations sont correctes ? Vous pouvez maintenant procéder à l'envoi final.
          </p>
        </div>
      </div>
    </div>
  );
}
