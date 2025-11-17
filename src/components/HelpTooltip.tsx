'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
}

export default function HelpTooltip({ content }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        className="text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Aide"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg left-0 top-full">
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
          <p className="whitespace-normal">{content}</p>
        </div>
      )}
    </div>
  );
}

