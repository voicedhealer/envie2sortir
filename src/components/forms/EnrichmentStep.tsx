"use client";

import { EnrichmentData } from '@/lib/enrichment-system';
import SmartEnrichmentStepV2 from './SmartEnrichmentStepV2';

interface EnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
  onEnrichmentDataChange?: (data: EnrichmentData | null) => void;
  establishmentType?: string;
}

export default function EnrichmentStep({ 
  onEnrichmentComplete, 
  onSkip, 
  isVisible, 
  onEnrichmentDataChange,
  establishmentType = 'restaurant'
}: EnrichmentStepProps) {
  if (!isVisible) return null;

  return (
    <SmartEnrichmentStepV2
      onEnrichmentComplete={onEnrichmentComplete}
      onSkip={onSkip}
      isVisible={isVisible}
      onEnrichmentDataChange={onEnrichmentDataChange}
      establishmentType={establishmentType}
    />
  );
}
