// Service d'apprentissage côté serveur (API routes uniquement)
import { createClient } from './supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
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
  private getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin client non configuré (variables manquantes)');
    }

    return createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
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
      const supabase = this.getAdminClient();
      const { error } = await supabase
        .from('establishment_learning_patterns')
        .insert({
          name: data.name,
          detected_type: data.detectedType,
          corrected_type: data.correctedType,
          google_types: JSON.stringify(data.googleTypes),
          keywords: JSON.stringify(data.keywords),
          confidence: data.confidence,
          is_corrected: !!data.correctedType,
          corrected_by: data.correctedBy,
        });
      
      if (error) {
        throw error;
      }
      
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
      const supabase = await createClient();
      
      // Trouver le pattern correspondant
      const { data: patterns, error: findError } = await supabase
        .from('establishment_learning_patterns')
        .select('*')
        .ilike('name', `%${establishmentName}%`)
        .limit(1);

      if (findError) {
        throw findError;
      }

      if (patterns && patterns.length > 0) {
        const pattern = patterns[0];
        const { error: updateError } = await supabase
          .from('establishment_learning_patterns')
          .update({
            corrected_type: correctedType,
            is_corrected: true,
            corrected_by: correctedBy,
            updated_at: new Date().toISOString()
          })
          .eq('id', pattern.id);
        
        if (updateError) {
          throw updateError;
        }
        
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
      const supabase = await createClient();
      
      // Récupérer tous les patterns d'apprentissage corrigés
      const { data: patterns, error } = await supabase
        .from('establishment_learning_patterns')
        .select('*')
        .eq('is_corrected', true);

      if (error) {
        throw error;
      }

      const suggestions: TypeSuggestion[] = [];
      const name = data.name.toLowerCase();
      const description = (data.description || '').toLowerCase();
      const fullText = `${name} ${description}`;

      // Analyser chaque pattern corrigé
      for (const pattern of (patterns || [])) {
        // Parser les champs JSON
        const patternKeywords = typeof pattern.keywords === 'string' 
          ? JSON.parse(pattern.keywords) 
          : pattern.keywords || [];
        const patternGoogleTypes = typeof pattern.google_types === 'string'
          ? JSON.parse(pattern.google_types)
          : pattern.google_types || [];
        
        // Calculer la similarité
        const similarity = this.calculateSimilarity(
          fullText,
          patternKeywords,
          data.googleTypes,
          patternGoogleTypes
        );

        if (similarity > 0.3) { // Seuil de similarité
          suggestions.push({
            type: pattern.corrected_type || pattern.detected_type,
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
      const supabase = await createClient();
      
      // Compter tous les patterns
      const { count: totalPatterns, error: totalError } = await supabase
        .from('establishment_learning_patterns')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw totalError;
      }

      // Compter les patterns corrigés
      const { count: correctedPatterns, error: correctedError } = await supabase
        .from('establishment_learning_patterns')
        .select('*', { count: 'exact', head: true })
        .eq('is_corrected', true);

      if (correctedError) {
        throw correctedError;
      }

      // Récupérer tous les patterns corrigés pour calculer les types les plus courants
      const { data: correctedPatternsData, error: patternsError } = await supabase
        .from('establishment_learning_patterns')
        .select('corrected_type')
        .eq('is_corrected', true);

      if (patternsError) {
        throw patternsError;
      }

      // Calculer les types les plus courants en mémoire
      const typeCounts: Record<string, number> = {};
      (correctedPatternsData || []).forEach((pattern: any) => {
        const type = pattern.corrected_type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const mostCommonTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count);

      return {
        totalPatterns: totalPatterns || 0,
        correctedPatterns: correctedPatterns || 0,
        accuracy: (totalPatterns || 0) > 0 ? (correctedPatterns || 0) / (totalPatterns || 0) : 0,
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

