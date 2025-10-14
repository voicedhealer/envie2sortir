"use client";

import { X, Calendar, Clock, Tag, FileText } from 'lucide-react';
import { formatDealTime, formatDealDate, formatPrice, calculateDiscount, markDealAsSeen } from '@/lib/deal-utils';
import { useEffect } from 'react';

interface DailyDeal {
  id: string;
  title: string;
  description: string;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  dateDebut: Date | string;
  dateFin: Date | string;
  heureDebut?: string | null;
  heureFin?: string | null;
  isActive: boolean;
}

interface DailyDealModalProps {
  deal: DailyDeal;
  onClose: () => void;
}

export default function DailyDealModal({ deal, onClose }: DailyDealModalProps) {
  const discount = calculateDiscount(deal.originalPrice, deal.discountedPrice);

  useEffect(() => {
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    markDealAsSeen(deal.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] border-2 border-orange-500 shadow-2xl shadow-orange-500/50 overflow-hidden">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Conteneur avec scroll */}
        <div className="h-full overflow-y-auto">
          {/* Image */}
          {deal.imageUrl && (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-orange-100 to-orange-50">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              {/* Badge réduction */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  -{discount}%
                </div>
              )}
            </div>
          )}

          {/* Contenu */}
          <div className="p-6 md:p-8">
          {/* Titre */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {deal.title}
          </h2>

          {/* Prix */}
          {(deal.originalPrice || deal.discountedPrice) && (
            <div className="flex items-baseline gap-4 mb-6">
              {deal.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
              {deal.discountedPrice && (
                <span className="text-4xl font-bold text-orange-600">
                  {formatPrice(deal.discountedPrice)}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {deal.description}
          </p>

          {/* Informations */}
          <div className="space-y-3 bg-orange-50/50 rounded-lg p-4 border border-orange-200">
            {/* Date */}
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="font-medium">{formatDealDate(deal)}</span>
            </div>

            {/* Horaires */}
            {deal.heureDebut && deal.heureFin && (
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="font-medium">
                  De {deal.heureDebut} à {deal.heureFin}
                </span>
              </div>
            )}

            {/* PDF */}
            {deal.pdfUrl && (
              <div className="pt-3 border-t border-orange-200">
                <a
                  href={deal.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  <span>Voir le menu complet (PDF)</span>
                </a>
              </div>
            )}
          </div>

          {/* Call to action */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Offre valable dans les conditions mentionnées
            </p>
            <button
              onClick={handleClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              J'en profite !
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}


