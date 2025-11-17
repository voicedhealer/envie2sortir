'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/fake-toast';
import { useEstablishmentStats } from '@/hooks/useEstablishmentStats';
import EstablishmentHeroWithGallery from '@/components/EstablishmentHeroWithGallery';
import EstablishmentInfo from '@/components/EstablishmentInfo';
import EstablishmentSections from '@/components/EstablishmentSections';
import EstablishmentActions from '@/components/EstablishmentActions';
import EstablishmentEvents from '@/components/EstablishmentEvents';
import EstablishmentReviews from '@/components/EstablishmentReviews';
import EventsSection from '@/components/EventsSection';
import UpcomingEventsSection from '@/components/UpcomingEventsSection';
import MapComponent from '@/app/carte/map-component';
import DailyDealModal from '@/components/DailyDealModal';
import { hasSeenDealToday, isDealActive } from '@/lib/deal-utils';

// Fonction pour parser les données hybrides JSON
const parseHybridData = (jsonField: any): any => {
  if (!jsonField) return null;
  
  if (typeof jsonField === 'string') {
    try {
      return JSON.parse(jsonField);
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      return null;
    }
  }
  
  return jsonField;
};

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
  youtube?: string;
  theForkLink?: string;
  uberEatsLink?: string;
  activities?: any;
  services?: any;
  ambiance?: any;
  paymentMethods?: any;
  informationsPratiques?: any;
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
  const { incrementView, incrementClick } = useEstablishmentStats();
  const [showDealModal, setShowDealModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<any>(null);
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
    youtube: establishment.youtube || '',
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
    youtube: establishment.youtube || '',
  });

  // Extraire les données d'enrichissement pour les passer à EstablishmentSections
  const smartEnrichmentData = parseHybridData(establishment.smartEnrichmentData);
  const enrichmentData = parseHybridData(establishment.enrichmentData);
  
  // Combiner les options de parking
  const parkingOptions = [
    ...(smartEnrichmentData?.servicesArray?.filter((service: string) => 
      service.toLowerCase().includes('parking')
    ) || []),
    ...(enrichmentData?.parking || [])
  ];
  
  // Combiner les services de santé
  const healthOptions = [
    ...(smartEnrichmentData?.servicesArray?.filter((service: string) => 
      service.toLowerCase().includes('santé') || 
      service.toLowerCase().includes('sécurité') ||
      service.toLowerCase().includes('premiers secours')
    ) || []),
    ...(enrichmentData?.health || [])
  ];

  // Cache pour le token CSRF
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfTokenExpiry, setCsrfTokenExpiry] = useState<number>(0);

  // Incrémenter les vues au chargement de la page (seulement si ce n'est pas le dashboard)
  useEffect(() => {
    if (!isDashboard && establishment.id) {
      incrementView(establishment.id);
    }
  }, [establishment.id, isDashboard, incrementView]);

  // Écouter les notifications toast depuis le MapComponent
  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { type, message } = event.detail;
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      }
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, []);

  // Récupérer et afficher le bon plan actif
  useEffect(() => {
    if (isDashboard) return; // Ne pas afficher sur le dashboard
    
    const fetchActiveDeal = async () => {
      try {
        const response = await fetch(`/api/deals/active/${establishment.id}`);
        const data = await response.json();
        
        if (data.success && data.deals && data.deals.length > 0) {
          setActiveDeal(data.deals[0]);
          
          // Vérifier si le bon plan est actif et si l'utilisateur ne l'a pas déjà vu
          if (isDealActive(data.deals[0]) && !hasSeenDealToday(data.deals[0].id)) {
            setShowDealModal(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du bon plan:', error);
      }
    };
    
    fetchActiveDeal();
  }, [establishment.id, isDashboard]);

  // Fonction pour récupérer un token CSRF valide
  const getCSRFToken = async (): Promise<string> => {
    const now = Date.now();
    
    // Si on a un token valide et qu'il n'est pas expiré, le réutiliser
    if (csrfToken && csrfTokenExpiry > now) {
      return csrfToken;
    }

    try {
      const response = await fetch('/api/csrf/token');
      const data = await response.json();
      
      if (data.token) {
        setCsrfToken(data.token);
        setCsrfTokenExpiry(data.expires || now + 3600000); // 1 heure par défaut
        return data.token;
      }
      
      throw new Error('Token CSRF non reçu');
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
      throw error;
    }
  };

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
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken();

      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          csrfToken
        }),
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
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken();

      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...socialsForm,
          csrfToken
        }),
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
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken();

      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csrfToken }),
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



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal bon plan */}
      {showDealModal && activeDeal && (
        <DailyDealModal 
          deal={activeDeal}
          onClose={() => setShowDealModal(false)}
        />
      )}


      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Hero */}
        <div className="mb-8">
          <EstablishmentHeroWithGallery 
            establishment={{
              id: establishment.id,
              name: establishment.name,
              address: establishment.address,
              city: establishment.city,
              avgRating: establishment.avgRating,
              totalComments: establishment.totalComments,
              imageUrl: establishment.imageUrl,
              images: establishment.images?.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean) || [],
              activities: establishment.activities,
              slug: establishment.slug
            }}
          />
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions rapides - TOUJOURS EN PREMIER */}
            <EstablishmentActions establishment={establishment} />
            
            {/* Section événements à venir - EN DESSOUS DES ACTIONS */}
            <UpcomingEventsSection establishmentSlug={establishment.slug} />

            {/* Sections d'informations */}
            <EstablishmentSections 
              establishment={establishment} 
              parkingOptions={parkingOptions}
              healthOptions={healthOptions}
            />

            {/* Section événements */}
            <EstablishmentEvents 
              establishmentId={establishment.id} 
              establishmentSlug={establishment.slug} 
            />

            {/* Section avis */}
            <EstablishmentReviews establishment={establishment} />
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
                <div className="h-110">
                  <MapComponent 
                    establishments={[establishment]} 
                    searchCenter={{ lat: establishment.latitude, lng: establishment.longitude }}
                    context="establishment-detail"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                <input
                  type="url"
                  name="youtube"
                  value={socialsForm.youtube}
                  onChange={handleSocialsChange}
                  placeholder="https://www.youtube.com/@votrechaine"
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
