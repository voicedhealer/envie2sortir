import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100'); // Augmenter pour avoir plus de données avant déduplication
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer plus de patterns pour avoir une meilleure vue avant déduplication
    const { data: patterns, error: patternsError } = await supabase
      .from('establishment_learning_patterns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Récupérer plus pour compenser la déduplication

    if (patternsError) {
      console.error('Erreur récupération patterns:', patternsError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Parser les données JSON
    const formattedPatterns = (patterns || []).map((pattern: any) => ({
      id: pattern.id,
      name: pattern.name,
      detectedType: pattern.detected_type,
      correctedType: pattern.corrected_type,
      googleTypes: typeof pattern.google_types === 'string' ? JSON.parse(pattern.google_types) : (pattern.google_types || []),
      keywords: typeof pattern.keywords === 'string' ? JSON.parse(pattern.keywords) : (pattern.keywords || []),
      confidence: pattern.confidence,
      isCorrected: pattern.is_corrected,
      correctedBy: pattern.corrected_by,
      createdAt: pattern.created_at,
      updatedAt: pattern.updated_at
    }));

    // Dédupliquer les patterns
    // Un doublon est défini comme : même nom + même type détecté + confiance similaire (±5%)
    const deduplicatedPatterns: typeof formattedPatterns = [];
    const patternsByKey = new Map<string, typeof formattedPatterns[0]>();

    for (const pattern of formattedPatterns) {
      // Créer une clé unique basée sur le nom, le type détecté et la confiance arrondie
      const confidenceRounded = Math.round(pattern.confidence * 20) / 20; // Arrondir à 5% près
      const key = `${pattern.name.toLowerCase().trim()}|${pattern.detectedType}|${confidenceRounded}`;

      const existing = patternsByKey.get(key);

      if (!existing) {
        // Aucun pattern similaire trouvé, ajouter celui-ci
        patternsByKey.set(key, pattern);
      } else {
        // Pattern similaire trouvé, décider lequel garder
        // Priorité : pattern corrigé > pattern plus récent
        const shouldReplace = 
          (!existing.isCorrected && pattern.isCorrected) ||
          (existing.isCorrected === pattern.isCorrected && 
           new Date(pattern.createdAt) > new Date(existing.createdAt));

        if (shouldReplace) {
          patternsByKey.set(key, pattern);
        }
      }
    }

    // Convertir la Map en tableau
    deduplicatedPatterns.push(...Array.from(patternsByKey.values()));

    // Réappliquer le tri par date (plus récent en premier)
    deduplicatedPatterns.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Appliquer la pagination après déduplication
    const paginatedPatterns = deduplicatedPatterns.slice(offset, offset + limit);

    return NextResponse.json(paginatedPatterns);
  } catch (error) {
    console.error('Error fetching learning patterns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
