// Module de géocodage simplifié
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('🌍 Géocodage de l\'adresse:', address);
    
    // Utiliser l'API de géocodage interne
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    
    if (!response.ok) {
      console.error('❌ Erreur API géocodage:', response.status, response.statusText);
      return null;
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Géocodage réussi:', result.data.latitude, result.data.longitude);
      return {
        latitude: result.data.latitude,
        longitude: result.data.longitude
      };
    } else {
      console.error('❌ Géocodage échoué:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur de géocodage:', error);
    return null;
  }
}
