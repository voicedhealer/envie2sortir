'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Euro, MapPin } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  imageUrl?: string;
  location?: string;
}

interface EstablishmentEventsProps {
  establishmentId: string;
  establishmentSlug: string;
}

export default function EstablishmentEvents({ establishmentId, establishmentSlug }: EstablishmentEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [establishmentSlug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="events-section">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 text-orange-500 mr-2" />
          Événements à venir
        </h3>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null; // Ne pas afficher la section s'il n'y a pas d'événements
  }

  return (
    <div className="events-section">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 text-orange-500 mr-2" />
        Événements à venir
      </h3>
      
      <div className="space-y-4">
        {events.slice(0, 3).map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-image">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Calendar className="w-8 h-8" />
              )}
            </div>
            
            <div className="event-info">
              <h4>{event.title}</h4>
              <p className="event-date">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatDate(event.startDate)} à {formatTime(event.startDate)}
              </p>
              {event.location && (
                <p className="text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {event.location}
                </p>
              )}
              {event.price && (
                <p className="event-price">
                  <Euro className="w-4 h-4 inline mr-1" />
                  {event.price}€
                </p>
              )}
            </div>
            
            <button className="event-cta">
              Événement à venir
            </button>
          </div>
        ))}
      </div>

      {events.length > 3 && (
        <div className="mt-4 text-center">
          <button className="action-btn">
            Voir tous les événements ({events.length})
          </button>
        </div>
      )}
    </div>
  );
}
