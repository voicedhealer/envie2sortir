import EnvieTagsInput from '@/components/forms/EnvieTagsInput';
import TagsSelector from '@/components/forms/TagsSelector';
import { getSuggestedTags } from '@/lib/establishment-form.utils';

interface TagsStepProps {
  formData: {
    tags: string[];
    activities: string[];
  };
  errors: Record<string, string>;
  onTagsChange: (tags: string[]) => void;
  onEnvieTagsGenerated: (generatedTags: string[]) => void;
}

export default function TagsStep({
  formData,
  errors,
  onTagsChange,
  onEnvieTagsGenerated
}: TagsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Comment les clients vous trouvent-ils ?
        </h2>
        <p className="text-gray-600 mt-2">
          Décrivez vos envies et choisissez les mots-clés qui décrivent le mieux votre établissement
        </p>
      </div>

      {/* Section "Envie de..." pour générer des tags automatiquement */}
      <EnvieTagsInput
        onEnvieTagsGenerated={onEnvieTagsGenerated}
        existingTags={formData.tags}
      />

      {/* Sélecteur de tags traditionnel */}
      <TagsSelector
        selectedTags={formData.tags}
        onTagsChange={onTagsChange}
        suggestedTags={getSuggestedTags(formData.activities)}
        error={errors.tags}
      />
    </div>
  );
}
