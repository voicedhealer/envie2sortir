'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, MapPin, Euro, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { isEventInProgress, isEventHappeningToday } from '@/lib/date-utils';
import { useLocation } from '@/hooks/useLocation';
import { isWithinRadius } from '@/lib/geolocation-utils';

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
    latitude?: number;
    longitude?: number;
  };
  engagementScore: number;
  engagementCount: number;
  status?: 'ongoing' | 'upcoming';
}

type FilterType = 'all' | 'today' | 'week' | 'weekend';

export default function EventsCarousel() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [blurredButton, setBlurredButton] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // 📍 Hook de localisation
  const { currentCity, searchRadius, loading: locationLoading } = useLocation();

  // ✅ Calculer dynamiquement les événements en cours avec useMemo
  const liveEventsCount = useMemo(() => {
    return filteredEvents.filter(e => 
      e.status === 'ongoing'
    ).length;
  }, [filteredEvents]);

  useEffect(() => {
    // Petit délai pour éviter la surcharge au montage initial
    const timer = setTimeout(() => {
      fetchEvents();
    }, 50); // Très court mais suffisant pour décaler
    
    return () => clearTimeout(timer);
  }, []);

  const applyFilter = useCallback(() => {
    let events = allEvents;
    
    // 📍 FILTRE 1 : Par localisation
    if (currentCity && searchRadius) {
      events = events.filter(event => {
        const establishment = event.establishment;
        
        // Si l'établissement a des coordonnées GPS, utiliser le calcul de distance
        if (establishment.latitude && establishment.longitude) {
          return isWithinRadius(
            establishment.latitude,
            establishment.longitude,
            currentCity,
            searchRadius
          );
        }
        
        // Sinon, comparer par nom de ville
        return establishment.city?.toLowerCase() === currentCity.name.toLowerCase();
      });
    }
    
    // 🗓️ FILTRE 2 : Par période (temporel)
    const now = new Date();
    
    if (filter === 'today') {
      events = events.filter(event => {
        return isEventHappeningToday(event.startDate, event.endDate);
      });
    } else if (filter === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      events = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate <= weekEnd;
      });
    } else if (filter === 'weekend') {
      events = events.filter(event => {
        const eventDate = new Date(event.startDate);
        const dayOfWeek = eventDate.getDay();
        const hour = eventDate.getHours();
        const minutes = eventDate.getMinutes();
        
        // Vendredi à partir de 18h00
        if (dayOfWeek === 5 && (hour > 18 || (hour === 18 && minutes >= 0))) {
          return true;
        }
        // Samedi toute la journée
        if (dayOfWeek === 6) {
          return true;
        }
        // Dimanche jusqu'à 23h00 (excluant 23h30 et plus)
        if (dayOfWeek === 0 && hour < 23) {
          return true;
        }
        // Dimanche à 23h00 exactement
        if (dayOfWeek === 0 && hour === 23 && minutes === 0) {
          return true;
        }
        
        return false;
      });
    }
    
    // Limiter à 12 événements pour l'affichage
    setFilteredEvents(events.slice(0, 12));
  }, [allEvents, filter, currentCity, searchRadius]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/upcoming');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [EventsCarousel] Données reçues de l\'API:', data);
        console.log('🔍 [EventsCarousel] Premier événement:', data.events?.[0]);
        setAllEvents(data.events || []);
        setTrendingEvents(data.trending || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
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

  const handleMouseEnter = () => {
    // Annuler le timeout précédent s'il existe
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Réinitialiser l'effet blur
    setBlurredButton(null);
    
    // Programmer l'effet blur après 3 secondes
    const timeout = setTimeout(() => {
      setBlurredButton('both');
    }, 3000);
    
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Annuler le timeout et réinitialiser
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setBlurredButton(null);
  };

  // Formater la date de l'événement avec détection des événements récurrents
  const formatEventDate = (event: Event) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const now = new Date();
    
    // Calculer la durée en jours
    const durationInDays = endDate ? 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Détecter si c'est un événement récurrent (durée > 1 jour)
    const isRecurringEvent = durationInDays > 1;
    
    if (isRecurringEvent) {
      // Pour les événements récurrents, afficher la plage de dates + horaires
      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'short' });
      const endDay = endDate ? endDate.getDate() : startDay;
      const endMonth = endDate ? endDate.toLocaleDateString('fr-FR', { month: 'short' }) : startMonth;
      
      // Extraire les horaires
      const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const endTime = endDate ? endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : startTime;
      
      // Format compact pour les événements récurrents avec horaires
      let dateRange;
      if (startMonth === endMonth) {
        dateRange = `${startDay}-${endDay} ${startMonth.replace('.', '')}`;
      } else {
        dateRange = `${startDay} ${startMonth.replace('.', '')} - ${endDay} ${endMonth.replace('.', '')}`;
      }
      
      // Ajouter les horaires de manière compacte
      return `${dateRange} • ${startTime}-${endTime}`;
    } else {
      // Pour les événements ponctuels, utiliser le format original avec heure de fin
      const isToday = startDate.toDateString() === now.toDateString();
      const isTomorrow = startDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
      
      // Extraire l'heure de fin si disponible
      const endTime = endDate ? endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
      const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) {
        return endTime ? `Aujourd'hui • ${startTime}-${endTime}` : `Aujourd'hui • ${startTime}`;
      } else if (isTomorrow) {
        return endTime ? `Demain • ${startTime}-${endTime}` : `Demain • ${startTime}`;
      } else {
        const dayName = startDate.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNumber = startDate.getDate();
        const monthName = startDate.toLocaleDateString('fr-FR', { month: 'short' });
        return endTime ? `${dayName} ${dayNumber} ${monthName} • ${startTime}-${endTime}` : `${dayName} ${dayNumber} ${monthName} • ${startTime}`;
      }
    }
  };

  // Formater la date pour le badge (version compacte)
  const formatEventDateBadge = (event: Event) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    // Calculer la durée en jours
    const durationInDays = endDate ? 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Détecter si c'est un événement récurrent (durée > 1 jour)
    const isRecurringEvent = durationInDays > 1;
    
    if (isRecurringEvent) {
      // Pour les événements récurrents, afficher la plage de dates
      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'short' });
      const endDay = endDate ? endDate.getDate() : startDay;
      const endMonth = endDate ? endDate.toLocaleDateString('fr-FR', { month: 'short' }) : startMonth;
      
      if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${startMonth.replace('.', '')}`;
      } else {
        return `${startDay} ${startMonth.replace('.', '')} - ${endDay} ${endMonth.replace('.', '')}`;
      }
    } else {
      // Pour les événements ponctuels, afficher seulement la date de début
      return `${startDate.getDate()} ${startDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}`;
    }
  };

  if (loading || locationLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" style={{ minHeight: '500px' }}>
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                🎉 Événements à venir
              </h2>
              {/* Compteur d'événements en cours */}
              {liveEventsCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  {liveEventsCount} EN DIRECT
                </div>
              )}
            </div>
            {/* 📍 Indicateur de localisation */}
            {currentCity && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>
                  <span className="font-medium text-orange-600">{currentCity.name}</span>
                  {' • '}
                  <span className="text-gray-500">Rayon {searchRadius}km</span>
                  {' • '}
                  <span className="font-medium text-gray-900">{filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''}</span>
                </span>
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
              onClick={() => setFilter('weekend')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'weekend'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Week-end
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
                ? `Aucun événement aujourd'hui près de ${currentCity?.name || 'vous'}, mais de belles surprises vous attendent !`
                : filter === 'week' 
                ? `Cette semaine est calme près de ${currentCity?.name || 'vous'}, mais la semaine prochaine sera animée !`
                : filter === 'weekend'
                ? `Aucun événement ce week-end près de ${currentCity?.name || 'vous'}, mais les professionnels préparent de belles surprises !`
                : `Aucun événement trouvé près de ${currentCity?.name || 'vous'}. Les professionnels préparent de superbes événements pour vous !`
              }
            </p>
            {currentCity && (
              <p className="text-sm text-gray-500 mb-6">
                💡 Essayez d&apos;augmenter le rayon de recherche ou de changer de ville via le badge dans le header
              </p>
            )}
            
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
              
              <Link 
                href="/etablissements/nouveau" 
                className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all font-medium"
              >
                Ajoutez mon établissement et créez un événement
              </Link>
            </div>


          </div>
        ) : (
          <>
            {/* Carrousel avec boutons de navigation */}
            <div 
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Bouton gauche */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollContainer('left');
                }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto ${
                  blurredButton === 'both' 
                    ? 'bg-transparent' 
                    : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                }`}
                aria-label="Précédent"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>

              {/* Container scrollable */}
              <div 
                id="events-scroll-container"
                className="overflow-x-auto scrollbar-hide scroll-smooth pointer-events-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6 py-4 px-4 items-stretch">
                  {filteredEvents.map((event) => {
                const isLive = event.status === 'ongoing';
                const isTrending = trendingEvents.some(t => t.id === event.id);
                
                console.log('🔍 [EventsCarousel] Événement:', {
                  title: event.title,
                  status: event.status,
                  isLive,
                  startDate: event.startDate,
                  endDate: event.endDate,
                  badgeDate: formatEventDateBadge(event),
                  fullDate: formatEventDate(event)
                });

                    return (
                      <Link
                        key={event.id}
                        href={`/etablissements/${event.establishment.slug}`}
                        className="flex-none w-80 group/card block"
                      >
                        <div className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-[28rem]">
                          
                          {/* Image de l'événement - pleine hauteur */}
                          <div className="relative h-full bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden rounded-2xl">
                            {event.imageUrl ? (
                              <img 
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-500 rounded-2xl"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-2xl">
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

                            {/* Date badge - style translucide avec plage de dates */}
                            <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 text-center shadow-lg z-10">
                              <div className="text-lg font-bold text-black">
                                {formatEventDateBadge(event)}
                              </div>
                            </div>

                            {/* Titre minimal toujours visible - avec gradient */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                              <h3 className="text-white text-lg font-bold line-clamp-2">
                                {event.title}
                              </h3>
                            </div>

                            {/* Badge récurrent */}
                            {event.isRecurring && (
                              <div className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs rounded-full font-medium z-10">
                                Récurrent
                              </div>
                            )}

                          </div>

                          {/* Overlay au survol - animation qui monte depuis le bas de la carte */}
                          <div className="absolute inset-0 bg-black opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform translate-y-full group-hover/card:translate-y-0 rounded-2xl z-20">
                            <div className="absolute inset-0 p-6 text-white flex flex-col">
                              
                              {/* Titre de l'événement - en haut à gauche en orange */}
                              <h3 className="font-bold text-xl mb-3 line-clamp-2 text-orange-400">
                                {event.title}
                              </h3>

                              {/* Description */}
                              {event.description && (
                                <p className="text-sm text-white mb-4 line-clamp-3">
                                  {event.description}
                                </p>
                              )}

                              {/* Détails avec icônes */}
                              <div className="space-y-2 mb-4">
                                {/* Établissement */}
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <MapPin className="w-4 h-4 flex-shrink-0 text-orange-400" />
                                  <span>{event.establishment.name}, {event.establishment.city}</span>
                                </div>

                                {/* Heure avec plage de dates pour les événements multi-jours */}
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Clock className="w-4 h-4 flex-shrink-0 text-orange-400" />
                                  <span>{formatEventDate(event)}</span>
                                </div>

                                {/* Capacité */}
                                {event.maxCapacity && (
                                  <div className="flex items-center gap-2 text-sm text-white">
                                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                      </svg>
                                    </div>
                                    <span>{event.maxCapacity} max</span>
                                  </div>
                                )}
                              </div>

                              {/* Informations supplémentaires */}
                              <div className="text-xs text-gray-300 mb-auto">
                                {event.modality && (
                                  <div className="mb-1 capitalize">{event.modality}</div>
                                )}
                                {event.engagementCount > 0 && (
                                  <div className="mb-1">
                                    {event.engagementCount} {event.engagementCount === 1 ? 'personne intéressée' : 'personnes intéressées'}
                                  </div>
                                )}
                                <div className="text-gray-400">
                                  Sous réserve de réservation et de disponibilité.
                                </div>
                              </div>

                              {/* Prix et bouton en bas */}
                              <div className="flex items-center justify-between mt-4">
                                {/* Prix en bas à gauche */}
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
                                        {event.price}
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div></div>
                                )}

                                {/* Bouton "Voir détails" en bas à droite */}
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/etablissements/${event.establishment.slug}`;
                                  }}
                                  className="px-4 py-2 text-white hover:text-orange-400 transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                  Voir détails
                                  <span className="text-lg">→</span>
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bouton droit */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollContainer('right');
                }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto ${
                  blurredButton === 'both' 
                    ? 'bg-transparent' 
                    : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                }`}
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

