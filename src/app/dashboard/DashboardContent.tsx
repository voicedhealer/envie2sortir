"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EventsManager from "./EventsManager";
import ImagesManager from "./ImagesManager";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  establishmentId: string;
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  imageUrl: string | null;
  status: string;
  subscription: string;
  viewsCount: number;
  clicksCount: number;
  avgRating: number | null;
  totalComments: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  images: any[];
  tags: any[];
  events: any[];
}

interface DashboardContentProps {
  user: User;
  establishment: Establishment;
}

export default function DashboardContent({ user, establishment }: DashboardContentProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'events'>('overview');
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente de validation';
      case 'suspended':
        return 'Suspendu';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Professionnel
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue, {user.firstName} {user.lastName}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>
        
        {/* Onglets */}
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes images
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes événements
              {establishment.subscription === 'PREMIUM' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Premium
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'overview' ? (
        <>
          {/* Établissement */}
          <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Mon Établissement
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(establishment.status)}`}>
              {getStatusText(establishment.status)}
            </span>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations principales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {establishment.name}
              </h3>
              
              {establishment.description && (
                <p className="text-gray-600 mb-4">
                  {establishment.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {establishment.address}
                  {establishment.city && `, ${establishment.city}`}
                </div>

                {establishment.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {establishment.phone}
                  </div>
                )}

                {establishment.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {establishment.email}
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Statistiques
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {establishment.viewsCount}
                  </div>
                  <div className="text-sm text-gray-600">Vues</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {establishment.clicksCount}
                  </div>
                  <div className="text-sm text-gray-600">Clics</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {establishment.totalComments}
                  </div>
                  <div className="text-sm text-gray-600">Avis</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {establishment.avgRating ? establishment.avgRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/etablissements/${establishment.slug}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Voir la page publique
            </Link>
            
            <Link
              href={`/etablissements/${establishment.slug}/modifier`}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Modifier l'établissement
            </Link>
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      {(establishment.website || establishment.instagram || establishment.facebook) && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Réseaux sociaux
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              {establishment.website && (
                <a
                  href={establishment.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Site web
                </a>
              )}
              
              {establishment.instagram && (
                <a
                  href={`https://instagram.com/${establishment.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-pink-600 hover:text-pink-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.297H6.721c-.807 0-1.297.49-1.297 1.297v9.297c0 .807.49 1.297 1.297 1.297h9.297c.807 0 1.297-.49 1.297-1.297V9.297c0-.807-.49-1.297-1.297-1.297z"/>
                  </svg>
                  Instagram
                </a>
              )}
              
              {establishment.facebook && (
                <a
                  href={`https://facebook.com/${establishment.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Événements récents */}
      {establishment.events.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Événements récents
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-3">
              {establishment.events.slice(0, 3).map((event: any) => (
                <div key={event.id} className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      ) : activeTab === 'images' ? (
        <ImagesManager 
          establishmentId={establishment.id}
          establishmentSlug={establishment.slug}
          currentImageUrl={establishment.imageUrl}
        />
      ) : (
        <EventsManager 
          establishmentId={establishment.id} 
          isPremium={establishment.subscription === 'PREMIUM'} 
          subscription={establishment.subscription as 'STANDARD' | 'PREMIUM'}
        />
      )}
    </div>
  );
}
