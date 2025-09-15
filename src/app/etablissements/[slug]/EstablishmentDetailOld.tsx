'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EstablishmentHero from '@/components/EstablishmentHero';
import EstablishmentInfo from '@/components/EstablishmentInfo';
import EstablishmentSections from '@/components/EstablishmentSections';
import EstablishmentActions from '@/components/EstablishmentActions';
import EventsSection from '@/components/EventsSection';
import MapComponent from '@/app/carte/map-component';

// Types pour les données
interface HoursData {
  [key: string]: {
    isOpen: boolean;
    slots: Array<{
      name: string;
      open: string;
      close: string;
    }>;
  };
}

interface Establishment {
  id: string;
  slug: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  activities?: any;
  services?: any;
  ambiance?: any;
  horairesOuverture?: HoursData;
  prixMoyen?: number;
  capaciteMax?: number;
  accessibilite?: boolean;
  parking?: boolean;
  terrasse?: boolean;
  status: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface EstablishmentDetailProps {
  establishment: Establishment;
  isDashboard?: boolean;
}

// Composant pour afficher les horaires de manière intelligente
const IntelligentHoursDisplay = ({ hours }: { hours?: HoursData }) => {
  if (!hours || Object.keys(hours).length === 0) {
    return <span className="text-gray-500">Horaires non définis</span>;
  }

  // Vérifier si c'est un créneau continu
  const isContinuousService = () => {
    const openDays = Object.entries(hours).filter(([_, dayData]) => dayData.isOpen);
    if (openDays.length === 0) return false;
    
    // Vérifier si tous les jours ont le même créneau
    const firstDay = openDays[0][1];
    if (firstDay.slots.length !== 1) return false;
    
    const firstSlot = firstDay.slots[0];
    return openDays.every(([_, dayData]) => {
      if (dayData.slots.length !== 1) return false;
      const slot = dayData.slots[0];
      return slot.open === firstSlot.open && slot.close === firstSlot.close;
    });
  };

  // Vérifier si c'est un créneau midi/semaine
  const isLunchWeekendPattern = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekends = ['saturday', 'sunday'];
    
    const weekdaysOpen = weekdays.every(day => hours[day]?.isOpen);
    const weekendsOpen = weekends.every(day => hours[day]?.isOpen);
    
    if (!weekdaysOpen || !weekendsOpen) return false;
    
    // Vérifier si les weekdays ont le même créneau
    const firstWeekday = hours[weekdays[0]];
    if (firstWeekday.slots.length !== 1) return false;
    
    return weekdays.every(day => {
      const dayData = hours[day];
      if (dayData.slots.length !== 1) return false;
      const slot = dayData.slots[0];
      return slot.open === firstWeekday.slots[0].open && 
             slot.close === firstWeekday.slots[0].close;
    });
  };

  if (isContinuousService()) {
    const firstDay = Object.entries(hours).find(([_, dayData]) => dayData.isOpen);
    if (firstDay) {
      const slot = firstDay[1].slots[0];
      return (
        <div className="space-y-2">
          <span className="font-medium text-green-600">Service continu</span>
          <p className="text-sm text-gray-600">
            {slot.open} - {slot.close} (tous les jours)
          </p>
        </div>
      );
    }
  }

  if (isLunchWeekendPattern()) {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekends = ['saturday', 'sunday'];
    
    const weekdaySlot = hours[weekdays[0]].slots[0];
    const weekendSlot = hours[weekends[0]].slots[0];
    
    return (
      <div className="space-y-2">
        <div>
          <span className="font-medium text-blue-600">Semaine :</span>
          <p className="text-sm text-gray-600">
            {weekdaySlot.open} - {weekdaySlot.close}
          </p>
        </div>
        <div>
          <span className="font-medium text-purple-600">Week-end :</span>
          <p className="text-sm text-gray-600">
            {weekendSlot.open} - {weekendSlot.close}
          </p>
        </div>
      </div>
    );
  }

  // Affichage détaillé par jour
  const daysLabels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  return (
    <div className="space-y-2">
      {Object.entries(hours).map(([dayKey, dayData]) => {
        if (!dayData.isOpen) return null;
        
        const dayLabel = daysLabels[dayKey as keyof typeof daysLabels] || dayKey;
        return (
          <div key={dayKey} className="flex justify-between items-center">
            <span className="font-medium text-gray-700">{dayLabel}</span>
            <span className="text-sm text-gray-600">
              {dayData.slots.map(slot => 
                `${slot.name || 'Service'} ${slot.open}-${slot.close}`
              ).join(', ')}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Composant pour la carte simple avec OpenStreetMap
const EstablishmentMap = ({ latitude, longitude, name }: { 
  latitude?: number; 
  longitude?: number; 
  name: string; 
}) => {
  if (!latitude || !longitude) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Coordonnées non disponibles</p>
          <p className="text-sm text-gray-400">La géolocalisation n'a pas été effectuée</p>
        </div>
      </div>
    );
  }

  // URL OpenStreetMap avec marqueur
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="relative">
      {/* Carte principale */}
      <div className="h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          title={`Carte de ${name}`}
          className="rounded-lg"
        />
      </div>
      
      {/* Attribution en bas à droite */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
        © OpenStreetMap
      </div>
      
      {/* Bouton pour ouvrir dans une nouvelle fenêtre */}
      <div className="absolute top-2 right-2">
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm hover:bg-opacity-100 transition-all"
        >
          Ouvrir dans OpenStreetMap
        </a>
      </div>
    </div>
  );
};

// Composant principal
export default function EstablishmentDetail({ establishment, isDashboard = false }: EstablishmentDetailProps) {
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [socialsForm, setSocialsForm] = useState({
    website: establishment.website || '',
    instagram: establishment.instagram || '',
    facebook: establishment.facebook || '',
    tiktok: establishment.tiktok || ''
  });

  const handleSocialsUpdate = async () => {
    try {
      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialsForm)
      });

      if (response.ok) {
        setIsEditingSocials(false);
        // Optionnel : rafraîchir les données
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price?: number) => {
    if (!price) return 'Non renseigné';
    if (price <= 15) return '€ (Moins de 15€)';
    if (price <= 30) return '€€ (15€ - 30€)';
    if (price <= 60) return '€€€ (30€ - 60€)';
    return '€€€€ (Plus de 60€)';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et tarifs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            {establishment.prixMoyen && (
              <div className="flex items-center space-x-2 text-lg text-gray-700">
                <Euro className="w-5 h-5" />
                <span className="font-medium">{formatPrice(establishment.prixMoyen)}</span>
              </div>
            )}
          </div>
        </div>
        
        {establishment.description && (
          <p className="text-gray-600 leading-relaxed">
            {establishment.description}
          </p>
        )}
      </div>

      {/* Layout en deux colonnes */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activités proposées */}
          {establishment.activities && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                🎯 Activités proposées
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(establishment.activities) ? 
                  establishment.activities.map((activity: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {activity.replace(/_/g, ' ')}
                    </span>
                  )) : 
                  <span className="text-gray-500">Aucune activité définie</span>
                }
              </div>
            </div>
          )}

          {/* Services & Commodités */}
          {establishment.services && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                🔧 Services & Commodités
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(establishment.services) ? 
                  establishment.services.map((service: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {service}
                    </span>
                  )) : 
                  <span className="text-gray-500">Aucun service défini</span>
                }
              </div>
            </div>
          )}

          {/* Ambiance & Spécialités */}
          {establishment.ambiance && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                ✨ Ambiance & Spécialités
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(establishment.ambiance) ? 
                  establishment.ambiance.map((ambiance: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {ambiance}
                    </span>
                  )) : 
                  <span className="text-gray-500">Aucune ambiance définie</span>
                }
              </div>
            </div>
          )}

          {/* Horaires d'ouverture */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Horaires d'ouverture
            </h3>
            <IntelligentHoursDisplay hours={establishment.horairesOuverture} />
          </div>

          {/* Informations pratiques */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              ℹ️ Informations pratiques
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{establishment.address}</p>
                    {establishment.city && (
                      <p className="text-sm text-gray-600">
                        {establishment.postalCode} {establishment.city}
                      </p>
                    )}
                  </div>
                </div>
                
                {establishment.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{establishment.phone}</span>
                  </div>
                )}
                
                {establishment.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{establishment.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {establishment.capaciteMax && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">Capacité : {establishment.capaciteMax} personnes</span>
                  </div>
                )}
                
                {establishment.parking && (
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">Parking disponible</span>
                  </div>
                )}
                
                {establishment.accessibilite && (
                  <div className="flex items-center space-x-3">
                    <Accessibility className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">Accessible PMR</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Réseaux sociaux éditables */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                🌐 Réseaux sociaux
              </h3>
              {isDashboard && (
                <button
                  onClick={() => setIsEditingSocials(!isEditingSocials)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {isEditingSocials ? 'Annuler' : 'Modifier'}
                </button>
              )}
            </div>
            
            {isDashboard && isEditingSocials ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={socialsForm.website}
                    onChange={(e) => setSocialsForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={socialsForm.instagram}
                    onChange={(e) => setSocialsForm(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={socialsForm.facebook}
                    onChange={(e) => setSocialsForm(prev => ({ ...prev, facebook: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom de la page"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={socialsForm.tiktok}
                    onChange={(e) => setSocialsForm(prev => ({ ...prev, tiktok: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.tiktok.com/@votrepseudo"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSocialsUpdate}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setIsEditingSocials(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {establishment.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <a
                      href={establishment.website}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {establishment.website}
                    </a>
                  </div>
                )}
                
                {establishment.instagram && (
                  <div className="flex items-center space-x-3">
                    <Instagram className="w-5 h-5 text-gray-500" />
                    <a
                      href={establishment.instagram.startsWith('http') 
                        ? establishment.instagram 
                        : `https://instagram.com/${establishment.instagram}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {establishment.instagram}
                    </a>
                  </div>
                )}
                
                {establishment.facebook && (
                  <div className="flex items-center space-x-3">
                    <Facebook className="w-5 h-5 text-gray-500" />
                    <a
                      href={establishment.facebook.startsWith('http') 
                        ? establishment.facebook 
                        : `https://facebook.com/${establishment.facebook}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {establishment.facebook}
                    </a>
                  </div>
                )}
                
                {establishment.tiktok && (
                  <div className="flex items-center space-x-3">
                    <TikTokIcon className="w-5 h-5 text-gray-500" />
                    <a
                      href={establishment.tiktok}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      TikTok
                    </a>
                  </div>
                )}
                
                {!establishment.website && !establishment.instagram && !establishment.facebook && !establishment.tiktok && (
                  <p className="text-gray-500 text-sm">Aucun réseau social configuré</p>
                )}
              </div>
            )}
          </div>

          {/* Référent modifiable */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                👤 Référent
              </h3>
              {isDashboard && (
                <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Changer
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {establishment.owner.firstName} {establishment.owner.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{establishment.owner.email}</span>
              </div>
              
              {establishment.owner.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900">{establishment.owner.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Carte et Informations pratiques */}
        <div className="space-y-6">
          {/* Carte améliorée */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Localisation
              </h3>
            </div>
            
            <EstablishmentMap 
              latitude={establishment.latitude} 
              longitude={establishment.longitude} 
              name={establishment.name} 
            />
          </div>
        </div>
      </div>

      {/* Section Événements */}
      <div className="mt-8">
        <EventsSection 
          establishmentId={establishment.id} 
          establishmentSlug={establishment.slug} 
        />
      </div>
    </div>
  );
}
