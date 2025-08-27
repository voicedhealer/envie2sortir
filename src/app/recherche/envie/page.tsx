"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MapComponent from "../../carte/map-component";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  address: string;
  category: string;
  score: number;
  distance: number;
  isOpen: boolean;
  matchedTags: string[];
  primaryImage: string | null;
  latitude?: number;
  longitude?: number;
}

interface SearchQuery {
  envie: string;
  ville?: string;
  rayon: number;
  keywords: string[];
  coordinates?: { lat: number; lng: number };
}

export default function EnvieSearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const response = await fetch(`/api/recherche/envie?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResults(data.results);
          setQuery(data.query);
        } else {
          setError(data.error || 'Erreur inconnue');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.toString()) {
      fetchResults();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de recherche</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
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

        {results.length === 0 ? (
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
            {results.length} établissement{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Layout grille + carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grille de résultats */}
        <div className="lg:col-span-2 space-y-4">
          {results.map((establishment, index) => (
            <div key={establishment.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                {/* Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  {establishment.primaryImage ? (
                    <img 
                      src={establishment.primaryImage} 
                      alt={establishment.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">🏢</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {establishment.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{establishment.address}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {establishment.category}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Score: {establishment.score}
                        </span>
                        {establishment.distance > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {establishment.distance} km
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Statut ouvert/fermé */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-4 h-4 rounded-full ${establishment.isOpen ? 'bg-green-500' : 'bg-red-500'}`} 
                           title={establishment.isOpen ? 'Ouvert' : 'Fermé'} />
                      <span className="text-xs text-gray-500">
                        {establishment.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                  </div>

                  {/* Tags correspondants */}
                  {establishment.matchedTags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Correspond à votre envie :</p>
                      <div className="flex flex-wrap gap-2">
                        {establishment.matchedTags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lien vers détails */}
                  <Link 
                    href={`/etablissements/${establishment.slug}`}
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Voir les détails
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carte */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px] border rounded-xl overflow-hidden">
          <MapComponent establishments={results as any} />
        </div>
      </div>
    </main>
  );
}
