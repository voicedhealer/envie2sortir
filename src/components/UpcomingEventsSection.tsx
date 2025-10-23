'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import EventCardNew from './EventCardNew';
import ImageModal from './ImageModal';
import AddToCalendar from './AddToCalendar';
import { formatEventDate, isEventInProgress, isEventUpcoming } from '../lib/date-utils';
import { getEstablishmentInfo } from '../lib/calendar-utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  price?: number;
  maxCapacity?: number;
  isRecurring?: boolean;
  modality?: string;
  createdAt: string;
  status?: 'ongoing' | 'upcoming';
}

interface EstablishmentInfo {
  name: string;
  address?: string;
  userId?: string;
}

interface UpcomingEventsSectionProps {
  establishmentSlug: string;
}

export default function UpcomingEventsSection({ establishmentSlug }: UpcomingEventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [establishmentInfo, setEstablishmentInfo] = useState<EstablishmentInfo | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Chargement des événements pour:', establishmentSlug);
        
        const response = await fetch(`/api/etablissements/${establishmentSlug}/events?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Données reçues:', data);
        const allEvents = data.events || [];
        console.log('📅 Événements trouvés:', allEvents.length);
        
        // 🔧 DEBUG: Voir ce qui se passe avec le filtrage
        console.log('🔍 UpcomingEventsSection - Tous les événements:', allEvents.length);
        allEvents.forEach((event, index) => {
          console.log(`🔍 Événement ${index + 1}:`, {
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status
          });
        });
        
        // 🔧 SIMPLIFICATION: Utiliser le champ status de l'API
        // L'API fournit déjà le bon statut (ongoing/upcoming), on utilise directement les données
        const upcomingEvents = allEvents
          .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxEvents);
        
        console.log('🎯 Événements à venir après filtrage:', upcomingEvents.length);
        console.log('🔍 [UpcomingEventsSection] Événements reçus avec statuts:', upcomingEvents.map(e => ({ title: e.title, status: e.status })));
        setEvents(upcomingEvents);
        
        // Récupérer les infos de l'établissement
        const establishmentData = await getEstablishmentInfo(establishmentSlug);
        setEstablishmentInfo(establishmentData);
        
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [establishmentSlug]);

  const maxEvents = 1; // Limite à 1 événement pour la section hero

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-gray-200 rounded-lg w-8 h-8"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erreur lors du chargement des événements:', error);
    return null;
  }

  // Ne pas afficher la section s'il n'y a pas d'événements
  if (events.length === 0) {
    console.log('Aucun événement à venir trouvé - Section masquée');
    return null;
  }

  console.log('Événements à venir trouvés:', events.length, events);

  // Déterminer le statut des événements pour le titre dynamique (utiliser le champ status de l'API)
  const hasInProgressEvents = events.some(event => event.status === 'ongoing');
  const hasUpcomingEvents = events.some(event => event.status === 'upcoming');

  const getSectionTitle = () => {
    if (events.length === 0) {
      return 'Événements à venir';
    } else if (hasInProgressEvents && hasUpcomingEvents) {
      return 'Événements en cours et à venir';
    } else if (hasInProgressEvents) {
      return 'Événements en cours';
    } else {
      return 'Événements à venir';
    }
  };

  const getSectionDescription = () => {
    if (events.length === 0) {
      return 'Aucun événement programmé';
    } else if (hasInProgressEvents && hasUpcomingEvents) {
      return `${events.length} événement${events.length > 1 ? 's' : ''} en cours et programmé${events.length > 1 ? 's' : ''}`;
    } else if (hasInProgressEvents) {
      return `${events.length} événement${events.length > 1 ? 's' : ''} en cours`;
    } else {
      return `${events.length} événement${events.length > 1 ? 's' : ''} programmé${events.length > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Événements - Dynamique selon le statut */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-100">
          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {getSectionTitle()}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {getSectionDescription()}
            </p>
          </div>
        </div>

        {/* Afficher SEULEMENT le premier événement (section hero) */}
        <div className="space-y-3 sm:space-y-4">
          {events.slice(0, 1).map((event) => (
            <EventCardNew
              key={event.id}
              event={{
                id: event.id,
                title: event.title,
                description: event.description || '',
                startDate: event.startDate,
                endDate: event.endDate || event.startDate,
                price: event.price || 0,
                imageUrl: event.imageUrl || '',
                modality: event.modality || '',
                establishmentId: establishmentSlug, // Utiliser le slug comme ID temporaire
                status: event.status // Passer le statut de l'API
              }}
              establishment={establishmentInfo}
            />
          ))}
        </div>

      </div>

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