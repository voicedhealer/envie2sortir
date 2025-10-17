'use client';

import { useState } from 'react';
import { MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { getActivityInfo } from '@/lib/category-tags-mapping';

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
    activities?: string[];
  };
}

export default function EstablishmentHero({ establishment }: EstablishmentHeroProps) {
  
  // Calculer la catégorie à partir des activités
  const getDisplayCategory = () => {
    if (establishment.category) {
      return establishment.category;
    }
    
    if (establishment.activities && establishment.activities.length > 0) {
      const firstActivity = establishment.activities[0];
      const activityInfo = getActivityInfo(firstActivity);
      return activityInfo?.label || firstActivity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return null;
  };
  
  const displayCategory = getDisplayCategory();
  
  // Prioriser l'image de card pour la première image du carrousel
  const cardImage = establishment.images?.find(img => img.isCardImage)?.url;
  
  // Combiner imageUrl et images pour créer un carrousel
  const allImages = [
    // Priorité 1: Image de card (si elle existe)
    ...(cardImage ? [cardImage] : []),
    // Priorité 2: Image principale de l'établissement
    ...(establishment.imageUrl && establishment.imageUrl !== cardImage ? [establishment.imageUrl] : []),
    // Priorité 3: Autres images (sauf l'image de card déjà incluse)
    ...(establishment.images || [])
      .filter(img => img.url !== cardImage && img.url !== establishment.imageUrl)
      .map(img => img.url)
  ].filter(Boolean).filter(img => img && img.trim() !== '');
  
  // Déduplication des images (éviter les doublons)
  const uniqueImages = [...new Set(allImages)];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // S'assurer que l'index est valide
  const validCurrentIndex = uniqueImages.length > 0 ? Math.min(currentImageIndex, uniqueImages.length - 1) : 0;
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
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


      {/* Badge catégorie en haut à gauche */}
      {displayCategory && (
        <div className="absolute top-4 left-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {displayCategory}
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
