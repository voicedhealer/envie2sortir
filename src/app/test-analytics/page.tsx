'use client';

import { useState } from 'react';
import ClickAnalyticsDashboard from '@/components/analytics/ClickAnalyticsDashboard';

export default function TestAnalyticsPage() {
  const [establishmentId, setEstablishmentId] = useState('test-establishment');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Test du Dashboard Analytics
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de l'établissement
              </label>
              <input
                type="text"
                value={establishmentId}
                onChange={(e) => setEstablishmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test-establishment"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>
        </div>

        <ClickAnalyticsDashboard 
          establishmentId={establishmentId} 
          period={period}
        />
      </div>
    </div>
  );
}
