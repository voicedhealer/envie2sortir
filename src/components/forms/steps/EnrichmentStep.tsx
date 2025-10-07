import EnrichmentStep from '@/components/forms/EnrichmentStep';
import { EnrichmentData } from '@/lib/enrichment-system';

interface EnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  onEnrichmentDataChange: (data: EnrichmentData | null) => void;
}

export default function EnrichmentStepWrapper({
  onEnrichmentComplete,
  onSkip,
  onEnrichmentDataChange
}: EnrichmentStepProps) {
  
  // Fonction pour traiter les données d'enrichissement
  const handleEnrichmentComplete = (data: EnrichmentData) => {
    console.log('📊 Données d\'enrichissement:', data);
    onEnrichmentComplete(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Informations de votre établissement
        </h2>
        <p className="text-gray-600 mt-2">
          Décrivez votre établissement et ses caractéristiques principales.
        </p>
      </div>
      
      <EnrichmentStep
        onEnrichmentComplete={handleEnrichmentComplete}
        onSkip={() => {
          console.log('Enrichissement ignoré par l\'utilisateur');
          onSkip();
        }}
        isVisible={true}
        onEnrichmentDataChange={onEnrichmentDataChange}
      />
    </div>
  );
}
