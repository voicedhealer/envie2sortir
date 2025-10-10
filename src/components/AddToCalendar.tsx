'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ExternalLink, Download } from 'lucide-react';
import { 
  generateGoogleCalendarUrl, 
  generateYahooCalendarUrl, 
  generateOutlookCalendarUrl, 
  downloadICS,
  CalendarEvent 
} from '../lib/calendar-utils';

interface AddToCalendarProps {
  event: CalendarEvent;
  establishmentName?: string;
  className?: string;
}

export default function AddToCalendar({ 
  event, 
  establishmentName,
  className = '' 
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu quand on clique à l'extérieur et calculer la position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const calculatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setDropdownPosition(spaceBelow < 300 && spaceAbove > 300 ? 'top' : 'bottom');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', calculatePosition);
    calculatePosition();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  // Enrichir l'événement avec les informations de l'établissement
  const enrichedEvent: CalendarEvent = {
    ...event,
    location: establishmentName ? `${establishmentName}${event.location ? ` - ${event.location}` : ''}` : event.location
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(enrichedEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleYahooCalendar = () => {
    const url = generateYahooCalendarUrl(enrichedEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarUrl(enrichedEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleAppleCalendar = () => {
    setIsLoading(true);
    try {
      downloadICS(enrichedEvent);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier ICS:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const calendarOptions = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '📅',
      action: handleGoogleCalendar,
      description: 'Ouvrir dans Google Calendar'
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '🍎',
      action: handleAppleCalendar,
      description: 'Télécharger le fichier .ics',
      loading: isLoading
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: '📧',
      action: handleOutlookCalendar,
      description: 'Ouvrir dans Outlook'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Calendar',
      icon: '📆',
      action: handleYahooCalendar,
      description: 'Ouvrir dans Yahoo Calendar'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-md"
        disabled={isLoading}
      >
        <Calendar className="w-4 h-4" />
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[9999] ${
          dropdownPosition === 'top' 
            ? 'bottom-full mb-2' 
            : 'top-full mt-2'
        }`}>
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Choisir un calendrier</p>
          <p className="text-xs text-gray-500">L&apos;événement sera ajouté avec un rappel</p>
        </div>
          
          <div className="py-1">
            {calendarOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                disabled={option.loading}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-150 group"
              >
                <span className="text-lg">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {option.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {option.loading ? 'Téléchargement...' : option.description}
                  </p>
                </div>
                {option.id !== 'apple' && (
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
                {option.id === 'apple' && (
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </button>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              💡 Un rappel sera automatiquement ajouté 1h avant l&apos;événement
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
