'use client';

import { useState, useEffect } from 'react';
import { X, Brain, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternName: string;
  detectedType: string;
  confidence?: number;
  onValidate: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ValidationModal({
  isOpen,
  onClose,
  patternName,
  detectedType,
  confidence,
  onValidate,
  onCancel,
  isLoading = false
}: ValidationModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      onCancel();
      setIsClosing(false);
    }, 200);
  };

  const handleValidate = () => {
    onValidate();
  };

  if (!isOpen && !isClosing) return null;

  // Formater le type détecté pour l'affichage
  const formatType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Obtenir l'emoji selon le type
  const getTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      'karaoke': '🎤',
      'restaurant': '🍽️',
      'bar': '🍻',
      'parc_loisir_indoor': '🎪',
      'escape_game': '🎯',
      'vr_experience': '🎮',
      'cinema': '🎬',
      'hotel': '🏨',
      'spa': '🧖',
      'sport': '⚽',
      'shopping': '🛍️',
    };
    return emojiMap[type] || '🏢';
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop avec blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Validation de détection</h3>
                <p className="text-sm text-white/90">Intelligence d'apprentissage</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-6 py-6">
          {/* Message principal */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4 text-center">
              Valider la détection pour cet établissement ?
            </p>
            
            {/* Établissement */}
            <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 mb-4 border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Établissement</p>
                  <p className="font-bold text-gray-900 text-lg">{patternName}</p>
                </div>
              </div>
            </div>

            {/* Type détecté */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeEmoji(detectedType)}</div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type détecté</p>
                    <p className="font-semibold text-blue-900">{formatType(detectedType)}</p>
                  </div>
                </div>
                {confidence !== undefined && (
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            confidence >= 90 ? 'bg-green-500' :
                            confidence >= 70 ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                        {confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Confiance</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Cette action validera la détection automatique et l'ajoutera aux patterns d'apprentissage.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleValidate}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Validation...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Valider</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

