import EnrichmentDemo from '@/components/EnrichmentDemo';

export default function DemoSectionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Démonstration des sections d'enrichissement
          </h1>
          <p className="text-lg text-gray-600">
            Visualisation des informations détaillées récupérées depuis Google Places
          </p>
        </div>
        
        <EnrichmentDemo />
      </div>
    </div>
  );
}
