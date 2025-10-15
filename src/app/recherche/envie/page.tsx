'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchFilters from '@/components/SearchFilters';
import LoadMoreButton from '@/components/LoadMoreButton';
import EstablishmentGrid from '@/components/EstablishmentGrid';
import MapComponent from '../../carte/map-component';

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

export default function EnvieSearchResults() {
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
  const [query, setQuery] = useState<any>(null);
  const isLoadingRef = useRef(false);

  const envie = searchParams.get('envie') || '';
  const ville = searchParams.get('ville') || '';
  const lat = searchParams.get('lat') || '';
  const lng = searchParams.get('lng') || '';
  const rayon = searchParams.get('rayon') || '5';

  // Debug: afficher les establishments
  useEffect(() => {
    console.log('📦 [EnvieSearch] Establishments updated:', establishments.length, 'items');
  }, [establishments]);

  // Charger les résultats initiaux
  useEffect(() => {
    console.log('🔍 [EnvieSearch] useEffect triggered with:', { envie, ville, lat, lng, rayon });
    if (envie) {
      console.log('🚀 [EnvieSearch] Calling loadResults...');
      loadResults(envie, ville, lat, lng, activeFilter, 1, true);
    } else {
      console.log('⚠️ [EnvieSearch] No envie, skipping search');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envie, ville, lat, lng, rayon]);

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
  const loadResults = useCallback(async (
    envie: string, 
    ville: string, 
    lat: string, 
    lng: string, 
    filter: string, 
    page: number, 
    reset: boolean
  ) => {
    // Éviter les appels multiples en cours
    if (reset && isLoadingRef.current) {
      console.log('⏸️ [EnvieSearch] Chargement déjà en cours, skip');
      return;
    }

    try {
      if (reset) {
        isLoadingRef.current = true;
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
        limit: '15',
        rayon
      });

      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }

      const apiUrl = `/api/recherche/filtered?${params}`;
      console.log('📡 [EnvieSearch] Fetching:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data: SearchResponse = await response.json();
      
      console.log('📊 [EnvieSearch] API Response:', { 
        success: data.success, 
        resultsCount: data.results?.length, 
        error: data.error 
      });

      if (data.success) {
        console.log('✅ [EnvieSearch] Setting establishments:', data.results.length, 'items');
        if (reset) {
          setEstablishments(data.results);
          setQuery(data.query);
        } else {
          setEstablishments(prev => [...prev, ...data.results]);
        }
        setPagination(data.pagination);
      } else {
        console.error('❌ [EnvieSearch] API Error:', data.error);
        setError(data.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      console.error('❌ [EnvieSearch] Exception:', err);
      setError('Erreur de connexion');
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [rayon]);

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
      {/* Header de recherche */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Résultats pour votre envie</h1>
            {query && (
              <div className="mt-2 space-y-2">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">"{query.envie}"</span>
                  {query.ville && query.ville !== "Autour de moi" && (
                    <span> à <span className="font-semibold">{query.ville}</span></span>
                  )}
                  {query.coordinates && (
                    <span> dans un rayon de <span className="font-semibold">{query.rayon} km</span></span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {query.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link 
            href="/"
            className="text-sm text-orange-600 hover:text-orange-700 underline"
          >
            Modifier la recherche
          </Link>
        </div>

        {establishments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h2>
            <p className="text-gray-600 mb-4">
              Essayez de reformuler votre envie ou élargir votre zone de recherche.
            </p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Nouvelle recherche
            </Link>
          </div>
        ) : (
          <p className="text-gray-600">
            {pagination.totalResults} établissement{pagination.totalResults > 1 ? 's' : ''} trouvé{pagination.totalResults > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filtres */}
      <SearchFilters 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
      />

      {/* Layout grille + carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grille de résultats */}
        <div className="lg:col-span-2">
          <EstablishmentGrid 
            establishments={establishments as any}
            searchCenter={query?.coordinates}
            from="envie"
            searchParams={{
              envie: envie,
              ville: ville,
              lat: lat,
              lng: lng,
              rayon: rayon
            }}
            title={query?.envie ? `Résultats pour "${query.envie}"` : "Résultats de recherche"}
            subtitle={query?.ville ? `à ${query.ville}` : undefined}
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
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px] border rounded-xl overflow-hidden">
          <MapComponent 
            establishments={establishments as any} 
            searchCenter={query?.coordinates}
            searchRadius={query?.rayon}
          />
        </div>
      </div>
    </main>
  );
}
