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
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-bold shadow-lg py-1 px-2 text-xs">
        <div className="flex items-center justify-center gap-1">
          <span className="text-xs">🎯</span>
          <span className="text-xs">BON PLAN DU JOUR</span>
        </div>
      </div>
      
      {/* Détails du bon plan */}
      <div className="bg-orange-50/95 backdrop-blur-sm text-orange-800 text-center font-medium border-b border-orange-200 py-0.5 px-2 text-xs">
        <div className="flex items-center justify-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span className="text-xs">{getOverlayText()}</span>
        </div>
      </div>
    </div>
  );
}
