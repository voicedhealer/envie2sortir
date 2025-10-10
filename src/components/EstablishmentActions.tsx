'use client';

import { Phone, MapPin, Star, Heart, FileText, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/fake-toast';
import { useEstablishmentStats } from '@/hooks/useEstablishmentStats';
import ContactButtons from './ContactButtons';
import { PublicMenuDisplay } from '@/types/menu.types';

interface EstablishmentActionsProps {
  establishment: {
    id: string;
    slug?: string;
    name: string;
    phone?: string;
    whatsappPhone?: string;
    messengerUrl?: string;
    email?: string;
    address: string;
    city?: string;
    avgRating?: number;
    totalComments?: number;
  };
}

export default function EstablishmentActions({ establishment }: EstablishmentActionsProps) {
  console.log('🔍 EstablishmentActions rendu pour:', establishment.name);
  const { data: session } = useSession();
  const router = useRouter();
  const { incrementClick } = useEstablishmentStats();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [menus, setMenus] = useState<PublicMenuDisplay[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<PublicMenuDisplay | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);


  // Vérifier si l'établissement est en favori
  useEffect(() => {
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!session || (session.user.userType !== 'user' && session.user.role !== 'user')) return;
    
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch('/api/user/favorites');
        if (response.ok) {
          const data = await response.json();
          const isFavorite = data.favorites.some((fav: any) => fav.establishment.id === establishment.id);
          setIsLiked(isFavorite);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      }
    };

    checkFavoriteStatus();
  }, [session?.user?.role, establishment.id]);

  // Charger les menus publics pour cet établissement
  useEffect(() => {
    const slug = establishment.slug;
    if (!slug) return;

    const loadMenus = async () => {
      try {
        setIsLoadingMenus(true);
        const response = await fetch(`/api/public/establishments/${slug}/menus`);
        if (!response.ok) return;

        const data = await response.json();
        if (data?.menus?.length) {
          setMenus(data.menus as PublicMenuDisplay[]);
          setActiveMenu((prev) => prev ?? data.menus[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des menus:', error);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    loadMenus();
  }, [establishment.slug]);

  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCommentForm) {
        setShowCommentForm(false);
      }
    };

    if (showCommentForm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCommentForm]);

  // Gestion du blur et de la touche Échap pour le modal menu
  useEffect(() => {
    if (!showMenuModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenuModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showMenuModal]);

  const handleCall = () => {
    if (establishment.phone) {
      window.open(`tel:${establishment.phone}`, '_self');
    }
  };

  const handleDirections = () => {
    const address = establishment.address;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const handleReview = () => {
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!session || (session.user.userType !== 'user' && session.user.role !== 'user')) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }
    setShowCommentForm(true);
  };

  // Gestion des favoris
  const handleFavorite = async () => {
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!session || (session.user.userType !== 'user' && session.user.role !== 'user')) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Retirer des favoris
        const response = await fetch(`/api/user/favorites`);
        
        if (response.ok) {
          const data = await response.json();
          const favorite = data.favorites.find((fav: any) => fav.establishment.id === establishment.id);
          
          if (favorite) {
            const deleteResponse = await fetch(`/api/user/favorites/${favorite.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              setIsLiked(false);
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
          body: JSON.stringify({ establishmentId: establishment.id })
        });

        if (response.ok) {
          setIsLiked(true);
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

    // Utilisateur connecté et client : ouvrir le formulaire d'avis
    setShowCommentForm(true);
  };

  // Gestion des commentaires
  const handleSubmitComment = async () => {
    if (!comment.trim() || rating === 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmittingComment(true);
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
        const data = await response.json();
        toast.success(data.message || 'Avis enregistré avec succès');
        setComment('');
        setRating(0);
        setShowCommentForm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'ajout de l\'avis');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-in-right">
      <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
      
      <div className="action-buttons">
        {/* Itinéraire */}
        <button
          onClick={handleDirections}
          className="action-btn info"
        >
          <MapPin className="w-4 h-4" />
          <span>Itinéraire</span>
        </button>

        {/* Consulter le menu */}
        {!isLoadingMenus && menus.length > 0 && (
          <button
            onClick={() => {
              incrementClick(establishment.id);
              setShowMenuModal(true);
            }}
            className="action-btn premium"
          >
            <FileText className="w-4 h-4" />
            <span>Consulter le menu</span>
          </button>
        )}

        {/* Boutons de contact (inclut Appeler, WhatsApp, Email) */}
        <ContactButtons 
          establishment={establishment}
          onContactClick={() => incrementClick(establishment.id)}
        />
        
        {/* Favoris */}
        {session?.user?.role === 'user' && (
          <button
            onClick={() => {
              handleFavorite();
              incrementClick(establishment.id);
            }}
            disabled={isLoading}
            className={`action-btn ${isLiked ? 'danger' : 'secondary'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
          </button>
        )}

        {/* Laisser un avis */}
        <button
          onClick={() => {
            handleReviewClick();
            incrementClick(establishment.id);
          }}
            className="action-btn primary"
          >
            <Star className="w-4 h-4" />
            <span>Laisser un avis</span>
          </button>
      </div>

      {/* Note et avis en bas */}
      {establishment.avgRating && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{establishment.avgRating.toFixed(1)}</span>
            </div>
            {establishment.totalComments && (
              <span className="text-gray-600 text-sm">
                ({establishment.totalComments} avis)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal de commentaire */}
      {showCommentForm && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCommentForm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laisser un avis</h3>
            
            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={4}
              />
            </div>

            {/* Boutons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !comment.trim() || rating === 0}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {isSubmittingComment ? 'Envoi...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de menu */}
      {showMenuModal && activeMenu && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMenuModal(false);
            }
          }}
        >
          <div 
            className="bg-orange-400/30 border border-orange-400 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[100vh] h-full flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Menus de {establishment.name}</h3>
                {menus.length > 1 && (
                  <p className="text-sm text-gray-500">Sélectionnez un menu pour le consulter</p>
                )}
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Fermer
              </button>
            </div>

            {menus.length > 1 && (
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => setActiveMenu(menu)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      activeMenu?.id === menu.id
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-400'
                    }`}
                  >
                    {menu.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 bg-gray-100">
              <iframe
                src={`${activeMenu.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={activeMenu.name}
                className="w-full h-full border-0"
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between text-sm text-gray-500">
              <div>
                {activeMenu.fileName} • {(activeMenu.fileSize / (1024 * 1024)).toFixed(2)} MB
              </div>
              <a
                href={activeMenu.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Télécharger
              </a>
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
