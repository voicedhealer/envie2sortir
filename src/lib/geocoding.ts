// Module de géocodage simplifié
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('🌍 Géocodage de l\'adresse:', address);
    
    // Déterminer l'URL de base selon l'environnement
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL || 'https://envie2sortir.fr'
      : 'http://localhost:3001';
    
    // Utiliser l'API de géocodage interne avec URL complète
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
