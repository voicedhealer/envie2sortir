import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const supabase = await createClient();

    // Trouver l'établissement par son slug
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('slug', slug)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Récupérer les commentaires de l'établissement
    const { data: comments, error: commentsError } = await supabase
      .from('user_comments')
      .select(`
        *,
        user:users!user_comments_user_id_fkey (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('establishment_id', establishment.id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Erreur récupération commentaires:', commentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des commentaires' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedComments = (comments || []).map((comment: any) => {
      const user = Array.isArray(comment.user) ? comment.user[0] : comment.user;
      
      return {
        id: comment.id,
        userId: comment.user_id,
        establishmentId: comment.establishment_id,
        content: comment.content,
        rating: comment.rating,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: user ? {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar
        } : null
      };
    });

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}
