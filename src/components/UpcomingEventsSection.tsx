'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import EventCard from './EventCard';
import ImageModal from './ImageModal';
import AddToCalendar from './AddToCalendar';
import { formatEventDate, isEventInProgress, isEventUpcoming } from '../lib/date-utils';
import { getEstablishmentInfo } from '../lib/calendar-utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate?: string | null;
  price?: number | null;
  maxCapacity?: number | null;
  imageUrl?: string | null;
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
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [establishmentInfo, setEstablishmentInfo] = useState<{
    name: string;
    address: string;
    city: string;
    postalCode: string;
  } | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!establishmentSlug) {
        console.log('⚠️ Aucun slug d\'établissement fourni');
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Chargement des événements pour:', establishmentSlug);
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events`);
        
        if (!response.ok) {
          console.log('❌ Erreur API événements:', response.status, response.statusText);
          if (response.status === 404) {
            // Établissement non trouvé ou non disponible
            console.log('📝 Établissement non trouvé, pas d\'événements');
            setEvents([]);
            setLoading(false);
            return;
          }
          // Pour les autres erreurs, ne pas lancer d'exception, juste logger
          console.warn('⚠️ Erreur lors du chargement des événements:', response.status);
          setEvents([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('📊 Données reçues:', data);
        const allEvents = data.events || [];
        console.log('📅 Événements trouvés:', allEvents.length);
        
        // 🔧 CORRECTION: Filtrer SEULEMENT les événements à venir (pas les événements passés ou en cours)
        const upcomingEvents = allEvents
          .filter((event: Event) => isEventUpcoming(event.startDate))
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxEvents);

        console.log('🎯 Événements à venir:', upcomingEvents.length);
        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setEvents([]); // S'assurer que events est un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [establishmentSlug, maxEvents]);

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

  console.log('Événements à venir trouvés:', events.length, events);

  return (
    <div className="space-y-6">
      {/* Section Événements à venir - SEULEMENT les événements futurs */}
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
              {events.length} événement{events.length > 1 ? 's' : ''} programmé{events.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Afficher seulement le premier événement (le plus proche) */}
        {events.length > 0 && (
          <div className="space-y-4">
            {(() => {
              const mainEvent = events[0]; // Premier événement (le plus proche)
              return (
                <div key={mainEvent.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 shadow-sm">
                  <div className="flex">
                    {/* Image à gauche */}
                    <div className="w-32 sm:w-40 h-40 sm:h-48 flex-shrink-0">
                      {mainEvent.imageUrl ? (
                        <img
                          src={mainEvent.imageUrl}
                          alt={mainEvent.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200 rounded-l-lg"
                          onClick={() => setModalImage({ url: mainEvent.imageUrl!, title: mainEvent.title })}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center rounded-l-lg">
                          <Calendar className="w-8 h-8 text-amber-600" />
                        </div>
                      )}
                    </div>

                    {/* Contenu à droite */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{mainEvent.title}</h3>
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                              À venir
                            </span>
                          </div>
                          
                          {mainEvent.description && (
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {mainEvent.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                Début: {formatEventDate(mainEvent.startDate)}
                              </span>
                            </div>
                            
                            {mainEvent.endDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  Fin: {formatEventDate(mainEvent.endDate)}
                                </span>
                              </div>
                            )}

                            {mainEvent.price && (
                              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {mainEvent.price}€
                              </div>
                            )}

                            {mainEvent.maxCapacity && (
                              <div className="text-gray-500">
                                Capacité: {mainEvent.maxCapacity} places
                              </div>
                            )}
                          </div>

                          {/* Bouton d'ajout au calendrier */}
                          <div className="mt-4 pt-4 border-t border-amber-200 relative z-10">
                            <AddToCalendar
                              event={{
                                title: mainEvent.title,
                                description: mainEvent.description || undefined,
                                startDate: mainEvent.startDate,
                                endDate: mainEvent.endDate || undefined,
                                location: establishmentInfo ? 
                                  `${establishmentInfo.address}, ${establishmentInfo.postalCode} ${establishmentInfo.city}` : 
                                  undefined
                              }}
                              establishmentName={establishmentInfo?.name}
                              className="w-full sm:w-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* Lien "Voir tous les événements" si plus d'événements */}
      {events.length >= maxEvents && (
        <div className="text-center">
          <button className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors mx-auto">
            Voir tous les événements
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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