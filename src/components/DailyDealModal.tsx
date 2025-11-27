"use client";

import { X, Calendar, Clock, Tag, FileText } from 'lucide-react';
import { formatDealTime, formatDealDate, formatPrice, calculateDiscount, markDealAsSeen } from '@/lib/deal-utils';
import { useEffect } from 'react';

interface DailyDeal {
  id: string;
  establishmentId?: string;
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

  const handleProfiteClick = async () => {
    try {
      // Enregistrer l'engagement "clicked" (clic sur "J'en profite !")
      const response = await fetch('/api/deals/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId: deal.id,
          type: 'clicked',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('Engagement "clicked" enregistré avec succès');
      } else {
        console.error('Erreur lors de l\'enregistrement de l\'engagement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'engagement:', error);
    }

    // Fermer le modal après l'enregistrement
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-xl max-w-md w-full max-h-[85vh] border border-orange-300 shadow-2xl overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 mx-auto flex flex-col">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Conteneur scrollable pour le contenu */}
        <div className="flex-1 overflow-y-auto">
          {/* Image */}
          {deal.imageUrl && (
            <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              {/* Badge réduction */}
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-md">
                  -{discount}%
                </div>
              )}
            </div>
          )}

          {/* Contenu */}
          <div className="p-5">
            {/* Titre */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {deal.title}
            </h2>

            {/* Prix */}
            {(deal.originalPrice || deal.discountedPrice) && (
              <div className="flex items-baseline gap-3 mb-4">
                {deal.originalPrice && (
                  <span className="text-base text-gray-400 line-through">
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
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              {deal.description}
            </p>

            {/* Informations */}
            <div className="space-y-2.5 bg-orange-50 rounded-lg p-3.5 border border-orange-200">
              {/* Date */}
              <div className="flex items-center gap-2.5 text-gray-700">
                <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm font-medium">{formatDealDate(deal)}</span>
              </div>

              {/* Horaires */}
              {deal.heureDebut && deal.heureFin && (
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    De {deal.heureDebut} à {deal.heureFin}
                  </span>
                </div>
              )}

              {/* PDF */}
              {deal.pdfUrl && (
                <div className="pt-2.5 border-t border-orange-200">
                  <a
                    href={deal.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Voir le menu complet (PDF)</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to action - Toujours visible en bas */}
        <div className="border-t border-gray-200 bg-white p-4 pt-3">
          <p className="text-xs text-gray-500 mb-3 text-center">
            Offre valable dans les conditions mentionnées
          </p>
          <button
            onClick={handleProfiteClick}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-base transition-colors shadow-md"
          >
            J'en profite !
          </button>
        </div>
      </div>
    </div>
  );
}


