'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import AddToCalendar from './AddToCalendar';
import { getEstablishmentInfo } from '../lib/calendar-utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  modality?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  maxCapacity?: number;
  imageUrl?: string;
}

interface EventsTimelineProps {
  establishmentSlug: string;
  maxEvents?: number;
}

// Couleurs pour les barres d'événements
const eventColors = [
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-blue-400 to-cyan-500',
  'from-pink-400 to-rose-500',
  'from-orange-400 to-amber-500',
  'from-indigo-400 to-purple-500',
  'from-teal-400 to-green-500',
  'from-red-400 to-pink-500'
];

export default function EventsTimeline({ 
  establishmentSlug, 
  maxEvents = 5 
}: EventsTimelineProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [establishmentInfo, setEstablishmentInfo] = useState<{
    name: string;
    address: string;
    city: string;
    postalCode: string;
  } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!establishmentSlug) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events`);
        
        if (!response.ok) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const allEvents = data.events || [];
        
        // Filtrer les événements à venir et les trier par date
        const upcomingEvents = allEvents
          .filter((event: Event) => new Date(event.startDate) > new Date())
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxEvents);

        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [establishmentSlug, maxEvents]);

  // Charger les informations de l'établissement
  useEffect(() => {
    const loadEstablishmentInfo = async () => {
      if (establishmentSlug) {
        const info = await getEstablishmentInfo(establishmentSlug);
        setEstablishmentInfo(info);
      }
    };

    loadEstablishmentInfo();
  }, [establishmentSlug]);

  // Formater la date courte (ex: "04/10")
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Formater le titre court
  const formatShortTitle = (title: string) => {
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Prochains événements</h3>
      </div>
      
      <div className="space-y-3">
        {events.map((event, index) => {
          const colorClass = eventColors[index % eventColors.length];
          const shortDate = formatShortDate(event.startDate);
          const shortTitle = formatShortTitle(event.title);
          
          return (
            <div key={event.id} className="group">
              <div className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${colorClass} text-white hover:shadow-md transition-all duration-200 cursor-pointer`}>
                {/* Icône de citrouille (Halloween theme) */}
                <div className="text-2xl">🎃</div>
                
                {/* Date courte */}
                <div className="text-sm font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                  {shortDate}
                </div>
                
                {/* Titre de l'événement */}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{shortTitle}</h4>
                  {event.modality && (
                    <p className="text-xs opacity-80 italic">{event.modality}</p>
                  )}
                  <p className="text-xs opacity-90">
                    {new Date(event.startDate).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {/* Badge spécial si nécessaire */}
                {event.title.toLowerCase().includes('nostalgie') && (
                  <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-bold">
                    NOSTALGIE
                  </div>
                )}
              </div>
              
              {/* Bouton d'ajout au calendrier (apparaît au hover) */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <AddToCalendar
                  event={{
                    title: event.title,
                    description: event.description || undefined,
                    startDate: event.startDate,
                    endDate: event.endDate || undefined,
                    location: establishmentInfo ? 
                      `${establishmentInfo.address}, ${establishmentInfo.postalCode} ${establishmentInfo.city}` : 
                      undefined
                  }}
                  establishmentName={establishmentInfo?.name}
                  className="w-full"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {events.length >= maxEvents && (
        <div className="mt-4 text-center">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Voir tous les événements ({events.length})
          </button>
        </div>
      )}
    </div>
  );
}
