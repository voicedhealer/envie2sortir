'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Tag, MapPin } from 'lucide-react';
import Link from 'next/link';
import DailyDealCard from './DailyDealCard';
import { useLocation } from '@/hooks/useLocation';
import { isWithinRadius } from '@/lib/geolocation-utils';

interface DailyDeal {
  id: string;
  title: string;
  description: string;
  modality?: string | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  dateDebut: Date | string;
  dateFin: Date | string;
  heureDebut?: string | null;
  heureFin?: string | null;
  isActive: boolean;
  promoUrl?: string | null;
  establishmentId: string;
  establishment: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city?: string;
    activities?: string[];
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function DailyDealsCarousel() {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 📍 Hook de localisation
  const { currentCity, searchRadius, loading: locationLoading } = useLocation();

  useEffect(() => {
    // Petit délai pour éviter la surcharge au montage initial
    const timer = setTimeout(() => {
      fetchDeals();
    }, 150); // Délai pour décaler après les autres sections
    
    return () => clearTimeout(timer);
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/deals/all?limit=12');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bons plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📍 Filtrer les deals par localisation
  const filteredDeals = useMemo(() => {
    if (!currentCity || !searchRadius) return deals;
    
    return deals.filter(deal => {
      const establishment = deal.establishment;
      
      // Si l'établissement a des coordonnées GPS
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
  }, [deals, currentCity, searchRadius]);

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('deals-scroll-container');
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50" style={{ minHeight: '500px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Bons plans du jour
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600">
                  Profitez des offres exclusives près de chez vous
                </p>
                {/* 📍 Indicateur de localisation */}
                {currentCity && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-medium text-orange-600">{currentCity.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{filteredDeals.length} offre{filteredDeals.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bouton "Voir tous" */}
          {filteredDeals.length >= 12 && (
            <Link
              href="/bons-plans"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span>Voir tous les bons plans</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Chargement */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* État vide - Aucun bon plan */}
        {!loading && filteredDeals.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Icône */}
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🎁</span>
              </div>

              {/* Message principal */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Aucun bon plan près de {currentCity?.name || 'vous'}
              </h3>
              
              <p className="text-gray-600 mb-4 text-lg">
                Aucune offre disponible dans un rayon de {searchRadius}km.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                💡 Essayez d&apos;augmenter le rayon de recherche ou de changer de ville
              </p>

              {/* CTA Inscription */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-8 border-2 border-orange-200">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">💙</span>
                  <h4 className="text-xl font-semibold text-gray-900">
                    Ne ratez aucune offre !
                  </h4>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Inscrivez-vous pour suivre vos établissements favoris et recevoir des notifications sur les nouveaux bons plans
                </p>

                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span>Créer un compte gratuitement</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <p className="text-sm text-gray-500 mt-4">
                  Déjà inscrit ? <Link href="/auth" className="text-orange-500 hover:text-orange-600 font-medium underline">Connectez-vous</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Carousel */}
        {!loading && filteredDeals.length > 0 && (
          <div className="relative group">
            {/* Boutons de navigation */}
            {filteredDeals.length > 3 && (
              <>
                <button
                  onClick={() => scrollContainer('left')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white pointer-events-auto"
                  aria-label="Défiler vers la gauche"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={() => scrollContainer('right')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white pointer-events-auto"
                  aria-label="Défiler vers la droite"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Container scrollable */}
            <div
              id="deals-scroll-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex-shrink-0 w-[350px]"
                >
                  <DailyDealCard
                    deal={deal}
                    redirectToEstablishment={true}
                    establishmentId={deal.establishmentId}
                    establishmentSlug={deal.establishment.slug}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton "Voir tous" mobile */}
        {deals.length >= 12 && (
          <div className="mt-8 flex justify-center md:hidden">
            <Link
              href="/bons-plans"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>Voir tous les bons plans</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

