/**
 * Utilitaires pour l'ajout d'événements au calendrier
 * Supporte Google Calendar, Apple Calendar, Outlook et Yahoo Calendar
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url?: string;
}

export interface CalendarReminder {
  minutes: number;
}

/**
 * Génère l'URL pour ajouter un événement à Google Calendar
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate || event.startDate)}`,
    details: event.description || '',
    location: event.location || '',
    trp: 'false'
  });

  if (event.url) {
    params.append('sprop', event.url);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Génère l'URL pour ajouter un événement à Yahoo Calendar
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: event.title,
    st: formatDateForYahoo(event.startDate),
    et: formatDateForYahoo(event.endDate || event.startDate),
    desc: event.description || '',
    in_loc: event.location || ''
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Génère l'URL pour ajouter un événement à Outlook Calendar
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.startDate,
    enddt: event.endDate || event.startDate,
    body: event.description || '',
    location: event.location || '',
    path: '/calendar/action/compose',
    rru: 'addevent'
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Génère le fichier ICS pour Apple Calendar et autres clients
 */
export function generateICSContent(event: CalendarEvent): string {
  const formatDateForICS = (date: string): string => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDateFormatted = formatDateForICS(event.startDate);
  const endDateFormatted = formatDateForICS(event.endDate || event.startDate);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Envie2Sortir//Event Calendar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDateFormatted}`,
    `DTEND:${endDateFormatted}`,
    `DTSTAMP:${now}`,
    `UID:${generateUID()}`,
    `SUMMARY:${escapeICS(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeICS(event.description)}`] : []),
    ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Rappel: ${event.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Télécharge un fichier ICS
 */
export function downloadICS(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formate une date pour Google Calendar (format RFC3339)
 */
function formatDateForGoogle(date: string): string {
  return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Formate une date pour Yahoo Calendar (format RFC3339)
 */
function formatDateForYahoo(date: string): string {
  return new Date(date).toISOString();
}

/**
 * Génère un UID unique pour l'événement ICS
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@envie2sortir.com`;
}

/**
 * Échappe les caractères spéciaux pour le format ICS
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Obtient les informations de l'établissement pour enrichir l'événement
 */
export async function getEstablishmentInfo(establishmentSlug: string): Promise<{
  name: string;
  address: string;
  city: string;
  postalCode: string;
} | null> {
  try {
    const response = await fetch(`/api/etablissements/${establishmentSlug}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      name: data.name || '',
      address: data.address || '',
      city: data.city || '',
      postalCode: data.postalCode || ''
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de l\'établissement:', error);
    return null;
  }
}
