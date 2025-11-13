import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = createClient();
    const { id: favoriteId } = await params;

    // Vérifier que le favori appartient à l'utilisateur
    const { data: favorite, error: favoriteError } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('id', favoriteId)
      .eq('user_id', user.id)
      .single();

    if (favoriteError || !favorite) {
      return NextResponse.json({ error: 'Favori introuvable' }, { status: 404 });
    }

    // Supprimer le favori
    const { error: deleteError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', favoriteId);

    if (deleteError) {
      console.error('Erreur suppression favori:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du favori' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Retiré des favoris' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du favori' },
      { status: 500 }
    );
  }
}
