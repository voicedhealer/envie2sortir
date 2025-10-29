'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Euro, Filter, Search, Flame, X } from 'lucide-react';
import Link from 'next/link';

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
    city: string;
  };
  status?: 'ongoing' | 'upcoming' | 'past';
}

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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

    // Filtre par ville
    if (selectedCity) {
      filtered = filtered.filter(event => 
        event.establishment.city.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.establishment.name.toLowerCase().includes(term) ||
        event.establishment.city.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredEvents = applyFilters();
  // Utiliser le statut calculé par l'API qui gère correctement les horaires quotidiens pour les événements récurrents
  const liveEventsCount = allEvents.filter(e => 
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
                Aujourd'hui
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
                Tendance
              </button>
            </div>

            {/* Filtre par ville */}
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Ville..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordéon des événements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventsPageAccordion 
          events={filteredEvents}
          loading={loading}
          filter={filter}
          searchTerm={searchTerm}
          onFilterChange={setFilter}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
}
