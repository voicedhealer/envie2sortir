'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  currentCount: number;
  totalCount?: number;
}

export default function LoadMoreButton({ 
  onLoadMore, 
  loading, 
  hasMore, 
  currentCount,
  totalCount 
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Vous avez vu tous les établissements disponibles
        </p>
        {totalCount && (
          <p className="text-gray-400 text-xs mt-1">
            {totalCount} établissement{totalCount > 1 ? 's' : ''} au total
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            Voir plus d'établissements
            <span className="text-orange-200 text-sm">
              ({currentCount} affichés)
            </span>
          </>
        )}
      </button>
    </div>
  );
}
