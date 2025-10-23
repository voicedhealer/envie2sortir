"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCalendar from './AddToCalendar';
import { getEstablishmentInfo } from '../lib/calendar-utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  modality: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  price: number | null;
  maxCapacity: number | null;
  status?: 'ongoing' | 'upcoming';
}

interface EventsSectionProps {
  establishmentId: string;
  establishmentSlug: string;
}

export default function EventsSection({ establishmentId, establishmentSlug }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [establishmentInfo, setEstablishmentInfo] = useState<{
    name: string;
    address: string;
    city: string;
    postalCode: string;
  } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events?t=${Date.now()}`);
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

  // Charger les informations de l'établissement pour enrichir les événements
  useEffect(() => {
    const loadEstablishmentInfo = async () => {
      if (establishmentSlug) {
        const info = await getEstablishmentInfo(establishmentSlug);
        setEstablishmentInfo(info);
      }
    };

    loadEstablishmentInfo();
  }, [establishmentSlug]);

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les événements selon leur statut (utiliser le champ status de l'API)
  console.log('🔍 [EventsSection] Tous les événements reçus:', events);
  events.forEach((event, index) => {
    console.log(`🔍 [EventsSection] Événement ${index + 1}:`, {
      title: event.title,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate
    });
  });

  const ongoingEvents = events.filter(event => {
    const isOngoing = event.status === 'ongoing';
    console.log(`🔍 [EventsSection] Événement "${event.title}" - status: ${event.status} - isOngoing: ${isOngoing}`);
    return isOngoing;
  });
  
  const upcomingEvents = events.filter(event => {
    const isUpcoming = event.status === 'upcoming';
    console.log(`🔍 [EventsSection] Événement "${event.title}" - status: ${event.status} - isUpcoming: ${isUpcoming}`);
    return isUpcoming;
  }).slice(0, 3); // Afficher seulement les 3 prochains

  console.log('🔍 [EventsSection] Résultats du filtrage:', {
    totalEvents: events.length,
    ongoingEvents: ongoingEvents.length,
    upcomingEvents: upcomingEvents.length,
    ongoingTitles: ongoingEvents.map(e => e.title),
    upcomingTitles: upcomingEvents.map(e => e.title)
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (ongoingEvents.length === 0 && upcomingEvents.length === 0) {
    return null; // Ne pas afficher la section s'il n'y a pas d'événements
  }

  return (
    <div className="space-y-6">
      {/* Section Événements en cours */}
      {ongoingEvents.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Événements en cours
            </h3>
            <span className="text-sm text-gray-500">
              {ongoingEvents.length} événement{ongoingEvents.length > 1 ? 's' : ''} en cours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingEvents.map((event) => (
              <div key={event.id} className="border border-green-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-green-50">
                {event.imageUrl && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      En cours
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h4>
                  
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  
                  {event.modality && (
                    <p className="text-xs text-gray-500 mb-3 italic line-clamp-2">
                      {event.modality}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">Début:</span>
                      <span className="ml-2">{formatDate(event.startDate)}</span>
                    </div>
                    {event.endDate && (
                      <div className="flex items-center">
                        <span className="font-medium">Fin:</span>
                        <span className="ml-2">{formatDate(event.endDate)}</span>
                      </div>
                    )}
                    {event.price && (
                      <div className="flex items-center">
                        <span className="font-medium">Prix:</span>
                        <span className="ml-2">{event.price}€</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Événements à venir */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Événements à venir
            </h3>
            <Link
              href={`/etablissements/${establishmentSlug}/evenements`}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Voir tous les événements
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {event.imageUrl && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {event.title}
              </h4>
              
              {event.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {event.description}
                </p>
              )}
              
              {event.modality && (
                <p className="text-xs text-gray-500 mb-3 italic line-clamp-2">
                  {event.modality}
                </p>
              )}
              
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(event.startDate)}
                </div>
                
                {event.endDate && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fin: {formatDate(event.endDate)}
                  </div>
                )}
                
                {event.price && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {event.price}€
                  </div>
                )}
                
                {event.maxCapacity && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.maxCapacity} places
                  </div>
                )}
              </div>

              {/* Bouton d'ajout au calendrier */}
              <div className="mt-4 pt-4 border-t border-gray-200">
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
          </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
