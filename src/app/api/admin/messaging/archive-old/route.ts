import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/messaging/archive-old
 * Supprime automatiquement les conversations fermées depuis plus de 45 jours
 * Route réservée aux admins
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Appeler la fonction PostgreSQL pour archiver les anciennes conversations
    const { data, error } = await supabase.rpc('archive_old_closed_conversations');

    if (error) {
      console.error('❌ [POST /api/admin/messaging/archive-old] Erreur:', error);
      return NextResponse.json(
        { 
          error: "Erreur lors de l'archivage",
          details: error.message 
        },
        { status: 500 }
      );
    }

    const deletedCount = data || 0;

    return NextResponse.json({
      success: true,
      message: `${deletedCount} conversation(s) archivée(s) avec succès`,
      deletedCount
    });
  } catch (error: any) {
    console.error("❌ [POST /api/admin/messaging/archive-old] Erreur:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/messaging/archive-old
 * Affiche le nombre de conversations qui seront archivées (sans les supprimer)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Compter les conversations qui seront archivées
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed')
      .not('closed_at', 'is', null)
      .lt('closed_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('❌ [GET /api/admin/messaging/archive-old] Erreur:', error);
      return NextResponse.json(
        { 
          error: "Erreur lors du comptage",
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: count || 0,
      message: `${count || 0} conversation(s) fermée(s) depuis plus de 45 jours`
    });
  } catch (error: any) {
    console.error("❌ [GET /api/admin/messaging/archive-old] Erreur:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

