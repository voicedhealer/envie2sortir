"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";

interface ImagesManagerProps {
  establishmentId: string;
  establishmentSlug: string;
  currentImageUrl?: string | null;
}

// Composant wrapper pour gérer les erreurs d'image
function SafeImage({ src, alt, className, onError, onLoad }: {
  src: string;
  alt: string;
  className: string;
  onError?: () => void;
  onLoad?: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Image non disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400">Chargement...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

export default function ImagesManager({ establishmentId, establishmentSlug, currentImageUrl }: ImagesManagerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | null>(currentImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les images existantes depuis la base de données
  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🔄 Chargement des images pour:', establishmentSlug);
        const response = await fetch(`/api/etablissements/${establishmentSlug}/images`, {
          credentials: 'include' // Inclure les cookies de session
        });
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Données reçues:', data.establishment);
          const establishmentImages = data.establishment.images || [];
          
          if (establishmentImages.length > 0) {
            const imageUrls = establishmentImages.map((img: any) => img.url);
            console.log('🖼️ URLs des images:', imageUrls);
            setImages(imageUrls);
            
            // Trouver l'image principale
            const primaryImg = establishmentImages.find((img: any) => img.isPrimary);
            if (primaryImg) {
              setPrimaryImage(primaryImg.url);
            } else if (imageUrls.length > 0) {
              // Si aucune image n'est marquée comme principale, prendre la première
              setPrimaryImage(imageUrls[0]);
              console.log('🎯 Aucune image principale trouvée, utilisation de la première:', imageUrls[0]);
            }
          } else if (currentImageUrl) {
            // Fallback sur l'ancien système
            setImages([currentImageUrl]);
            setPrimaryImage(currentImageUrl);
          }
        } else {
          console.error('❌ Erreur API:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des images:', error);
        // Fallback sur l'ancien système
        if (currentImageUrl) {
          setImages([currentImageUrl]);
          setPrimaryImage(currentImageUrl);
        }
      }
    };

    loadImages();
  }, [establishmentSlug, currentImageUrl]);

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      
      // Ajouter l'image à la liste
      const newImages = [...images, imageUrl];
      setImages(newImages);
      
      // Si c'est la première image, la définir comme image principale
      if (!primaryImage) {
        setPrimaryImage(imageUrl);
        await updatePrimaryImage(imageUrl);
      }
      
      toast.success('Image ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      toast.error('Erreur lors de l\'ajout de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrimaryImage = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/etablissements/${establishmentSlug}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclure les cookies de session
        body: JSON.stringify({
          imageUrl: imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        if (response.status === 403) {
          setError('Vous n\'avez pas les permissions pour modifier cet établissement. Assurez-vous d\'être connecté avec le bon compte.');
        } else {
          setError(errorData.error || 'Erreur lors de la mise à jour');
        }
        
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      setPrimaryImage(imageUrl);
      toast.success('Image principale mise à jour !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'image principale:', error);
      toast.error('Erreur lors de la mise à jour de l\'image principale');
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      
      // Retirer l'image de la liste
      const newImages = images.filter(img => img !== imageUrl);
      setImages(newImages);
      
      // Si c'était l'image principale, en choisir une autre ou la vider
      if (primaryImage === imageUrl) {
        const newPrimary = newImages.length > 0 ? newImages[0] : null;
        setPrimaryImage(newPrimary);
        await updatePrimaryImage(newPrimary || '');
      }
      
      toast.success('Image supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur de permissions</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload d'images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ajouter une image
        </h3>
        <ImageUpload 
          onImageUpload={handleImageUpload}
          onImageRemove={() => {}}
          establishmentId={establishmentId}
          currentImageUrl={undefined}
        />
      </div>

      {/* Images existantes */}
      {images.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mes images ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <SafeImage
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="object-cover"
                    onError={() => {
                      console.error('Erreur chargement image:', imageUrl);
                    }}
                    onLoad={() => {
                      console.log('Image chargée avec succès:', imageUrl);
                    }}
                  />
                </div>
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {primaryImage !== imageUrl && (
                      <button
                        onClick={() => updatePrimaryImage(imageUrl)}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Image principale
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(imageUrl)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                
                {/* Badge image principale */}
                {primaryImage === imageUrl && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Image principale
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Conseils pour vos images
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• L'image principale sera affichée sur la vignette de recherche</li>
          <li>• Formats acceptés : JPG, PNG, WebP (max 5MB)</li>
          <li>• Recommandation : images en format paysage (16:9 ou 4:3)</li>
          <li>• Vous pouvez changer l'image principale à tout moment</li>
        </ul>
      </div>
    </div>
  );
}
