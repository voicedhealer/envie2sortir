'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/SearchFilters';
import LoadMoreButton from '@/components/LoadMoreButton';
import EstablishmentGrid from '@/components/EstablishmentGrid';
import MapComponent from '../../carte/map-component';
import Link from 'next/link';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  activities: string[];
  specialites?: string[];
  motsClesRecherche?: string[];
  services?: any;
  ambiance?: any;
  paymentMethods?: any;
  horairesOuverture?: any;
  prixMoyen?: number;
  priceMin?: number;
  priceMax?: number;
  capaciteMax?: number;
  accessibilite?: boolean;
  parking?: boolean;
  terrasse?: boolean;
  status: string;
  subscription: string;
  ownerId: string;
  viewsCount: number;
  clicksCount: number;
  avgRating?: number;
  totalComments: number;
  createdAt: string;
  updatedAt: string;
  tiktok?: string;
  imageUrl?: string;
  informationsPratiques?: any;
  googlePlaceId?: string;
  googleBusinessUrl?: string;
  enriched: boolean;
  enrichmentData?: any;
  envieTags?: string[];
  priceLevel?: number;
  googleRating?: number;
  googleReviewCount?: number;
  theForkLink?: string;
  uberEatsLink?: string;
  specialties?: string[];
  atmosphere?: string[];
  accessibility?: string[];
  accessibilityDetails?: any;
  detailedServices?: any;
  clienteleInfo?: any;
  detailedPayments?: any;
  childrenServices?: any;
  score: number;
  thematicScore: number;
  distance: number;
  isOpen: boolean;
  matchedTags: string[];
  primaryImage?: string;
  images: any[];
  events: any[];
}

interface SearchResponse {
  success: boolean;
  results: Establishment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
    limit: number;
  };
  filter: string;
  query: {
    envie: string;
    ville: string;
    rayon: number;
    keywords: string[];
    coordinates: { lat: number; lng: number } | null;
  };
}

function FilteredSearchContent() {
  const searchParams = useSearchParams();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState('popular');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasMore: false,
    limit: 15
  });
  const [error, setError] = useState<string | null>(null);

  const envie = searchParams.get('envie') || '';
  const ville = searchParams.get('ville') || '';
  const lat = searchParams.get('lat') || '';
  const lng = searchParams.get('lng') || '';

  // Charger les résultats initiaux
  useEffect(() => {
    if (envie) {
      loadResults(envie, ville, lat, lng, activeFilter, 1, true);
    }
  }, [envie, ville, lat, lng]);

  // Charger plus de résultats
  const loadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      loadResults(envie, ville, lat, lng, activeFilter, pagination.currentPage + 1, false);
    }
  };

  // Changer de filtre
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    loadResults(envie, ville, lat, lng, filter, 1, true);
  };

  // Fonction pour charger les résultats
  const loadResults = async (
    envie: string, 
    ville: string, 
    lat: string, 
    lng: string, 
    filter: string, 
    page: number, 
    reset: boolean
  ) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        envie,
        ville,
        filter,
        page: page.toString(),
        limit: '15'
      });

      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }

      const response = await fetch(`/api/recherche/filtered?${params}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        if (reset) {
          setEstablishments(data.results);
        } else {
          setEstablishments(prev => [...prev, ...data.results]);
        }
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de recherche</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header recherche */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Résultats de recherche</h1>
          <p className="text-gray-600">
            {pagination.totalResults} lieu{pagination.totalResults > 1 ? "x" : ""} trouvé{pagination.totalResults > 1 ? "s" : ""}
            {envie && ` pour "${envie}"`}
          </p>
        </div>
        <Link href="/" className="text-sm underline">Modifier la recherche</Link>
      </div>

      {/* Filtres */}
      <SearchFilters 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
      />

      {/* Layout grille + carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grille de cards */}
        <div className="lg:col-span-2">
          <EstablishmentGrid 
            establishments={establishments as any}
            from="recherche"
            title={envie ? `Résultats pour "${envie}"` : "Tous les établissements"}
            subtitle={`${establishments.length} établissement${establishments.length > 1 ? 's' : ''} affiché${establishments.length > 1 ? 's' : ''}`}
          />
          
          {/* Bouton Voir plus */}
          <LoadMoreButton
            onLoadMore={loadMore}
            loading={loadingMore}
            hasMore={pagination.hasMore}
            currentCount={establishments.length}
            totalCount={pagination.totalResults}
          />
        </div>

        {/* Carte */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[420px] border rounded-xl overflow-hidden">
          <MapComponent establishments={establishments as any} />
        </div>
      </div>
    </main>
  );
}

export default function FilteredSearchPage() {
  return (
    <Suspense fallback={
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </main>
    }>
      <FilteredSearchContent />
    </Suspense>
  );
}
