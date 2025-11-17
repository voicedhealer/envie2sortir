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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: patterns, error: patternsError } = await supabase
      .from('establishment_learning_patterns')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

    return NextResponse.json(formattedPatterns);
  } catch (error) {
    console.error('Error fetching learning patterns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
