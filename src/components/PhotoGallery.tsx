'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PhotoGalleryProps {
  images: string[];
  establishmentName: string;
}

export default function PhotoGallery({ images, establishmentName }: PhotoGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Si moins de 2 images, ne pas afficher la galerie
  if (!images || images.length < 2) {
    return null;
  }

  // Limiter à 5 images maximum pour l'effet galerie
  const galleryImages = images.slice(0, 5);

  return (
    <div className="photo-gallery-container">
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className="gallery_item"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={image}
            alt={`${establishmentName} - Image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 20vw"
            style={{ objectFit: 'cover' }}
            priority={index === 0}
          />
          
          <div className="gallery_item_overlay">
            <p className="text-sm font-medium">Image {index + 1} / {galleryImages.length}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

