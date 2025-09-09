import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapComponent from "../../carte/map-component";
import EstablishmentGrid from "@/components/EstablishmentGrid";

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

async function getSearchResults(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const envie = searchParams.envie as string;
    const ville = searchParams.ville as string;
    const rayon = parseInt(searchParams.rayon as string) || 5;
    const lat = searchParams.lat ? parseFloat(searchParams.lat as string) : undefined;
    const lng = searchParams.lng ? parseFloat(searchParams.lng as string) : undefined;

    if (!envie) {
      return { success: false, error: 'Aucune envie spécifiée' };
    }

    // Appeler l'API de recherche
    const params = new URLSearchParams();
    params.set('envie', envie);
    if (ville) params.set('ville', ville);
    params.set('rayon', rayon.toString());
    if (lat) params.set('lat', lat.toString());
    if (lng) params.set('lng', lng.toString());

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/recherche/envie?${params.toString()}`);
    
    if (!response.ok) {
      return { success: false, error: 'Erreur lors de la recherche' };
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export default async function EnvieSearchResults({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const data = await getSearchResults(params);

  if (!data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de recherche</h1>
          <p className="text-gray-600 mb-4">{data.error}</p>
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

  const { results, query } = data;

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
        <div className="lg:col-span-2">
          <EstablishmentGrid 
            establishments={results as any}
            searchCenter={query?.coordinates}
            from="envie"
            title={query?.envie ? `Résultats pour "${query.envie}"` : "Résultats de recherche"}
            subtitle={query?.ville ? `à ${query.ville}` : undefined}
          />
        </div>

        {/* Carte */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px] border rounded-xl overflow-hidden">
          <MapComponent 
            establishments={results as any} 
            searchCenter={query?.coordinates}
            searchRadius={query?.rayon}
          />
        </div>
      </div>
    </main>
  );
}
