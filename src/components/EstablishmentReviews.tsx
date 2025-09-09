'use client';

import { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface EstablishmentReviewsProps {
  establishment: {
    avgRating?: number;
    totalComments?: number;
  };
}

// Données d'exemple pour les avis (à remplacer par une vraie API)
const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Marie L.',
    rating: 5,
    comment: 'Excellent établissement ! L\'ambiance est parfaite et le personnel très accueillant. Je recommande vivement.',
    date: '2024-01-15',
  },
  {
    id: '2',
    userName: 'Pierre M.',
    rating: 4,
    comment: 'Très bon moment passé ici. La nourriture est délicieuse et les prix raisonnables. Petit bémol sur l\'attente.',
    date: '2024-01-10',
  },
  {
    id: '3',
    userName: 'Sophie D.',
    rating: 5,
    comment: 'Un endroit parfait pour une soirée entre amis. La musique est au top et l\'ambiance festive !',
    date: '2024-01-08',
  },
];

export default function EstablishmentReviews({ establishment }: EstablishmentReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 3);

  return (
    <div className="reviews-section" id="avis">
      <div className="reviews-header">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Star className="w-5 h-5 text-orange-500 mr-2" />
          Avis clients
        </h3>
        
        {establishment.avgRating && (
          <div className="rating-summary flex items-center gap-2">
            <div className="stars flex items-center">
              {renderStars(Math.round(establishment.avgRating))}
            </div>
            <span className="rating text-lg font-semibold text-gray-900">
              {establishment.avgRating.toFixed(1)}
            </span>
            {establishment.totalComments && (
              <span className="text-sm text-gray-600">
                ({establishment.totalComments} avis)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="reviews-list">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-avatar">
              {review.avatar ? (
                <img 
                  src={review.avatar} 
                  alt={review.userName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm">{getInitials(review.userName)}</span>
              )}
            </div>
            
            <div className="review-content">
              <div className="review-header flex items-center justify-between">
                <span className="review-name">{review.userName}</span>
                <div className="review-rating flex items-center gap-1">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              <p className="review-text">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(review.date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {mockReviews.length > 3 && (
        <button 
          className="view-all-reviews"
          onClick={() => setShowAllReviews(!showAllReviews)}
        >
          {showAllReviews ? 'Voir moins d\'avis' : `Voir tous les avis (${mockReviews.length})`}
        </button>
      )}

      {/* Bouton pour ajouter un avis */}
      <div className="mt-4 text-center">
        <button className="action-btn primary">
          <MessageCircle className="w-4 h-4" />
          <span>Laisser un avis</span>
        </button>
      </div>
    </div>
  );
}
