'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  period: string;
  startDate: string;
  totalClicks: number;
  topElements: Array<{
    elementType: string;
    elementId: string;
    elementName: string | null;
    _count: { id: number };
  }>;
  statsByType: Array<{
    elementType: string;
    _count: { id: number };
  }>;
  dailyStats: Array<{
    date: string;
    clicks: number;
  }>;
}

interface ClickAnalyticsDashboardProps {
  establishmentId: string;
  period?: '7d' | '30d' | '90d' | '1y';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ClickAnalyticsDashboard({ establishmentId, period = '30d' }: ClickAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/track?establishmentId=${establishmentId}&period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [establishmentId, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur lors du chargement des statistiques: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">Aucune donnée disponible pour cette période.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques générales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Statistiques d'engagement</h3>
          <div className="text-sm text-gray-500">
            Période: {period} ({data.startDate} - {new Date().toISOString().split('T')[0]})
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{data.totalClicks}</div>
            <div className="text-sm text-blue-800">Total des interactions</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {data.topElements.length > 0 ? data.topElements[0]._count.id : 0}
            </div>
            <div className="text-sm text-green-800">Élément le plus populaire</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.totalClicks / 30)}/jour
            </div>
            <div className="text-sm text-purple-800">Moyenne quotidienne</div>
          </div>
        </div>
      </div>

      {/* Graphique des interactions par type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Interactions par type</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.statsByType}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ elementType, _count }) => `${elementType}: ${_count.id}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="_count.id"
            >
              {data.statsByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 des éléments les plus cliqués */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 10 des éléments les plus populaires</h4>
        <div className="space-y-2">
          {data.topElements.slice(0, 10).map((element, index) => (
            <div key={element.elementId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {element.elementName || element.elementId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {element.elementType} • {element.elementId}
                  </div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {element._count.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique temporel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution des interactions</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
              formatter={(value) => [value, 'Interactions']}
            />
            <Bar dataKey="clicks" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
