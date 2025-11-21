'use client';

import { useState, useEffect } from 'react';
import { Calendar, Heart, Users, TrendingUp, ThumbsUp, ThumbsDown, Star, MessageSquare, TrendingDown } from 'lucide-react';

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
  reviewsStats?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
    recentReviews: number;
    trend: 'positive' | 'negative' | 'stable';
    previousPeriodAverage: number;
  };
}


interface ClickAnalyticsDashboardProps {
  establishmentId: string;
  period?: '7d' | '30d' | '90d' | '1y';
}

interface EventsAnalyticsData {
  totalEvents: number;
  totalEngagements: number;
  statsByType: {
    envie: number;
    'grande-envie': number;
    decouvrir: number;
    'pas-envie': number;
  };
  totalScore: number;
  eventsStats: Array<{
    eventId: string;
    title: string;
    startDate: string;
    endDate: string | null;
    totalEngagements: number;
    stats: {
      envie: number;
      'grande-envie': number;
      decouvrir: number;
      'pas-envie': number;
    };
    score: number;
  }>;
  period: string;
  startDate: string;
}

export default function ClickAnalyticsDashboard({ establishmentId, period = '30d' }: ClickAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [eventsData, setEventsData] = useState<EventsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
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

    const fetchEventsAnalytics = async () => {
      try {
        setEventsLoading(true);
        const response = await fetch(`/api/analytics/events?establishmentId=${establishmentId}&period=${period}`);
        
        if (!response.ok) {
          // Ne pas bloquer si l'API échoue, juste ne pas afficher les stats d'événements
          console.warn('Failed to fetch events analytics');
          return;
        }
        
        const eventsAnalyticsData = await response.json();
        setEventsData(eventsAnalyticsData);
      } catch (err) {
        console.warn('Error fetching events analytics:', err);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchAnalytics();
    fetchEventsAnalytics();
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

      {/* Statistiques des avis */}
      {data.reviewsStats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
            <h4 className="text-lg font-semibold text-gray-900">Statistiques des avis</h4>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <p>Analyse des avis laissés par vos visiteurs et évolution de la satisfaction.</p>
          </div>

          {data.reviewsStats.totalReviews === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun avis pour cette période.</p>
            </div>
          ) : (
            <>
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Note moyenne</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.reviewsStats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">sur 5 étoiles</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total avis</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.reviewsStats.totalReviews}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">avis reçus</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Avis récents</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.reviewsStats.recentReviews}
                  </div>
                  <div className="text-xs text-green-600 mt-1">7 derniers jours</div>
                </div>

                <div className={`rounded-lg p-4 ${
                  data.reviewsStats.trend === 'positive' ? 'bg-green-50' :
                  data.reviewsStats.trend === 'negative' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {data.reviewsStats.trend === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : data.reviewsStats.trend === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.reviewsStats.trend === 'positive' ? 'text-green-800' :
                      data.reviewsStats.trend === 'negative' ? 'text-red-800' :
                      'text-gray-800'
                    }`}>
                      Tendance
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${
                    data.reviewsStats.trend === 'positive' ? 'text-green-600' :
                    data.reviewsStats.trend === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {data.reviewsStats.trend === 'positive' ? '📈 En hausse' :
                     data.reviewsStats.trend === 'negative' ? '📉 En baisse' :
                     '➡️ Stable'}
                  </div>
                  {data.reviewsStats.previousPeriodAverage > 0 && (
                    <div className={`text-xs mt-1 ${
                      data.reviewsStats.trend === 'positive' ? 'text-green-600' :
                      data.reviewsStats.trend === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      vs {data.reviewsStats.previousPeriodAverage.toFixed(1)} précédemment
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution des notes */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Répartition des notes</h5>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = data.reviewsStats.ratingDistribution[rating as keyof typeof data.reviewsStats.ratingDistribution];
                    const percentage = data.reviewsStats.totalReviews > 0 
                      ? (count / data.reviewsStats.totalReviews) * 100 
                      : 0;
                    const isPositive = rating >= 4;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                          <Star className={`w-4 h-4 ${isPositive ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isPositive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {count} avis ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">💡 Insights</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  {data.reviewsStats.averageRating >= 4.5 ? (
                    <p>Excellent ! Vos clients sont très satisfaits. Continuez ainsi ! ⭐</p>
                  ) : data.reviewsStats.averageRating >= 4 ? (
                    <p>Très bon score ! Vos clients sont satisfaits. 🎉</p>
                  ) : data.reviewsStats.averageRating >= 3 ? (
                    <p>Score correct. Il y a de la marge pour améliorer la satisfaction client.</p>
                  ) : (
                    <p>Attention : Le score est en dessous de la moyenne. Analysez les avis négatifs pour améliorer l'expérience client.</p>
                  )}
                  {data.reviewsStats.recentReviews > 0 && (
                    <p className="mt-2">
                      <strong>{data.reviewsStats.recentReviews}</strong> nou{data.reviewsStats.recentReviews > 1 ? 'veaux' : 'vel'} avis cette semaine.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Statistiques des événements */}
      {!eventsLoading && eventsData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-semibold text-gray-900">Statistiques des événements</h4>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <p>Analyse des interactions et votes sur vos événements.</p>
          </div>

          {eventsData.totalEvents === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun événement avec des interactions pour cette période.</p>
            </div>
          ) : (
            <>
              {/* Statistiques globales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Événements</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{eventsData.totalEvents}</div>
                  <div className="text-xs text-blue-600 mt-1">Total événements</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Interactions</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{eventsData.totalEngagements}</div>
                  <div className="text-xs text-green-600 mt-1">Total votes</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Score</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{eventsData.totalScore}</div>
                  <div className="text-xs text-purple-600 mt-1">Score total</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Moyenne</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {eventsData.totalEvents > 0 
                      ? Math.round(eventsData.totalEngagements / eventsData.totalEvents)
                      : 0}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Votes/événement</div>
                </div>
              </div>

              {/* Répartition par type d'engagement */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Répartition des votes</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-800">Grande envie</span>
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-600">{eventsData.statsByType['grande-envie']}</div>
                    <div className="text-xs text-green-600 mt-1">
                      {eventsData.totalEngagements > 0 
                        ? Math.round((eventsData.statsByType['grande-envie'] / eventsData.totalEngagements) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-800">Découvrir</span>
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-blue-600">{eventsData.statsByType.decouvrir}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {eventsData.totalEngagements > 0 
                        ? Math.round((eventsData.statsByType.decouvrir / eventsData.totalEngagements) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-800">Envie</span>
                      <Heart className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="text-xl font-bold text-yellow-600">{eventsData.statsByType.envie}</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {eventsData.totalEngagements > 0 
                        ? Math.round((eventsData.statsByType.envie / eventsData.totalEngagements) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-800">Pas envie</span>
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-xl font-bold text-red-600">{eventsData.statsByType['pas-envie']}</div>
                    <div className="text-xs text-red-600 mt-1">
                      {eventsData.totalEngagements > 0 
                        ? Math.round((eventsData.statsByType['pas-envie'] / eventsData.totalEngagements) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Top événements */}
              {eventsData.eventsStats.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Événements les plus interactifs</h5>
                  <div className="space-y-3">
                    {eventsData.eventsStats.slice(0, 5).map((event, index) => {
                      const totalEventEngagements = Object.values(event.stats).reduce((a, b) => a + b, 0);
                      return (
                        <div key={event.eventId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <h6 className="font-medium text-gray-900">{event.title}</h6>
                              </div>
                              <div className="text-sm text-gray-500 ml-8 mb-3">
                                {new Date(event.startDate).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="grid grid-cols-4 gap-2 ml-8">
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-green-600">{event.stats['grande-envie']}</div>
                                  <div className="text-xs text-gray-500">Grande envie</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-blue-600">{event.stats.decouvrir}</div>
                                  <div className="text-xs text-gray-500">Découvrir</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-yellow-600">{event.stats.envie}</div>
                                  <div className="text-xs text-gray-500">Envie</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-red-600">{event.stats['pas-envie']}</div>
                                  <div className="text-xs text-gray-500">Pas envie</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-gray-900">{totalEventEngagements}</div>
                              <div className="text-xs text-gray-500">interactions</div>
                              <div className="text-sm font-semibold text-purple-600 mt-1">Score: {event.score}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
