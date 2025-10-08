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
        const response = await fetch(`/api/analytics/detailed?establishmentId=${establishmentId}&period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch detailed analytics');
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
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
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🕐 Heures les plus visitées</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Répartition des interactions par heure de la journée.</p>
          <p>Identifiez vos créneaux de forte affluence pour optimiser votre présence.</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.hourlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timeSlot" 
              tickFormatter={(value) => value}
            />
            <YAxis 
              domain={[0, 'dataMax + 1']}
              tickFormatter={(value) => Math.round(value)}
            />
            <Tooltip 
              labelFormatter={(value, payload) => {
                const data = payload?.[0]?.payload;
                return `${data?.timeSlot} • ${data?.interactions} interactions • ${data?.visitors} visiteurs`;
              }}
              formatter={(value, name) => [value, name === 'interactions' ? 'Interactions' : 'Visiteurs']}
            />
            <Bar dataKey="interactions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Éléments les plus populaires */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Éléments les plus populaires</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Classement précis des éléments les plus consultés par vos visiteurs.</p>
        </div>
        <div className="space-y-3">
          {data.popularElements.slice(0, 10).map((element, index) => (
            <div key={element.elementId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{element.elementName}</div>
                  <div className="text-sm text-gray-500">
                    {element.elementType === 'schedule' ? '🕐 Horaires' :
                     element.elementType === 'section' ? '📋 Section' :
                     element.elementType === 'link' ? '🔗 Lien' :
                     element.elementType === 'gallery' ? '📸 Galerie' :
                     element.elementType === 'contact' ? '📞 Contact' :
                     element.elementType} • {element.percentage.toFixed(1)}% du total
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{element.interactions}</div>
                <div className="text-xs text-gray-500">interactions</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections les plus consultées */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Sections les plus consultées</h4>
        <div className="mb-4 text-sm text-gray-600">
          <p>Quelles sections de votre page intéressent le plus vos visiteurs ?</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.popularSections} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="sectionName" type="category" width={120} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'openCount' ? 'Ouvertures' : 'Visiteurs uniques']}
            />
            <Bar dataKey="openCount" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.scheduleStats.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeSlot" />
              <YAxis />
              <Tooltip 
                labelFormatter={(value, payload) => {
                  const data = payload?.[0]?.payload;
                  return `${data?.timeSlot} • ${data?.views} consultations`;
                }}
                formatter={(value) => [value, 'Consultations']}
              />
              <Bar dataKey="views" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
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
            <div key={contact.contactType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
    </div>
  );
}
