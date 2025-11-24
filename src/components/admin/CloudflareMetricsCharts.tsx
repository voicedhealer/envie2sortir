'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CloudflareDetailedMetrics } from '@/lib/cloudflare-api';

interface CloudflareMetricsChartsProps {
  metrics: CloudflareDetailedMetrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CloudflareMetricsCharts({ metrics }: CloudflareMetricsChartsProps) {
  // Formater les données quotidiennes pour les graphiques
  const formattedDailyData = metrics.dailyData.map(d => ({
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    requêtes: d.requests,
    'bande passante (MB)': Math.round((d.bandwidth / 1024 / 1024) * 100) / 100,
    'mises en cache': d.cachedRequests,
  }));

  // Formater les données horaires (dernières 24h)
  const formattedHourlyData = metrics.hourlyData.slice(-24).map(d => ({
    heure: new Date(d.datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    requêtes: d.requests,
    'bande passante (MB)': Math.round((d.bandwidth / 1024 / 1024) * 100) / 100,
  }));

  // Préparer les données des codes HTTP
  const httpStatusData = Object.entries(metrics.httpStatusCodes)
    .map(([code, count]) => ({ 
      code, 
      count: count as number,
      name: `${code} (${count.toLocaleString()})`
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 codes

  // Préparer les données des pays
  const countriesData = metrics.countries.slice(0, 10);

  // Calculer le total pour les pourcentages
  const totalHttpRequests = Object.values(metrics.httpStatusCodes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6 mt-6">
      {/* Graphique des requêtes par jour */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">
          📈 Évolution des requêtes (7 derniers jours)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedDailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="requêtes" 
              stroke="#0088FE" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="mises en cache" 
              stroke="#00C49F" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique des requêtes par heure (24h) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">
          ⏰ Requêtes par heure (24 dernières heures)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedHourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="heure" 
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="requêtes" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphiques côte à côte : Codes HTTP et Top Pays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Codes HTTP */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            🌐 Codes de statut HTTP
          </h4>
          {httpStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={httpStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ code, percent }) => {
                    const percentage = (percent * 100).toFixed(0);
                    return percentage > 5 ? `${code}: ${percentage}%` : '';
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {httpStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    `${value.toLocaleString()} requêtes`,
                    ''
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              Aucune donnée disponible
            </div>
          )}
          {/* Liste des codes HTTP */}
          <div className="mt-4 space-y-2">
            {httpStatusData.slice(0, 5).map((item) => {
              const percentage = totalHttpRequests > 0 
                ? ((item.count / totalHttpRequests) * 100).toFixed(1)
                : '0';
              return (
                <div key={item.code} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">{item.code}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-700 font-medium w-16 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top pays */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            🌍 Top 10 pays
          </h4>
          {countriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value.toLocaleString()} requêtes`,
                    ''
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="requests" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Graphique de la bande passante */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">
          📊 Bande passante (7 derniers jours)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedDailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} MB`, 'Bande passante']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="bande passante (MB)" 
              stroke="#FF8042" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




