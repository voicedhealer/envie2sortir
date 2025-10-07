'use client';

import { useState, useEffect } from 'react';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';
import TypeCorrectionModal from './TypeCorrectionModal';

interface LearningSuggestionsProps {
  establishmentName: string;
  detectedType: string;
  onTypeChanged: (newType: string) => void;
}

interface TypeSuggestion {
  type: string;
  confidence: number;
  reason: string;
  keywords: string[];
}

export default function LearningSuggestions({
  establishmentName,
  detectedType,
  onTypeChanged
}: LearningSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TypeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  useEffect(() => {
    if (establishmentName && establishmentName.length > 3) {
      fetchSuggestions();
    }
  }, [establishmentName]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/establishments/suggest-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: establishmentName,
          googleTypes: [], // TODO: Récupérer depuis le formulaire
          description: ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Erreur récupération suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeCorrection = (correctedType: string) => {
    onTypeChanged(correctedType);
    setShowCorrectionModal(false);
    // Rafraîchir les suggestions
    fetchSuggestions();
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-blue-700">Analyse des suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <h4 className="font-semibold text-purple-800">Suggestions intelligentes</h4>
        </div>

        <div className="space-y-2">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                suggestion.type === detectedType
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => onTypeChanged(suggestion.type)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-800">
                    {suggestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(suggestion.confidence * 100)}%)
                  </span>
                </div>
                {suggestion.type === detectedType && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Sélectionné</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
              {suggestion.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestion.keywords.slice(0, 5).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-purple-200">
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Corriger manuellement le type</span>
          </button>
        </div>
      </div>

      <TypeCorrectionModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        establishmentName={establishmentName}
        detectedType={detectedType}
        onTypeCorrected={handleTypeCorrection}
      />
    </>
  );
}

