"use client";

import { useState, useEffect } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { toast } from '@/lib/fake-toast';
import { Eye, EyeOff, Lock, User, Mail, Building, Phone, Edit, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import SmsVerificationModal from '@/components/SmsVerificationModal';

interface ParametresManagerProps {
  professional: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    siret: string;
    companyName: string;
  };
}

interface UpdateRequest {
  id: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  status: string;
  rejectionReason: string | null;
  requestedAt: string;
  isEmailVerified: boolean;
}

export default function ParametresManager({ professional }: ParametresManagerProps) {
  const { session } = useSupabaseSession();
  
  // États pour le changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // États pour les modifications d'informations
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [smsVerified, setSmsVerified] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [pendingRequests, setPendingRequests] = useState<UpdateRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Charger les demandes en attente
  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch('/api/professional/update-requests');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Validation du mot de passe
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Au moins 8 caractères');
    if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule');
    if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule');
    if (!/\d/.test(password)) errors.push('Au moins un chiffre');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Au moins un caractère spécial (!@#$%^&*...)');
    }
    return errors;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Tous les champs sont requis');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      toast.error('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/dashboard/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Mot de passe modifié avec succès !');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors([]);
      } else {
        toast.error(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Gestion de la modification des informations
  const handleStartEdit = (fieldName: string) => {
    setCurrentField(fieldName);
    setEditingField(null);
    setSmsVerified(false);
    setShowSmsModal(true);
  };

  const handleSmsVerified = () => {
    setSmsVerified(true);
    setEditingField(currentField);
    setEditValues({ ...editValues, [currentField]: professional[currentField as keyof typeof professional] as string });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setSmsVerified(false);
    setEditValues({});
  };

  const handleSubmitUpdate = async (fieldName: string) => {
    const newValue = editValues[fieldName];
    
    if (!newValue || newValue.trim() === '') {
      toast.error('La valeur ne peut pas être vide');
      return;
    }

    if (newValue === professional[fieldName as keyof typeof professional]) {
      toast.error('La nouvelle valeur est identique à l\'ancienne');
      return;
    }

    try {
      const response = await fetch('/api/professional/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName,
          newValue,
          smsVerified: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresAdminApproval) {
          toast.success(data.message || 'Demande envoyée à l\'administrateur');
          loadPendingRequests();
        } else {
          toast.success(data.message || 'Informations mises à jour');
          window.location.reload();
        }
        handleCancelEdit();
      } else {
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification');
    }
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approuvé' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejeté' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Modal de vérification SMS */}
      <SmsVerificationModal
        isOpen={showSmsModal}
        onClose={() => {
          setShowSmsModal(false);
          setSmsVerified(false);
        }}
        onVerified={handleSmsVerified}
        fieldName={currentField}
        phone={professional.phone}
      />

      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Modifications en attente
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{getFieldLabel(request.fieldName)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="line-through">{request.oldValue}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{request.newValue}</span>
                    </p>
                    {request.fieldName === 'email' && !request.isEmailVerified && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ En attente de vérification de votre nouvel email
                      </p>
                    )}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Raison du rejet: {request.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations du compte */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-gray-500" />
          Informations du compte
        </h3>
        
        <div className="space-y-4">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            {editingField === 'firstName' ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={editValues.firstName || ''}
                  onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => handleSubmitUpdate('firstName')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-700">{professional.firstName}</span>
                <button
                  onClick={() => handleStartEdit('firstName')}
                  className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            {editingField === 'lastName' ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={editValues.lastName || ''}
                  onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => handleSubmitUpdate('lastName')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-700">{professional.lastName}</span>
                <button
                  onClick={() => handleStartEdit('lastName')}
                  className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </label>
            {editingField === 'email' ? (
              <div>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="email"
                    value={editValues.email || ''}
                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => handleSubmitUpdate('email')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Valider
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
                <p className="text-xs text-orange-600">
                  ⚠️ Un email de vérification sera envoyé à votre nouvelle adresse
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">{professional.email}</span>
                  <button
                    onClick={() => handleStartEdit('email')}
                    className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Modification nécessite validation admin
                </p>
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Téléphone
            </label>
            {editingField === 'phone' ? (
              <div className="flex space-x-2">
                <input
                  type="tel"
                  value={editValues.phone || ''}
                  onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="06 ou 07..."
                />
                <button
                  onClick={() => handleSubmitUpdate('phone')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-700">{professional.phone}</span>
                <button
                  onClick={() => handleStartEdit('phone')}
                  className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <Building className="w-5 h-5 mr-2 text-gray-500" />
          Informations professionnelles
        </h3>
        
        <div className="space-y-4">
          {/* Nom de l'entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise
            </label>
            {editingField === 'companyName' ? (
              <div>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={editValues.companyName || ''}
                    onChange={(e) => setEditValues({ ...editValues, companyName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => handleSubmitUpdate('companyName')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Valider
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
                <p className="text-xs text-orange-600">
                  ⚠️ Cette modification nécessite une validation admin
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">{professional.companyName}</span>
                  <button
                    onClick={() => handleStartEdit('companyName')}
                    className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Modification nécessite validation admin
                </p>
              </div>
            )}
          </div>

          {/* SIRET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIRET
            </label>
            {editingField === 'siret' ? (
              <div>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={editValues.siret || ''}
                    onChange={(e) => setEditValues({ ...editValues, siret: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    placeholder="14 chiffres"
                    maxLength={14}
                  />
                  <button
                    onClick={() => handleSubmitUpdate('siret')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Valider
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
                <p className="text-xs text-orange-600">
                  ⚠️ Cette modification nécessite une validation admin
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 font-mono">{professional.siret}</span>
                  <button
                    onClick={() => handleStartEdit('siret')}
                    className="text-orange-600 hover:text-orange-700 flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Modification nécessite validation admin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sécurité - Changement de mot de passe */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-gray-500" />
          Sécurité
        </h3>
        
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Entrez votre mot de passe actuel"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Entrez votre nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {passwordForm.newPassword && (
              <div className="mt-2 text-xs space-y-1">
                {passwordErrors.length > 0 ? (
                  <>
                    <p className="text-red-600 font-medium">Le mot de passe doit contenir :</p>
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-red-600">• {error}</p>
                    ))}
                  </>
                ) : (
                  <p className="text-green-600 font-medium">✓ Mot de passe sécurisé</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Confirmez votre nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || passwordErrors.length > 0 || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? 'Modification en cours...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
