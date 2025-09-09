'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Star, MessageSquare, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';

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
  };
  createdAt: string;
}

export default function MonComptePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'favoris' | 'avis' | 'profil'>('favoris');
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'user') {
      loadUserData();
    } else if (session?.user?.role === 'pro') {
      router.push('/dashboard');
    } else if (session?.user?.role === 'admin') {
      router.push('/admin');
    }
  }, [session, status, router]);

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
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {session.user.firstName?.charAt(0) || session.user.email?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour {session.user.firstName || 'Utilisateur'} !
                </h1>
                <p className="text-gray-600">Gérez vos favoris et vos avis</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('favoris')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favoris'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Mes favoris ({favorites.length})
              </button>
              <button
                onClick={() => setActiveTab('avis')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'avis'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Mes avis ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('profil')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profil'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-5 h-5 inline mr-2" />
                Mon profil
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'favoris' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes établissements favoris</h2>
              
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
                    <div key={favorite.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {favorite.establishment.imageUrl ? (
                        <Image
                          src={favorite.establishment.imageUrl}
                          alt={favorite.establishment.name}
                          width={400}
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
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => router.push(`/etablissements/${favorite.establishment.slug}`)}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Voir l'établissement
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Retirer des favoris
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
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{comment.establishment.name}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      {comment.rating && (
                        <div className="flex items-center mb-2">
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
                      
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      
                      <button
                        onClick={() => router.push(`/etablissements/${comment.establishment.slug}`)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Voir l'établissement
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profil' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mon profil</h2>
              
              <div className="max-w-md">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={session.user.firstName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={session.user.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      readOnly
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
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/api/auth/signout')}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
