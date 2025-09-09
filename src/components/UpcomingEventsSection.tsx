'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import EventCard from './EventCard';

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
        
        // Filtrer les événements à venir (startDate >= aujourd'hui)
        const now = new Date();
        const upcomingEvents = allEvents
          .filter((event: Event) => new Date(event.startDate) >= now)
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxEvents);

        setEvents(upcomingEvents);
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
      {/* Titre de la section - Plus visible */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Calendar className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Événements à venir
          </h2>
          {events.length > maxEvents && (
            <p className="text-sm text-gray-500">
              {events.length} événements programmés
            </p>
          )}
        </div>
      </div>

      {/* Liste des événements */}
      <div className="space-y-3">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            isUpcoming={true}
          />
        ))}
      </div>

      {/* Lien "Voir tous les événements" si plus d'événements */}
      {events.length >= maxEvents && (
        <div className="pt-2">
          <button className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
            Voir tous les événements
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
