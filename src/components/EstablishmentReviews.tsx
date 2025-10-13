'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, MessageCircle, X } from 'lucide-react';
import { toast } from '@/lib/fake-toast';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le formulaire d'avis
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Récupérer les avis depuis l'API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/public/establishments/${establishment.slug}/comments`);
        
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
          // Si l'API n'existe pas (404) ou pas d'avis (pas d'erreur grave), on affiche juste une liste vide
          if (response.status === 404) {
            setReviews([]);
          } else {
            setError('Erreur lors du chargement des avis');
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        // En cas d'erreur réseau ou autre, on affiche juste une liste vide au lieu d'une erreur
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (establishment.slug) {
      fetchReviews();
    }
  }, [establishment.slug]);

  // Vérifier si l'utilisateur connecté a déjà un avis
  useEffect(() => {
    if (session?.user && reviews.length > 0) {
      const userReview = reviews.find(review => 
        review.userName === (session.user.firstName || session.user.name)
      );
      if (userReview) {
        setExistingUserReview(userReview);
      }
    }
  }, [session, reviews]);

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

  // Gestion du clic sur "Laisser un avis"
  const handleReviewClick = () => {
    if (!session) {
      // Utilisateur non connecté : afficher le modal d'inscription
      setShowSignupModal(true);
      return;
    }

    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (session.user.userType !== 'user' && session.user.role !== 'user') {
      // Utilisateur connecté mais pas client : afficher le modal d'inscription
      setShowSignupModal(true);
      return;
    }

    // Utilisateur connecté et client : vérifier s'il a déjà un avis
    if (existingUserReview) {
      // Mode édition : pré-remplir avec l'avis existant
      setIsEditMode(true);
      setComment(existingUserReview.comment);
      setRating(existingUserReview.rating);
    } else {
      // Mode création : formulaire vide
      setIsEditMode(false);
      setComment('');
      setRating(0);
    }
    setShowCommentForm(true);
  };

  // Soumission de l'avis
  const handleSubmitComment = async () => {
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!session || (session.user.userType !== 'user' && session.user.role !== 'user')) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (!comment.trim()) {
      toast.error('Veuillez saisir un commentaire');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez donner une note');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishmentId: establishment.id,
          content: comment.trim(),
          rating: rating
        })
      });

      if (response.ok) {
        toast.success(isEditMode ? 'Avis modifié avec succès' : 'Avis ajouté avec succès');
        setComment('');
        setRating(0);
        setIsEditMode(false);
        setExistingUserReview(null);
        setShowCommentForm(false);
        // Recharger la page pour voir les changements
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || (isEditMode ? 'Erreur lors de la modification de l\'avis' : 'Erreur lors de l\'ajout de l\'avis'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

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


      {/* Modal de formulaire d'avis */}
      {showCommentForm && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowCommentForm(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Modifier votre avis' : 'Laisser un avis'}</h3>
              <button
                onClick={() => setShowCommentForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 caractères
              </p>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !comment.trim() || rating === 0}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi...' : (isEditMode ? 'Modifier' : 'Publier')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'inscription */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Inscription requise
              </h3>
              <p className="text-gray-600 mb-6">
                Il faut être inscrit sur le site pour laisser un avis sur cet établissement.
                Souhaitez-vous être redirigé vers la page d'inscription ?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowSignupModal(false);
                    router.push('/auth?callbackUrl=' + encodeURIComponent(window.location.href));
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
