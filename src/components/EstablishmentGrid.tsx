'use client';

import EstablishmentCard from './EstablishmentCard';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  category?: string;
  status: 'approved' | 'pending' | 'rejected';
  latitude?: number;
  longitude?: number;
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  events?: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
  }>;
  distance?: number;
  matchedTags?: string[];
  rating?: number;
  reviewCount?: number;
}

interface EstablishmentGridProps {
  establishments: Establishment[];
  searchCenter?: { lat: number; lng: number };
  from?: string;
  searchParams?: {
    envie?: string;
    ville?: string;
    lat?: string;
    lng?: string;
    rayon?: string;
  };
  title?: string;
  subtitle?: string;
}

export default function EstablishmentGrid({ 
  establishments, 
  searchCenter, 
  from = 'recherche',
  searchParams,
  title,
  subtitle 
}: EstablishmentGridProps) {
  if (establishments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Grille 3x3 responsive - optimisée pour le nouveau design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {establishments.map((establishment) => (
          <EstablishmentCard
            key={establishment.id}
            establishment={establishment}
            searchCenter={searchCenter}
            from={from}
            searchParams={searchParams}
          />
        ))}
      </div>

      {/* Compteur de résultats */}
      <div className="text-center text-sm text-gray-500">
        {establishments.length} établissement{establishments.length > 1 ? 's' : ''} trouvé{establishments.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
