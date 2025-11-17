'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Euro, Filter, Search, X, ExternalLink, Flame, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  priceUnit?: string;
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
  gaugePercentage?: number;
  eventBadge?: {
    type: string;
    label: string;
    color: string;
  } | null;
  status?: 'ongoing' | 'upcoming' | 'past';
}

type FilterType = 'all' | 'today' | 'week' | 'trending';

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [selectedCity]);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, allEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = selectedCity 
        ? `/api/events/upcoming?city=${encodeURIComponent(selectedCity)}`
        : '/api/events/upcoming';
      
      const response = await fetch(url);
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

  const applyFilters = () => {
    let filtered = [...allEvents];
    const now = new Date();

    // Filtre temporel
    if (filter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= todayStart && eventDate <= todayEnd;
      });
    } else if (filter === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate <= weekEnd;
      });
    } else if (filter === 'trending') {
      filtered = trendingEvents;
    }

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.establishment.name.toLowerCase().includes(term) ||
        event.establishment.city?.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  };

  const cities = Array.from(new Set(allEvents.map(e => e.establishment.city).filter(Boolean))) as string[];

  // Formater la date complète pour l'overlay
  const formatEventDate = (event: Event) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    const dayName = startDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNumber = startDate.getDate();
    const monthName = startDate.toLocaleDateString('fr-FR', { month: 'long' });
    const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (endDate) {
      const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return endTime ? `${dayName} ${dayNumber} ${monthName} • ${startTime}-${endTime}` : `${dayName} ${dayNumber} ${monthName} • ${startTime}`;
    } else {
      return `${dayName} ${dayNumber} ${monthName} • ${startTime}`;
    }
  };

  // Formater la date pour le badge (version compacte avec plage de dates)
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

  // Utiliser le statut calculé par l'API qui gère correctement les horaires quotidiens pour les événements récurrents
  const liveEventsCount = filteredEvents.filter(e => 
    e.status === 'ongoing'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎉 Tous les événements</h1>
              <p className="text-white/90">Découvrez ce qui se passe près de chez vous et ailleurs</p>
            </div>
            {liveEventsCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full font-bold animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                {liveEventsCount} EN DIRECT
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un événement, un lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filtres temporels */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'today'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'week'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cette semaine
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  filter === 'trending'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Niveau D'envie Général
              </button>
            </div>

            {/* Filtre par ville */}
            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Toutes les villes</option>
                {cities.sort().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4 bg-white rounded-b-2xl">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
                setSelectedCity('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event) => {
                // Utiliser le statut calculé par l'API qui gère correctement les horaires quotidiens pour les événements récurrents
                const isLive = event.status === 'ongoing';

                return (
                  <Link
                    key={event.id}
                    href={`/etablissements/${event.establishment.slug}?event=${event.id}`}
                    className="group/card block"
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
                        
                        {/* Badge LIVE avec animation - Position en haut à gauche */}
                        {isLive && (
                          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full font-bold text-sm shadow-lg z-10">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            LIVE
                          </div>
                        )}

                        {/* Date badge - style translucide avec plage de dates - Position en haut à droite */}
                        <div className="absolute top-3 right-4 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 text-center shadow-lg z-10">
                          <div className="text-lg font-bold text-black">
                            {formatEventDateBadge(event)}
                          </div>
                        </div>

                        {/* Badge Engagement - Position sous la date (en haut à droite) */}
                        {event.gaugePercentage !== undefined && event.gaugePercentage > 0 && (
                          <div className="absolute top-11 right-4 flex items-center gap-1.5 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-xl font-bold text-sm shadow-lg z-10">
                            {/* Icône de tendance et N.E.G */}
                            <TrendingUp className="w-3 h-3 text-orange-400" />
                            <span className="text-[10px] font-normal">N.E.G</span>
                            {/* Icône basée sur le badge de l'événement */}
                            <span className="text-xs">
                              {event.eventBadge?.type === 'fire' && '🔥'}
                              {event.eventBadge?.type === 'gold' && '🏆'}
                              {event.eventBadge?.type === 'silver' && '⭐'}
                              {event.eventBadge?.type === 'bronze' && '👍'}
                              {!event.eventBadge && '❄️'}
                            </span>
                            {/* Pourcentage */}
                            <span className="text-xs font-semibold">
                              {Math.round(event.gaugePercentage)}%
                            </span>
                          </div>
                        )}

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
                                    {event.price}€{event.priceUnit ? ` ${event.priceUnit}` : ''}
                                  </>
                                )}
                              </div>
                            ) : null}

                            {/* Bouton Voir plus - en bas à droite */}
                            <div className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-xs">
                              <ExternalLink className="w-4 h-4" />
                              <span>Voir plus</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

