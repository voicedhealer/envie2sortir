'use client';

import { useState, useEffect } from 'react';
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
    id: string;
    slug: string;
    avgRating?: number;
    totalComments?: number;
  };
}

export default function EstablishmentReviews({ establishment }: EstablishmentReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les avis depuis l'API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/establishments/${establishment.slug}/comments`);
        
        if (response.ok) {
          const data = await response.json();
          const formattedReviews = data.comments.map((comment: any) => ({
            id: comment.id,
            userName: comment.user.firstName || 'Anonyme',
            rating: comment.rating || 0,
            comment: comment.content,
            date: comment.createdAt,
            avatar: comment.user.avatar
          }));
          setReviews(formattedReviews);
        } else {
          setError('Erreur lors du chargement des avis');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        setError('Erreur lors du chargement des avis');
      } finally {
        setIsLoading(false);
      }
    };

    if (establishment.slug) {
      fetchReviews();
    }
  }, [establishment.slug]);

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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (isLoading) {
    return (
      <div className="reviews-section" id="avis">
        <div className="reviews-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-5 h-5 text-orange-500 mr-2" />
            Avis clients
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-section" id="avis">
        <div className="reviews-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-5 h-5 text-orange-500 mr-2" />
            Avis clients
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

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

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Aucun avis pour le moment.</p>
          <p className="text-sm text-gray-500 mt-2">Soyez le premier à laisser un avis !</p>
        </div>
      ) : (
        <>
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

          {reviews.length > 3 && (
            <button 
              className="view-all-reviews"
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews ? 'Voir moins d\'avis' : `Voir tous les avis (${reviews.length})`}
            </button>
          )}
        </>
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
