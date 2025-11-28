'use client';

import { Phone, MapPin, Star, Heart, FileText, MessageSquare, Share, X, MessageCircle, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/fake-toast';
import { useEstablishmentStats } from '@/hooks/useEstablishmentStats';
import { useClickTracking } from '@/hooks/useClickTracking';
import { PublicMenuDisplay } from '@/types/menu.types';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';

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
  const { session, user } = useSupabaseSession();
  const router = useRouter();
  const { incrementClick } = useEstablishmentStats();
  const { trackClick } = useClickTracking(establishment.id);
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
  const [signupModalAction, setSignupModalAction] = useState<'review' | 'favorite'>('review');
  const [existingUserReview, setExistingUserReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);

  // Vérifier si l'utilisateur a déjà un avis pour cet établissement
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!user?.id || (user.userType !== 'user' && user.role !== 'user')) return;
      
      try {
        const response = await fetch('/api/user/comments');
        if (response.ok) {
          const data = await response.json();
          const userReview = data.comments.find((review: any) => 
            review.establishment.id === establishment.id
          );
          if (userReview) {
            setExistingUserReview(userReview);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'avis existant:', error);
      }
    };

    checkExistingReview();
  }, [user, establishment.id]);

  // Vérifier si l'établissement est en favori
  useEffect(() => {
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!user || (user.userType !== 'user' && user.role !== 'user')) return;
    
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

    // Écouter les changements de favoris depuis le MapComponent
    const handleFavoriteChanged = (event: CustomEvent) => {
      const { establishmentId, isFavorite } = event.detail;
      
      // Mettre à jour l'état seulement si c'est pour cet établissement
      if (establishmentId === establishment.id) {
        setIsLiked(isFavorite);
      }
    };

    checkFavoriteStatus();
    window.addEventListener('favorite-changed', handleFavoriteChanged as EventListener);

    return () => {
      window.removeEventListener('favorite-changed', handleFavoriteChanged as EventListener);
    };
  }, [user?.role, establishment.id]);

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

  // Gestion de la fermeture du dropdown contact
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContactOptions) {
        const target = e.target as Element;
        if (!target.closest('.contact-dropdown')) {
          setShowContactOptions(false);
        }
      }
    };

    if (showContactOptions) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContactOptions]);

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
      trackClick({
        elementType: 'contact',
        elementId: 'phone',
        elementName: 'Appeler',
        action: 'click',
        sectionContext: 'actions_rapides',
      });
      window.open(`tel:${establishment.phone}`, '_self');
    }
  };

  const handleDirections = () => {
    trackClick({
      elementType: 'button',
      elementId: 'directions',
      elementName: 'Itinéraire',
      action: 'click',
      sectionContext: 'actions_rapides',
    });
    const address = establishment.address;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const handleShare = async () => {
    trackClick({
      elementType: 'button',
      elementId: 'share',
      elementName: 'Partager',
      action: 'click',
      sectionContext: 'actions_rapides',
    });
    
    // 1. Essayer l'API Web Share (mobile principalement)
    if (navigator.share) {
      try {
        const shareData = {
          title: establishment.name,
          text: `Découvrez ${establishment.name} sur Envie2Sortir`,
          url: window.location.href,
        };
        
        await navigator.share(shareData);
        console.log('✅ Partage réussi via Web Share API');
        return;
      } catch (error) {
        // Si le partage a été annulé par l'utilisateur, c'est normal
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Partage annulé par l\'utilisateur');
          return;
        }
        // Autres erreurs, continuer vers le fallback
        console.warn('Erreur Web Share API:', error);
      }
    }

    // 2. Fallback: copier dans le presse-papiers
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers !');
        return;
      }
    } catch (error) {
      console.warn('Erreur clipboard:', error);
    }

    // 3. Dernier recours: afficher l'URL
    toast.success(`Partagez ce lien: ${window.location.href}`);
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
    if (!user || (user.userType !== 'user' && user.role !== 'user')) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    trackClick({
      elementType: 'button',
      elementId: 'favorite',
      elementName: isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris',
      action: 'click',
      sectionContext: 'actions_rapides',
    });

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
              // Notifier le MapComponent du changement
              window.dispatchEvent(new CustomEvent('favorite-changed', {
                detail: { establishmentId: establishment.id, isFavorite: false }
              }));
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
          // Notifier le MapComponent du changement
          window.dispatchEvent(new CustomEvent('favorite-changed', {
            detail: { establishmentId: establishment.id, isFavorite: true }
          }));
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
    if (!user) {
      // Utilisateur non connecté : afficher le modal d'inscription
      setSignupModalAction('review');
      setShowSignupModal(true);
      return;
    }

    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (user.userType !== 'user' && user.role !== 'user') {
      // Utilisateur connecté mais pas client : afficher le modal d'inscription
      setSignupModalAction('review');
      setShowSignupModal(true);
      return;
    }

    // Utilisateur connecté et client : vérifier s'il a déjà un avis
    if (existingUserReview) {
      // Mode édition : pré-remplir avec l'avis existant
      setIsEditMode(true);
      setComment(existingUserReview.content || '');
      setRating(existingUserReview.rating || 0);
    } else {
      // Mode création : formulaire vide
      setIsEditMode(false);
      setComment('');
      setRating(0);
    }
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
        toast.success(data.message || (isEditMode ? 'Avis modifié avec succès' : 'Avis enregistré avec succès'));
        setComment('');
        setRating(0);
        setIsEditMode(false);
        setExistingUserReview(null);
        setShowCommentForm(false);
        // Déclencher un événement pour rafraîchir le dernier avis dans le hero
        window.dispatchEvent(new CustomEvent('review-created'));
        // Recharger la page pour voir les changements (statistiques, etc.)
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || (isEditMode ? 'Erreur lors de la modification de l\'avis' : 'Erreur lors de l\'ajout de l\'avis'));
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
      
      {/* Layout Figma : 5 boutons ligne 1, 1 bouton ligne 2 */}
      <div className="space-y-4">
        {/* Ligne 1 : 5 boutons carrés verticaux */}
        <div className="grid grid-cols-5 gap-3">
          {/* Itinéraire */}
          <button
            onClick={handleDirections}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <MapPin className="w-5 h-5 text-gray-700 mb-2" />
            <span className="text-xs text-gray-700 font-medium">Itinéraire</span>
          </button>

          {/* Consulter le menu */}
          <button
            onClick={() => {
              if (menus.length > 0) {
                trackClick({
                  elementType: 'button',
                  elementId: 'menu',
                  elementName: 'Consulter le menu',
                  action: 'click',
                  sectionContext: 'actions_rapides',
                });
                incrementClick(establishment.id);
                setShowMenuModal(true);
              }
            }}
            disabled={isLoadingMenus || menus.length === 0}
            className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg transition-colors ${
              isLoadingMenus || menus.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 text-gray-700 mb-2" />
            <span className="text-xs text-gray-700 font-medium">
              {isLoadingMenus ? 'Chargement...' : 'Consulter le menu'}
            </span>
          </button>

          {/* Contacter */}
          <div className="relative contact-dropdown w-full h-full flex">
            <button
              onClick={() => {
                trackClick({
                  elementType: 'button',
                  elementId: 'contact',
                  elementName: 'Contacter',
                  action: 'click',
                  sectionContext: 'actions_rapides',
                });
                incrementClick(establishment.id);
                setShowContactOptions(!showContactOptions);
              }}
              className="flex-1 flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-700 mb-2" />
              <span className="text-xs text-gray-700 font-medium">Contacter</span>
            </button>
            
            {/* Dropdown des options de contact */}
            {showContactOptions && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {establishment.phone && (
                  <button
                    onClick={() => {
                      trackClick({
                        elementType: 'contact',
                        elementId: 'phone-dropdown',
                        elementName: 'Appeler',
                        action: 'click',
                        sectionContext: 'actions_rapides',
                      });
                      window.open(`tel:${establishment.phone}`);
                      setShowContactOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>Appeler</span>
                  </button>
                )}
                {establishment.whatsappPhone && (
                  <button
                    onClick={() => {
                      trackClick({
                        elementType: 'contact',
                        elementId: 'whatsapp',
                        elementName: 'WhatsApp',
                        action: 'click',
                        sectionContext: 'actions_rapides',
                      });
                      const cleanPhone = establishment.whatsappPhone!.replace(/[\s\.\-\(\)]/g, '');
                      const phoneWithCountryCode = cleanPhone.startsWith('+33') 
                        ? cleanPhone 
                        : cleanPhone.startsWith('0') 
                          ? '+33' + cleanPhone.substring(1)
                          : '+33' + cleanPhone;
                      const message = `Bonjour ! Je suis intéressé(e) par votre établissement "${establishment.name}" et j'aimerais avoir plus d'informations.`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`);
                      setShowContactOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span>WhatsApp</span>
                  </button>
                )}
                {establishment.messengerUrl && (
                  <button
                    onClick={() => {
                      trackClick({
                        elementType: 'contact',
                        elementId: 'messenger',
                        elementName: 'Messenger',
                        action: 'click',
                        sectionContext: 'actions_rapides',
                      });
                      window.open(establishment.messengerUrl!);
                      setShowContactOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>Messenger</span>
                  </button>
                )}
                {establishment.email && (
                  <button
                    onClick={() => {
                      trackClick({
                        elementType: 'contact',
                        elementId: 'email',
                        elementName: 'Email',
                        action: 'click',
                        sectionContext: 'actions_rapides',
                      });
                      window.open(`mailto:${establishment.email}`);
                      setShowContactOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>Email</span>
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Favoris */}
          <button
            onClick={() => {
              // Si l'utilisateur n'est pas connecté ou n'est pas un utilisateur simple
              if (!user || (user.userType !== 'user' && user.role !== 'user')) {
                setSignupModalAction('favorite');
                setShowSignupModal(true);
                return;
              }
              // Sinon, gérer les favoris normalement
              handleFavorite();
              incrementClick(establishment.id);
            }}
            disabled={isLoading && user?.role === 'user'}
            className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors ${isLoading && user?.role === 'user' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-5 h-5 mb-2 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
            <span className="text-xs text-gray-700 font-medium">
              {isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </span>
          </button>

          {/* Partager */}
          <button
            onClick={() => {
              handleShare();
              incrementClick(establishment.id);
            }}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <Share className="w-5 h-5 text-gray-700 mb-2" />
            <span className="text-xs text-gray-700 font-medium">Partager</span>
          </button>
        </div>

        {/* Ligne 2 : Bouton "Laisser un avis" avec notes intégrées */}
        <div className="w-full">
          <button
            onClick={() => {
              trackClick({
                elementType: 'button',
                elementId: 'review',
                elementName: 'Laisser un avis',
                action: 'click',
                sectionContext: 'actions_rapides',
              });
              handleReviewClick();
              incrementClick(establishment.id);
            }}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">Laisser un avis</span>
            </div>
            
            {/* Affichage des notes intégré */}
            {establishment.avgRating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900 text-sm">{establishment.avgRating.toFixed(1)}</span>
                {establishment.totalComments && (
                  <span className="text-gray-600 text-xs">
                    ({establishment.totalComments})
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      </div>


      {/* Modal de commentaire */}
      {showCommentForm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCommentForm(false);
              setIsEditMode(false);
              setExistingUserReview(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Modifier votre avis' : 'Laisser un avis'}</h3>
              <button
                onClick={() => {
                  setShowCommentForm(false);
                  setIsEditMode(false);
                  setExistingUserReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
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
                {isSubmittingComment ? 'Envoi...' : (isEditMode ? 'Modifier' : 'Publier')}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Inscription requise
              </h3>
              <p className="text-gray-600 mb-6">
                {signupModalAction === 'review' 
                  ? "Il faut être inscrit sur le site pour laisser un avis sur cet établissement."
                  : "Il faut être inscrit sur le site pour ajouter cet établissement à vos favoris."
                } Souhaitez-vous être redirigé vers la page d'inscription ?
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
