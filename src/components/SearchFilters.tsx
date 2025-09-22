'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Heart, DollarSign, Crown, Clock, TrendingUp } from 'lucide-react';

interface SearchFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { 
    id: 'popular', 
    label: 'Populaire', 
    icon: TrendingUp,
    description: 'Les plus visités'
  },
  { 
    id: 'wanted', 
    label: 'Désirés ++', 
    icon: Heart,
    description: 'Les plus aimés'
  },
  { 
    id: 'cheap', 
    label: 'Les - cher', 
    icon: DollarSign,
    description: 'Prix abordables'
  },
  { 
    id: 'premium', 
    label: 'Notre sélection', 
    icon: Crown,
    description: 'Établissements premium'
  },
  { 
    id: 'newest', 
    label: 'Nouveaux', 
    icon: Clock,
    description: 'Derniers ajouts'
  },
  { 
    id: 'rating', 
    label: 'Mieux notés', 
    icon: Star,
    description: 'Meilleures notes'
  }
];

export default function SearchFilters({ activeFilter, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trier par :</h2>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
              title={filter.description}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
