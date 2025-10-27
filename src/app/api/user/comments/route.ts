import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (session.user.userType !== 'user' && session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const comments = await prisma.userComment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ comments });

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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (session.user.userType !== 'user' && session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

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
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Vérifier s'il existe déjà un avis de cet utilisateur pour cet établissement
    const existingComment = await prisma.userComment.findFirst({
      where: {
        userId: session.user.id,
        establishmentId: establishmentId
      }
    });

    let comment;
    if (existingComment) {
      // Mettre à jour l'avis existant
      comment = await prisma.userComment.update({
        where: { id: existingComment.id },
        data: {
          content: cleanedContent,
          rating: validRating,
          updatedAt: new Date()
        },
        include: {
          establishment: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });
    } else {
      // Créer un nouvel avis
      comment = await prisma.userComment.create({
        data: {
          userId: session.user.id,
          establishmentId: establishmentId,
          content: cleanedContent,
          rating: validRating
        },
        include: {
          establishment: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });
    }

    // Mettre à jour la note moyenne de l'établissement
    if (validRating && validRating > 0) {
      const allComments = await prisma.userComment.findMany({
        where: {
          establishmentId: establishmentId
        },
        select: { rating: true }
      });

      // Filtrer les commentaires avec rating valide
      const commentsWithRating = allComments.filter(c => c.rating && c.rating > 0);
      const avgRating = commentsWithRating.length > 0 
        ? commentsWithRating.reduce((sum, c) => sum + c.rating!, 0) / commentsWithRating.length 
        : 0;

      await prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          avgRating: avgRating,
          totalComments: commentsWithRating.length
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      comment,
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
