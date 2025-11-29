'use client';

import { useEffect, useState } from 'react';
import { getTimeUntilLaunch, formatTimeUntilLaunch, isLaunchActive } from '@/lib/launch';

/**
 * Composant CountdownTimer
 * Affiche le décompte avant le lancement officiel
 */
export default function CountdownTimer() {
  // Initialiser avec des valeurs par défaut pour éviter les problèmes d'hydratation
  const [timeUntilLaunch, setTimeUntilLaunch] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer comme monté côté client
    setMounted(true);
    
    // Calculer les valeurs uniquement côté client
    setTimeUntilLaunch(getTimeUntilLaunch());
    setIsActive(isLaunchActive());

    // Mettre à jour toutes les minutes
    const interval = setInterval(() => {
      setTimeUntilLaunch(getTimeUntilLaunch());
      setIsActive(isLaunchActive());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Ne rien afficher jusqu'à ce que le composant soit monté côté client
  if (!mounted) {
    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 mb-2">Temps restant avant le lancement</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#ff751f]">--</div>
            <div className="text-xs text-gray-500">jours</div>
          </div>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-[#ff751f]">
          🎉 Le site est lancé !
        </p>
      </div>
    );
  }

  const { days, hours, minutes } = timeUntilLaunch;

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-gray-600 mb-2">Temps restant avant le lancement</p>
      <div className="flex items-center justify-center gap-4">
        {days > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#ff751f]">{days}</div>
            <div className="text-xs text-gray-500">jour{days > 1 ? 's' : ''}</div>
          </div>
        )}
        {hours > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#ff1fa9]">{hours}</div>
            <div className="text-xs text-gray-500">heure{hours > 1 ? 's' : ''}</div>
          </div>
        )}
        {days === 0 && minutes > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#ff3a3a]">{minutes}</div>
            <div className="text-xs text-gray-500">minute{minutes > 1 ? 's' : ''}</div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">{formatTimeUntilLaunch()}</p>
    </div>
  );
}

