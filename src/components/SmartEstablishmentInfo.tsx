"use client";

import { Establishment } from '@prisma/client';
import { MapPin, Phone, Globe, Clock, Star, Users, Car, Utensils, Wifi, Coffee, ChevronDown, ChevronUp, Instagram, Facebook, Music, Youtube, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { SmartEnrichmentData, EnrichmentPriority } from '@/lib/smart-enrichment-service';

// Fonction utilitaire pour nettoyer l'affichage d'une URL
const cleanUrlForDisplay = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.startsWith('www.') ? urlObj.hostname : urlObj.hostname;
  } catch (error) {
    return url;
  }
};

// Fonction pour parser les données d'enrichissement intelligent
const parseSmartEnrichmentData = (data: any): SmartEnrichmentData | null => {
  if (!data) return null;
  
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  if (typeof data === 'object' && data.prioritizedData) {
    return data;
  }
  
  return null;
};

// Fonction pour afficher les données priorisées
const renderPrioritySection = (
  priorities: EnrichmentPriority[], 
  title: string, 
  icon: React.ReactNode,
  emptyMessage: string = "Aucune information disponible"
) => {
  if (!priorities || priorities.length === 0) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Info className="w-4 h-4 mr-2" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {priorities.map((priority, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              priority.source === 'google' ? 'bg-green-500' :
              priority.source === 'manual' ? 'bg-blue-500' :
              'bg-orange-500'
            }`}></span>
            <span className="text-sm font-medium text-gray-900">
              {Array.isArray(priority.value) ? priority.value.join(', ') : priority.value}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {priority.source === 'google' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {priority.source === 'manual' && <CheckCircle className="w-4 h-4 text-blue-500" />}
            {priority.source === 'suggested' && <AlertCircle className="w-4 h-4 text-orange-500" />}
            <span className="text-xs text-gray-500">
              {Math.round(priority.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SmartEstablishmentInfoProps {
  establishment: Establishment;
}

export default function SmartEstablishmentInfo({ establishment }: SmartEstablishmentInfoProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    services: false,
    accessibility: false,
    children: false,
    parking: false,
    contact: false
  });

  const smartData = parseSmartEnrichmentData(establishment.smartEnrichmentData);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityIcon = (source: string) => {
    switch (source) {
      case 'google': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'manual': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'suggested': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* En-tête de l'établissement */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            <p className="text-gray-600 mb-4">{establishment.description}</p>
            
            {/* Note et avis */}
            <div className="flex items-center space-x-4 mb-4">
              {establishment.googleRating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {establishment.googleRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({establishment.googleReviewCount} avis)
                  </span>
                </div>
              )}
              
              {/* Niveau de prix */}
              {establishment.priceLevel && (
                <div className="flex items-center space-x-1">
                  <span className="text-gray-500 text-sm">Prix:</span>
                  <span className="text-gray-900 font-medium">
                    {'€'.repeat(establishment.priceLevel)}
                  </span>
                </div>
              )}
            </div>

            {/* Adresse */}
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{establishment.address}</span>
            </div>
          </div>

          {/* Métadonnées d'enrichissement */}
          {smartData?.enrichmentMetadata && (
            <div className="mt-4 md:mt-0 md:ml-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📊 Qualité des données</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Confiance Google:</span>
                  <span className="text-blue-900 font-medium">
                    {Math.round(smartData.enrichmentMetadata.googleConfidence * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Complétude:</span>
                  <span className="text-blue-900 font-medium">
                    {Math.round(smartData.enrichmentMetadata.manualCompleteness * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags d'envie */}
        {establishment.envieTags && establishment.envieTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {establishment.envieTags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services et commodités */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => toggleSection('services')}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Utensils className="w-6 h-6 mr-3 text-orange-500" />
            Services et commodités
          </h2>
          {expandedSections.services ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.services && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {smartData ? (
              renderPrioritySection(
                smartData.prioritizedData.services,
                'Services',
                <Utensils className="w-5 h-5" />,
                "Aucun service spécifié"
              )
            ) : (
              <div className="text-gray-500 text-sm">
                Aucune information de service disponible
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accessibilité */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => toggleSection('accessibility')}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-3 text-blue-500" />
            Accessibilité
          </h2>
          {expandedSections.accessibility ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.accessibility && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {smartData ? (
              renderPrioritySection(
                smartData.prioritizedData.accessibility,
                'Accessibilité',
                <Users className="w-5 h-5" />,
                "Aucune information d'accessibilité disponible"
              )
            ) : (
              <div className="text-gray-500 text-sm">
                Aucune information d'accessibilité disponible
              </div>
            )}
          </div>
        )}
      </div>


      {/* Services enfants */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => toggleSection('children')}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-3 text-pink-500" />
            Services enfants
          </h2>
          {expandedSections.children ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.children && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {smartData ? (
              renderPrioritySection(
                smartData.prioritizedData.children,
                'Services enfants',
                <Users className="w-5 h-5" />,
                "Aucun service enfant disponible"
              )
            ) : (
              <div className="text-gray-500 text-sm">
                Aucun service enfant disponible
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parking */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => toggleSection('parking')}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-3 text-gray-500" />
            Parking
          </h2>
          {expandedSections.parking ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.parking && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {smartData ? (
              renderPrioritySection(
                smartData.prioritizedData.parking,
                'Parking',
                <Car className="w-5 h-5" />,
                "Aucune information de parking disponible"
              )
            ) : (
              <div className="text-gray-500 text-sm">
                Aucune information de parking disponible
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact et réseaux sociaux */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => toggleSection('contact')}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Phone className="w-6 h-6 mr-3 text-purple-500" />
            Contact et réseaux sociaux
          </h2>
          {expandedSections.contact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.contact && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {establishment.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a href={`tel:${establishment.phone}`} className="text-blue-600 hover:text-blue-800">
                    {establishment.phone}
                  </a>
                </div>
              )}
              
              {establishment.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a 
                    href={establishment.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {cleanUrlForDisplay(establishment.website)}
                  </a>
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="flex flex-wrap gap-4">
              {establishment.instagram && (
                <a 
                  href={establishment.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-pink-600 hover:text-pink-800"
                >
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
              )}
              
              {establishment.facebook && (
                <a 
                  href={establishment.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
              )}
              
              {establishment.tiktok && (
                <a 
                  href={establishment.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-black hover:text-gray-800"
                >
                  <Music className="w-5 h-5" />
                  <span>TikTok</span>
                </a>
              )}
              
              {establishment.youtube && (
                <a 
                  href={establishment.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                >
                  <Youtube className="w-5 h-5" />
                  <span>YouTube</span>
                </a>
              )}
            </div>

            {/* Liens externes */}
            {(establishment.theForkLink || establishment.uberEatsLink) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Réservations et commandes</h3>
                <div className="flex flex-wrap gap-4">
                  {establishment.theForkLink && (
                    <a 
                      href={establishment.theForkLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-orange-600 hover:text-orange-800"
                    >
                      <Utensils className="w-5 h-5" />
                      <span>TheFork</span>
                    </a>
                  )}
                  
                  {establishment.uberEatsLink && (
                    <a 
                      href={establishment.uberEatsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-black hover:text-gray-800"
                    >
                      <Car className="w-5 h-5" />
                      <span>Uber Eats</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horaires d'ouverture */}
      {establishment.hours && Object.keys(establishment.hours).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-indigo-500" />
            Horaires d'ouverture
          </h2>
          <div className="space-y-2">
            {Object.entries(establishment.hours).map(([day, schedule]) => (
              <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium text-gray-900 capitalize">
                  {day === 'monday' ? 'Lundi' :
                   day === 'tuesday' ? 'Mardi' :
                   day === 'wednesday' ? 'Mercredi' :
                   day === 'thursday' ? 'Jeudi' :
                   day === 'friday' ? 'Vendredi' :
                   day === 'saturday' ? 'Samedi' :
                   day === 'sunday' ? 'Dimanche' : day}
                </span>
                <span className="text-gray-600">
                  {schedule.isOpen ? 
                    schedule.slots.map(slot => `${slot.open} - ${slot.close}`).join(', ') :
                    'Fermé'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
