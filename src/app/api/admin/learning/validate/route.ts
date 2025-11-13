import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patternId, patternName, validatedType, validatedBy } = await request.json();

    if (!patternId || !patternName || !validatedType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();

    // Valider le pattern (marquer comme corrigé avec le type détecté)
    const { error } = await supabase
      .from('establishment_learning_patterns')
      .update({
        corrected_type: validatedType,
        is_corrected: true,
        corrected_by: validatedBy || user.email || 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', patternId);
    
    if (error) {
      console.error('❌ Erreur validation pattern:', error);
      return NextResponse.json({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Pattern validé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur validation pattern:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erreur inconnue') : undefined
    }, { status: 500 });
  }
}
