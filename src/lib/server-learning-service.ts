// Service d'apprentissage côté serveur (API routes uniquement)
import { prisma } from './prisma';
import { learningService } from './learning-service';

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

export class ServerLearningService {
  
  /**
   * Sauvegarde un pattern d'apprentissage lors de l'ajout d'un établissement
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
    try {
      await prisma.establishmentLearningPattern.create({
        data: {
          name: data.name,
          detectedType: data.detectedType,
          correctedType: data.correctedType,
          googleTypes: JSON.stringify(data.googleTypes),
          keywords: JSON.stringify(data.keywords),
          confidence: data.confidence,
          isCorrected: !!data.correctedType,
          correctedBy: data.correctedBy,
        }
      });
      
      console.log('📚 Pattern d\'apprentissage sauvegardé:', data.name);
    } catch (error) {
      console.error('❌ Erreur sauvegarde pattern:', error);
    }
  }

  /**
   * Corrige un type d'établissement et met à jour le pattern d'apprentissage
   */
  async correctEstablishmentType(
    establishmentName: string, 
    correctedType: string, 
    correctedBy: string
  ): Promise<void> {
    try {
      // Trouver le pattern correspondant
      const pattern = await prisma.establishmentLearningPattern.findFirst({
        where: { name: { contains: establishmentName } }
      });

      if (pattern) {
        await prisma.establishmentLearningPattern.update({
          where: { id: pattern.id },
          data: {
            correctedType,
            isCorrected: true,
            correctedBy,
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Type corrigé et pattern mis à jour');
      } else {
        // Créer un nouveau pattern si pas trouvé
        await this.saveLearningPattern({
          name: establishmentName,
          detectedType: 'unknown',
          correctedType,
          googleTypes: [],
          keywords: learningService.extractKeywords(establishmentName),
          confidence: 1.0,
          correctedBy
        });
      }
    } catch (error) {
      console.error('❌ Erreur correction type:', error);
    }
  }

  /**
   * Analyse un établissement et suggère des types basés sur l'apprentissage
   */
  async suggestEstablishmentType(data: {
    name: string;
    googleTypes: string[];
    description?: string;
  }): Promise<TypeSuggestion[]> {
    try {
      // Récupérer tous les patterns d'apprentissage
      const patterns = await prisma.establishmentLearningPattern.findMany({
        where: { isCorrected: true } // Seulement les patterns corrigés
      });

      const suggestions: TypeSuggestion[] = [];
      const name = data.name.toLowerCase();
      const description = (data.description || '').toLowerCase();
      const fullText = `${name} ${description}`;

      // Analyser chaque pattern corrigé
      for (const pattern of patterns) {
        const patternKeywords = JSON.parse(pattern.keywords);
        const patternGoogleTypes = JSON.parse(pattern.googleTypes);
        
        // Calculer la similarité
        const similarity = this.calculateSimilarity(
          fullText,
          patternKeywords,
          data.googleTypes,
          patternGoogleTypes
        );

        if (similarity > 0.3) { // Seuil de similarité
          suggestions.push({
            type: pattern.correctedType || pattern.detectedType,
            confidence: similarity,
            reason: `Basé sur "${pattern.name}" (${Math.round(similarity * 100)}% de similarité)`,
            keywords: patternKeywords
          });
        }
      }

      // Trier par confiance décroissante
      return suggestions.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.error('❌ Erreur suggestion type:', error);
      return [];
    }
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
   */
  async getLearningStats(): Promise<{
    totalPatterns: number;
    correctedPatterns: number;
    accuracy: number;
    mostCommonTypes: Array<{ type: string; count: number }>;
  }> {
    try {
      const totalPatterns = await prisma.establishmentLearningPattern.count();
      const correctedPatterns = await prisma.establishmentLearningPattern.count({
        where: { isCorrected: true }
      });

      // Types les plus courants
      const typeStats = await prisma.establishmentLearningPattern.groupBy({
        by: ['correctedType'],
        _count: { correctedType: true },
        where: { isCorrected: true }
      });

      const mostCommonTypes = typeStats
        .map(stat => ({
          type: stat.correctedType || 'unknown',
          count: stat._count.correctedType
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalPatterns,
        correctedPatterns,
        accuracy: totalPatterns > 0 ? correctedPatterns / totalPatterns : 0,
        mostCommonTypes
      };
    } catch (error) {
      console.error('❌ Erreur stats apprentissage:', error);
      return {
        totalPatterns: 0,
        correctedPatterns: 0,
        accuracy: 0,
        mostCommonTypes: []
      };
    }
  }
}

export const serverLearningService = new ServerLearningService();

