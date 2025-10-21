"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Globe, BarChart3, TrendingUp, Eye, Lock, MessageSquare, Youtube, Music } from "lucide-react";
import EventsManager from "./EventsManager";
import ImagesManager from "./ImagesManager";
import ParametresManager from "./ParametresManager";
import MenuManager from "@/components/dashboard/MenuManager";
import ClickAnalyticsDashboard from "@/components/analytics/ClickAnalyticsDashboard";
import DetailedAnalyticsDashboard from "@/components/analytics/DetailedAnalyticsDashboard";
import DealsManager from "./DealsManager";
import DealsGlobalStats from "@/components/DealsGlobalStats";
import MessageBadge from "@/components/messaging/MessageBadge";

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
  youtube: string | null;
  tiktok: string | null;
  imageUrl: string | null;
  status: string;
  subscription: string;
  rejectionReason: string | null;
  rejectedAt: string | null;
  lastModifiedAt: string | null;
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

interface Professional {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  siret: string;
  companyName: string;
  subscriptionPlan: 'FREE' | 'PREMIUM';
}

interface DashboardContentProps {
  user: User;
  establishment: Establishment;
  professional: Professional;
}

export default function DashboardContent({ user, establishment, professional }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'events' | 'menus' | 'deals' | 'analytics' | 'parametres'>('overview');
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'overview' | 'detailed'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente de validation';
      case 'rejected':
        return 'Rejeté';
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
              <p className={`text-sm mt-1 ${
                professional.subscriptionPlan === 'PREMIUM' 
                  ? 'text-orange-600 font-medium' 
                  : 'text-gray-500'
              }`}>
                Compte : {professional.subscriptionPlan === 'PREMIUM' ? 'Premium' : 'Basic'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Onglets - Responsive avec scroll horizontal sur mobile/tablette */}
        <div className="px-3 sm:px-6 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'images'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes images
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes événements
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'menus'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes menus
            </button>
            {professional.subscriptionPlan === 'PREMIUM' && (
              <button
                onClick={() => setActiveTab('deals')}
                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'deals'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bons plans
              </button>
            )}
            {professional.subscriptionPlan === 'PREMIUM' ? (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Analytics
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('overview')}
                title="Réservé au plan Premium"
                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center cursor-not-allowed whitespace-nowrap ${
                  'border-transparent text-gray-300'
                }`}
                disabled
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Analytics
              </button>
            )}
            <Link
              href="/dashboard/messagerie"
              className="py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2"
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              Messagerie
              <MessageBadge />
            </Link>
            <button
              onClick={() => setActiveTab('parametres')}
              className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'parametres'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paramètres
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
        
        {/* Informations de rejet */}
        {establishment.status === 'rejected' && establishment.rejectionReason && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Votre établissement a été rejeté
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Raison du rejet :</strong></p>
                  <p className="mt-1">{establishment.rejectionReason}</p>
                  {establishment.rejectedAt && (
                    <p className="mt-2 text-xs text-red-600">
                      Rejeté le {new Date(establishment.rejectedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/etablissements/${establishment.slug}/modifier`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier et redemander validation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
      {(establishment.website || establishment.instagram || establishment.facebook || establishment.youtube || establishment.tiktok) && (
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
                  <Globe className="w-5 h-5 mr-2" />
                  Site web
                </a>
              )}
              
              {establishment.instagram && (
                <a
                  href={establishment.instagram.startsWith('http') 
                    ? establishment.instagram 
                    : `https://instagram.com/${establishment.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-pink-600 hover:text-pink-800"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Instagram
                </a>
              )}
              
              {establishment.facebook && (
                <a
                  href={establishment.facebook.startsWith('http') 
                    ? establishment.facebook 
                    : `https://facebook.com/${establishment.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </a>
              )}
              
              {establishment.youtube && (
                <a
                  href={establishment.youtube.startsWith('http') 
                    ? establishment.youtube 
                    : `https://youtube.com/${establishment.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  YouTube
                </a>
              )}
              
              {establishment.tiktok && (
                <a
                  href={establishment.tiktok.startsWith('http') 
                    ? establishment.tiktok 
                    : `https://tiktok.com/@${establishment.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-800 hover:text-black"
                >
                  <Music className="w-5 h-5 mr-2" />
                  TikTok
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
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
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
          subscription={professional.subscriptionPlan}
        />
      ) : activeTab === 'events' ? (
        <EventsManager 
          establishmentId={establishment.id} 
          isPremium={professional.subscriptionPlan === 'PREMIUM'} 
          subscription={professional.subscriptionPlan}
        />
      ) : activeTab === 'menus' ? (
        <MenuManager 
          establishmentId={establishment.id} 
          isPremium={professional.subscriptionPlan === 'PREMIUM'}
        />
      ) : activeTab === 'deals' ? (
        <DealsManager 
          establishmentId={establishment.id} 
          isPremium={professional.subscriptionPlan === 'PREMIUM'}
        />
      ) : activeTab === 'analytics' ? (
        professional.subscriptionPlan !== 'PREMIUM' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Premium</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-4">
              Les tableaux de bord Analytics détaillés sont réservés au plan Premium. 
              Depuis l'onglet « Vue d'ensemble », vous conservez l'accès à vos statistiques globales.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#ff751f] text-white px-5 py-3 rounded-lg font-semibold cursor-not-allowed">
              Passer au Premium
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* En-tête Analytics avec boutons de basculement */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Analytics de votre établissement</h2>
                  <p className="text-sm text-gray-600">Découvrez comment vos clients interagissent avec votre page</p>
                </div>
              </div>
              
              {/* Boutons de basculement */}
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setAnalyticsViewMode('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      analyticsViewMode === 'overview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setAnalyticsViewMode('detailed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      analyticsViewMode === 'detailed'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Vue détaillée
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  Données en temps réel
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu selon la vue sélectionnée */}
          {analyticsViewMode === 'overview' ? (
            <div className="space-y-6">
              <ClickAnalyticsDashboard 
                establishmentId={establishment.id} 
                period="30d"
              />
              <DealsGlobalStats establishmentId={establishment.id} />
            </div>
          ) : (
            <DetailedAnalyticsDashboard 
              establishmentId={establishment.id} 
              period="30d"
            />
          )}
        </div>
        )
      ) : (
        <ParametresManager 
          professional={professional}
        />
      )}
    </div>
  );
}