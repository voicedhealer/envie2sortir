import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';
import { createClient as createClientAdmin } from '@supabase/supabase-js';

// POST - Signaler un avis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let user;
    try {
      user = await getCurrentUser();
    } catch (authError: any) {
      console.error('❌ Erreur d\'authentification lors du signalement:', authError);
      // Si c'est une erreur de refresh token invalide, retourner une erreur 401
      if (authError?.message?.includes('Refresh Token') || authError?.message?.includes('Invalid Refresh Token')) {
        return NextResponse.json(
          { error: 'Session expirée. Veuillez vous reconnecter.' },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: commentId } = await params;
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Veuillez indiquer la raison du signalement (minimum 10 caractères)' 
      }, { status: 400 });
    }

    // Créer le client admin pour contourner RLS (lecture et mise à jour)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return NextResponse.json(
        { error: 'Erreur de configuration serveur' },
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Vérifier que le commentaire existe (avec client admin pour éviter les problèmes RLS)
    console.log('🔍 Recherche du commentaire:', commentId);
    const { data: comment, error: commentError } = await adminClient
      .from('user_comments')
      .select('id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentError) {
      console.error('❌ Erreur vérification commentaire:', commentError);
      return NextResponse.json({ error: 'Erreur lors de la vérification de l\'avis' }, { status: 500 });
    }

    if (!comment) {
      console.log('⚠️ Commentaire non trouvé avec ID:', commentId);
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Marquer l'avis comme signalé - UNIQUEMENT les champs de signalement
    // On ne modifie PAS le contenu (content), le rating, ou tout autre champ de l'avis
    const { data: updatedComment, error: updateError } = await adminClient
      .from('user_comments')
      .update({
        // SEULEMENT les champs de signalement
        is_reported: true,
        report_reason: reason.trim(),
        reported_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select('id, is_reported, report_reason, reported_at')
      .maybeSingle();

    if (updateError) {
      console.error('❌ Erreur signalement:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du signalement' },
        { status: 500 }
      );
    }

    if (!updatedComment) {
      console.log('⚠️ Commentaire non trouvé après mise à jour avec ID:', commentId);
      return NextResponse.json({ error: 'Avis introuvable après mise à jour' }, { status: 404 });
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
