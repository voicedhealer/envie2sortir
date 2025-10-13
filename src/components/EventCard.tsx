'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import ImageModal from './ImageModal';
import EventEngagementGauge from './EventEngagementGauge';
import EventEngagementButtons from './EventEngagementButtons';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate?: string | null;
    price?: number | null;
    maxCapacity?: number | null;
    imageUrl?: string | null;
    location?: string;
    modality?: string;
    establishmentId?: string;
  };
  establishment?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  } | null;
  isUpcoming?: boolean;
}

// DEPRECATED: Ce composant est remplacé par EventCardNew
export default function EventCard({ event, establishment, isUpcoming = true }: EventCardProps) {
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données d'engagement au montage
  useEffect(() => {
    fetchEngagementData();
  }, [event.id]);

  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/engage`);
      if (response.ok) {
        const data = await response.json();
        setEngagementData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEngagementUpdate = (data: any) => {
    setEngagementData(data);
  };
  // Formater la date et l'heure
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Aujourd'hui • ${time}`;
    } else if (isTomorrow) {
      return `Demain • ${time}`;
    } else {
      return `${dayName} ${dayNumber} ${monthName} ${year} • ${time}`;
    }
  };

  // Formater le prix
  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return `${price}€`;
  };

  // Tronquer la description si nécessaire
  const truncateDescription = (description: string | null, maxLength: number = 80) => {
    if (!description) return '';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  };

  return (
    <div className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex h-40">
        {/* Image à gauche */}
        <div className="w-24 h-40 flex-shrink-0">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
              onClick={() => setModalImage({ url: event.imageUrl!, title: event.title })}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          )}
        </div>

        {/* Contenu central avec boutons intégrés */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* Header avec icône calendrier */}
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">
              {isUpcoming ? 'Événement à venir' : 'Événement en cours'}
            </span>
          </div>

          {/* Titre de l'événement */}
          <h3 className="text-sm font-bold text-gray-800 mb-1 leading-tight line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-xs text-gray-600 mb-1 leading-relaxed line-clamp-1">
              {truncateDescription(event.description, 35)}
            </p>
          )}

          {/* Date/heure et prix */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1 text-xs text-gray-700">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="font-medium">
                {formatEventDate(event.startDate)}
              </span>
            </div>
            {event.price && (
              <div className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                {formatPrice(event.price)}
              </div>
            )}
          </div>

          {/* Boutons d'engagement intégrés - plus fins et élégants */}
          {!loading && engagementData && (
            <EventEngagementButtons
              eventId={event.id}
              stats={engagementData.stats || {
                envie: 0,
                'grande-envie': 0,
                decouvrir: 0,
                'pas-envie': 0
              }}
              userEngagement={engagementData.userEngagement}
              onEngagementUpdate={handleEngagementUpdate}
              isInline={true}
            />
          )}
        </div>

        {/* Barre d'envie verticale à droite - prend toute la hauteur */}
        {!loading && engagementData && (
          <div className="w-16 flex flex-col items-center justify-center p-2 border-l border-yellow-200 h-full">
            <EventEngagementGauge
              percentage={engagementData.gaugePercentage || 0}
              eventBadge={engagementData.eventBadge}
              isVertical={true}
            />
          </div>
        )}
      </div>

      {/* Modal d'image */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          alt={modalImage.title}
          title={modalImage.title}
        />
      )}
    </div>
  );
}
