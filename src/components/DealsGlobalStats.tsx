"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, Users, BarChart3 } from 'lucide-react';

interface GlobalEngagementStats {
  totalLiked: number;
  totalDisliked: number;
  totalInteractions: number;
  averageEngagementRate: number;
  dealsCount: number;
}

interface DealsGlobalStatsProps {
  establishmentId: string;
}

export default function DealsGlobalStats({ establishmentId }: DealsGlobalStatsProps) {
  const [stats, setStats] = useState<GlobalEngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/deals/engagement?establishmentId=${establishmentId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Calculer les statistiques globales
          const globalStats: GlobalEngagementStats = {
            totalLiked: data.stats.liked || 0,
            totalDisliked: data.stats.disliked || 0,
            totalInteractions: data.stats.total || 0,
            averageEngagementRate: data.stats.engagementRate || 0,
            dealsCount: data.engagements ? new Set(data.engagements.map((e: any) => e.dealId)).size : 0
          };
          
          setStats(globalStats);
        } else {
          setError('Données non disponibles');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques globales:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
    
    // Rafraîchir les stats toutes les 30 secondes
    const interval = setInterval(fetchGlobalStats, 30000);
    
    return () => clearInterval(interval);
  }, [establishmentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>{error || 'Aucune donnée disponible'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Statistiques Globales des Bons Plans</h3>
      </div>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total intéressés */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Intéressés</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{stats.totalLiked}</div>
        </div>
        
        {/* Total pas intéressés */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Pas intéressés</span>
          </div>
          <div className="text-2xl font-bold text-red-800">{stats.totalDisliked}</div>
        </div>
        
        {/* Total interactions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Interactions</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{stats.totalInteractions}</div>
        </div>
        
        {/* Taux d'engagement moyen */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Taux Moyen</span>
          </div>
          <div className={`text-2xl font-bold ${
            stats.averageEngagementRate >= 70 ? 'text-green-600' :
            stats.averageEngagementRate >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {stats.averageEngagementRate.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Barre de progression globale */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Engagement Global</span>
          <span className="text-sm text-gray-600">{stats.totalInteractions} interactions</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              stats.averageEngagementRate >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
              stats.averageEngagementRate >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${Math.min(stats.averageEngagementRate, 100)}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {stats.totalLiked} intéressés sur {stats.totalInteractions} interactions totales
        </div>
      </div>
      
      {/* Légende des couleurs */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Excellent (≥70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Bon (50-69%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>À améliorer (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}
