'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Euro, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { isEventInProgress } from '@/lib/date-utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  maxCapacity?: number;
  isRecurring: boolean;
  modality?: string;
  establishmentId: string;
  establishment: {
    id: string;
    name: string;
    slug: string;
    city?: string;
    address: string;
  };
  engagementScore: number;
  engagementCount: number;
}

type FilterType = 'all' | 'today' | 'week';

export default function EventsCarousel() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, allEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/upcoming');
      if (response.ok) {
        const data = await response.json();
        setAllEvents(data.events || []);
        setTrendingEvents(data.trending || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    const now = new Date();
    
    if (filter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      
      const todayEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= todayStart && eventDate <= todayEnd;
      });
      setFilteredEvents(todayEvents);
    } else if (filter === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate <= weekEnd;
      });
      setFilteredEvents(weekEvents);
    } else {
      setFilteredEvents(allEvents);
    }
  };

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('events-scroll-container');
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Demain • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Compter les événements en cours (seulement côté client)
  const liveEventsCount = isMounted ? filteredEvents.filter(e => 
    isEventInProgress(e.startDate, e.endDate)
  ).length : 0;

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  // Toujours afficher la section, même sans événements

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête avec filtres */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              🎉 Événements à venir
            </h2>
            {/* Compteur d'événements en cours */}
            {isMounted && liveEventsCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                {liveEventsCount} EN DIRECT
              </div>
            )}
          </div>

          {/* Filtres rapides */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'today'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'week'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Découvrez vos futurs événements ici
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              {filter === 'today' 
                ? 'Aucun événement aujourd\'hui, mais de belles surprises vous attendent !'
                : filter === 'week' 
                ? 'Cette semaine est calme, mais la semaine prochaine sera animée !'
                : 'Les professionnels préparent de superbes événements pour vous. Revenez bientôt !'
              }
            </p>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Voir tous les événements
                </button>
              )}
              
              <a 
                href="/etablissements/nouveau" 
                className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all font-medium"
              >
                Ajoutez mon établissement et créez un événement
              </a>
            </div>


          </div>
        ) : (
          <>
            {/* Carrousel avec boutons de navigation */}
            <div className="relative group">
              {/* Bouton gauche */}
              <button
                onClick={() => scrollContainer('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>

              {/* Container scrollable */}
              <div 
                id="events-scroll-container"
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6 pb-4">
                  {filteredEvents.map((event) => {
                const isLive = isMounted ? isEventInProgress(event.startDate, event.endDate) : false;
                const isTrending = trendingEvents.some(t => t.id === event.id);

                    return (
                      <Link
                        key={event.id}
                        href={`/etablissements/${event.establishment.slug}?event=${event.id}`}
                        className="flex-none w-80 group/card"
                      >
                        <div className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                          
                          {/* Image de l'événement */}
                          <div className="relative h-44 bg-gradient-to-br from-purple-400 to-pink-400">
                            {event.imageUrl ? (
                              <img 
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">🎪</span>
                              </div>
                            )}
                            
                            {/* Badge LIVE avec animation */}
                            {isLive && (
                              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full font-bold text-sm shadow-lg">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                                LIVE
                              </div>
                            )}

                            {/* Badge Trending */}
                            {!isLive && isTrending && event.engagementScore > 5 && (
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-bold text-sm shadow-lg">
                                <Flame className="w-4 h-4" />
                                TENDANCE
                              </div>
                            )}

                            {/* Date calendrier */}
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl p-2 text-center min-w-[3rem]">
                              <div className="text-white text-lg font-bold leading-none">
                                {new Date(event.startDate).getDate()}
                              </div>
                              <div className="text-white/80 text-xs uppercase mt-0.5">
                                {new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
                              </div>
                            </div>

                            {/* Badge récurrent */}
                            {event.isRecurring && (
                              <div className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                Récurrent
                              </div>
                            )}
                          </div>

                          {/* Contenu */}
                          <div className="p-4">
                            {/* Titre de l'événement */}
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover/card:text-orange-600 transition-colors">
                              {event.title}
                            </h3>

                            {/* Description */}
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {/* Établissement */}
                            <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-700 line-clamp-1">{event.establishment.name}</div>
                                <div className="text-xs line-clamp-1">{event.establishment.city}</div>
                              </div>
                            </div>

                            {/* Heure, prix et capacité */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Clock className="w-4 h-4" />
                                {new Date(event.startDate).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              
                              {event.price !== null && event.price !== undefined ? (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${
                                  event.price === 0 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                }`}>
                                  {event.price === 0 ? (
                                    'Gratuit'
                                  ) : (
                                    <>
                                      <Euro className="w-3 h-3" />
                                      {event.price}€
                                    </>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            {/* Modalité et capacité */}
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              {event.modality && (
                                <span className="capitalize">{event.modality}</span>
                              )}
                              {event.maxCapacity && (
                                <span>{event.maxCapacity} places max</span>
                              )}
                            </div>

                            {/* Score d'engagement (visible uniquement si > 0) */}
                            {event.engagementCount > 0 && (
                              <div className="mt-2 text-xs text-gray-400">
                                {event.engagementCount} {event.engagementCount === 1 ? 'personne intéressée' : 'personnes intéressées'}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bouton droit */}
              <button
                onClick={() => scrollContainer('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                aria-label="Suivant"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            {/* Lien "Voir tous les événements" */}
            <div className="mt-8 text-center">
              <Link 
                href="/evenements" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Voir tous les événements
                <span className="text-lg">→</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Styles pour masquer la scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

