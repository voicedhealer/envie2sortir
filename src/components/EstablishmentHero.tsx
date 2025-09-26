'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from '@/lib/fake-toast';
import Image from 'next/image';

interface EstablishmentHeroProps {
  establishment: {
    id: string;
    name: string;
    address: string;
    city?: string;
    avgRating?: number;
    totalComments?: number;
    imageUrl?: string;
    images?: string[];
    category?: string;
  };
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function EstablishmentHero({ establishment, onFavorite, onShare }: EstablishmentHeroProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Combiner imageUrl et images pour créer un carrousel
  const allImages = [
    ...(establishment.imageUrl ? [establishment.imageUrl] : []),
    ...(establishment.images || [])
  ].filter(Boolean).filter(img => img && img.trim() !== '');
  
  // Déduplication des images (éviter les doublons)
  const uniqueImages = [...new Set(allImages)];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // S'assurer que l'index est valide
  const validCurrentIndex = uniqueImages.length > 0 ? Math.min(currentImageIndex, uniqueImages.length - 1) : 0;
  
  // Vérifier si l'établissement est en favori
  useEffect(() => {
    if (session?.user?.role === 'user') {
      checkFavoriteStatus();
    }
  }, [session, establishment.id]);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
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

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl animate-fade-in-up">
      {/* Image principale ou placeholder */}
      {uniqueImages.length > 0 ? (
        <div className="relative w-full h-full">
          <Image
            src={uniqueImages[validCurrentIndex]}
            alt={establishment.name}
            fill
            className="object-cover"
            priority
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Navigation du carrousel */}
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
              
              {/* Indicateurs */}
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
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-xl font-medium">Aucune image disponible</p>
          </div>
        </div>
      )}

      {/* Actions en haut à droite */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} 
          />
        </button>
        <button
          onClick={onShare}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-3"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Badge catégorie en haut à gauche */}
      {establishment.category && (
        <div className="absolute top-4 left-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {establishment.category}
          </span>
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
              {establishment.city && `, ${establishment.city}`}
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
  );
}
