'use client';

import React from 'react';

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
}

// Props du composant
interface SummaryStepProps {
  data: EstablishmentFormData;
  onEdit: (step: number) => void;
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

export default function SummaryStep({ data, onEdit }: SummaryStepProps) {
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Récapitulatif de votre inscription
        </h2>
        <p className="text-gray-600 mt-2">
          Vérifiez toutes les informations avant l'envoi final
        </p>
      </div>

      {/* Informations générales */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📋 Informations générales
          </h3>
          <button
            onClick={() => onEdit(1)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Nom de l'établissement :</span>
            <span className="ml-2 text-gray-900">{data.establishmentName || 'Non renseigné'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Description :</span>
            <span className="ml-2 text-gray-900">{data.description || 'Non renseignée'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Adresse :</span>
            <span className="ml-2 text-gray-900">{data.address || 'Non renseignée'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Activités :</span>
            <span className="ml-2 text-gray-900">{formatList(data.activities) || 'Aucune activité sélectionnée'}</span>
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🕐 Horaires d'ouverture
          </h3>
          <button
            onClick={() => onEdit(2)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="text-gray-900">
          {formatHours(data.hours)}
        </div>
      </div>

      {/* Services et Ambiance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🎯 Services & Ambiance
          </h3>
          <button
            onClick={() => onEdit(3)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Services :</span>
            <span className="ml-2 text-gray-900">{formatList(data.services)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Ambiance :</span>
            <span className="ml-2 text-gray-900">{formatList(data.ambiance)}</span>
          </div>
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            💳 Moyens de paiement
          </h3>
          <button
            onClick={() => onEdit(4)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div>
          <span className="font-medium text-gray-700">Moyens acceptés :</span>
          <span className="ml-2 text-gray-900">{formatList(data.paymentMethods)}</span>
        </div>
      </div>

      {/* Tags de recherche */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🏷️ Tags de recherche
          </h3>
          <button
            onClick={() => onEdit(5)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.tags.length > 0 ? (
            data.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic">Aucun tag sélectionné</span>
          )}
        </div>
      </div>

      {/* Abonnement */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📸 Abonnement
          </h3>
          <button
            onClick={() => onEdit(6)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="text-gray-900">
          Les photos sont ajoutées sur la page pro
        </div>
      </div>

      {/* Contact et Réseaux sociaux */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📞 Contact & Réseaux sociaux
          </h3>
          <button
            onClick={() => onEdit(7)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Téléphone :</span>
            <span className="ml-2 text-gray-900">{data.phone || 'Non renseigné'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email :</span>
            <span className="ml-2 text-gray-900">{data.email || 'Non renseigné'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Site web :</span>
            <span className="ml-2 text-gray-900">{data.website || 'Non renseigné'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Instagram :</span>
            <span className="ml-2 text-gray-900">{data.instagram || 'Non renseigné'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Facebook :</span>
            <span className="ml-2 text-gray-900">{data.facebook || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Toutes les informations sont correctes ? Vous pouvez maintenant procéder à l'envoi final.
      </div>
    </div>
  );
}
