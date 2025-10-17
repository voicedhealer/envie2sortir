'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import DailyDealCard from './DailyDealCard';

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
    address: string;
    city?: string;
    category?: string;
    imageUrl?: string;
  };
}

export default function DailyDealsCarousel() {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchDeals();
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

  if (!isMounted) return null;

  // Si aucun bon plan, ne rien afficher
  if (!loading && deals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50">
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
              <p className="text-gray-600 mt-1">
                Profitez des offres exclusives près de chez vous
              </p>
            </div>
          </div>

          {/* Bouton "Voir tous" */}
          {deals.length >= 12 && (
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

        {/* Carousel */}
        {!loading && deals.length > 0 && (
          <div className="relative group">
            {/* Boutons de navigation */}
            {deals.length > 3 && (
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
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex-shrink-0 w-[350px]"
                >
                  <DailyDealCard
                    deal={deal}
                    redirectToEstablishment={true}
                    establishmentId={deal.establishmentId}
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

