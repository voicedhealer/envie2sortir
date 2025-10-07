'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ESTABLISHMENT_CATEGORIES, getCategoryInfo } from '@/lib/establishment-categories';

interface EstablishmentCategorySectionProps {
  categoryId: string;
  items: string[];
  isCollapsible?: boolean;
  showCount?: boolean;
  className?: string;
}

export default function EstablishmentCategorySection({
  categoryId,
  items,
  isCollapsible = true,
  showCount = true,
  className = ''
}: EstablishmentCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryInfo = getCategoryInfo(categoryId);
  
  if (!categoryInfo || items.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* En-tête de la section */}
      <div 
        className={`flex items-center justify-between p-4 ${isCollapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{categoryInfo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {categoryInfo.label}
            </h3>
            {showCount && (
              <p className="text-sm text-gray-500">
                {items.length} {items.length === 1 ? 'élément' : 'éléments'}
              </p>
            )}
          </div>
        </div>
        
        {isCollapsible && (
          <button className="p-1 hover:bg-gray-100 rounded-full">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Contenu de la section */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  categoryInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  categoryInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                  categoryInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                  categoryInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  categoryInfo.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
