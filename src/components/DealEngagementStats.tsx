"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, Users } from 'lucide-react';

interface EngagementStats {
  liked: number;
  disliked: number;
  total: number;
  engagementRate: number;
}

interface DealEngagementStatsProps {
  dealId: string;
  establishmentId: string;
}

export default function DealEngagementStats({ dealId, establishmentId }: DealEngagementStatsProps) {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/deals/engagement?dealId=${dealId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError('Données non disponibles');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Rafraîchir les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [dealId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-sm text-gray-600">Chargement...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center p-4 text-gray-500 text-sm">
        {error || 'Aucune donnée disponible'}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        <h4 className="font-semibold text-orange-800 text-sm">Engagement</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Intéressés */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <span className="text-lg font-bold text-green-700">{stats.liked}</span>
          </div>
          <p className="text-xs text-gray-600">Intéressés</p>
        </div>
        
        {/* Pas intéressés */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ThumbsDown className="w-4 h-4 text-red-600" />
            <span className="text-lg font-bold text-red-700">{stats.disliked}</span>
          </div>
          <p className="text-xs text-gray-600">Pas intéressés</p>
        </div>
      </div>
      
      {/* Taux d'engagement */}
      <div className="mt-3 pt-3 border-t border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-700">Taux d'engagement</span>
          </div>
          <span className={`font-bold text-sm ${
            stats.engagementRate >= 70 ? 'text-green-600' :
            stats.engagementRate >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {stats.engagementRate.toFixed(1)}%
          </span>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              stats.engagementRate >= 70 ? 'bg-green-500' :
              stats.engagementRate >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.engagementRate, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Total */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500">
          {stats.total} interaction{stats.total > 1 ? 's' : ''} au total
        </span>
      </div>
    </div>
  );
}