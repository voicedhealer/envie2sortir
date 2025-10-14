'use client';

import { useState, useEffect } from 'react';
import { X, Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface TypeCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentName: string;
  detectedType: string;
  onTypeCorrected: (correctedType: string) => void;
}

const ESTABLISHMENT_TYPES = [
  { key: 'parc_loisir_indoor', label: 'Parc de loisir indoor', emoji: '🎪' },
  { key: 'escape_game', label: 'Escape Game', emoji: '🎯' },
  { key: 'vr_experience', label: 'Réalité Virtuelle', emoji: '🎮' },
  { key: 'karaoke', label: 'Karaoké', emoji: '🎤' },
  { key: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { key: 'bar', label: 'Bar', emoji: '🍻' },
  { key: 'cinema', label: 'Cinéma', emoji: '🎬' },
  { key: 'hotel', label: 'Hôtel', emoji: '🏨' },
  { key: 'spa', label: 'Spa', emoji: '🧖' },
  { key: 'sport', label: 'Sport', emoji: '⚽' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { key: 'autre', label: 'Autre', emoji: '❓' }
];

export default function TypeCorrectionModal({
  isOpen,
  onClose,
  establishmentName,
  detectedType,
  onTypeCorrected
}: TypeCorrectionModalProps) {
  const [selectedType, setSelectedType] = useState(detectedType);
  const [isCorrecting, setIsCorrecting] = useState(false);

  useEffect(() => {
    setSelectedType(detectedType);
  }, [detectedType]);

  const handleCorrection = async () => {
    if (selectedType === detectedType) {
      onClose();
      return;
    }

    setIsCorrecting(true);
    try {
      // Appeler l'API pour corriger le type
      const response = await fetch('/api/establishments/correct-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishmentName,
          detectedType,
          correctedType: selectedType
        })
      });

      if (response.ok) {
        onTypeCorrected(selectedType);
        onClose();
      } else {
        console.error('Erreur correction type');
      }
    } catch (error) {
      console.error('Erreur correction type:', error);
    } finally {
      setIsCorrecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Correction du type</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{establishmentName}</strong>
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span>Type détecté: <strong>{ESTABLISHMENT_TYPES.find(t => t.key === detectedType)?.label || detectedType}</strong></span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type correct:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {ESTABLISHMENT_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedType === type.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCorrection}
            disabled={isCorrecting || selectedType === detectedType}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isCorrecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Correction...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Corriger</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

