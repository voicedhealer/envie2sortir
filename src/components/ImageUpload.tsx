'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove?: () => void;
  establishmentId?: string;
  className?: string;
  uploadType?: 'establishment' | 'event';
  // ✅ NOUVEAU : Support pour uploads multiples
  multiple?: boolean;
  onMultipleImagesUpload?: (imageUrls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  onImageRemove,
  establishmentId,
  className = '',
  uploadType = 'establishment',
  multiple = false,
  onMultipleImagesUpload,
  maxImages = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer pour masquer la notification de succès après 3 secondes
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // ✅ NOUVEAU : Gestion de l'upload multiple
    if (multiple && onMultipleImagesUpload) {
      return handleMultipleFileUpload(files);
    }

    // Upload simple (ancien comportement)
    const file = files[0];

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Fichier trop volumineux. Taille maximum: 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      if (uploadType === 'establishment' && !establishmentId) {
        setUploadError('ID d\'établissement manquant. Veuillez recharger la page.');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      
      // Pour les images d'établissement, ajouter l'ID d'établissement
      if (uploadType === 'establishment' && establishmentId) {
        formData.append('establishmentId', establishmentId);
      }

      // Choisir l'API selon le type d'upload
      const apiEndpoint = uploadType === 'event' ? '/api/upload/event-image' : '/api/upload/image';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      onImageUpload(result.imageUrl);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ NOUVEAU : Gestion de l'upload multiple
  const handleMultipleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Limiter le nombre de fichiers
    if (fileArray.length > maxImages) {
      setUploadError(`Vous ne pouvez uploader que ${maxImages} images maximum`);
      return;
    }

    // Valider tous les fichiers
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`Type de fichier non autorisé: ${file.name}. Formats acceptés: JPG, PNG, WebP`);
        return;
      }
      if (file.size > maxSize) {
        setUploadError(`Fichier trop volumineux: ${file.name}. Taille maximum: 5MB`);
        return;
      }
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress('');

    try {
      if (uploadType === 'establishment' && !establishmentId) {
        setUploadError('ID d\'établissement manquant. Veuillez recharger la page.');
        return;
      }

      const uploadedUrls: string[] = [];

      // Uploader chaque fichier séquentiellement
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Upload ${i + 1}/${fileArray.length}: ${file.name}`);

        const formData = new FormData();
        formData.append('image', file);
        
        if (uploadType === 'establishment' && establishmentId) {
          formData.append('establishmentId', establishmentId);
        }

        const apiEndpoint = uploadType === 'event' ? '/api/upload/event-image' : '/api/upload/image';

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Erreur lors de l\'upload de ${file.name}`);
        }

        uploadedUrls.push(result.imageUrl);
      }

      onMultipleImagesUpload?.(uploadedUrls);
      setShowSuccessMessage(true);
      setUploadProgress('');
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image actuelle */}
      {currentImageUrl && (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Image actuelle" 
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zone d'upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          multiple={multiple}
        />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-600">Upload en cours...</p>
            {uploadProgress && (
              <p className="text-xs text-gray-500">{uploadProgress}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {multiple 
                  ? `Ajouter des images (max ${maxImages})`
                  : (currentImageUrl ? 'Changer l&apos;image' : 'Ajouter une image')
                }
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP (max 5MB{multiple ? ' par image' : ''})
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choisir {multiple ? 'des fichiers' : 'un fichier'}
            </button>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Message de succès temporaire */}
      {showSuccessMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-600">
            {multiple ? 'Images ajoutées avec succès !' : 'Image ajoutée avec succès !'}
          </p>
        </div>
      )}
    </div>
  );
}
