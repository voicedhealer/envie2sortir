// Module de géocodage simplifié
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('🌍 Géocodage de l\'adresse:', address);
    
    // Construire l'URL absolue pour les appels côté serveur
    // Utiliser process.env pour obtenir l'URL de base
    const baseUrl = typeof window === 'undefined' 
      ? (process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`)
      : '';
    
    const apiUrl = `${baseUrl}/api/geocode?address=${encodeURIComponent(address)}`;
    console.log('🔗 URL de géocodage:', apiUrl);
    
    const response = await fetch(apiUrl);
    
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
