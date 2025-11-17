import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select(`
        *,
        establishment:establishments!user_favorites_establishment_id_fkey (
          id,
          name,
          slug,
          address,
          image_url,
          avg_rating
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (favoritesError) {
      console.error('Erreur récupération favoris:', favoritesError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des favoris' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedFavorites = (favorites || []).map((fav: any) => {
      const establishment = Array.isArray(fav.establishment) ? fav.establishment[0] : fav.establishment;
      
      return {
        id: fav.id,
        userId: fav.user_id,
        establishmentId: fav.establishment_id,
        createdAt: fav.created_at,
        establishment: establishment ? {
          id: establishment.id,
          name: establishment.name,
          slug: establishment.slug,
          address: establishment.address,
          imageUrl: establishment.image_url,
          avgRating: establishment.avg_rating
        } : null
      };
    });

    return NextResponse.json({ favorites: formattedFavorites });

  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { establishmentId } = await request.json();

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID d\'établissement requis' }, { status: 400 });
    }

    // Vérifier que l'établissement existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier si le favori existe déjà
    const { data: existingFavorite } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('establishment_id', establishmentId)
      .single();

    let favorite;
    if (existingFavorite) {
      // Le favori existe déjà, le retourner
      const { data: favWithEst } = await supabase
        .from('user_favorites')
        .select(`
          *,
          establishment:establishments!user_favorites_establishment_id_fkey (
            id,
            name,
            slug,
            address,
            image_url,
            avg_rating
          )
        `)
        .eq('id', existingFavorite.id)
        .single();

      favorite = favWithEst;
    } else {
      // Créer le favori
      const { data: newFavorite, error: createError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          establishment_id: establishmentId
        })
        .select(`
          *,
          establishment:establishments!user_favorites_establishment_id_fkey (
            id,
            name,
            slug,
            address,
            image_url,
            avg_rating
          )
        `)
        .single();

      if (createError || !newFavorite) {
        console.error('Erreur création favori:', createError);
        return NextResponse.json({ error: 'Erreur lors de l\'ajout aux favoris' }, { status: 500 });
      }

      favorite = newFavorite;
    }

    // Convertir snake_case -> camelCase
    const establishmentData = favorite.establishment ? (Array.isArray(favorite.establishment) ? favorite.establishment[0] : favorite.establishment) : null;

    const formattedFavorite = {
      id: favorite.id,
      userId: favorite.user_id,
      establishmentId: favorite.establishment_id,
      createdAt: favorite.created_at,
      establishment: establishmentData ? {
        id: establishmentData.id,
        name: establishmentData.name,
        slug: establishmentData.slug,
        address: establishmentData.address,
        imageUrl: establishmentData.image_url,
        avgRating: establishmentData.avg_rating
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      favorite: formattedFavorite,
      message: 'Ajouté aux favoris' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    );
  }
}
