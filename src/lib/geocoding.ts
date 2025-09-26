// Module de géocodage simplifié
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Pour l'instant, retournons des coordonnées par défaut (Paris)
    // TODO: Implémenter le vrai géocodage avec une API comme Google Maps ou OpenStreetMap
    console.log('🌍 Géocodage simulé pour:', address);
    
    // Coordonnées par défaut (Paris)
    return {
      latitude: 48.8566,
      longitude: 2.3522
    };
  } catch (error) {
    console.error('❌ Erreur de géocodage:', error);
    return null;
  }
}
