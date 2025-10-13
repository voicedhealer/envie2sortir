"use client";

import { Clock } from 'lucide-react';

interface ActiveDeal {
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
}

interface DailyDealOverlayProps {
  deal: ActiveDeal;
}

export default function DailyDealOverlay({ deal }: DailyDealOverlayProps) {
  // Logique pour déterminer le texte à afficher
  const getOverlayText = () => {
    // Prioriser les horaires sur les modalités
    if (deal.heureDebut && deal.heureFin) {
      return `de ${deal.heureDebut} à ${deal.heureFin}`;
    }
    
    if (deal.heureDebut) {
      return `à partir de ${deal.heureDebut}`;
    }
    
    if (deal.heureFin) {
      return `jusqu'à ${deal.heureFin}`;
    }
    
    // Si pas d'horaires, afficher la modalité si disponible
    if (deal.modality) {
      return deal.modality;
    }
    
    // Par défaut, toute la journée
    return "toute la journée";
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      {/* Badge "Bon plan du jour" */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 px-3 font-bold text-sm shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <span>🎯</span>
          <span>BON PLAN DU JOUR</span>
        </div>
      </div>
      
      {/* Détails du bon plan */}
      <div className="bg-orange-50/95 backdrop-blur-sm text-orange-800 text-center py-2 px-3 text-xs font-medium border-b border-orange-200">
        <div className="flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{getOverlayText()}</span>
        </div>
      </div>
    </div>
  );
}
