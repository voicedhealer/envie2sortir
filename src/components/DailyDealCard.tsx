"use client";

import { Tag, Clock, FileText, ThumbsUp, ThumbsDown, MapPin, Calendar, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDealTime, formatDealDate, formatPrice, calculateDiscount } from '@/lib/deal-utils';

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
  // Récurrence
  isRecurring?: boolean;
  recurrenceType?: string | null;
  recurrenceDays?: number[] | null;
  recurrenceEndDate?: Date | string | null;
  // Champs pour l'effet flip
  promoUrl?: string | null;
}

interface DailyDealCardProps {
  deal: DailyDeal;
  onClick?: () => void;
  redirectToEstablishment?: boolean; // Si true, redirige vers la page établissement au lieu d'ouvrir le modal
  establishmentId?: string; // ID de l'établissement pour la redirection
  establishmentSlug?: string; // Slug de l'établissement pour la redirection
  establishmentName?: string; // Nom de l'établissement à afficher sur l'image
}

export default function DailyDealCard({ deal, onClick, redirectToEstablishment = false, establishmentId, establishmentSlug, establishmentName }: DailyDealCardProps) {
  const router = useRouter();
  const discount = calculateDiscount(deal.originalPrice, deal.discountedPrice);
  const [userEngagement, setUserEngagement] = useState<'liked' | 'disliked' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Fonction pour formater uniquement la date (sans l'heure)
  const formatDateForFront = (deal: DailyDeal) => {
    // Pour les bons plans récurrents
    if (deal.isRecurring) {
      if (deal.recurrenceType === 'weekly' && deal.recurrenceDays && deal.recurrenceDays.length > 0) {
        const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const selectedDays = deal.recurrenceDays.map(day => dayNames[day]);
        
        // Grouper les jours de semaine et weekend
        const weekdays = [1, 2, 3, 4, 5]; // Lundi à Vendredi
        const weekends = [6, 7]; // Samedi et Dimanche
        
        const hasWeekdays = deal.recurrenceDays.some(day => weekdays.includes(day));
        const hasWeekends = deal.recurrenceDays.some(day => weekends.includes(day));
        
        // Vérifier si c'est exactement tous les jours de semaine
        const isAllWeekdays = weekdays.every(day => deal.recurrenceDays.includes(day));
        // Vérifier si c'est exactement tous les jours de weekend
        const isAllWeekends = weekends.every(day => deal.recurrenceDays.includes(day));
        // Vérifier si c'est tous les jours
        const isAllDays = isAllWeekdays && isAllWeekends;
        
        if (isAllDays) {
          return 'Tous les jours';
        } else if (isAllWeekdays && !hasWeekends) {
          return 'En semaine';
        } else if (isAllWeekends && !hasWeekdays) {
          return 'Le weekend';
        } else {
          return `Tous les ${selectedDays.join(', ')}`;
        }
      }
      
      if (deal.recurrenceType === 'monthly') {
        return 'Tous les mois';
      }
      
      // Récurrence quotidienne par défaut
      return 'Tous les jours';
    }
    
    // Pour les bons plans non récurrents
    const startDate = new Date(deal.dateDebut);
    const day = startDate.getDate().toString().padStart(2, '0');
    const month = startDate.toLocaleDateString('fr-FR', { month: 'long' });
    const year = startDate.getFullYear();
    
    return `Le ${day} ${month} ${year}`;
  };

  // Fonction pour tronquer intelligemment le texte
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleEngagement = async (type: 'liked' | 'disliked', e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/deals/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId: deal.id,
          type: type,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setUserEngagement(type);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'engagement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    setIsFlipped(true);
  };

  const handleFlipBack = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    if (isFlipped) return; // Ne pas ouvrir le modal/rediriger si la carte est retournée
    
    // Si redirection vers établissement activée
    if (redirectToEstablishment && establishmentSlug) {
      router.push(`/etablissements/${establishmentSlug}`);
      return;
    }
    
    // Sinon, comportement par défaut (modal)
    if (onClick) onClick();
  };

  return (
    <div 
      className={`promo-card ${isFlipped ? 'flipped' : ''} shadow-lg`}
      onClick={handleCardClick}
    >
      <div className="promo-card-inner">
        
        {/* FACE AVANT */}
        <div className="promo-card-front">
          <div className="relative">
            {/* Badge "Bon plan du jour" */}
            <div className="absolute top-0 left-20 right-20 bg-orange-500 text-white text-center py-1 font-bold text-sm z-10 rounded-b-lg">
              🎯 BON PLAN DU JOUR
            </div>

            {/* Image */}
            {deal.imageUrl ? (
              <div className="relative h-56 mt-0 overflow-hidden">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover object-center"
                  style={{
                    objectPosition: 'center 40%'
                  }}
                />
                
                {/* Nom de l'établissement en overlay en bas à gauche - texte réduit max 25 caractères */}
                {establishmentName && (
                  <div className="absolute bottom-0 left-0 bg-gradient-to-r from-black/70 to-transparent p-2 pr-8">
                    <p className="text-white font-medium text-xs drop-shadow-lg">
                      {establishmentName.length > 25 ? establishmentName.substring(0, 25) + '...' : establishmentName}
                    </p>
                  </div>
                )}
                
                {/* Boutons de vote en bas à droite de l'image */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => handleEngagement('liked', e)}
                    disabled={isSubmitting}
                    className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                      userEngagement === 'liked'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/90 text-green-600 hover:bg-green-500 hover:text-white'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Cette offre m'intéresse"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => handleEngagement('disliked', e)}
                    disabled={isSubmitting}
                    className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                      userEngagement === 'disliked'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-red-600 hover:bg-red-500 hover:text-white'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Cette offre ne m'intéresse pas"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-56 mt-8 bg-gradient-to-br from-orange-100 to-orange-50" />
            )}
          </div>

          {/* Contenu */}
          <div className="p-4 flex flex-col flex-1">
            {/* Titre */}
            <h3 className="font-bold text-gray-900 text-lg mb-2" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {deal.title}
            </h3>

            {/* Prix */}
            {(deal.originalPrice || deal.discountedPrice) && (
              <div className="flex items-center gap-2 mb-3">
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
                {discount > 0 && (
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    -{discount}%
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 flex-1">
              {truncateText(deal.description, 80)}
            </p>

            {/* Date et horaires */}
            <div className="space-y-1 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{formatDateForFront(deal)}</span>
              </div>
              
              {deal.heureDebut && deal.heureFin && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>De {deal.heureDebut} à {deal.heureFin}</span>
                </div>
              )}
              
              {deal.pdfUrl && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Menu disponible (PDF)</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div>
              {/* Bouton flip */}
              <button 
                onClick={handleFlip}
                className="w-full border-2 border-orange-500 hover:border-orange-600 text-orange-500 hover:text-orange-600 font-semibold py-2 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                Voir les détails
              </button>
            </div>
          </div>
        </div>

        {/* FACE ARRIÈRE */}
        <div className="promo-card-back relative">
          <button 
            onClick={handleFlipBack}
            className="absolute top-1/2 -left-3 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10"
            title="Retour"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="promo-back-header">
            <h3 className="promo-back-title">Détails de l'offre</h3>
          </div>
          
          <div className="promo-back-content">
            <div className="promo-details">
              {/* Nom de l'établissement en première position - tronqué à 25 caractères */}
              {establishmentName && (
                <div className="detail-item">
                  <span className="detail-icon">🏢</span>
                  <span className="detail-text">
                    {establishmentName.length > 25 ? establishmentName.substring(0, 25) + '...' : establishmentName}
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">{deal.title}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span className="detail-text">{formatDealDate(deal)}</span>
              </div>
              
              {deal.heureDebut && deal.heureFin && (
                <div className="detail-item">
                  <span className="detail-icon">⏰</span>
                  <span className="detail-text">De {deal.heureDebut} à {deal.heureFin}</span>
                </div>
              )}
              
              {deal.modality && (
                <div className="detail-item">
                  <span className="detail-icon">📋</span>
                  <span 
                    className="detail-text"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3rem'
                    }}
                  >
                    {deal.modality}
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-icon">💰</span>
                <span className="detail-text">
                  {deal.originalPrice && (
                    <span className="line-through text-gray-400 mr-2">
                      {formatPrice(deal.originalPrice)}
                    </span>
                  )}
                  {deal.discountedPrice && (
                    <span className="font-bold text-orange-600">
                      {formatPrice(deal.discountedPrice)}
                    </span>
                  )}
                </span>
              </div>
              
              {deal.pdfUrl && (
                <div className="detail-item">
                  <span className="detail-icon">📄</span>
                  <span className="detail-text">Menu disponible en PDF</span>
                </div>
              )}
              
            </div>
            
            <div className="promo-conditions">
              <p 
                className="conditions-text"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxHeight: '6rem'
                }}
              >
                {deal.description}
              </p>
              
              {deal.promoUrl && (
                <div className="mt-3 pt-3 border-t border-orange-300">
                  <a 
                    href={deal.promoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    🔗 Voir la promotion en ligne
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

