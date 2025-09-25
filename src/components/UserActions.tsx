'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, MessageSquare, Star } from 'lucide-react';
import { toast } from '@/lib/fake-toast';

interface UserActionsProps {
  establishmentId: string;
  establishmentName: string;
  establishmentSlug: string;
  avgRating?: number;
}

export default function UserActions({ 
  establishmentId, 
  establishmentName, 
  establishmentSlug,
  avgRating 
}: UserActionsProps) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  console.log('🔍 UserActions - Session:', session);
  console.log('🔍 UserActions - EstablishmentId:', establishmentId);
  console.log('🔍 UserActions - User role:', session?.user?.role);

  // Vérifier si l'établissement est en favori
  useEffect(() => {
    if (session?.user?.role === 'user') {
      checkFavoriteStatus();
    }
  }, [session, establishmentId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      if (response.ok) {
        const data = await response.json();
        const isFav = data.favorites.some((fav: any) => fav.establishment.id === establishmentId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session || session.user.role !== 'user') {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        // Retirer des favoris
        const response = await fetch(`/api/user/favorites`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          const favorite = data.favorites.find((fav: any) => fav.establishment.id === establishmentId);
          
          if (favorite) {
            const deleteResponse = await fetch(`/api/user/favorites/${favorite.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              setIsFavorite(false);
              toast.success('Retiré des favoris');
            }
          }
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ establishmentId })
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success('Ajouté aux favoris');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          toast.error(errorData.error || 'Erreur lors de l\'ajout aux favoris');
          console.error('Erreur favoris:', response.status, errorData);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      toast.error('Erreur lors de la gestion des favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!session || session.user.role !== 'user') {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (!comment.trim()) {
      toast.error('Veuillez saisir un commentaire');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishmentId,
          content: comment.trim(),
          rating: rating > 0 ? rating : null
        })
      });

      if (response.ok) {
        toast.success('Avis ajouté avec succès');
        setComment('');
        setRating(0);
        setShowCommentForm(false);
        // Recharger la page pour voir le nouvel avis
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'ajout de l\'avis');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsLoading(false);
    }
  };

  // Si pas de session, afficher un indicateur de chargement
  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas un utilisateur normal, ne pas afficher
  if (session.user.role !== 'user') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
      
      <div className="space-y-4">
        {/* Bouton Favoris */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
            isFavorite
              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </button>

        {/* Bouton Avis */}
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Laisser un avis
        </button>

        {/* Formulaire d'avis */}
        {showCommentForm && (
          <div className="border-t pt-4">
            <div className="space-y-4">
              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optionnelle)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre avis
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Partagez votre expérience..."
                />
              </div>

              {/* Boutons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitComment}
                  disabled={isLoading || !comment.trim()}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Envoi...' : 'Publier l\'avis'}
                </button>
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setComment('');
                    setRating(0);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
