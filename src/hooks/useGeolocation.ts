/**
 * Hook pour gérer la géolocalisation GPS
 */

import { useState, useEffect } from 'react';
import { getCurrentPosition, checkGeolocationPermission } from '@/lib/geolocation-utils';
import { GeolocationResult } from '@/types/location';

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Vérifier la permission au montage
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await checkGeolocationPermission();
    setPermission(status);
  };

  const requestPosition = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentPosition();
      setPosition(result);
      setPermission('granted');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géolocalisation';
      setError(errorMessage);
      setPermission('denied');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    position,
    loading,
    error,
    permission,
    requestPosition,
    checkPermission,
  };
}

