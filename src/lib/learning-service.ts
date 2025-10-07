// Service d'apprentissage intelligent pour la détection des types d'établissements
// Note: Ce service ne peut être utilisé que côté serveur (API routes)

export interface LearningPattern {
  id: string;
  name: string;
  detectedType: string;
  correctedType?: string;
  googleTypes: string[];
  keywords: string[];
  confidence: number;
  isCorrected: boolean;
  correctedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypeSuggestion {
  type: string;
  confidence: number;
  reason: string;
  keywords: string[];
}

export class EstablishmentLearningService {
  
  /**
   * Sauvegarde un pattern d'apprentissage lors de l'ajout d'un établissement
   * Cette méthode doit être appelée côté serveur uniquement
   */
  async saveLearningPattern(data: {
    name: string;
    detectedType: string;
    correctedType?: string;
    googleTypes: string[];
    keywords: string[];
    confidence: number;
    correctedBy?: string;
  }): Promise<void> {
    // Cette méthode sera implémentée dans les API routes
    console.log('📚 Pattern d\'apprentissage à sauvegarder:', data.name);
  }

  /**
   * Corrige un type d'établissement et met à jour le pattern d'apprentissage
   * Cette méthode doit être appelée côté serveur uniquement
   */
  async correctEstablishmentType(
    establishmentId: string, 
    correctedType: string, 
    correctedBy: string
  ): Promise<void> {
    // Cette méthode sera implémentée dans les API routes
    console.log('✅ Type à corriger:', establishmentId, '→', correctedType);
  }

  /**
   * Analyse un établissement et suggère des types basés sur l'apprentissage
   * Cette méthode doit être appelée côté serveur uniquement
   */
  async suggestEstablishmentType(data: {
    name: string;
    googleTypes: string[];
    description?: string;
  }): Promise<TypeSuggestion[]> {
    // Cette méthode sera implémentée dans les API routes
    console.log('🧠 Suggestions à générer pour:', data.name);
    return [];
  }

  /**
   * Calcule la similarité entre deux établissements
   */
  private calculateSimilarity(
    text1: string,
    keywords1: string[],
    googleTypes1: string[],
    googleTypes2: string[]
  ): number {
    let similarity = 0;

    // Similarité basée sur les mots-clés (40% du score)
    const keywordMatches = keywords1.filter(keyword => 
      text1.includes(keyword.toLowerCase())
    ).length;
    const keywordSimilarity = keywords1.length > 0 ? keywordMatches / keywords1.length : 0;
    similarity += keywordSimilarity * 0.4;

    // Similarité basée sur les types Google (60% du score)
    const googleTypeMatches = googleTypes1.filter(type => 
      googleTypes2.includes(type)
    ).length;
    const googleTypeSimilarity = googleTypes2.length > 0 ? googleTypeMatches / googleTypes2.length : 0;
    similarity += googleTypeSimilarity * 0.6;

    return Math.min(similarity, 1);
  }

  /**
   * Obtient les statistiques d'apprentissage
   * Cette méthode doit être appelée côté serveur uniquement
   */
  async getLearningStats(): Promise<{
    totalPatterns: number;
    correctedPatterns: number;
    accuracy: number;
    mostCommonTypes: Array<{ type: string; count: number }>;
  }> {
    // Cette méthode sera implémentée dans les API routes
    return {
      totalPatterns: 0,
      correctedPatterns: 0,
      accuracy: 0,
      mostCommonTypes: []
    };
  }

  /**
   * Extrait les mots-clés d'un texte
   */
  extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Mots-clés spécifiques aux types d'établissements
    const typeKeywords = {
      'parc_loisir_indoor': ['parc', 'loisir', 'indoor', 'intérieur', 'jeux', 'games', 'factory', 'ludique', 'famille', 'enfants'],
      'escape_game': ['escape', 'room', 'énigme', 'mystère', 'puzzle', 'défi', 'challenge', 'aventure', 'donjon'],
      'vr_experience': ['vr', 'virtual', 'réalité', 'virtuelle', 'casque', 'immersion', 'simulation'],
      'karaoke': ['karaoké', 'karaoke', 'chanson', 'micro', 'cabine', 'singing'],
      'restaurant': ['restaurant', 'resto', 'cuisine', 'manger', 'repas', 'table'],
      'bar': ['bar', 'boisson', 'alcool', 'cocktail', 'bière', 'vin'],
      'cinema': ['cinéma', 'cinema', 'film', 'movie', 'salle', 'projection']
    };

    // Vérifier chaque catégorie
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        keywords.push(...keywords.filter(keyword => text.includes(keyword)));
      }
    }

    // Ajouter les mots fréquents
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Ajouter les mots qui apparaissent plus d'une fois
    Object.entries(wordCount).forEach(([word, count]) => {
      if (count > 1 && word.length > 3) {
        keywords.push(word);
      }
    });

    return [...new Set(keywords)]; // Supprimer les doublons
  }
}

export const learningService = new EstablishmentLearningService();
