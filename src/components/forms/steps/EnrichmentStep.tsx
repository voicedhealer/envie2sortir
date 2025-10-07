import EnrichmentStep from '@/components/forms/EnrichmentStep';
import { EnrichmentData } from '@/lib/enrichment-system';
import { organizeTagsByCategory } from '@/lib/establishment-categories';

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
  
  // Fonction pour organiser les données d'enrichissement selon les nouvelles catégories
  const handleEnrichmentComplete = (data: EnrichmentData) => {
    // Organiser les données selon les nouvelles catégories
    const allTags = [
      ...(data.services || []),
      ...(data.ambiance || []),
      ...(data.specialties || []),
      ...(data.activities || []),
      ...(data.clientele || []),
      ...(data.informationsPratiques || [])
    ];

    const organizedData = organizeTagsByCategory(allTags);
    
    // Créer un objet d'enrichissement organisé
    const organizedEnrichmentData = {
      ...data,
      organizedCategories: organizedData,
      totalTags: allTags.length,
      categoriesCount: Object.keys(organizedData).length
    };

    console.log('📊 Données d\'enrichissement organisées:', organizedEnrichmentData);
    onEnrichmentComplete(organizedEnrichmentData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Informations de votre établissement
        </h2>
        <p className="text-gray-600 mt-2">
          Décrivez votre établissement et ses caractéristiques principales.
          Les données seront automatiquement organisées en catégories cohérentes.
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
