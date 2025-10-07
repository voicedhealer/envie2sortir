'use client';

import { useCallback } from 'react';

interface ClickTrackingData {
  establishmentId: string;
  elementType: 'section' | 'subsection' | 'link' | 'button' | 'image';
  elementId: string;
  elementName?: string;
  action: 'open' | 'close' | 'click' | 'hover';
  sectionContext?: string;
}

// Hook pour tracker les clics et interactions
export function useClickTracking(establishmentId: string) {
  const trackClick = useCallback(async (data: Omit<ClickTrackingData, 'establishmentId'>) => {
    try {
      // Envoyer les données de tracking de manière asynchrone
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishmentId,
          ...data,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
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
