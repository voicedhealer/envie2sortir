'use client';

import { Calendar, Clock } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate?: string | null;
    price?: number | null;
    maxCapacity?: number | null;
  };
  isUpcoming?: boolean;
}

export default function EventCard({ event, isUpcoming = true }: EventCardProps) {
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
    <div className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-5 shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-200">
      {/* Header avec icône calendrier et "Événement à venir" */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">
            {isUpcoming ? 'Événement à venir' : 'Événement en cours'}
          </span>
        </div>
      </div>

      {/* Titre de l'événement */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 leading-tight">
        {event.title}
      </h3>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {truncateDescription(event.description)}
        </p>
      )}

      {/* Footer avec date/heure et prix */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Date et heure */}
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-medium">
            {formatEventDate(event.startDate)}
          </span>
        </div>

        {/* Prix */}
        {event.price && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold self-start sm:self-auto">
            {formatPrice(event.price)}
          </div>
        )}
      </div>

      {/* Capacité si disponible */}
      {event.maxCapacity && (
        <div className="mt-2 text-xs text-gray-500">
          Capacité: {event.maxCapacity} places
        </div>
      )}
    </div>
  );
}
