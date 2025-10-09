'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, MapPin, Filter } from 'lucide-react';
import EventCard from '@/components/EventCard';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate?: string | null;
  price?: number | null;
  maxCapacity?: number | null;
  imageUrl?: string | null;
  establishment: {
    id: string;
    name: string;
    slug: string;
    city?: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'upcoming'>('all');
  const [cityFilter, setCityFilter] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Récupérer tous les événements à venir
      const response = await fetch('/api/events/upcoming');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        
        // Pour l'instant, on simule les trending (à améliorer avec les vraies stats)
        setTrendingEvents((data.events || []).slice(0, 3));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste unique des villes
  const cities = Array.from(new Set(events.map(e => e.establishment.city).filter(Boolean)));

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    if (cityFilter && event.establishment.city !== cityFilter) {
      return false;
    }
    return true;
  });

  const displayedEvents = filter === 'trending' ? trendingEvents : filteredEvents;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Événements à venir
            </h1>
          </div>
          <p className="text-gray-600">
            Découvrez et participez aux événements près de chez vous
          </p>
        </div>

        {/* Section Tendances */}
        {trendingEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                🔥 Événements Tendance
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingEvents.map(event => (
                <EventCard key={event.id} event={event} isUpcoming={true} />
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Filtre par type */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'trending'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 Tendance
              </button>
            </div>

            {/* Filtre par ville */}
            {cities.length > 1 && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Liste des événements */}
        {displayedEvents.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {filter === 'trending' ? 'Événements Tendance' : 'Tous les événements'}
                <span className="ml-2 text-sm text-gray-500">
                  ({displayedEvents.length})
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map(event => (
                <div key={event.id}>
                  <EventCard event={event} isUpcoming={true} />
                  <Link
                    href={`/etablissements/${event.establishment.slug}`}
                    className="block mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    📍 {event.establishment.name}
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600">
              {cityFilter 
                ? `Aucun événement à ${cityFilter} pour le moment`
                : 'Revenez bientôt pour découvrir de nouveaux événements !'}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">
            Vous organisez un événement ?
          </h3>
          <p className="mb-4">
            Créez votre établissement et partagez vos événements avec la communauté !
          </p>
          <Link
            href="/etablissements/nouveau"
            className="inline-block bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Créer mon établissement
          </Link>
        </div>
      </div>
    </div>
  );
}

