'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EstablishmentHero from '@/components/EstablishmentHero';
import EstablishmentInfo from '@/components/EstablishmentInfo';
import EstablishmentSections from '@/components/EstablishmentSections';
import EstablishmentActions from '@/components/EstablishmentActions';
import EventsSection from '@/components/EventsSection';
import MapComponent from '@/app/carte/map-component';

// Types pour les données
interface HoursData {
  [key: string]: {
    isOpen: boolean;
    slots: Array<{
      name: string;
      open: string;
      close: string;
    }>;
  };
}

interface Establishment {
  id: string;
  slug: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  activities?: any;
  services?: any;
  ambiance?: any;
  horairesOuverture?: HoursData;
  prixMoyen?: number;
  capaciteMax?: number;
  accessibilite?: boolean;
  parking?: boolean;
  terrasse?: boolean;
  imageUrl?: string;
  images?: string[];
  tags?: Array<{
    tag: string;
    typeTag: string;
    poids: number;
  }>;
  status: string;
  avgRating?: number;
  totalComments?: number;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface EstablishmentDetailProps {
  establishment: Establishment;
  isDashboard?: boolean;
}

export default function EstablishmentDetail({ establishment, isDashboard = false }: EstablishmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: establishment.name || '',
    description: establishment.description || '',
    address: establishment.address || '',
    city: establishment.city || '',
    postalCode: establishment.postalCode || '',
    phone: establishment.phone || '',
    email: establishment.email || '',
    website: establishment.website || '',
    instagram: establishment.instagram || '',
    facebook: establishment.facebook || '',
    tiktok: establishment.tiktok || '',
    prixMoyen: establishment.prixMoyen || 0,
    capaciteMax: establishment.capaciteMax || 0,
    accessibilite: establishment.accessibilite || false,
    parking: establishment.parking || false,
    terrasse: establishment.terrasse || false,
  });

  const [socialsForm, setSocialsForm] = useState({
    website: establishment.website || '',
    instagram: establishment.instagram || '',
    facebook: establishment.facebook || '',
    tiktok: establishment.tiktok || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        window.location.reload();
      } else {
        console.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSocialsSave = async () => {
    try {
      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socialsForm),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Erreur lors de la sauvegarde des réseaux sociaux');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/etablissements';
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleFavorite = () => {
    // TODO: Implémenter la logique de favoris
    console.log('Ajouter aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: establishment.name,
        text: establishment.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copier l'URL dans le presse-papiers
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/etablissements" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Link>
            
            {isDashboard && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Hero */}
        <div className="mb-8">
          <EstablishmentHero 
            establishment={{
              name: establishment.name,
              address: establishment.address,
              city: establishment.city,
              avgRating: establishment.avgRating,
              totalComments: establishment.totalComments,
              imageUrl: establishment.imageUrl,
              images: establishment.images,
              category: establishment.activities ? 'Restaurant' : 'Établissement'
            }}
            onFavorite={handleFavorite}
            onShare={handleShare}
          />
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions rapides */}
            <EstablishmentActions establishment={establishment} />

            {/* Sections d'informations */}
            <EstablishmentSections establishment={establishment} />

            {/* Section événements */}
            <EventsSection establishmentId={establishment.id} />
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Informations pratiques */}
            <EstablishmentInfo establishment={establishment} />

            {/* Carte */}
            {establishment.latitude && establishment.longitude && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Localisation</h3>
                </div>
                <div className="h-64">
                  <MapComponent 
                    establishments={[establishment]} 
                    searchCenter={{ lat: establishment.latitude, lng: establishment.longitude }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'édition */}
        {isEditing && isDashboard && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier les informations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  name="website"
                  value={editForm.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={editForm.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix moyen (€)</label>
                <input
                  type="number"
                  name="prixMoyen"
                  value={editForm.prixMoyen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacité max</label>
                <input
                  type="number"
                  name="capaciteMax"
                  value={editForm.capaciteMax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessibilite"
                      checked={editForm.accessibilite}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Accessible aux personnes à mobilité réduite
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={editForm.parking}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Parking disponible
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="terrasse"
                      checked={editForm.terrasse}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Terrasse
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de modification des réseaux sociaux */}
        {isDashboard && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={socialsForm.instagram}
                  onChange={handleSocialsChange}
                  placeholder="https://www.instagram.com/votrecompte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={socialsForm.facebook}
                  onChange={handleSocialsChange}
                  placeholder="https://www.facebook.com/votrepage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                <input
                  type="url"
                  name="tiktok"
                  value={socialsForm.tiktok}
                  onChange={handleSocialsChange}
                  placeholder="https://www.tiktok.com/@votrecompte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSocialsSave}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sauvegarder les réseaux sociaux
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
