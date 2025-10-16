'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Euro, Filter, Search, Flame, X } from 'lucide-react';
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const liveEventsCount = filteredEvents.filter(e => 
    isEventInProgress(e.startDate, e.endDate)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎉 Tous les événements</h1>
              <p className="text-white/90">Découvrez ce qui se passe près de chez vous</p>
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
                <Flame className="w-4 h-4" />
                Tendances
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isLive = isEventInProgress(event.startDate, event.endDate);
                const isTrending = trendingEvents.some(t => t.id === event.id);

                return (
                  <Link
                    key={event.id}
                    href={`/etablissements/${event.establishment.slug}?event=${event.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
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
                        
                        {/* Badge LIVE */}
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

                        {/* Date */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl p-2 text-center min-w-[3rem]">
                          <div className="text-white text-lg font-bold leading-none">
                            {new Date(event.startDate).getDate()}
                          </div>
                          <div className="text-white/80 text-xs uppercase mt-0.5">
                            {new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-700 line-clamp-1">{event.establishment.name}</div>
                            <div className="text-xs line-clamp-1">{event.establishment.city}</div>
                          </div>
                        </div>

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
          </>
        )}
      </div>
    </div>
  );
}
