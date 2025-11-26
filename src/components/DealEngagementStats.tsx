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
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="bg-orange-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-600" />
          <span className="text-xs md:text-sm font-semibold text-orange-800">Engagement</span>
        </div>
        <span className={`font-bold text-sm md:text-base ${
          stats.engagementRate >= 70 ? 'text-green-600' :
          stats.engagementRate >= 50 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {stats.engagementRate.toFixed(1)}%
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Intéressés */}
        <div className="flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-green-600" />
          <span className="text-xs md:text-sm font-semibold text-green-700">{stats.liked}</span>
          <span className="text-xs text-gray-600">Int.</span>
        </div>
        
        {/* Pas intéressés */}
        <div className="flex items-center gap-1.5">
          <ThumbsDown className="w-4 h-4 text-red-600" />
          <span className="text-xs md:text-sm font-semibold text-red-700">{stats.disliked}</span>
          <span className="text-xs text-gray-600">Pas int.</span>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            stats.engagementRate >= 70 ? 'bg-green-500' :
            stats.engagementRate >= 50 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${Math.min(stats.engagementRate, 100)}%` }}
        />
      </div>
      
      {/* Total */}
      <div className="text-center">
        <span className="text-xs text-gray-500">
          {stats.total} interaction{stats.total > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}