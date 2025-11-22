'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { Download, Mail, Users, TrendingUp, Calendar, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from '@/lib/fake-toast';

interface NewsletterSubscriber {
  id: string;
  email: string;
  newsletterOptIn: boolean;
  isVerified: boolean;
  createdAt: string;
  lastActivity?: string;
  preferences?: any;
}

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  verifiedSubscribers: number;
  newThisWeek: number;
  unsubscribedThisWeek: number;
}

export default function NewsletterDashboard() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'unverified'>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const hasRedirectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchSubscribers = useCallback(async () => {
    // Éviter les appels multiples
    if (hasFetchedRef.current) {
      return;
    }

    try {
      hasFetchedRef.current = true;
      setLoading(true);
      const response = await fetch('/api/admin/newsletter/subscribers');
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        toast.error('Erreur lors du chargement des abonnés');
        hasFetchedRef.current = false; // Permettre de réessayer
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
      hasFetchedRef.current = false; // Permettre de réessayer
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, []);

  // Vérifier les permissions admin et charger les données
  useEffect(() => {
    if (sessionLoading) return;

    // Éviter les redirections multiples
    if (!session || session.user?.role !== 'admin') {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.push('/auth');
      }
      return;
    }

    // Charger les données uniquement une fois
    if (!hasFetchedRef.current) {
      fetchSubscribers();
      fetchStats();
    }
  }, [session, sessionLoading, fetchSubscribers, fetchStats]);

  // Vérifier les permissions admin (pour l'affichage)
  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Filtrer les abonnés
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterStatus) {
      case 'active':
        matchesFilter = subscriber.newsletterOptIn && subscriber.isVerified;
        break;
      case 'inactive':
        matchesFilter = !subscriber.newsletterOptIn;
        break;
      case 'unverified':
        matchesFilter = !subscriber.isVerified;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Actions sur les abonnés
  const toggleSubscription = async (subscriberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/newsletter/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId, status: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubscribers(prev => prev.map(sub => 
          sub.id === subscriberId 
            ? { ...sub, newsletterOptIn: !currentStatus }
            : sub
        ));
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const verifySubscriber = async (subscriberId: string) => {
    try {
      const response = await fetch('/api/admin/newsletter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubscribers(prev => prev.map(sub => 
          sub.id === subscriberId 
            ? { ...sub, isVerified: true }
            : sub
        ));
        // Rafraîchir les stats
        fetchStats();
        toast.success(data.message || 'Email vérifié avec succès');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    }
  };

  const deleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) return;

    try {
      const response = await fetch('/api/admin/newsletter/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId));
        toast.success('Abonné supprimé');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/export');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abonnes-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export CSV téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion Newsletter</h1>
          <p className="text-gray-600">Gérez vos abonnés et consultez les statistiques</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Abonnés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cette Semaine</p>
                  <p className="text-2xl font-bold text-gray-900">+{stats.newThisWeek}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vérifiés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedSubscribers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contrôles */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="unverified">Non vérifiés</option>
            </select>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Liste des abonnés */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.newsletterOptIn && subscriber.isVerified
                            ? 'bg-green-100 text-green-800'
                            : subscriber.newsletterOptIn && !subscriber.isVerified
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.newsletterOptIn && subscriber.isVerified
                            ? 'Actif'
                            : subscriber.newsletterOptIn && !subscriber.isVerified
                            ? 'En attente'
                            : 'Inactif'
                          }
                        </span>
                        {!subscriber.isVerified && (
                          <span className="text-xs text-gray-500">(Non vérifié)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!subscriber.isVerified && subscriber.newsletterOptIn && (
                          <button
                            onClick={() => verifySubscriber(subscriber.id)}
                            className="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-50"
                            title="Vérifier l'email"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleSubscription(subscriber.id, subscriber.newsletterOptIn)}
                          className={`p-2 rounded-lg transition-colors ${
                            subscriber.newsletterOptIn
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={subscriber.newsletterOptIn ? 'Désactiver' : 'Activer'}
                        >
                          {subscriber.newsletterOptIn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun abonné trouvé</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Affichage de {filteredSubscribers.length} abonné{filteredSubscribers.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}


