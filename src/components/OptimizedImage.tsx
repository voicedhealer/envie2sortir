"use client";

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  // Variantes disponibles
  variants?: {
    hero?: string;
    card?: string;
    thumbnail?: string;
    main?: string;
    preview?: string;
  };
  // Usage pour déterminer la variante à utiliser
  usage?: 'hero' | 'card' | 'thumbnail' | 'main' | 'preview';
  // Fallback si pas de variantes
  fallback?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  variants,
  usage = 'hero',
  fallback
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Déterminer quelle variante utiliser
  const getImageSrc = () => {
    if (imageError && fallback) {
      return fallback;
    }

    if (variants && variants[usage]) {
      return variants[usage];
    }

    return src;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={getImageSrc()}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        // Optimisations Next.js
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            Image non disponible
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook pour gérer les variantes d'images
 */
export function useImageVariants(baseSrc: string, variants?: Record<string, string>) {
  const [currentVariant, setCurrentVariant] = useState<string>('hero');

  const getOptimalSrc = (containerWidth: number) => {
    if (!variants) return baseSrc;

    // Logique de sélection de la variante selon la largeur du conteneur
    if (containerWidth <= 150) {
      return variants.thumbnail || variants.card || baseSrc;
    } else if (containerWidth <= 400) {
      return variants.card || variants.hero || baseSrc;
    } else {
      return variants.hero || variants.main || baseSrc;
    }
  };

  return {
    currentVariant,
    setCurrentVariant,
    getOptimalSrc
  };
}




