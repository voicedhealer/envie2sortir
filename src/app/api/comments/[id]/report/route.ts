import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

// POST - Signaler un avis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = await createClient();
    const commentId = params.id;
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Veuillez indiquer la raison du signalement (minimum 10 caractères)' 
      }, { status: 400 });
    }

    // Vérifier que le commentaire existe
    const { data: comment, error: commentError } = await supabase
      .from('user_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Marquer l'avis comme signalé
    const { data: updatedComment, error: updateError } = await supabase
      .from('user_comments')
      .update({
        is_reported: true,
        report_reason: reason.trim(),
        reported_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Erreur signalement:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du signalement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Avis signalé avec succès. Notre équipe va l\'examiner.',
      comment: {
        id: updatedComment.id,
        isReported: updatedComment.is_reported,
        reportReason: updatedComment.report_reason,
        reportedAt: updatedComment.reported_at
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement' },
      { status: 500 }
    );
  }
}
