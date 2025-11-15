'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, MapPin, Star, MessageSquare, Settings, LogOut, Edit3, Trash2, Save, X, Trophy } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/fake-toast';
import UserBadges from '@/components/UserBadges';

interface UserFavorite {
  id: string;
  establishment: {
    id: string;
    name: string;
    slug: string;
    address: string;
    imageUrl?: string;
    avgRating?: number;
  };
  createdAt: string;
}

interface UserComment {
  id: string;
  content: string;
  rating?: number;
  establishment: {
    id: string;
    name: string;
    slug: string;
    address?: string;
  };
  createdAt: string;
}

function MonCompteContent() {
  const { session, loading, signOut } = useSupabaseSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'favoris' | 'avis' | 'badges' | 'profil'>('favoris');
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour la modification du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Initialiser l'onglet actif depuis l'URL
  useEffect(() => {
    const tab = searchParams.get('tab') as 'favoris' | 'avis' | 'badges' | 'profil';
    if (tab && ['favoris', 'avis', 'badges', 'profil'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.push('/auth');
      return;
    }

    if (session.user?.role === 'user' || session.user?.userType === 'user') {
      loadUserData();
      // Initialiser les données du profil
      setProfileData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else if (session.user?.role === 'professional' || session.user?.userType === 'professional') {
      router.push('/dashboard');
    } else if (session.user?.role === 'admin') {
      router.push('/admin');
    }
  }, [session, loading, router]);

  // Mettre à jour profileData quand la session change
  useEffect(() => {
    if (session?.user && !isEditingProfile) {
      setProfileData(prev => ({
        ...prev,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || ''
      }));
    }
  }, [session, isEditingProfile]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les favoris
      const favoritesResponse = await fetch('/api/user/favorites');
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData.favorites || []);
      }

      // Charger les avis
      const commentsResponse = await fetch('/api/user/comments');
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        toast.success('Favori supprimé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const handleUpdateProfile = async () => {
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    console.log('🔍 Données envoyées:', {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email
    });

    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          currentPassword: profileData.currentPassword || undefined,
          newPassword: profileData.newPassword || undefined
        })
      });

      const data = await response.json();
      console.log('📡 Réponse API:', data);

      if (data.success) {
        toast.success('Profil mis à jour avec succès');
        setIsEditingProfile(false);
        // Réinitialiser les mots de passe
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        // Mettre à jour les données du profil avec les nouvelles données
        setProfileData(prev => ({
          ...prev,
          firstName: data.user.firstName || prev.firstName,
          lastName: data.user.lastName || prev.lastName,
          email: data.user.email || prev.email
        }));
        // Recharger la page pour s'assurer que tout est synchronisé
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Compte supprimé avec succès');
        // Déconnecter l'utilisateur et rediriger
        await signOut();
        router.push('/');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression du compte');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {session.user.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour {session.user.firstName || 'Utilisateur'} !
                </h1>
                <p className="text-gray-600">Gérez votre compte et vos préférences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Navigation tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('favoris');
                  router.push('/mon-compte?tab=favoris');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favoris'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Mes favoris ({favorites.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('avis');
                  router.push('/mon-compte?tab=avis');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'avis'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Mes avis ({comments.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('badges');
                  router.push('/mon-compte?tab=badges');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'badges'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Badges & Karma
              </button>
              <button
                onClick={() => {
                  setActiveTab('profil');
                  router.push('/mon-compte?tab=profil');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profil'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Mon profil
              </button>
            </nav>
          </div>

          {/* Contenu des tabs */}
          <div className="min-h-[400px]">
            {activeTab === 'favoris' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes favoris</h2>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori pour le moment</h3>
                    <p className="text-gray-600 mb-6">Découvrez des établissements et ajoutez-les à vos favoris !</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Découvrir des établissements
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {favorite.establishment.imageUrl ? (
                          <Image
                            src={favorite.establishment.imageUrl}
                            alt={favorite.establishment.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{favorite.establishment.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{favorite.establishment.address}</p>
                          
                          {favorite.establishment.avgRating && (
                            <div className="flex items-center mb-3">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-600">
                                {favorite.establishment.avgRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/etablissements/${favorite.establishment.slug}`)}
                              className="flex-1 bg-orange-500 text-white py-2 px-3 rounded text-sm hover:bg-orange-600 transition-colors"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(favorite.id)}
                              className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-current text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes avis</h2>
                
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
                    <p className="text-gray-600 mb-6">Partagez votre expérience en laissant des avis !</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Découvrir des établissements
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{comment.establishment.name}</h3>
                            <p className="text-sm text-gray-600">{comment.establishment.address || 'Adresse non disponible'}</p>
                          </div>
                          {comment.rating && (
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < comment.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="p-6">
                <UserBadges showProgress={true} />
              </div>
            )}

            {activeTab === 'profil' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Mon profil</h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isUpdatingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        disabled={!isEditingProfile}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        disabled={!isEditingProfile}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditingProfile}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                      <input
                        type="text"
                        value="Utilisateur"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                      />
                    </div>

                    {isEditingProfile && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                            <input
                              type="password"
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Laissez vide si pas de changement"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                            <input
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Laissez vide si pas de changement"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                            <input
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Laissez vide si pas de changement"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                    <button
                      onClick={async () => {
                        await signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supprimer mon compte</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera :
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Tous vos favoris</li>
              <li>• Tous vos avis</li>
              <li>• Toutes vos données personnelles</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isDeletingAccount}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeletingAccount ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonComptePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <MonCompteContent />
    </Suspense>
  );
}