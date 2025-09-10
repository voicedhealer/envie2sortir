/**
 * COMPOSANT SELECT MODERNE POUR ACTIVITÉS MULTIPLES
 * Permet de sélectionner plusieurs activités pour un établissement
 * Utilise React-Select avec groupes, recherche et style moderne
 * Source unique : category-tags-mapping.ts
 */

import Select from 'react-select';
import { useState, useEffect } from 'react';
import { getGroupedActivities, getActivityInfo, type ActivityInfo } from '@/lib/category-tags-mapping';

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


// Fonction pour convertir la config en format React-Select (utilise le mapping)
const createGroupedOptions = (): GroupedOption[] => {
  const groupedActivities = getGroupedActivities();
  
  return Object.entries(groupedActivities).map(([groupLabel, activityKeys]) => {
    const options: ActivityOption[] = activityKeys.map(activityKey => {
      const activityInfo = getActivityInfo(activityKey);
      if (!activityInfo) {
        console.warn(`Activité non trouvée: ${activityKey}`);
        return {
          value: activityKey,
          label: activityKey,
          services: [],
          ambiance: []
        };
      }
      
      return {
        value: activityKey,
        label: activityInfo.label,
        services: activityInfo.services,
        ambiance: activityInfo.ambiance
      };
    });
    
    return {
      label: groupLabel,
      options
    };
  });
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
  const [isHydrated, setIsHydrated] = useState(false);
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

  // Gestion de l'hydratation
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialiser les options sélectionnées
  useEffect(() => {
    if (value && value.length > 0) {
      setSelectedOptions(findOptionsByValues(value));
    }
  }, [value]);

  // Afficher un placeholder pendant l'hydratation
  if (!isHydrated) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Activités proposées *
        </label>
        <div className="h-11 bg-gray-100 rounded-lg flex items-center px-3 text-gray-500">
          Chargement...
        </div>
      </div>
    );
  }

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
        instanceId="activities-selector"
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
