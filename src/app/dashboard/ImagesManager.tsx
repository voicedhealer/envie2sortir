"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/fake-toast";
import ImageUpload from "@/components/ImageUpload";
import { getMinImages, getMaxImages } from "@/lib/subscription-utils";

interface ImagesManagerProps {
  establishmentId: string; // Gardé pour compatibilité mais non utilisé
  establishmentSlug: string; // Gardé pour compatibilité mais non utilisé
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
  const { data: session, status } = useSession();
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | null>(currentImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [establishmentData, setEstablishmentData] = useState<any>(null);

  // Calculer les limites d'images selon l'abonnement
  const minImages = getMinImages(subscription);
  const maxImages = getMaxImages(subscription);
  const canUploadMore = images.length < maxImages;
  const hasMinimumImages = images.length >= minImages;
  
  // Log pour debug
  console.log('🔍 État des images:', { images: images.length, minImages, maxImages, canUploadMore, hasMinimumImages, subscription });

  // Charger les images quand la session est prête
  useEffect(() => {
    console.log('🔍 État de la session:', { status, hasSession: !!session, hasUser: !!session?.user });
    
    if (status === 'authenticated' && session?.user) {
      console.log('✅ Session authentifiée, chargement des images...');
      loadImages();
    } else if (status === 'unauthenticated') {
      console.log('❌ Session non authentifiée');
      setError('Session expirée. Veuillez vous reconnecter.');
    } else if (status === 'loading') {
      console.log('⏳ Session en cours de chargement...');
    } else {
      console.log('⚠️ État de session inattendu:', { status, session });
    }
  }, [status, session]);

  // Afficher un message si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Session expirée</h3>
        <p className="text-red-600 mb-4">Vous devez vous reconnecter pour gérer vos images.</p>
        <a 
          href="/auth" 
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Se reconnecter
        </a>
      </div>
    );
  }

  // Afficher un loader pendant le chargement de la session
  if (status === 'loading') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de votre session...</p>
      </div>
    );
  }

  // Fonction pour charger les images avec retry et backoff
  const loadImages = async (retryCount = 0) => {
    try {
      // Vérifier l'authentification
      if (status === 'loading') {
        console.log('⏳ Session en cours de chargement...');
        return;
      }
      
      if (!session?.user) {
        console.error('❌ Utilisateur non authentifié');
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      console.log('🔄 Chargement des images pour l\'établissement:', establishmentId);
      console.log('🔍 Appel API /api/etablissements/images (sans establishmentId - recherche par session)');
      
      const response = await fetch(`/api/etablissements/images`, {
        method: 'GET',
        credentials: 'include', // Inclure les cookies de session
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Réponse API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
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
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limiting - retry avec backoff exponentiel
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Rate limiting détecté, retry dans ${delay}ms (tentative ${retryCount + 1}/3)`);
        setTimeout(() => {
          loadImages(retryCount + 1);
        }, delay);
        return;
      } else {
        console.error('❌ Erreur lors du chargement des images:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des images:', error);
    }
  };

  // Note: Le chargement des images est maintenant géré par l'effet de session ci-dessus

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
      // Vérifier l'authentification
      if (!session?.user) {
        console.error('❌ Utilisateur non authentifié');
        setError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
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
          const response = await fetch(`/api/etablissements/images`, {
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
      // Vérifier l'authentification
      console.log('🔍 Vérification de session avant updatePrimaryImage:', { 
        status, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      
      if (!session?.user) {
        console.error('❌ Utilisateur non authentifié');
        setError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      console.log('🔄 Mise à jour image principale:', imageUrl);
      
      // Utiliser l'API pour l'établissement de l'utilisateur connecté
      const response = await fetch(`/api/etablissements/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclure les cookies de session
        body: JSON.stringify({
          imageUrl: imageUrl
        }),
      });

      console.log('📡 Réponse API:', response.status, response.statusText);

      if (!response.ok) {
        let errorData: any = {};
        let responseText = '';
        
        try {
          // Cloner la réponse pour pouvoir la lire plusieurs fois
          const responseClone = response.clone();
          responseText = await responseClone.text();
          console.log('📝 Réponse brute:', responseText);
          console.log('📝 Longueur de la réponse:', responseText.length);
          console.log('📝 Type de contenu:', response.headers.get('content-type'));
          
          if (responseText.trim()) {
            // Vérifier si c'est du JSON
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              try {
                errorData = JSON.parse(responseText);
                console.log('✅ JSON parsé avec succès:', errorData);
              } catch (jsonError) {
                console.error('❌ Erreur parsing JSON:', jsonError);
                errorData = { 
                  error: `Réponse JSON invalide du serveur`,
                  rawResponse: responseText.substring(0, 200),
                  parseError: jsonError instanceof Error ? jsonError.message : 'Erreur inconnue'
                };
              }
            } else {
              // Probablement du HTML ou du texte
              console.warn('⚠️ Réponse non-JSON reçue, probablement une erreur Next.js');
              errorData = { 
                error: `Erreur serveur (${response.status})`,
                rawResponse: responseText.substring(0, 200),
                isHtml: contentType?.includes('text/html')
              };
            }
          } else {
            console.warn('⚠️ Réponse vide reçue');
            errorData = { 
              error: `Erreur ${response.status}: ${response.statusText}`,
              emptyResponse: true
            };
          }
        } catch (textError) {
          console.error('❌ Erreur lecture réponse:', textError);
          errorData = { 
            error: `Erreur ${response.status}: Impossible de lire la réponse`,
            readError: textError instanceof Error ? textError.message : 'Erreur inconnue'
          };
        }
        
        console.error('❌ Erreur API détaillée:', {
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.substring(0, 500),
          errorData: errorData,
          url: response.url,
          contentType: response.headers.get('content-type'),
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Log supplémentaire pour debug
        console.error('❌ Détails de l\'erreur:', {
          hasErrorData: !!errorData,
          errorDataKeys: errorData ? Object.keys(errorData) : 'N/A',
          errorDataType: typeof errorData,
          responseTextLength: responseText.length,
          responseTextPreview: responseText.substring(0, 200)
        });
        
        let errorMessage = 'Erreur lors de la mise à jour';
        
        if (response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (response.status === 403) {
          errorMessage = 'Vous n\'avez pas les permissions pour modifier cet établissement.';
        } else if (response.status === 404) {
          errorMessage = 'Établissement non trouvé.';
        } else if (response.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer.';
        } else if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          errorMessage = `Erreur: ${JSON.stringify(errorData)}`;
        } else {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        
        setError(errorMessage);
        throw new Error(`Erreur API ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Image principale mise à jour:', result);
      
      setPrimaryImage(imageUrl);
      toast.success('Image principale mise à jour !');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'image principale:', error);
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
            const response = await fetch(`/api/etablissements/images`, {
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
        
        {/* Message informatif sur le format des images */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="text-blue-500 mr-3 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Astuce sur les formats d'images</h4>
              <p className="text-sm text-blue-800">
                <strong>Photos en mode paysage</strong> (horizontales) : créent un effet de zoom immersif dans la galerie, idéal pour mettre en valeur l'ambiance.
                <br />
                <strong>Photos en mode portrait ou carré</strong> : s'affichent avec un effet plus doux.
              </p>
            </div>
          </div>
        </div>
        
        {/* Avertissement si minimum non atteint */}
        {!hasMinimumImages && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="text-orange-500 mr-3 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-orange-900 mb-1">⚠️ Photos obligatoires</h4>
                <p className="text-sm text-orange-800">
                  Vous devez ajouter au minimum <strong>{minImages} photos</strong> pour votre établissement. 
                  Actuellement : {images.length}/{minImages}
                </p>
              </div>
            </div>
          </div>
        )}
        
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
              Vous avez atteint la limite de {maxImages} image{maxImages > 1 ? 's' : ''} pour votre plan {subscription === 'PREMIUM' ? 'Premium' : 'Standard'}.
            </p>
            {subscription === 'STANDARD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">
                  💡 Passez au plan Premium pour uploader jusqu'à 5 images !
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
          {subscription === 'PREMIUM' ? ' (Plan Premium)' : ' (Plan Standard)'}
          {!hasMinimumImages && (
            <span className="text-orange-600 font-medium"> - Minimum requis : {minImages}</span>
          )}
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
