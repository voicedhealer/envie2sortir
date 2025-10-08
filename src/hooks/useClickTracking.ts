'use client';

import { useCallback } from 'react';

interface ClickTrackingData {
  establishmentId: string;
  elementType: 'section' | 'subsection' | 'link' | 'button' | 'image' | 'schedule' | 'gallery' | 'contact';
  elementId: string;
  elementName?: string;
  action: 'open' | 'close' | 'click' | 'hover' | 'view' | 'expand';
  sectionContext?: string;
  // ✅ AJOUT : Données temporelles précises
  hour?: number; // Heure de l'interaction (0-23)
  dayOfWeek?: string; // Jour de la semaine
  timeSlot?: string; // Créneau horaire (ex: "14h-15h")
}

// Hook pour tracker les clics et interactions
export function useClickTracking(establishmentId: string) {
  const trackClick = useCallback(async (data: Omit<ClickTrackingData, 'establishmentId'>) => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.toLocaleDateString('fr-FR', { weekday: 'long' });
      const timeSlot = `${hour}h-${hour + 1}h`;
      
      // Envoyer les données de tracking de manière asynchrone
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishmentId,
          ...data,
          hour,
          dayOfWeek,
          timeSlot,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: now.toISOString(),
        }),
      });
    } catch (error) {
      // Silencieux - ne pas interrompre l'expérience utilisateur
      console.debug('Analytics tracking failed:', error);
    }
  }, [establishmentId]);

  return { trackClick };
}

// Fonction utilitaire pour tracker les sections
export function useSectionTracking(establishmentId: string) {
  const { trackClick } = useClickTracking(establishmentId);

  const trackSectionOpen = useCallback((sectionId: string, sectionName: string) => {
    trackClick({
      elementType: 'section',
      elementId: sectionId,
      elementName: sectionName,
      action: 'open',
    });
  }, [trackClick]);

  const trackSectionClose = useCallback((sectionId: string, sectionName: string) => {
    trackClick({
      elementType: 'section',
      elementId: sectionId,
      elementName: sectionName,
      action: 'close',
    });
  }, [trackClick]);

  const trackSubsectionClick = useCallback((subsectionId: string, subsectionName: string, sectionContext: string) => {
    trackClick({
      elementType: 'subsection',
      elementId: subsectionId,
      elementName: subsectionName,
      action: 'click',
      sectionContext,
    });
  }, [trackClick]);

  return {
    trackSectionOpen,
    trackSectionClose,
    trackSubsectionClick,
  };
}

// Fonction utilitaire pour tracker les liens externes
export function useLinkTracking(establishmentId: string) {
  const { trackClick } = useClickTracking(establishmentId);

  const trackLinkClick = useCallback((linkId: string, linkName: string, linkType: 'website' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'phone' | 'email') => {
    trackClick({
      elementType: 'link',
      elementId: linkId,
      elementName: linkName,
      action: 'click',
      sectionContext: 'external_links',
    });
  }, [trackClick]);

  return { trackLinkClick };
}

// ✅ NOUVEAU : Hook pour tracker les horaires
export function useScheduleTracking(establishmentId: string) {
  const { trackClick } = useClickTracking(establishmentId);

  const trackScheduleView = useCallback((scheduleType: 'opening_hours' | 'events' | 'special_hours') => {
    trackClick({
      elementType: 'schedule',
      elementId: scheduleType,
      elementName: 'Horaires d\'ouverture',
      action: 'view',
      sectionContext: 'schedule',
    });
  }, [trackClick]);

  const trackScheduleExpand = useCallback(() => {
    trackClick({
      elementType: 'schedule',
      elementId: 'opening_hours',
      elementName: 'Horaires d\'ouverture',
      action: 'expand',
      sectionContext: 'schedule',
    });
  }, [trackClick]);

  return { trackScheduleView, trackScheduleExpand };
}

// ✅ NOUVEAU : Hook pour tracker la galerie photos
export function useGalleryTracking(establishmentId: string) {
  const { trackClick } = useClickTracking(establishmentId);

  const trackImageView = useCallback((imageIndex: number, totalImages: number) => {
    trackClick({
      elementType: 'gallery',
      elementId: `image_${imageIndex}`,
      elementName: `Image ${imageIndex + 1}/${totalImages}`,
      action: 'view',
      sectionContext: 'gallery',
    });
  }, [trackClick]);

  return { trackImageView };
}

// ✅ NOUVEAU : Hook pour tracker les contacts
export function useContactTracking(establishmentId: string) {
  const { trackClick } = useClickTracking(establishmentId);

  const trackContactClick = useCallback((contactType: 'phone' | 'whatsapp' | 'email' | 'website') => {
    trackClick({
      elementType: 'contact',
      elementId: contactType,
      elementName: `Contact ${contactType}`,
      action: 'click',
      sectionContext: 'contact',
    });
  }, [trackClick]);

  return { trackContactClick };
}
