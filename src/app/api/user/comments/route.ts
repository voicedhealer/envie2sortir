import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';
import { Filter } from 'bad-words';

// Initialiser le filtre de mots interdits
const filter = new Filter();
// Ajouter des mots français à la liste (bad-words gère déjà l'anglais)
const frenchBadWords = [
  'merde', 'putain', 'connard', 'salope', 'enculé', 'foutre', 'bordel',
  'con', 'putes', 'pute', 'connasse', 'salopard', 'enfoiré', 'connasse',
  'chier', 'chiant', 'baiser', 'bite', 'cul', 'zizi', 'couilles', 'vagin',
  'pute', 'salop', 'fdp', 'connas', 'pd', 'pd', 'enculé', 'tapette',
  'sale', 'dégueulasse', 'pourri', 'nul', 'merdique', 'pourriture'
];
filter.addWords(...frenchBadWords);

// Ajouter aussi des mots espagnols, italiens et autres langues courantes
const internationalBadWords = [
  // Espagnol
  'cabron', 'cabrón', 'puta', 'hijo de puta', 'mierda', 'joder', 'puto', 'hijoputa', 'mamada',
  // Italien
  'merda', 'cazzo', 'bastardo', 'puttana', 'fottere', 'fanculo', 'stronzo',
  // Allemand
  'scheisse', 'scheiße', 'arschloch', 'ficken', 'scheiß', 'wichser',
  // Portugal
  'porra', 'merda', 'puta', 'foder', 'caralho',
  // Néerlandais
  'kut', 'fuck', 'kanker', 'flikker',
  // Variantes avec caractères spéciaux pour contourner
  'f*ck', 'f**k', 'sh*t', 'cr*p', 'p*ss', 'a*s',
  'fuck', 'fucking', 'bullshit', 'damn', 'shit', 'asshole', 'bitch', 'bastard'
];
filter.addWords(...internationalBadWords);

// Fonction de validation et nettoyage du contenu
function validateAndCleanContent(content: string): { isValid: boolean; cleanedContent: string; error?: string } {
  // Vérifier la longueur minimale
  if (!content || content.trim().length < 10) {
    return {
      isValid: false,
      cleanedContent: '',
      error: 'Votre avis doit contenir au moins 10 caractères'
    };
  }

  // Vérifier la longueur maximale
  if (content.length > 1000) {
    return {
      isValid: false,
      cleanedContent: '',
      error: 'Votre avis ne peut pas dépasser 1000 caractères'
    };
  }

  // Vérifier les mots interdits (multilingue : français, anglais, espagnol, italien, allemand, etc.)
  const containsBadWords = filter.isProfane(content);
  
  if (containsBadWords) {
    return {
      isValid: false,
      cleanedContent: '',
      error: 'Votre avis contient des mots inappropriés. Veuillez reformuler votre message de manière respectueuse.'
    };
  }

  // Nettoyer le contenu (supprimer les espaces superflus)
  const cleanedContent = content.trim();

  return {
    isValid: true,
    cleanedContent
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: comments, error: commentsError } = await supabase
      .from('user_comments')
      .select(`
        *,
        establishment:establishments!user_comments_establishment_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Erreur récupération commentaires:', commentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedComments = (comments || []).map((comment: any) => {
      const establishment = Array.isArray(comment.establishment) ? comment.establishment[0] : comment.establishment;
      
      return {
        id: comment.id,
        userId: comment.user_id,
        establishmentId: comment.establishment_id,
        content: comment.content,
        rating: comment.rating,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        establishment: establishment ? {
          id: establishment.id,
          name: establishment.name,
          slug: establishment.slug
        } : null
      };
    });

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
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
    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    const { establishmentId, content, rating } = body;

    if (!establishmentId || !content) {
      console.log('❌ Données manquantes:', { establishmentId, content, rating });
      return NextResponse.json({ 
        error: 'Données manquantes',
        received: { establishmentId, content, rating }
      }, { status: 400 });
    }

    // 🔒 VALIDATION ET NETTOYAGE DU CONTENU
    const validation = validateAndCleanContent(content);
    
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.error);
      return NextResponse.json({ 
        error: validation.error || 'Contenu invalide'
      }, { status: 400 });
    }

    const cleanedContent = validation.cleanedContent;

    // Validation du rating
    const validRating = rating && typeof rating === 'number' && rating > 0 && rating <= 5 ? rating : null;

    // Vérifier que l'établissement existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier s'il existe déjà un avis de cet utilisateur pour cet établissement
    const { data: existingComment } = await supabase
      .from('user_comments')
      .select('*')
      .eq('user_id', user.id)
      .eq('establishment_id', establishmentId)
      .single();

    let comment;
    if (existingComment) {
      // Mettre à jour l'avis existant
      const { data: updatedComment, error: updateError } = await supabase
        .from('user_comments')
        .update({
          content: cleanedContent,
          rating: validRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingComment.id)
        .select(`
          *,
          establishment:establishments!user_comments_establishment_id_fkey (
            id,
            name,
            slug
          )
        `)
        .single();

      if (updateError || !updatedComment) {
        console.error('Erreur mise à jour commentaire:', updateError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'avis' }, { status: 500 });
      }

      comment = updatedComment;
    } else {
      // Créer un nouvel avis
      const { data: newComment, error: createError } = await supabase
        .from('user_comments')
        .insert({
          user_id: user.id,
          establishment_id: establishmentId,
          content: cleanedContent,
          rating: validRating
        })
        .select(`
          *,
          establishment:establishments!user_comments_establishment_id_fkey (
            id,
            name,
            slug
          )
        `)
        .single();

      if (createError || !newComment) {
        console.error('Erreur création commentaire:', createError);
        return NextResponse.json({ error: 'Erreur lors de l\'ajout de l\'avis' }, { status: 500 });
      }

      comment = newComment;
    }

    // Mettre à jour la note moyenne de l'établissement
    if (validRating && validRating > 0) {
      const { data: allComments } = await supabase
        .from('user_comments')
        .select('rating')
        .eq('establishment_id', establishmentId);

      // Filtrer les commentaires avec rating valide
      const commentsWithRating = (allComments || []).filter((c: any) => c.rating && c.rating > 0);
      const avgRating = commentsWithRating.length > 0 
        ? commentsWithRating.reduce((sum: number, c: any) => sum + c.rating, 0) / commentsWithRating.length 
        : 0;

      await supabase
        .from('establishments')
        .update({
          avg_rating: avgRating,
          total_comments: commentsWithRating.length
        })
        .eq('id', establishmentId);
    }

    // Convertir snake_case -> camelCase
    const establishmentData = comment.establishment ? (Array.isArray(comment.establishment) ? comment.establishment[0] : comment.establishment) : null;

    const formattedComment = {
      id: comment.id,
      userId: comment.user_id,
      establishmentId: comment.establishment_id,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      establishment: establishmentData ? {
        id: establishmentData.id,
        name: establishmentData.name,
        slug: establishmentData.slug
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      comment: formattedComment,
      message: existingComment ? 'Avis mis à jour' : 'Avis ajouté' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'avis:', error);
    console.error('❌ Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Retourner l'erreur spécifique au lieu d'un message générique
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'ajout de l\'avis',
        details: error.message,
        code: error.code
      },
      { status: 400 }
    );
  }
}
