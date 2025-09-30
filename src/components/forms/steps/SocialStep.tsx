interface SocialStepProps {
  formData: {
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    priceMin?: number;
    priceMax?: number;
  };
  onInputChange: (field: string | number | symbol, value: any) => void;
}

export default function SocialStep({
  formData,
  onInputChange
}: SocialStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Réseaux sociaux</h2>
        <p className="text-gray-600 mt-2">
          Ajoutez vos liens réseaux sociaux pour améliorer votre visibilité
        </p>
      </div>
      
      {/* Liens réseaux sociaux */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Site web</label>
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => onInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.votre-site.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Instagram</label>
          <input
            type="text"
            value={formData.instagram || ''}
            onChange={(e) => onInputChange('instagram', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="@votre_compte"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Facebook</label>
        <input
          type="url"
          value={formData.facebook || ''}
          onChange={(e) => onInputChange('facebook', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.facebook.com/votre-page"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">TikTok</label>
        <input
          type="url"
          value={formData.tiktok || ''}
          onChange={(e) => onInputChange('tiktok', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.tiktok.com/@votrepseudo"
        />
      </div>

      {/* Section Prix */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fourchette de prix</h3>
        <p className="text-sm text-gray-600 mb-4">
          Indiquez votre fourchette de prix pour aider vos clients à mieux vous connaître
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prix minimum (€)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.priceMin || ''}
              onChange={(e) => onInputChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Prix maximum (€)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.priceMax || ''}
              onChange={(e) => onInputChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="45"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Exemple : 15-45€ pour un restaurant, 5-12€ pour un bar
        </p>
      </div>
    </div>
  );
}
