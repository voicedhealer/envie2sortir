'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PhotoGalleryProps {
  images: string[];
  establishmentName: string;
}

export default function PhotoGallery({ images, establishmentName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Si moins de 2 images, ne pas afficher la galerie
  if (!images || images.length < 2) {
    return null;
  }

  // Limiter à 5 images maximum pour l'effet galerie
  const galleryImages = images.slice(0, 5);

  const handleItemClick = (index: number) => {
    if (isMobile) {
      // Sur mobile, basculer l'état actif
      setActiveIndex(activeIndex === index ? null : index);
    }
  };

  const handleItemHover = (index: number) => {
    if (!isMobile) {
      // Sur desktop, utiliser le hover
      setActiveIndex(index);
    }
  };

  const handleItemLeave = () => {
    if (!isMobile) {
      // Sur desktop, désactiver au leave
      setActiveIndex(null);
    }
  };

  return (
    <div className="photo-gallery-container">
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className={`gallery_item ${activeIndex === index ? 'gallery_item_active' : ''}`}
          onMouseEnter={() => handleItemHover(index)}
          onMouseLeave={handleItemLeave}
          onClick={() => handleItemClick(index)}
        >
          <Image
            src={image}
            alt={`${establishmentName} - Image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 20vw"
            style={{ objectFit: 'cover' }}
            priority={index === 0}
          />
          
          {activeIndex === index && (
            <div className="gallery_item_overlay">
              <p className="text-sm font-medium">Image {index + 1} / {galleryImages.length}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

