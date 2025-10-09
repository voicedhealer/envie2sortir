'use client';

import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface Establishment {
  id: string;
  name: string;
  slug: string;
  city?: string;
  address?: string;
  description?: string;
}

export default function EstablishmentEventsPage() {
  const params = useParams();
  const establishmentSlug = params.establishmentSlug as string;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [establishmentSlug]);

  const fetchData = async () => {
    try {
      // Récupérer les événements de l'établissement
      const eventsResponse = await fetch(`/api/etablissements/${establishmentSlug}/events`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      // Récupérer les infos de l'établissement
      const estabResponse = await fetch(`/api/etablissements/${establishmentSlug}`);
      if (estabResponse.ok) {
        const estabData = await estabResponse.json();
        setEstablishment(estabData.establishment || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les événements à venir et passés
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.startDate) > now);
  const pastEvents = events.filter(e => new Date(e.startDate) <= now);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
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

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Établissement introuvable
            </h2>
            <Link
              href="/evenements"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Retour aux événements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/evenements"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </Link>
        </div>

        {/* En-tête établissement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Événements - {establishment.name}
                </h1>
              </div>
              
              {establishment.city && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{establishment.city}</span>
                </div>
              )}
              
              {establishment.description && (
                <p className="text-gray-600 mt-3">
                  {establishment.description}
                </p>
              )}
            </div>

            <Link
              href={`/etablissements/${establishment.slug}`}
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Voir l'établissement
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Événements à venir */}
        {upcomingEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📅</span>
              Événements à venir
              <span className="text-sm text-gray-500 font-normal">
                ({upcomingEvents.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} isUpcoming={true} />
              ))}
            </div>
          </div>
        )}

        {/* Événements passés */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🕐</span>
              Événements passés
              <span className="text-sm text-gray-500 font-normal">
                ({pastEvents.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isUpcoming={false} />
              ))}
            </div>
          </div>
        )}

        {/* Aucun événement */}
        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement programmé
            </h3>
            <p className="text-gray-600 mb-6">
              Cet établissement n'a pas encore créé d'événements.
            </p>
            <Link
              href={`/etablissements/${establishment.slug}`}
              className="inline-block text-orange-600 hover:text-orange-700 font-medium"
            >
              Découvrir l'établissement →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

