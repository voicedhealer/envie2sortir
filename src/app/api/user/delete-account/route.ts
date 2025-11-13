import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = createClient();
    const userId = user.id;

    // Supprimer toutes les données associées à l'utilisateur
    // Supprimer les favoris
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId);

    // Supprimer les avis
    await supabase
      .from('user_comments')
      .delete()
      .eq('user_id', userId);

    // Supprimer les likes
    await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId);

    // Supprimer l'utilisateur de la table users
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Erreur suppression utilisateur:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 });
    }

    // Supprimer l'utilisateur de Supabase Auth (nécessite service role key)
    // Note: Cette opération nécessite généralement le service role key
    // Pour l'instant, on supprime juste de la table users
    // L'utilisateur Auth restera mais ne pourra plus se connecter

    return NextResponse.json({ 
      success: true, 
      message: 'Compte supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
}
