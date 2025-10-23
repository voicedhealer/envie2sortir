'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import EstablishmentCard from './EstablishmentCard';
import Link from 'next/link';
import { useLocation } from '@/hooks/useLocation';
import { isWithinRadius } from '@/lib/geolocation-utils';
import { MapPin } from 'lucide-react';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  category?: string;
  status: 'approved' | 'pending' | 'rejected';
  latitude?: number;
  longitude?: number;
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  events?: Array<{
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    price?: number;
    maxCapacity?: number;
  }>;
  subscription?: 'FREE' | 'PREMIUM';
  description?: string;
  imageUrl?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  reviewCount?: number;
  avgRating?: number;
  totalComments?: number;
}

export default function DynamicEstablishmentsSection() {
  const { data: session } = useSession();
  const { currentCity, searchRadius, loading: locationLoading } = useLocation();
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        
        // Prioriser la localisation de l'utilisateur (currentCity) sur la ville favorite de session
        const cityToUse = currentCity?.name || (session?.user as any)?.favoriteCity;
        
        // Construire l'URL avec ville, coordonnées et rayon
        const params = new URLSearchParams();
        params.set('limit', '20');
        
        if (currentCity && currentCity.latitude && currentCity.longitude) {
          // Utiliser les coordonnées GPS pour un filtrage précis
          params.set('lat', currentCity.latitude.toString());
          params.set('lng', currentCity.longitude.toString());
          params.set('radius', searchRadius.toString());
        } else if (cityToUse) {
          // Fallback sur le nom de ville
          params.set('city', cityToUse);
        }
        
        const url = `/api/establishments/random?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setAllEstablishments(data.establishments);
        } else {
          setError('Erreur lors du chargement des établissements');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des établissements');
      } finally {
        setLoading(false);
      }
    }, 100); // Délai pour décaler du chargement EventsCarousel
    
    return () => clearTimeout(timer);
  }, [session, currentCity, searchRadius]);

  // 📍 Les établissements sont déjà filtrés par l'API, on limite juste l'affichage
  const filteredEstablishments = useMemo(() => {
    // L'API a déjà fait le filtrage géographique, on limite juste l'affichage
    return allEstablishments.slice(0, 12);
  }, [allEstablishments]);

  if (loading) {
    return (
      <section className="py-16 bg-white" style={{ minHeight: '600px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos meilleurs endroits</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos meilleurs endroits</h2>
          <div className="text-center text-gray-500">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (filteredEstablishments.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-center">Nos meilleurs endroits</h2>
            {currentCity && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>
                  <span className="font-medium text-orange-600">{currentCity.name}</span>
                  {' • '}
                  <span className="text-gray-500">Rayon {searchRadius}km</span>
                </span>
              </div>
            )}
          </div>
          <div className="text-center text-gray-500">
            <p className="mb-4">Aucun établissement trouvé dans un rayon de {searchRadius}km autour de {currentCity?.name}.</p>
            <p className="text-sm text-gray-400">💡 Essayez d'augmenter le rayon de recherche via le badge de localisation dans le header</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold">
              Nos meilleurs endroits
            </h2>
            {/* 📍 Indicateur de localisation */}
            {currentCity && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>
                  <span className="font-medium text-orange-600">{currentCity.name}</span>
                  {' • '}
                  <span className="text-gray-500">Rayon {searchRadius}km</span>
                  {' • '}
                  <span className="font-medium text-gray-900">{filteredEstablishments.length} résultat{filteredEstablishments.length > 1 ? 's' : ''}</span>
                </span>
              </div>
            )}
          </div>
          <Link 
            href="/recherche" 
            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            Voir tous →
          </Link>
        </div>
        
        {/* Container avec animation de défilement */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-6">
            {/* Affichage unique des établissements avec animation */}
            {filteredEstablishments.map((establishment, index) => (
              <div 
                key={establishment.id} 
                className="flex-shrink-0 w-80"
              >
                <EstablishmentCard establishment={establishment} from="homepage" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
