'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import EstablishmentCard from './EstablishmentCard';
import Link from 'next/link';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  category?: string;
  status: 'active' | 'pending' | 'suspended';
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
  subscription?: 'STANDARD' | 'PREMIUM';
  description?: string;
  imageUrl?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  reviewCount?: number;
}

export default function DynamicEstablishmentsSection() {
  const { data: session } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        setLoading(true);
        
        // Déterminer la ville favorite de l'utilisateur
        const favoriteCity = (session?.user as any)?.favoriteCity;
        
        // Construire l'URL avec ou sans ville
        const url = favoriteCity 
          ? `/api/establishments/random?city=${encodeURIComponent(favoriteCity)}&limit=8`
          : '/api/establishments/random?limit=8';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setEstablishments(data.establishments);
        } else {
          setError('Erreur lors du chargement des établissements');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des établissements');
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, [session]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
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

  if (establishments.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos meilleurs endroits</h2>
          <div className="text-center text-gray-500">
            <p>Aucun établissement trouvé pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">
            Nos meilleurs endroits
            {session?.user && (session.user as any)?.favoriteCity && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                à {(session.user as any).favoriteCity}
              </span>
            )}
          </h2>
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
            {/* Duplication des établissements pour un scroll infini */}
            {[...establishments, ...establishments].map((establishment, index) => (
              <div 
                key={`${establishment.id}-${index}`} 
                className="flex-shrink-0 w-80"
              >
                <EstablishmentCard establishment={establishment} />
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
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
