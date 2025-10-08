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
  hourlyStats: Array<{
    hour: number;
    clicks: number;
    hourLabel: string;
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
            <div className="text-sm text-blue-800 font-medium">Total des interactions</div>
            <div className="text-xs text-blue-600 mt-1">Clics, consultations et actions</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {data.topElements.length > 0 ? data.topElements[0]._count.id : 0}
            </div>
            <div className="text-sm text-green-800 font-medium">Élément le plus populaire</div>
            <div className="text-xs text-green-600 mt-1">Nombre de clics sur l'élément #1</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.totalClicks / (period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365))}/jour
            </div>
            <div className="text-sm text-purple-800 font-medium">Moyenne quotidienne</div>
            <div className="text-xs text-purple-600 mt-1">Interactions par jour en moyenne</div>
          </div>
        </div>
      </div>

      {/* Métriques d'engagement avancées */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Métriques d'engagement</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Analyse détaillée de l'engagement de vos visiteurs avec des insights actionables.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Taux d'engagement par type */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Performance par type de contenu</h5>
            <div className="space-y-3">
              {data.statsByType.map((type, index) => {
                const percentage = Math.round((type._count.id / data.totalClicks) * 100);
                const isTopPerformer = index === 0;
                
                return (
                  <div key={type.elementType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isTopPerformer ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {type.elementType === 'link' ? 'Liens externes' :
                           type.elementType === 'section' ? 'Sections principales' :
                           type.elementType === 'subsection' ? 'Sous-sections' :
                           type.elementType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {type.elementType === 'link' ? 'Réseaux sociaux, site web' :
                           type.elementType === 'section' ? 'Horaires, services, informations' :
                           type.elementType === 'subsection' ? 'Ambiance, spécialités, détails' :
                           'Contenu interactif'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{type._count.id}</div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights et recommandations */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">💡 Insights & Recommandations</h5>
            <div className="space-y-3">
              {data.statsByType.length > 0 && (() => {
                const topType = data.statsByType[0];
                const topPercentage = Math.round((topType._count.id / data.totalClicks) * 100);
                
                return (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-600">📊</div>
                      <div>
                        <div className="text-sm font-medium text-blue-800">Contenu le plus engageant</div>
                        <div className="text-sm text-blue-700 mt-1">
                          Les <strong>
                            {topType.elementType === 'link' ? 'liens externes' :
                             topType.elementType === 'section' ? 'sections principales' :
                             topType.elementType === 'subsection' ? 'sous-sections' :
                             topType.elementType}
                          </strong> représentent <strong>{topPercentage}%</strong> de l'engagement.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-green-600">🎯</div>
                  <div>
                    <div className="text-sm font-medium text-green-800">Recommandation</div>
                    <div className="text-sm text-green-700 mt-1">
                      {data.totalClicks < 10 ? 
                        "Augmentez le contenu interactif pour améliorer l'engagement" :
                        "Continuez à développer le type de contenu le plus populaire"
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-orange-600">⚡</div>
                  <div>
                    <div className="text-sm font-medium text-orange-800">Optimisation</div>
                    <div className="text-sm text-orange-700 mt-1">
                      {data.statsByType.find(t => t.elementType === 'link')?.elementType ? 
                        "Vos liens externes sont bien utilisés - continuez à les promouvoir" :
                        "Ajoutez plus de liens vers vos réseaux sociaux et site web"
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 des éléments les plus cliqués */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 10 des éléments les plus populaires</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Classement des éléments les plus consultés par vos visiteurs.</p>
        </div>
        
        {/* En-têtes du tableau */}
        <div className="grid grid-cols-12 gap-4 mb-3 px-3">
          <div className="col-span-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rang
          </div>
          <div className="col-span-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Élément
          </div>
          <div className="col-span-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre de clics
          </div>
        </div>
        
        {/* Corps du tableau */}
        <div className="space-y-2">
          {data.topElements.slice(0, 10).map((element, index) => (
            <div key={element.elementId} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="col-span-1 text-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto">
                  {index + 1}
                </div>
              </div>
              <div className="col-span-8">
                <div className="font-medium text-gray-900">
                  {element.elementName || element.elementId}
                </div>
                <div className="text-sm text-gray-500">
                  {element.elementType === 'schedule' ? 'Horaires' : 
                   element.elementType === 'section' ? 'Section' :
                   element.elementType === 'link' ? 'Lien' :
                   element.elementType === 'button' ? 'Bouton' :
                   element.elementType} • {element.elementId}
                </div>
              </div>
              <div className="col-span-3 text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {element._count.id}
                </div>
                <div className="text-xs text-gray-500">clics</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique de répartition par heure */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition des interactions par heure</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Ce graphique montre les heures de la journée où vos visiteurs sont les plus actifs.</p>
          <p>Utile pour identifier les créneaux de forte affluence et optimiser vos horaires d'ouverture.</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.hourlyStats}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis 
              type="category" 
              dataKey="hourLabel"
              width={60}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              labelFormatter={(value) => `Heure: ${value}`}
              formatter={(value) => [value, 'Interactions']}
            />
            <Bar 
              dataKey="clicks" 
              fill="#10B981" 
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Légende et insights */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h5 className="text-sm font-medium text-green-800 mb-2">💡 Insights :</h5>
          <div className="text-sm text-green-700">
            {data.hourlyStats.length > 0 && (
              <p>
                Heure la plus active : <strong>
                  {data.hourlyStats.reduce((max, hour) => hour.clicks > max.clicks ? hour : max).hourLabel}h
                </strong> avec <strong>
                  {data.hourlyStats.reduce((max, hour) => hour.clicks > max.clicks ? hour : max).clicks}
                </strong> interactions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
