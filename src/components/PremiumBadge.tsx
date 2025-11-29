'use client';

import { getSubscriptionDisplayInfo } from '@/lib/subscription-utils';
import type { SubscriptionType } from '@/lib/subscription-utils';

interface PremiumBadgeProps {
  subscription: SubscriptionType;
  className?: string;
}

/**
 * Composant PremiumBadge
 * Affiche un badge selon le type d'abonnement
 */
export default function PremiumBadge({ subscription, className = '' }: PremiumBadgeProps) {
  const displayInfo = getSubscriptionDisplayInfo(subscription);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${displayInfo.badgeColor} ${className}`}
    >
      {displayInfo.isWaitlistBeta && '🚀 '}
      {displayInfo.isPremium && !displayInfo.isWaitlistBeta && '🔥 '}
      {displayInfo.label}
    </span>
  );
}

