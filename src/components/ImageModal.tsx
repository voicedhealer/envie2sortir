'use client';

import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt, title }: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Gérer la fermeture avec la touche Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Réinitialiser le zoom quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Titre si fourni */}
      {title && (
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      {/* Bouton zoom */}
      <button
        onClick={handleImageClick}
        className="absolute bottom-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200"
        aria-label={isZoomed ? "Réduire" : "Agrandir"}
      >
        <ZoomIn className="w-6 h-6" />
      </button>

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] p-4">
        <img
          src={imageUrl}
          alt={alt}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={handleImageClick}
          style={{
            maxWidth: isZoomed ? 'none' : '90vw',
            maxHeight: isZoomed ? 'none' : '90vh'
          }}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
        <p>Cliquez sur l'image pour zoomer • Échap pour fermer</p>
      </div>
    </div>
  );
}
