/**
 * COMPOSANT SELECT MODERNE POUR CATÉGORIES
 * Utilise React-Select avec groupes, recherche et style moderne
 */

import Select from 'react-select';
import { useState } from 'react';

// Types TypeScript
type CategoryOption = {
  value: string;
  label: string;
  services: string[];
  ambiance: string[];
};

type GroupedOption = {
  label: string;
  options: CategoryOption[];
};

// Configuration complète des catégories groupées
const CATEGORY_GROUPS = {
  "🍹 Bars & Boissons": {
    bar_ambiance: {
      label: "Bar d'ambiance / Lounge",
      services: ["Cocktails maison", "Apéros", "Terrasse", "Musique douce", "Sofas"],
      ambiance: ["Chic", "Élégant", "Romantique", "After-work"]
    },
    pub_traditionnel: {
      label: "Pub traditionnel",
      services: ["Bières pression", "Fish & chips", "Écrans sport", "Ambiance conviviale"],
      ambiance: ["Décontractée", "Entre potes", "Sportive", "Anglaise"]
    },
    brasserie_artisanale: {
      label: "Brasserie artisanale",
      services: ["Bières craft", "Dégustation", "Visite brasserie", "Produits locaux"],
      ambiance: ["Artisanale", "Locale", "Découverte", "Authentique"]
    },
    bar_cocktails: {
      label: "Bar à cocktails spécialisé",
      services: ["Cocktails signature", "Mixologie", "Happy Hour", "Bartender expert"],
      ambiance: ["Sophistiqué", "Créatif", "Festive", "Trendy"]
    },
    bar_vins: {
      label: "Bar à vins / Cave à vin",
      services: ["Dégustation vins", "Accords mets-vins", "Cave sélectionnée", "Conseil sommelier"],
      ambiance: ["Œnologique", "Raffinée", "Culturelle", "Conviviale"]
    },
    bar_sports: {
      label: "Bar sportif",
      services: ["Écrans géants", "Retransmission match", "Bière pression", "Ambiance supporters"],
      ambiance: ["Sportive", "Conviviale", "Animée", "Passion"]
    },
    rooftop_bar: {
      label: "Bar rooftop / Terrasse",
      services: ["Vue panoramique", "Terrasse", "Coucher soleil", "Cocktails premium"],
      ambiance: ["Panoramique", "Romantique", "Exclusive", "Instagram"]
    },
    bar_karaoke: {
      label: "Bar karaoké",
      services: ["Karaoké", "Cabines privées", "Playlist variée", "Ambiance festive"],
      ambiance: ["Amusante", "Décontractée", "Festive", "Entre amis"]
    },
    bar_bières: {
        label: "Bar bières",
        services: ["Bières pression","Bières Belge", "Tapas/Planches", "Happy Hour", "Terrasse"],
        ambiance: ["Amusante", "Décontractée", "Festive", "Entre amis","DJ","Musique live","Écrans sport"]
      }
  },

  "🍽️ Restaurants": {
    restaurant_gastronomique: {
      label: "Restaurant gastronomique",
      services: ["Menu dégustation", "Chef étoilé", "Service premium", "Vins d'exception"],
      ambiance: ["Gastronomique", "Raffinée", "Étoilée", "Exceptionnelle"]
    },
    restaurant_traditionnel: {
      label: "Restaurant traditionnel français",
      services: ["Cuisine traditionnelle", "Produits terroir", "Plats régionaux", "Ambiance authentique"],
      ambiance: ["Traditionnelle", "Authentique", "Terroir", "Familiale"]
    },
    restaurant_familial: {
      label: "Restaurant familial",
      services: ["Menu enfant", "Chaises hautes", "Animations", "Prix abordables"],
      ambiance: ["Familiale", "Conviviale", "Décontractée", "Générations"]
    },
    bistrot: {
      label: "Bistrot de quartier",
      services: ["Plat du jour", "Ardoise", "Prix doux", "Ambiance locale"],
      ambiance: ["Bistrot", "Quartier", "Authentique", "Simplicité"]
    }
  },

  "🌍 Cuisines du monde": {
    restaurant_italien: {
      label: "Restaurant italien",
      services: ["Pâtes fraîches", "Pizza au feu de bois", "Antipasti", "Vins italiens"],
      ambiance: ["Italienne", "Conviviale", "Famiglia", "Méditerranéenne"]
    },
    restaurant_asiatique: {
      label: "Restaurant asiatique",
      services: ["Sushi frais", "Wok", "Dim sum", "Thé premium"],
      ambiance: ["Zen", "Exotique", "Moderne", "Épurée"]
    },
    restaurant_oriental: {
      label: "Restaurant oriental",
      services: ["Couscous", "Tajines", "Thé à la menthe", "Pâtisseries orientales"],
      ambiance: ["Orientale", "Chaleureuse", "Épices", "Conviviale"]
    }
  },

  "🥙 Fast Food & Street Food": {
    kebab: {
      label: "Kebab",
      services: ["Viande grillée", "Sandwich", "Livraison", "Prix accessible"],
      ambiance: ["Rapide", "Décontractée", "Entre potes", "Pratique"]
    },
    tacos_mexicain: {
      label: "Tacos mexicains",
      services: ["Tacos authentiques", "Guacamole", "Sauces piquantes", "À emporter"],
      ambiance: ["Mexicaine", "Épicée", "Street food", "Décontractée"]
    },
    burger: {
      label: "Burger house",
      services: ["Burgers maison", "Frites artisanales", "Milkshakes", "Ingrédients frais"],
      ambiance: ["Américaine", "Gourmande", "Moderne", "Trendy"]
    },
    pizzeria: {
      label: "Pizzeria",
      services: ["Pizza au feu de bois", "Pâte maison", "Livraison", "À emporter"],
      ambiance: ["Italienne", "Conviviale", "Rapide", "Familiale"]
    }
  },

  "🎉 Sorties nocturnes": {
    discotheque: {
      label: "Discothèque classique",
      services: ["Piste de danse", "DJ", "Bar", "Vestiaire"],
      ambiance: ["Festive", "Dansante", "Nocturne", "Énergique"]
    },
    club_techno: {
      label: "Club techno/électro",
      services: ["Sound system", "DJ internationaux", "Lights show", "After"],
      ambiance: ["Underground", "Électro", "Intense", "Rave"]
    },
    boite_nuit_mainstream: {
      label: "Boîte de nuit grand public",
      services: ["Hits du moment", "Ambiance jeune", "Cocktails", "Soirées thématiques"],
      ambiance: ["Mainstream", "Jeune", "Commerciale", "Accessible"]
    }
  },

  "🎯 Sports & Activités": {
    bowling: {
      label: "Bowling",
      services: ["Pistes de bowling", "Location chaussures", "Snack", "Anniversaires"],
      ambiance: ["Amusante", "Familiale", "Compétition", "Décontractée"]
    },
    escape_game_horreur: {
      label: "Escape game horreur",
      services: ["Salles thématiques", "Frissons garantis", "Team building", "Réservation"],
      ambiance: ["Horreur", "Adrénaline", "Immersive", "Challenge"]
    },
    futsal: {
      label: "Futsal",
      services: ["Terrains couverts", "Location équipement", "Matchs", "Tournois"],
      ambiance: ["Sportive", "Compétitive", "Équipe", "Technique"]
    }
  },

  "❓ Autres": {
    autre: {
      label: "Autre activité",
      services: ["À définir", "Spécialité unique", "Original", "Insolite"],
      ambiance: ["Originale", "Unique", "Surprenante", "Créative"]
    }
  }
};

// Fonction pour convertir la config en format React-Select
const createGroupedOptions = (): GroupedOption[] => {
  return Object.entries(CATEGORY_GROUPS).map(([groupLabel, categories]) => ({
    label: groupLabel,
    options: Object.entries(categories).map(([value, config]) => ({
      value,
      label: config.label,
      services: config.services,
      ambiance: config.ambiance
    }))
  }));
};

// Styles personnalisés pour un look moderne
const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '44px',
    borderColor: state.hasValue ? '#3b82f6' : state.isFocused ? '#3b82f6' : '#d1d5db',
    borderWidth: '2px',
    borderRadius: '8px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6'
    },
    fontSize: '14px'
  }),
  
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px'
  }),
  
  groupHeading: (provided: any) => ({
    ...provided,
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f9fafb',
    padding: '8px 12px',
    margin: '0',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'none'
  }),
  
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: '14px',
    padding: '10px 12px',
    backgroundColor: state.isSelected 
      ? '#3b82f6' 
      : state.isFocused 
        ? '#eff6ff' 
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#eff6ff'
    }
  }),
  
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb'
  }),
  
  menuList: (provided: any) => ({
    ...provided,
    padding: '0',
    maxHeight: '300px'
  })
};

// Composant principal
export const ModernCategorySelector = ({ 
  value, 
  onChange, 
  error 
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const [selectedOption, setSelectedOption] = useState<CategoryOption | null>(null);
  const groupedOptions = createGroupedOptions();

  // Trouve l'option correspondante à la valeur
  const findOptionByValue = (searchValue: string): CategoryOption | null => {
    for (const group of groupedOptions) {
      const option = group.options.find(opt => opt.value === searchValue);
      if (option) return option;
    }
    return null;
  };

  // Handler pour les changements
  const handleChange = (option: CategoryOption | null) => {
    setSelectedOption(option);
    onChange(option?.value || '');
  };

  // Fonction pour afficher une option personnalisée
  const formatOptionLabel = (option: CategoryOption) => (
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500 mt-1">
        {option.services.slice(0, 3).join(' • ')}
        {option.services.length > 3 ? ' ...' : ''}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Catégorie principale *
      </label>
      
      <Select<CategoryOption, false, GroupedOption>
        value={selectedOption || findOptionByValue(value)}
        onChange={handleChange}
        options={groupedOptions}
        styles={customStyles}
        placeholder="🔍 Rechercher ou sélectionner une catégorie..."
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `Aucune catégorie trouvée pour "${inputValue}"` 
            : 'Aucune catégorie disponible'
        }
        formatOptionLabel={formatOptionLabel}
        isSearchable
        isClearable
        className="react-select-container"
        classNamePrefix="react-select"
        menuPlacement="auto"
        maxMenuHeight={400}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {selectedOption && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Catégorie sélectionnée :</p>
          <p className="text-sm text-blue-700">{selectedOption.label}</p>
          <div className="mt-2">
            <p className="text-xs text-blue-600 font-medium">Services disponibles :</p>
            <p className="text-xs text-blue-600">{selectedOption.services.join(' • ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
