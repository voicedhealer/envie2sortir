'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import EventCard from './EventCard';
import { formatEventDate, isEventInProgress, isEventUpcoming } from '../lib/date-utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate?: string | null;
  price?: number | null;
  maxCapacity?: number | null;
}

interface UpcomingEventsSectionProps {
  establishmentSlug: string;
  maxEvents?: number;
}

export default function UpcomingEventsSection({ 
  establishmentSlug, 
  maxEvents = 3 
}: UpcomingEventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Établissement non trouvé ou non disponible
            setEvents([]);
            setLoading(false);
            return;
          }
          throw new Error('Erreur lors du chargement des événements');
        }

        const data = await response.json();
        const allEvents = data.events || [];
        
        // Séparer les événements en cours et à venir avec gestion du fuseau horaire
        const currentEvents = allEvents
          .filter((event: Event) => isEventInProgress(event.startDate, event.endDate))
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const upcomingEvents = allEvents
          .filter((event: Event) => isEventUpcoming(event.startDate))
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxEvents);

        // Combiner les événements en cours (priorité) + événements à venir
        setEvents([...currentEvents, ...upcomingEvents]);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [establishmentSlug, maxEvents]);

  // Ne pas afficher la section s'il n'y a pas d'événements
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500">
          Chargement des événements...
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erreur lors du chargement des événements:', error);
    return null;
  }

  if (events.length === 0) {
    console.log('Aucun événement à venir trouvé');
    return null; // Ne pas afficher la section s'il n'y a pas d'événements
  }

  console.log('Événements trouvés:', events.length, events);

  // Séparer les événements en cours et à venir pour l'affichage
  const currentEvents = events.filter((event) => isEventInProgress(event.startDate, event.endDate));
  const upcomingEvents = events.filter((event) => isEventUpcoming(event.startDate));

  return (
    <div className="space-y-6">
      {/* Section Événements en cours */}
      {currentEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Événements en cours
              </h2>
              <p className="text-sm text-green-600 font-medium">
                {currentEvents.length} événement{currentEvents.length > 1 ? 's' : ''} en cours
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentEvents.map((event) => (
              <div key={event.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        En cours
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          Début: {formatEventDate(event.startDate)}
                        </span>
                      </div>
                      
                      {event.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            Fin: {formatEventDate(event.endDate)}
                          </span>
                        </div>
                      )}

                      {event.price && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {event.price}€
                        </div>
                      )}

                      {event.maxCapacity && (
                        <div className="text-gray-500">
                          Capacité: {event.maxCapacity} places
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Événements à venir */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Événements à venir
              </h2>
              <p className="text-sm text-gray-500">
                {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''} programmé{upcomingEvents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        À venir
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          Début: {formatEventDate(event.startDate)}
                        </span>
                      </div>
                      
                      {event.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            Fin: {formatEventDate(event.endDate)}
                          </span>
                        </div>
                      )}

                      {event.price && (
                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {event.price}€
                        </div>
                      )}

                      {event.maxCapacity && (
                        <div className="text-gray-500">
                          Capacité: {event.maxCapacity} places
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lien "Voir tous les événements" si plus d'événements */}
      {events.length >= maxEvents && (
        <div className="text-center">
          <button className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors mx-auto">
            Voir tous les événements
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
