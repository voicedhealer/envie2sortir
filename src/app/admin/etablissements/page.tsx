"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  siret: string;
  legalStatus: string;
  siretVerified: boolean;
  siretVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  rejectedAt: string | null;
  lastModifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: Professional;
  _count: {
    images: number;
    events: number;
    comments: number;
    favorites: number;
  };
}

interface EstablishmentsResponse {
  establishments: Establishment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export default function AdminEstablishmentsPage() {
  const { data: session, status } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Charger les établissements
  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/establishments?${params}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data: EstablishmentsResponse = await response.json();
      setEstablishments(data.establishments);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, [selectedStatus, searchTerm]);

  // Redirection si pas admin
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login?error=AccessDenied');
  }

  // Actions admin
  const handleAction = async (establishmentId: string, action: 'approve' | 'reject' | 'pending' | 'delete', reason?: string) => {
    try {
      setActionLoading(establishmentId);
      
      const response = await fetch('/api/admin/establishments/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          action,
          reason: reason || (action === 'reject' ? rejectionReason : undefined)
        })
      });

      if (!response.ok) throw new Error('Erreur lors de l\'action');
      
      const result = await response.json();
      
      // Mettre à jour la liste
      await loadEstablishments();
      
      // Fermer les modals
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedEstablishment(null);
      
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Établissements</h1>
          <p className="text-gray-600 mt-2">Gérez et validez les établissements de la plateforme</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, ville, propriétaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des établissements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {establishments.map((establishment) => (
                  <tr key={establishment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {establishment.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {establishment.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {establishment.owner.firstName} {establishment.owner.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {establishment.owner.companyName}
                        </div>
                        <div className="text-xs text-gray-400">
                          SIRET: {establishment.owner.siret}
                          {establishment.owner.siretVerified && (
                            <span className="ml-1 text-green-600">✅</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {establishment.owner.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {establishment.owner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(establishment.status)}
                      {establishment.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          Raison: {establishment.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(establishment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEstablishment(establishment);
                            setShowViewModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir
                        </button>
                        {establishment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(establishment.id, 'approve')}
                              disabled={actionLoading === establishment.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {actionLoading === establishment.id ? '...' : 'Approuver'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEstablishment(establishment);
                                setShowRejectModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de visualisation des détails */}
        {showViewModal && selectedEstablishment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Détails de l'établissement
                  </h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedEstablishment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informations de l'établissement */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🏢 Établissement</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEstablishment.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEstablishment.description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEstablishment.address}</p>
                        {selectedEstablishment.city && (
                          <p className="mt-1 text-sm text-gray-600">{selectedEstablishment.city}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Téléphone établissement</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedEstablishment.phone ? (
                              <a href={`tel:${selectedEstablishment.phone}`} className="text-blue-600 hover:text-blue-800">
                                {selectedEstablishment.phone}
                              </a>
                            ) : (
                              <span className="text-gray-500 italic">Non renseigné</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email établissement</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedEstablishment.email ? (
                              <a href={`mailto:${selectedEstablishment.email}`} className="text-blue-600 hover:text-blue-800">
                                {selectedEstablishment.email}
                              </a>
                            ) : (
                              <span className="text-gray-500 italic">Non renseigné</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Site web</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEstablishment.website ? (
                            <a href={selectedEstablishment.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              {selectedEstablishment.website}
                            </a>
                          ) : 'Non renseigné'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <div className="mt-1">
                          {getStatusBadge(selectedEstablishment.status)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plan d'abonnement</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedEstablishment.subscription === 'PREMIUM' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEstablishment.subscription === 'PREMIUM' ? '⭐ Premium' : '🆓 Gratuit'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations du professionnel */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">👤 Professionnel</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEstablishment.owner.firstName} {selectedEstablishment.owner.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEstablishment.owner.companyName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SIRET</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEstablishment.owner.siret}
                          {selectedEstablishment.owner.siretVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✅ Vérifié
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Statut légal</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEstablishment.owner.legalStatus}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email professionnel</label>
                          <p className="mt-1 text-sm text-gray-900">
                            <a href={`mailto:${selectedEstablishment.owner.email}`} className="text-blue-600 hover:text-blue-800">
                              {selectedEstablishment.owner.email}
                            </a>
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Téléphone professionnel</label>
                          <p className="mt-1 text-sm text-gray-900">
                            <a href={`tel:${selectedEstablishment.owner.phone}`} className="text-blue-600 hover:text-blue-800">
                              {selectedEstablishment.owner.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date d'inscription</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(selectedEstablishment.owner.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Images</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedEstablishment._count.images}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Événements</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedEstablishment._count.events}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Commentaires</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedEstablishment._count.comments}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Favoris</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedEstablishment._count.favorites}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions administratives</h4>
                  <div className="flex flex-wrap gap-3">
                    {/* Bouton Fermer */}
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setSelectedEstablishment(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Fermer
                    </button>

                    {/* Actions selon le statut */}
                    {selectedEstablishment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            handleAction(selectedEstablishment.id, 'approve');
                          }}
                          disabled={actionLoading === selectedEstablishment.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approuver
                        </button>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            setShowRejectModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejeter
                        </button>
                      </>
                    )}

                    {selectedEstablishment.status === 'approved' && (
                      <>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            handleAction(selectedEstablishment.id, 'pending');
                          }}
                          disabled={actionLoading === selectedEstablishment.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Remettre en attente
                        </button>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </>
                    )}

                    {selectedEstablishment.status === 'rejected' && (
                      <>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            handleAction(selectedEstablishment.id, 'approve');
                          }}
                          disabled={actionLoading === selectedEstablishment.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approuver
                        </button>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de rejet */}
        {showRejectModal && selectedEstablishment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Rejeter l'établissement
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{selectedEstablishment.name}</strong><br />
                  Propriétaire: {selectedEstablishment.owner.firstName} {selectedEstablishment.owner.lastName}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Expliquez pourquoi cet établissement est rejeté..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedEstablishment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleAction(selectedEstablishment.id, 'reject')}
                    disabled={!rejectionReason.trim() || actionLoading === selectedEstablishment.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedEstablishment.id ? 'Rejet en cours...' : 'Rejeter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de suppression */}
        {showDeleteModal && selectedEstablishment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mt-2">
                  Confirmer la suppression
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  <strong>{selectedEstablishment.name}</strong><br />
                  Propriétaire: {selectedEstablishment.owner.firstName} {selectedEstablishment.owner.lastName}
                </p>
                <p className="text-sm text-red-600 mb-4 text-center">
                  ⚠️ Cette action est irréversible. L'établissement sera marqué comme supprimé.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedEstablishment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleAction(selectedEstablishment.id, 'delete')}
                    disabled={actionLoading === selectedEstablishment.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedEstablishment.id ? 'Suppression...' : 'Supprimer définitivement'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
