/**
 * COMPOSANT SELECT MODERNE POUR ACTIVITÉS MULTIPLES
 * Permet de sélectionner plusieurs activités pour un établissement
 * Utilise React-Select avec groupes, recherche et style moderne
 */

import Select from 'react-select';
import { useState } from 'react';

// Types TypeScript
type ActivityOption = {
  value: string;
  label: string;
  services: string[];
  ambiance: string[];
};

type GroupedOption = {
  label: string;
  options: ActivityOption[];
};

// Configuration complète des activités groupées
const ACTIVITY_GROUPS = {
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
    billard_americain: {
      label: "Billard américain",
      services: ["Tables de billard", "Location queues", "Snack", "Ambiance détendue"],
      ambiance: ["Détendue", "Conviviale", "Technique", "Entre amis"]
    },
    billard_francais: {
      label: "Billard français",
      services: ["Tables de carambole", "Location queues", "Snack", "Ambiance traditionnelle"],
      ambiance: ["Traditionnelle", "Technique", "Calme", "Concentration"]
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
    },
    karting: {
      label: "Karting",
      services: ["Pistes de karting", "Location casques", "Chronométrage", "Compétitions"],
      ambiance: ["Adrénaline", "Compétitive", "Sportive", "Excitante"]
    },
    laser_game: {
      label: "Laser game",
      services: ["Arènes de jeu", "Équipements laser", "Équipes", "Scores"],
      ambiance: ["Stratégique", "Compétitive", "Amusante", "Équipe"]
    },
    vr_experience: {
      label: "Expérience VR",
      services: ["Casques VR", "Jeux immersifs", "Simulateurs", "Réservation"],
      ambiance: ["Futuriste", "Immersive", "Technologique", "Innovante"]
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
  return Object.entries(ACTIVITY_GROUPS).map(([groupLabel, activities]) => ({
    label: groupLabel,
    options: Object.entries(activities).map(([value, config]) => ({
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
  }),
  
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    padding: '2px 6px'
  }),
  
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: '#1e40af',
    fontSize: '12px',
    fontWeight: '500'
  }),
  
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: '#1e40af',
    '&:hover': {
      backgroundColor: '#bfdbfe',
      color: '#1e3a8a'
    }
  })
};

// Composant principal
export const ModernActivitiesSelector = ({ 
  value, 
  onChange, 
  error 
}: {
  value: string[]; // Maintenant un tableau d'activités
  onChange: (value: string[]) => void;
  error?: string;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<ActivityOption[]>([]);
  const groupedOptions = createGroupedOptions();

  // Trouve les options correspondantes aux valeurs
  const findOptionsByValues = (searchValues: string[]): ActivityOption[] => {
    const found: ActivityOption[] = [];
    for (const group of groupedOptions) {
      for (const option of group.options) {
        if (searchValues.includes(option.value)) {
          found.push(option);
        }
      }
    }
    return found;
  };

  // Handler pour les changements
  const handleChange = (options: readonly ActivityOption[]) => {
    const selected = Array.isArray(options) ? options : [];
    setSelectedOptions(selected);
    onChange(selected.map(opt => opt.value));
  };

  // Fonction pour afficher une option personnalisée
  const formatOptionLabel = (option: ActivityOption) => (
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500 mt-1">
        {option.services.slice(0, 3).join(' • ')}
        {option.services.length > 3 ? ' ...' : ''}
      </div>
    </div>
  );

  // Initialiser les options sélectionnées
  useState(() => {
    if (value && value.length > 0) {
      setSelectedOptions(findOptionsByValues(value));
    }
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Activités proposées *
      </label>
      
      <Select<ActivityOption, true, GroupedOption>
        value={selectedOptions}
        onChange={handleChange}
        options={groupedOptions}
        styles={customStyles}
        placeholder="🔍 Rechercher et sélectionner des activités..."
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `Aucune activité trouvée pour "${inputValue}"` 
            : 'Aucune activité disponible'
        }
        formatOptionLabel={formatOptionLabel}
        isSearchable
        isClearable
        isMulti
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
      
      {selectedOptions.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Activités sélectionnées ({selectedOptions.length}) :
          </p>
          <div className="mt-2 space-y-1">
            {selectedOptions.map((option, index) => (
              <div key={index} className="text-sm text-blue-700">
                • {option.label}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-xs text-blue-600 font-medium">Services disponibles :</p>
            <p className="text-xs text-blue-600">
              {selectedOptions.flatMap(opt => opt.services).slice(0, 5).join(' • ')}
              {selectedOptions.flatMap(opt => opt.services).length > 5 ? ' ...' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
