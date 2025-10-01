"use client";

import { useState } from 'react';
import { toast } from '@/lib/fake-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, Mail, Building2, User, Phone, Hash } from 'lucide-react';

interface Professional {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  siret: string;
}

interface UpdateRequest {
  id: string;
  professionalId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  status: string;
  rejectionReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  isEmailVerified: boolean;
  isSmsVerified: boolean;
  professional: Professional;
}

interface ModificationsManagerProps {
  pendingRequests: UpdateRequest[];
  recentHistory: UpdateRequest[];
}

export default function ModificationsManager({ 
  pendingRequests: initialPending, 
  recentHistory: initialHistory 
}: ModificationsManagerProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingRequests, setPendingRequests] = useState(initialPending);
  const [recentHistory, setRecentHistory] = useState(initialHistory);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null);

  const getFieldIcon = (fieldName: string) => {
    const icons: Record<string, any> = {
      email: Mail,
      companyName: Building2,
      siret: Hash,
      firstName: User,
      lastName: User,
      phone: Phone
    };
    return icons[fieldName] || User;
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      email: 'Email',
      siret: 'SIRET',
      companyName: 'Nom de l\'entreprise'
    };
    return labels[fieldName] || fieldName;
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette modification ?')) {
      return;
    }

    setIsProcessing(requestId);

    try {
      const response = await fetch('/api/admin/review-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'approve'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Modification approuvée avec succès');
        
        // Rafraîchir la page
        window.location.reload();
      } else {
        toast.error(data.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer une raison du rejet');
      return;
    }

    setIsProcessing(requestId);

    try {
      const response = await fetch('/api/admin/review-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Modification rejetée');
        setShowRejectionModal(null);
        setRejectionReason('');
        
        // Rafraîchir la page
        window.location.reload();
      } else {
        toast.error(data.error || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des modifications professionnelles
        </h1>
        <p className="text-gray-600">
          Validez ou rejetez les demandes de modification des informations professionnelles
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approuvées (récentes)</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentHistory.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejetées (récentes)</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentHistory.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              En attente ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historique ({recentHistory.length})
            </button>
          </nav>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {activeTab === 'pending' ? (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune demande en attente
                  </h3>
                  <p className="text-gray-600">
                    Toutes les demandes ont été traitées
                  </p>
                </div>
              ) : (
                pendingRequests.map((request) => {
                  const Icon = getFieldIcon(request.fieldName);
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* En-tête */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Icon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getFieldLabel(request.fieldName)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.professional.companyName} - {request.professional.firstName} {request.professional.lastName}
                              </p>
                            </div>
                          </div>

                          {/* Informations professionnelles */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Informations du professionnel</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">Email:</span>
                                <span className="ml-2 text-gray-900">{request.professional.email}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Téléphone:</span>
                                <span className="ml-2 text-gray-900">{request.professional.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">SIRET:</span>
                                <span className="ml-2 text-gray-900 font-mono">{request.professional.siret}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Entreprise:</span>
                                <span className="ml-2 text-gray-900">{request.professional.companyName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Changement demandé */}
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-xs text-red-600 font-medium mb-1">Ancienne valeur</p>
                              <p className="text-sm text-gray-900 font-mono">{request.oldValue}</p>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-xs text-green-600 font-medium mb-1">Nouvelle valeur</p>
                              <p className="text-sm text-gray-900 font-mono">{request.newValue}</p>
                            </div>
                          </div>

                          {/* Statut des vérifications */}
                          <div className="flex items-center space-x-4 mb-4 text-sm">
                            <div className={`flex items-center ${request.isSmsVerified ? 'text-green-600' : 'text-red-600'}`}>
                              {request.isSmsVerified ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                              SMS vérifié
                            </div>
                            <div className={`flex items-center ${request.isEmailVerified ? 'text-green-600' : 'text-orange-600'}`}>
                              {request.isEmailVerified ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                              Email vérifié
                            </div>
                          </div>

                          {!request.isEmailVerified && request.fieldName === 'email' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                              <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-orange-800">
                                  Le professionnel n'a pas encore vérifié son nouvel email. 
                                  La modification ne pourra être appliquée qu'après vérification.
                                </p>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">
                            Demandé le {new Date(request.requestedAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="ml-6 flex flex-col space-y-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing === request.id || (!request.isEmailVerified && request.fieldName === 'email')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approuver
                          </button>
                          <button
                            onClick={() => setShowRejectionModal(request.id)}
                            disabled={isProcessing === request.id}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun historique
                  </h3>
                  <p className="text-gray-600">
                    Aucune demande n'a encore été traitée
                  </p>
                </div>
              ) : (
                recentHistory.map((request) => {
                  const Icon = getFieldIcon(request.fieldName);
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {getFieldLabel(request.fieldName)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                request.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {request.professional.companyName} - {request.oldValue} → {request.newValue}
                            </p>
                            {request.status === 'rejected' && request.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">
                                Raison: {request.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 ml-4">
                          {request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Raison du rejet
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
              placeholder="Expliquez pourquoi cette modification est rejetée..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleReject(showRejectionModal)}
                disabled={!rejectionReason.trim() || isProcessing === showRejectionModal}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer le rejet
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing === showRejectionModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

