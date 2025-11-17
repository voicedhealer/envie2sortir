'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import PhotoGallery from './PhotoGallery';
import { motion, AnimatePresence } from 'framer-motion';

interface LatestReview {
  id: string;
  content: string;
  rating: number;
  userName: string;
  createdAt: string;
}

interface EstablishmentHeroWithGalleryProps {
  establishment: {
    id: string;
    name: string;
    address: string;
    city?: string;
    avgRating?: number;
    totalComments?: number;
    imageUrl?: string;
    images?: string[]; // ✅ CORRECTION : Le parent passe déjà des strings
    category?: string;
    activities?: string[];
    slug?: string;
  };
}

export default function EstablishmentHeroWithGallery({ 
  establishment
}: EstablishmentHeroWithGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<LatestReview[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Récupérer les avis
  const fetchReviews = async () => {
    if (!establishment.slug) return;
    
    try {
      const response = await fetch(`/api/public/establishments/${establishment.slug}/comments?limit=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.comments && data.comments.length > 0) {
          const reviewsData = data.comments.map((review: any) => ({
            id: review.id,
            content: review.content,
            rating: review.rating || 0,
            userName: review.user?.firstName || 'Anonyme',
            createdAt: review.createdAt
          }));
          setReviews(reviewsData);
          setCurrentReviewIndex(0);
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    }
  };

  useEffect(() => {
    fetchReviews();

    // Écouter les événements de création/mise à jour d'avis
    const handleReviewUpdate = () => {
      fetchReviews();
    };

    window.addEventListener('review-created', handleReviewUpdate);
    window.addEventListener('review-updated', handleReviewUpdate);

    return () => {
      window.removeEventListener('review-created', handleReviewUpdate);
      window.removeEventListener('review-updated', handleReviewUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishment.slug]);

  // Carousel automatique des avis (seulement si plusieurs avis)
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews.length]);
  
  
  // ✅ CORRECTION : Utiliser l'ordre correct des images
  // Les images sont déjà ordonnées par le champ 'ordre' dans la requête Prisma
  // et transformées en strings par le composant parent
  
  // Les images sont déjà des strings, on les utilise directement
  const allImages = (establishment.images || [])
    .filter(Boolean)
    .filter(img => img && img.trim() !== '');
  
  // Déduplication des images (éviter les doublons)
  const uniqueImages = [...new Set(allImages)];
  
  // Calculer l'index valide pour l'image actuelle
  const validCurrentIndex = uniqueImages.length > 0 ? Math.min(currentImageIndex, uniqueImages.length - 1) : 0;
  
  // Fonctions de navigation des images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
  };
  

  return (
    <div className="relative w-full animate-fade-in-up">
      {/* Affichage conditionnel selon la taille d'écran */}
      {isMobile ? (
        // Mode mobile : carousel classique
        <div className="relative w-full h-[400px] overflow-hidden rounded-2xl shadow-2xl">
          {uniqueImages.length > 0 ? (
            <>
              <Image
                src={uniqueImages[validCurrentIndex]}
                alt={establishment.name}
                fill
                className="object-cover"
                priority
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {uniqueImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {uniqueImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-xl font-medium">Aucune image disponible</p>
              </div>
            </div>
          )}



          {/* Informations principales en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
              {establishment.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {establishment.address}
                </span>
              </div>
            </div>

            {/* Note et avis */}
            {establishment.avgRating && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{establishment.avgRating.toFixed(1)}</span>
                </div>
                {establishment.totalComments && (
                  <span className="text-sm opacity-90">
                    ({establishment.totalComments} avis)
                  </span>
                )}
              </div>
            )}

            {/* Condensé des avis avec carousel */}
            <div className="mt-3 max-w-sm">
              {reviews.length > 0 ? (
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {reviews.map((review, index) => {
                      if (index !== currentReviewIndex) return null;
                      return (
                        <motion.div
                          key={review.id}
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                        >
                          <div className="flex items-start gap-2">
                            <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{review.userName}</span>
                                {review.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">{review.rating}</span>
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm line-clamp-2 opacity-95">{review.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 text-sm opacity-75">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Soyez le premier à laisser un avis</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Mode desktop : galerie interactive
        uniqueImages.length >= 2 ? (
          <div className="relative">
            <PhotoGallery 
              images={uniqueImages.map((url, index) => ({ 
                url, 
                isMain: index === 0 // Pour l'instant, la première image est principale
              }))} 
              establishmentName={establishment.name}
            />
            


            {/* Informations principales en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {establishment.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {establishment.address}
                  </span>
                </div>
              </div>

              {/* Note et avis */}
              {establishment.avgRating && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{establishment.avgRating.toFixed(1)}</span>
                  </div>
                  {establishment.totalComments && (
                    <span className="text-sm opacity-90">
                      ({establishment.totalComments} avis)
                    </span>
                  )}
                </div>
              )}

              {/* Condensé des avis avec carousel */}
              <div className="mt-3 max-w-sm">
                {reviews.length > 0 ? (
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {reviews.map((review, index) => {
                        if (index !== currentReviewIndex) return null;
                        return (
                          <motion.div
                            key={review.id}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                          >
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{review.userName}</span>
                                  {review.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium">{review.rating}</span>
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm line-clamp-2 opacity-95">{review.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 text-sm opacity-75">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Soyez le premier à laisser un avis</span>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
        ) : (
          // Fallback pour les établissements avec moins de 2 images
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
            {uniqueImages.length > 0 ? (
              <>
                <Image
                  src={uniqueImages[0]}
                  alt={establishment.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏢</div>
                  <p className="text-xl font-medium">Aucune image disponible</p>
                </div>
              </div>
            )}



            {/* Informations principales en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {establishment.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {establishment.address}
                  </span>
                </div>
              </div>

              {/* Note et avis */}
              {establishment.avgRating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{establishment.avgRating.toFixed(1)}</span>
                  </div>
                  {establishment.totalComments && (
                    <span className="text-sm opacity-90">
                      ({establishment.totalComments} avis)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

