'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Clock, Users, Eye, TrendingUp, Calendar, MapPin } from 'lucide-react';

interface DetailedAnalyticsData {
  // Statistiques générales
  totalInteractions: number;
  uniqueVisitors: number;
  averageSessionTime: number;
  
  // Données temporelles
  hourlyStats: Array<{
    hour: number;
    interactions: number;
    visitors: number;
    timeSlot: string;
  }>;
  
  dailyStats: Array<{
    date: string;
    dayOfWeek: string;
    interactions: number;
    visitors: number;
  }>;
  
  // Éléments populaires
  popularElements: Array<{
    elementType: string;
    elementName: string;
    elementId: string;
    interactions: number;
    percentage: number;
  }>;
  
  // Sections les plus consultées
  popularSections: Array<{
    sectionName: string;
    sectionId: string;
    openCount: number;
    uniqueVisitors: number;
  }>;
  
  // Horaires les plus consultés
  scheduleStats: {
    totalViews: number;
    peakHours: Array<{
      hour: number;
      views: number;
      timeSlot: string;
    }>;
    mostViewedDay: string;
  };
  
  // Contacts les plus utilisés
  contactStats: Array<{
    contactType: string;
    contactName: string;
    clicks: number;
    percentage: number;
  }>;
  
  // Liens sociaux et sites web
  linkStats: Array<{
    linkType: string;
    linkName: string;
    linkUrl?: string;
    clicks: number;
    percentage: number;
  }>;
}

interface DetailedAnalyticsDashboardProps {
  establishmentId: string;
  period?: '7d' | '30d' | '90d' | '1y';
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function DetailedAnalyticsDashboard({ 
  establishmentId, 
  period = '30d' 
}: DetailedAnalyticsDashboardProps) {
  const [data, setData] = useState<DetailedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailedAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/analytics/detailed?establishmentId=${establishmentId}&period=${period}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ [DetailedAnalytics] Erreur API:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch detailed analytics`);
        }
        
        const analyticsData = await response.json();
        console.log('✅ [DetailedAnalytics] Données reçues:', {
          totalInteractions: analyticsData.totalInteractions,
          uniqueVisitors: analyticsData.uniqueVisitors,
          hourlyStatsCount: analyticsData.hourlyStats?.length,
          popularSections: analyticsData.popularSections,
        });
        setData(analyticsData);
      } catch (err) {
        console.error('❌ [DetailedAnalytics] Erreur:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedAnalytics();
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
      {/* En-tête avec statistiques clés */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Analytics détaillés</h3>
          <div className="text-sm text-gray-500">
            Période: {period} • Données en temps réel
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total interactions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.totalInteractions}</div>
            <div className="text-xs text-blue-600">Toutes actions confondues</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Visiteurs uniques</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{data.uniqueVisitors}</div>
            <div className="text-xs text-green-600">Visiteurs distincts</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Temps moyen</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{data.averageSessionTime}min</div>
            <div className="text-xs text-purple-600">Par session</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Pic d'activité</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {data.hourlyStats.length > 0 ? 
                `${data.hourlyStats.reduce((max, curr) => curr.interactions > max.interactions ? curr : max).hour}h` : 
                'N/A'
              }
            </div>
            <div className="text-xs text-orange-600">Heure de pointe</div>
          </div>
        </div>
      </div>

      {/* Graphique des heures les plus visitées */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition des interactions par heure</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Ce graphique montre les heures de la journée où vos visiteurs sont les plus actifs.</p>
          <p>Utile pour identifier les créneaux de forte affluence et optimiser vos horaires d'ouverture.</p>
        </div>
        
        {data.hourlyStats.length === 0 || data.hourlyStats.every(h => h.interactions === 0) ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
              <p className="text-gray-500 mb-4">
                Les données d'interaction par heure apparaîtront ici une fois que vos visiteurs commenceront à interagir avec votre établissement.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Conseil :</strong> Partagez votre lien d'établissement pour commencer à collecter des données d'analytics.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.hourlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                <XAxis 
                  dataKey="timeSlot" 
                  tickFormatter={(value) => value}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']}
                  tickFormatter={(value) => Math.round(value).toString()}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151' }}
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload;
                    return `${data?.timeSlot} • ${data?.interactions} interactions • ${data?.visitors} visiteurs`;
                  }}
                  formatter={(value, name) => [String(value), name === 'interactions' ? 'Interactions' : 'Visiteurs']}
                />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Insights */}
            {data.hourlyStats.some(h => h.interactions > 0) && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium text-green-800">Insights :</span>
                  <span className="text-green-700 ml-2">
                    Heure la plus active : <strong>
                      {data.hourlyStats.reduce((max, curr) => curr.interactions > max.interactions ? curr : max).timeSlot}
                    </strong> avec <strong>
                      {data.hourlyStats.reduce((max, curr) => curr.interactions > max.interactions ? curr : max).interactions} interactions
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Éléments les plus populaires */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Top 10 des éléments les plus populaires</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Classement précis des éléments les plus consultés par vos visiteurs avec leurs statistiques détaillées.</p>
        </div>
        
        {data.popularElements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucun élément avec des interactions pour cette période.</p>
          </div>
        ) : (
          <>
            {/* En-têtes du tableau */}
            <div className="grid grid-cols-12 gap-4 mb-3 px-3 border-b border-gray-200 pb-2">
              <div className="col-span-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rang
              </div>
              <div className="col-span-7 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élément
              </div>
              <div className="col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interactions
              </div>
              <div className="col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part du total
              </div>
            </div>
            
            {/* Corps du tableau */}
            <div className="space-y-2">
              {data.popularElements.slice(0, 10).map((element, index) => (
                <div key={element.elementId} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="col-span-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mx-auto ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="col-span-7">
                    <div className="font-medium text-gray-900 mb-1">{element.elementName || element.elementId}</div>
                    <div className="text-sm text-gray-500">
                      {element.elementType === 'schedule' ? '🕐 Horaires' :
                       element.elementType === 'section' ? '📋 Section' :
                       element.elementType === 'link' ? '🔗 Lien' :
                       element.elementType === 'gallery' ? '📸 Galerie' :
                       element.elementType === 'contact' ? '📞 Contact' :
                       element.elementType === 'button' ? '🔘 Bouton' :
                       element.elementType === 'subsection' ? '📄 Sous-section' :
                       element.elementType} • ID: {element.elementId}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-lg font-semibold text-gray-900">{element.interactions}</div>
                    <div className="text-xs text-gray-500">interactions</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-lg font-semibold text-blue-600">{element.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">du total</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Statistiques résumées */}
            {data.popularElements.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">Élément #1</div>
                    <div className="text-lg font-bold text-blue-600">
                      {data.popularElements[0]?.interactions || 0} interactions
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {data.popularElements[0]?.percentage.toFixed(1) || 0}% du total
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800 mb-1">Top 3</div>
                    <div className="text-lg font-bold text-green-600">
                      {data.popularElements.slice(0, 3).reduce((sum, el) => sum + el.interactions, 0)} interactions
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {data.popularElements.slice(0, 3).reduce((sum, el) => sum + el.percentage, 0).toFixed(1)}% du total
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-800 mb-1">Top 10</div>
                    <div className="text-lg font-bold text-purple-600">
                      {data.popularElements.slice(0, 10).reduce((sum, el) => sum + el.interactions, 0)} interactions
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {data.popularElements.slice(0, 10).reduce((sum, el) => sum + el.percentage, 0).toFixed(1)}% du total
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sections les plus consultées */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Sections les plus consultées</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Quelles sections de votre page intéressent le plus vos visiteurs ?</p>
        </div>
        {data.popularSections.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
              <p className="text-gray-500 mb-4">
                Les statistiques des sections apparaîtront ici une fois que vos visiteurs commenceront à ouvrir les sections de votre page.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Debug: Afficher les données en texte pour vérification */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug:</strong> {JSON.stringify(data.popularSections, null, 2)}
              </div>
            )}
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={data.popularSections} 
                layout="horizontal" 
                margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                <XAxis 
                  type="number" 
                  domain={[0, (dataMax: number) => {
                    const max = Math.max(...data.popularSections.map(s => s.openCount));
                    return Math.ceil(max * 1.2);
                  }]}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="sectionName" 
                  type="category" 
                  width={140}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'openCount') {
                      return [value, 'Ouvertures'];
                    }
                    return [value, 'Visiteurs uniques'];
                  }}
                  labelFormatter={(label) => `Section: ${label}`}
                />
                <Bar 
                  dataKey="openCount" 
                  fill="#3B82F6" 
                  radius={[0, 4, 4, 0]}
                  name="Ouvertures"
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Statistiques des horaires */}
      {data.scheduleStats.totalViews > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🕐 Consultation des horaires</h4>
          <div className="mb-4 text-sm text-gray-600">
            <p>Analyse détaillée de la consultation de vos horaires d'ouverture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{data.scheduleStats.totalViews}</div>
              <div className="text-sm text-blue-800">Consultations totales</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{data.scheduleStats.mostViewedDay}</div>
              <div className="text-sm text-green-800">Jour le plus consulté</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {data.scheduleStats.peakHours.length > 0 ? 
                  `${data.scheduleStats.peakHours[0].hour}h` : 'N/A'
                }
              </div>
              <div className="text-sm text-purple-800">Heure de pointe</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.scheduleStats.peakHours} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
              <XAxis 
                dataKey="timeSlot" 
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#374151',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151' }}
                labelFormatter={(value, payload) => {
                  const data = payload?.[0]?.payload;
                  return `${data?.timeSlot} • ${data?.views} consultations`;
                }}
                formatter={(value) => [value, 'Consultations']}
              />
              <Bar dataKey="views" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Contacts les plus utilisés */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📞 Contacts les plus utilisés</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Quels moyens de contact vos visiteurs utilisent-ils le plus ?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.contactStats.map((contact, index) => (
            <div key={`contact-${contact.contactType}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{contact.contactName}</div>
                  <div className="text-sm text-gray-500">{contact.percentage.toFixed(1)}% des contacts</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">{contact.clicks}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Liens sociaux et sites web */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🔗 Liens sociaux et sites web</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Quels liens externes vos visiteurs consultent-ils le plus ?</p>
        </div>
        
        {!data.linkStats || data.linkStats.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lien tracké</h3>
            <p className="text-gray-500 mb-4">
              Les statistiques des liens apparaîtront ici une fois que vos visiteurs commenceront à cliquer sur vos liens externes (réseaux sociaux, site web).
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Conseil :</strong> Assurez-vous que vos liens sont bien configurés dans les paramètres de votre établissement.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.linkStats.map((link, index) => {
              // Icônes et couleurs selon le type de lien
              const getLinkIcon = (type: string) => {
                switch (type.toLowerCase()) {
                  case 'instagram':
                    return { icon: '📷', color: 'bg-pink-100 text-pink-600', label: 'Instagram' };
                  case 'facebook':
                    return { icon: '👥', color: 'bg-blue-100 text-blue-600', label: 'Facebook' };
                  case 'tiktok':
                    return { icon: '🎵', color: 'bg-black text-white', label: 'TikTok' };
                  case 'youtube':
                    return { icon: '▶️', color: 'bg-red-100 text-red-600', label: 'YouTube' };
                  case 'twitter':
                    return { icon: '🐦', color: 'bg-sky-100 text-sky-600', label: 'Twitter/X' };
                  case 'linkedin':
                    return { icon: '💼', color: 'bg-blue-100 text-blue-700', label: 'LinkedIn' };
                  case 'thefork':
                    return { icon: '🍴', color: 'bg-green-100 text-green-600', label: 'TheFork' };
                  case 'ubereats':
                    return { icon: '🚗', color: 'bg-blue-100 text-blue-600', label: 'Uber Eats' };
                  default:
                    return { icon: '🌐', color: 'bg-green-100 text-green-600', label: 'Site web' };
                }
              };

              const linkInfo = getLinkIcon(link.linkType);
              
              return (
                <div key={`${link.linkType}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 ${linkInfo.color} rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{linkInfo.icon}</span>
                        <div className="font-medium text-gray-900 truncate">{linkInfo.label}</div>
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={link.linkName}>
                        {link.linkName.length > 40 ? `${link.linkName.substring(0, 40)}...` : link.linkName}
                      </div>
                      {link.linkUrl && (
                        <div className="text-xs text-gray-400 truncate mt-1" title={link.linkUrl}>
                          {link.linkUrl.length > 50 ? `${link.linkUrl.substring(0, 50)}...` : link.linkUrl}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">{link.percentage.toFixed(1)}% des clics sur liens</div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-lg font-semibold text-gray-900">{link.clicks}</div>
                    <div className="text-xs text-gray-500">clics</div>
                  </div>
                </div>
              );
            })}
            </div>
            
            {/* Statistiques résumées */}
            {data.linkStats.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">Lien le plus cliqué</div>
                    <div className="text-lg font-bold text-blue-600">
                      {data.linkStats[0]?.clicks || 0} clics
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {data.linkStats[0]?.percentage.toFixed(1) || 0}% du total
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800 mb-1">Total des liens</div>
                    <div className="text-lg font-bold text-green-600">
                      {data.linkStats.length} liens
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {data.linkStats.reduce((sum, link) => sum + link.clicks, 0)} clics au total
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-800 mb-1">Moyenne par lien</div>
                    <div className="text-lg font-bold text-purple-600">
                      {data.linkStats.length > 0 
                        ? Math.round(data.linkStats.reduce((sum, link) => sum + link.clicks, 0) / data.linkStats.length)
                        : 0} clics
                    </div>
                    <div className="text-xs text-purple-600 mt-1">par lien en moyenne</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
