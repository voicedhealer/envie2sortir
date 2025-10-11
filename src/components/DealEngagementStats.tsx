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
  establishmentId: string;
  dealId?: string;
}

export default function DealEngagementStats({ establishmentId, dealId }: DealEngagementStatsProps) {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const url = dealId 
          ? `/api/deals/engagement?dealId=${dealId}`
          : `/api/deals/engagement?establishmentId=${establishmentId}`;
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [establishmentId, dealId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Engagement des bons plans
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucune interaction sur vos bons plans pour le moment</p>
        </div>
      </div>
    );
  }

  const positiveRate = stats.total > 0 ? (stats.liked / stats.total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        Engagement des bons plans
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total interactions */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total interactions</div>
        </div>

        {/* Intéressés */}
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">{stats.liked}</div>
          <div className="text-sm text-green-600">Intéressés</div>
        </div>

        {/* Pas intéressés */}
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <ThumbsDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-700">{stats.disliked}</div>
          <div className="text-sm text-red-600">Pas intéressés</div>
        </div>
      </div>

      {/* Taux d'engagement positif */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-orange-800">Taux d'intérêt positif</span>
          <span className="text-lg font-bold text-orange-900">{positiveRate.toFixed(1)}%</span>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-orange-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${positiveRate}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-orange-700 mt-2">
          {positiveRate >= 70 ? 'Excellent engagement !' : 
           positiveRate >= 50 ? 'Bon engagement' : 
           positiveRate >= 30 ? 'Engagement moyen' : 
           'Engagement faible - pensez à ajuster vos offres'}
        </p>
      </div>

      {/* Insights */}
      {stats.total >= 5 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Insight</h4>
          <p className="text-xs text-blue-800">
            {positiveRate >= 70 ? 
              'Vos bons plans génèrent un fort intérêt ! Continuez sur cette lancée.' :
              positiveRate >= 50 ?
              'Vos offres intéressent la majorité. Analysez les retours négatifs pour améliorer.' :
              'Les retours suggèrent d\'ajuster vos bons plans. Considérez les préférences de votre audience.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

