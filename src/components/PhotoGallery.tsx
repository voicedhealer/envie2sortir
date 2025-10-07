'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useClickTracking } from '@/hooks/useClickTracking';

interface PhotoGalleryProps {
  images: Array<{ url: string; isMain?: boolean }> | string[];
  establishmentName: string;
  establishmentId?: string;
}

export default function PhotoGallery({ images, establishmentName, establishmentId }: PhotoGalleryProps) {
  // Hook de tracking
  const { trackClick } = useClickTracking(establishmentId || '');
  
  // Si moins de 2 images, ne pas afficher la galerie
  if (!images || images.length < 2) {
    return null;
  }

  // Normaliser les images (gérer les cas string[] et Array<{url, isMain}>)
  const normalizedImages = images.map(img => 
    typeof img === 'string' ? { url: img, isMain: false } : img
  );

  // Limiter à 5 images maximum pour l'effet galerie
  const galleryImages = normalizedImages.slice(0, 5);

  // Trouver l'index de l'image principale (ou 0 par défaut)
  const defaultActiveIndex = galleryImages.findIndex(img => img.isMain) !== -1 
    ? galleryImages.findIndex(img => img.isMain) 
    : 0;

  // Initialiser avec l'image principale active
  const [activeIndex, setActiveIndex] = useState<number>(defaultActiveIndex);
  
  // Fonction pour tracker le clic sur une image
  const handleImageClick = (index: number) => {
    if (establishmentId) {
      trackClick({
        elementType: 'image',
        elementId: `gallery-image-${index}`,
        elementName: `Image ${index + 1} de la galerie`,
        action: 'click',
        sectionContext: 'photo_gallery',
      });
    }
  };

  return (
    <div className="photo-gallery-container">
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className={`gallery_item ${activeIndex === index ? 'gallery_item_active' : ''}`}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(defaultActiveIndex)}
          onClick={() => handleImageClick(index)}
        >
          <Image
            src={image.url}
            alt={`${establishmentName} - Image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 20vw"
            style={{ objectFit: 'cover' }}
            priority={index === defaultActiveIndex}
          />
          
          <div className="gallery_item_overlay">
          </div>
        </div>
      ))}
    </div>
  );
}

