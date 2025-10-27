'use client';

import { useState, useEffect } from 'react';
import { Tag, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import DailyDealCard from '@/components/DailyDealCard';

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
    activities?: string[];
    imageUrl?: string;
  };
}

export default function BonsPlansPage() {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAllDeals();
  }, []);

  const fetchAllDeals = async () => {
    setLoading(true);
    try {
      // Récupérer tous les deals (limit=0)
      const response = await fetch('/api/deals/all?limit=0');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
        setHasMore(false); // Plus de deals à charger
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bons plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </Link>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Tous les bons plans
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {loading ? 'Chargement...' : `${deals.length} offre${deals.length > 1 ? 's' : ''} disponible${deals.length > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chargement */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des bons plans...</p>
              </div>
            </div>
          )}

          {/* Aucun bon plan */}
          {!loading && deals.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun bon plan disponible
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Il n'y a pas de bons plans actifs pour le moment. Revenez plus tard pour découvrir de nouvelles offres !
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </Link>
            </div>
          )}

          {/* Grille des bons plans */}
          {!loading && deals.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <DailyDealCard
                    key={deal.id}
                    deal={deal}
                    redirectToEstablishment={true}
                    establishmentId={deal.establishmentId}
                    establishmentSlug={deal.establishment?.slug}
                    establishmentName={deal.establishment?.name}
                  />
                ))}
              </div>

              {/* Info fin de liste */}
              {!hasMore && deals.length > 0 && (
                <div className="text-center mt-12 py-8 border-t border-gray-200">
                  <p className="text-gray-600">
                    ✨ Vous avez vu tous les bons plans disponibles !
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-4 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Section CTA */}
      {!loading && deals.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-orange-500 to-pink-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Vous êtes professionnel ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Créez vos propres bons plans et attirez de nouveaux clients !
            </p>
            <Link
              href="/etablissements/nouveau"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              <span>Référencer mon établissement</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

