"use client";

import { Tag, Clock, FileText } from 'lucide-react';
import { formatDealTime, formatPrice, calculateDiscount } from '@/lib/deal-utils';

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
}

interface DailyDealCardProps {
  deal: DailyDeal;
  onClick?: () => void;
}

export default function DailyDealCard({ deal, onClick }: DailyDealCardProps) {
  const discount = calculateDiscount(deal.originalPrice, deal.discountedPrice);

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-orange-50/80 to-white rounded-xl border-2 border-orange-500 shadow-lg shadow-orange-500/20 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative">
        {/* Badge "Bon plan du jour" */}
        <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 font-bold text-sm">
          🎯 BON PLAN DU JOUR
        </div>

        {/* Image */}
        {deal.imageUrl ? (
          <div className="relative h-40 mt-10">
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                -{discount}%
              </div>
            )}
          </div>
        ) : (
          <div className="h-16 mt-10 bg-gradient-to-br from-orange-100 to-orange-50" />
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Titre */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {deal.title}
        </h3>

        {/* Prix */}
        {(deal.originalPrice || deal.discountedPrice) && (
          <div className="flex items-baseline gap-2 mb-3">
            {deal.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(deal.originalPrice)}
              </span>
            )}
            {deal.discountedPrice && (
              <span className="text-2xl font-bold text-orange-600">
                {formatPrice(deal.discountedPrice)}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {deal.description}
        </p>

        {/* Horaires */}
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{formatDealTime(deal)}</span>
          </div>
          
          {deal.pdfUrl && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Menu disponible (PDF)</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-orange-200">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
            Voir les détails
          </button>
        </div>
      </div>
    </div>
  );
}

