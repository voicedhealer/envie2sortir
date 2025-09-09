"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";

interface ImagesManagerProps {
  establishmentId: string;
  establishmentSlug: string;
  currentImageUrl?: string | null;
  subscription?: 'STANDARD' | 'PREMIUM';
}

// Fonction utilitaire pour construire l'URL d'image
function getImageUrl(imagePath: string): string {
  // Vérifier que imagePath est bien une chaîne et non vide
  if (typeof imagePath !== 'string' || imagePath === '' || imagePath === 'undefined' || imagePath === 'null') {
    console.error('getImageUrl: imagePath invalide:', imagePath);
    return '';
  }
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Sinon, utiliser l'URL relative qui sera gérée par le rewrite
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

export default function ImagesManager({ establishmentId, establishmentSlug, currentImageUrl, subscription = 'STANDARD' }: ImagesManagerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | null>(currentImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [establishmentData, setEstablishmentData] = useState<any>(null);

  // Calculer la limite d'images selon l'abonnement
  const maxImages = subscription === 'PREMIUM' ? 10 : 1;
  const canUploadMore = images.length < maxImages;
  
  // Log pour debug
  console.log('🔍 État des images:', { images: images.length, maxImages, canUploadMore, subscription });

  // Fonction pour charger les images
  const loadImages = async () => {
    try {
      console.log('🔄 Chargement des images pour:', establishmentSlug);
      const response = await fetch(`/api/etablissements/${establishmentSlug}/images`, {
        credentials: 'include' // Inclure les cookies de session
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Données reçues:', data.establishment);
        setEstablishmentData(data); // Stocker les données de l'établissement
        const establishmentImages = data.establishment.images || [];
        
        if (establishmentImages.length > 0) {
          // Extraire les URLs des images et les filtrer
          const imageUrls = establishmentImages.map((img: any) => {
            if (typeof img.url === 'string') {
              return img.url;
            } else if (img.url && typeof img.url === 'object') {
              return img.url.url || img.url.path || '';
            } else {
              console.error('❌ img.url n\'est pas valide:', img.url);
              return '';
            }
          }).filter(url => {
            return typeof url === 'string' && 
                   url !== '' && 
                   url !== 'undefined' && 
                   url !== 'null' && 
                   url !== '{}' && 
                   url.length > 0;
          });
          
          setImages(imageUrls);
          console.log('🔄 Images mises à jour depuis establishmentData:', imageUrls);
        }
      } else {
        console.error('❌ Erreur lors du chargement des images:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des images:', error);
    }
  };

  // Charger les images existantes depuis la base de données
  useEffect(() => {
    loadImages();
  }, [establishmentSlug]);

  // Effet pour recharger les images quand establishmentData change
  useEffect(() => {
    if (establishmentData) {
      const establishmentImages = establishmentData.establishment.images || [];
      
      if (establishmentImages.length > 0) {
        const imageUrls = establishmentImages.map((img: any) => {
          if (typeof img.url === 'string') {
            return img.url;
          } else if (img.url && typeof img.url === 'object') {
            return img.url.url || img.url.path || '';
          } else {
            return '';
          }
        }).filter(url => {
          return typeof url === 'string' && 
                 url !== '' && 
                 url !== 'undefined' && 
                 url !== 'null' && 
                 url !== '{}' && 
                 url.length > 0;
        });
        
        setImages(imageUrls);
        console.log('🔄 Images mises à jour depuis establishmentData:', imageUrls);
        
        // Trouver l'image principale
        const primaryImg = establishmentImages.find((img: any) => img.isPrimary);
        if (primaryImg) {
          setPrimaryImage(primaryImg.url);
        } else if (imageUrls.length > 0) {
          setPrimaryImage(imageUrls[0]);
        }
      } else if (currentImageUrl) {
        // Fallback sur l'ancien système
        console.log('🔄 Fallback sur currentImageUrl:', currentImageUrl);
        setImages([currentImageUrl]);
        setPrimaryImage(currentImageUrl);
      } else {
        // Aucune image trouvée
        console.log('📭 Aucune image trouvée');
        setImages([]);
        setPrimaryImage(null);
      }
    }
  }, [establishmentData, currentImageUrl]);
  useEffect(() => {
    if (establishmentData) {
      const establishmentImages = establishmentData.establishment.images || [];
      const imageUrls = establishmentImages.map((img: any) => img.url);
      setImages(imageUrls);
      console.log('🔄 Images mises à jour depuis establishmentData:', imageUrls);
    }
  }, [establishmentData]);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📤 Remplacement d\'image:', file.name);

      // Si on a déjà une image, on la supprime d'abord
      if (images.length > 0) {
        console.log('🗑️ Suppression de l\'ancienne image avant remplacement');
        await removeImage(images[0]);
      }

      // Maintenant on peut uploader la nouvelle image
      const formData = new FormData();
      formData.append('image', file);
      formData.append('establishmentId', establishmentId);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      console.log('✅ Nouvelle image uploadée:', data);

      // Recharger les images après upload
      await loadImages();
      
    } catch (error) {
      console.error('❌ Erreur remplacement:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du remplacement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      console.log('📸 handleImageUpload appelé avec:', imageUrl);
      
      // Ajouter l'image à la liste immédiatement
      const newImages = [...images, imageUrl];
      setImages(newImages);
      console.log('📸 Images mises à jour:', newImages);
      
      // Si c'est la première image, la définir comme image principale
      if (!primaryImage) {
        setPrimaryImage(imageUrl);
        await updatePrimaryImage(imageUrl);
        console.log('📸 Image principale définie:', imageUrl);
      }
      
      toast.success('Image ajoutée avec succès !');
      
      // Forcer la synchronisation immédiate
      const loadImages = async () => {
        try {
          console.log('🔄 Rechargement immédiat des images depuis l\'API...');
          const response = await fetch(`/api/etablissements/${establishmentSlug}/images`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            const establishmentImages = data.establishment.images || [];
            const imageUrls = establishmentImages.map((img: any) => img.url);
            setImages(imageUrls);
            setEstablishmentData(data);
            console.log('🔄 Images rechargées après upload:', imageUrls);
            console.log('🔄 État final:', { images: imageUrls.length, maxImages, canUploadMore: imageUrls.length < maxImages });
          }
        } catch (error) {
          console.error('❌ Erreur lors du rechargement:', error);
        }
      };
      
      // Recharger immédiatement
      await loadImages();
      
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
      
      // Trouver l'ID de l'image à supprimer
      const imageToDelete = establishmentData?.establishment?.images?.find(img => img.url === imageUrl);
      if (!imageToDelete) {
        throw new Error('Image non trouvée');
      }
      
      // Appel API pour supprimer l'image de la base de données
      const response = await fetch(`/api/dashboard/images/${imageToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'image');
      }
      
      // Retirer l'image de la liste locale
      const newImages = images.filter(img => img !== imageUrl);
      setImages(newImages);
      
      // Si c'était l'image principale, en choisir une autre ou la vider
      if (primaryImage === imageUrl) {
        const newPrimary = newImages.length > 0 ? newImages[0] : null;
        setPrimaryImage(newPrimary);
        if (newPrimary) {
          await updatePrimaryImage(newPrimary);
        }
      }
      
      toast.success('Image supprimée avec succès !');
      
      // Recharger les images depuis l'API pour synchroniser
      setTimeout(() => {
        const loadImages = async () => {
          try {
            const response = await fetch(`/api/etablissements/${establishmentSlug}/images`, {
              credentials: 'include'
            });
            if (response.ok) {
              const data = await response.json();
              const establishmentImages = data.establishment.images || [];
              const imageUrls = establishmentImages.map((img: any) => img.url);
              setImages(imageUrls);
              console.log('🔄 Images rechargées après suppression:', imageUrls);
            }
          } catch (error) {
            console.error('❌ Erreur lors du rechargement:', error);
          }
        };
        loadImages();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Input file caché pour le bouton Remplacer */}
      <input
        type="file"
        id="replace-image-upload"
        accept="image/*"
        onChange={async (event) => {
          console.log('📤 Input file change détecté');
          const file = event.target.files?.[0];
          if (!file) {
            console.log('❌ Aucun fichier sélectionné');
            return;
          }
          console.log('📁 Fichier sélectionné:', file.name, file.size, 'bytes');
          
          // Appeler la fonction d'upload existante
          await handleFileUpload(file);
        }}
        className="hidden"
      />
      
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
        
        {canUploadMore ? (
          <ImageUpload 
            onImageUpload={handleImageUpload}
            onImageRemove={() => {}}
            establishmentId={establishmentId}
            currentImageUrl={undefined}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚫</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Limite d'images atteinte
            </h4>
            <p className="text-gray-600 mb-4">
              Vous avez atteint la limite de {maxImages} image{maxImages > 1 ? 's' : ''} pour votre plan {subscription === 'PREMIUM' ? 'Premium' : 'Gratuit'}.
            </p>
            {subscription === 'STANDARD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">
                  💡 Passez au plan Premium pour uploader jusqu'à 10 images !
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Voir les plans
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          Images actuelles : {images.length}/{maxImages} 
          {subscription === 'PREMIUM' ? ' (Plan Premium)' : ' (Plan Gratuit)'}
        </div>
      </div>



      {/* Images existantes */}
      {images.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mes images ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images
              .filter((imageUrl) => {
                // Filtrer les URLs invalides AVANT le map
                return typeof imageUrl === 'string' && 
                       imageUrl !== '' && 
                       imageUrl !== 'undefined' && 
                       imageUrl !== 'null' && 
                       imageUrl !== '{}' && 
                       imageUrl.length > 0;
              })
              .map((imageUrl, index) => {
                const fullUrl = getImageUrl(imageUrl);
                return (
                <div key={`${imageUrl}-${index}`} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={fullUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{
                        minHeight: '200px',
                        backgroundColor: '#f3f4f6'
                      }}
                      onError={(e) => {
                        console.error('Erreur chargement image:', e);
                      }}
                      onLoad={() => {
                        // Image chargée avec succès
                      }}
                    />
                  </div>
                
                {/* Overlay avec actions - FINAL */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-white/20 group-hover:backdrop-blur-sm transition-all duration-300 rounded-lg flex items-center justify-center z-10">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    {primaryImage !== imageUrl && (
                      <button
                        onClick={() => updatePrimaryImage(imageUrl)}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        ⭐ Image principale
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(imageUrl)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      🗑️ Supprimer
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔄 Bouton Remplacer cliqué');
                        // Déclencher l'upload d'une nouvelle image
                        const fileInput = document.getElementById('replace-image-upload') as HTMLInputElement;
                        if (fileInput) {
                          console.log('📁 Input file trouvé, ouverture du sélecteur');
                          fileInput.click();
                        } else {
                          console.error('❌ Input file non trouvé');
                        }
                      }}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      📷 Remplacer
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
              );
            })}
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
