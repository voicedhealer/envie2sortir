import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

// POST - Répondre à un avis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient();
    const commentId = params.id;
    const { reply } = await request.json();

    if (!reply || reply.trim().length < 5) {
      return NextResponse.json({ 
        error: 'La réponse doit contenir au moins 5 caractères' 
      }, { status: 400 });
    }

    if (reply.length > 500) {
      return NextResponse.json({ 
        error: 'La réponse ne peut pas dépasser 500 caractères' 
      }, { status: 400 });
    }

    // Vérifier que le commentaire existe et appartient à un établissement du professionnel
    const { data: comment, error: commentError } = await supabase
      .from('user_comments')
      .select(`
        *,
        establishment:establishments (
          id,
          owner_id
        )
      `)
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Vérifier que le professionnel est le propriétaire de l'établissement
    const establishment = Array.isArray(comment.establishment) 
      ? comment.establishment[0] 
      : comment.establishment;

    if (!establishment || establishment.owner_id !== user.id) {
      return NextResponse.json({ 
        error: 'Vous n\'êtes pas autorisé à répondre à cet avis' 
      }, { status: 403 });
    }

    // Mettre à jour le commentaire avec la réponse
    const { data: updatedComment, error: updateError } = await supabase
      .from('user_comments')
      .update({
        establishment_reply: reply.trim(),
        replied_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Erreur ajout réponse:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout de la réponse' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      comment: {
        id: updatedComment.id,
        establishmentReply: updatedComment.establishment_reply,
        repliedAt: updatedComment.replied_at
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la réponse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la réponse' },
      { status: 500 }
    );
  }
}
