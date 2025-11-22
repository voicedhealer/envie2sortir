import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messaging/unread-count
// Utilise une fonction RPC sécurisée pour éviter les erreurs de permission RLS
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification basique
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Appel de la fonction RPC 'get_unread_messages_count'
    // Cette fonction gère toute la logique (Admin vs Pro) directement en base de données
    const { data: unreadCount, error } = await supabase.rpc('get_unread_messages_count');

    if (error) {
      console.error('❌ Erreur RPC get_unread_messages_count:', error);
      // En cas d'erreur RPC, retourner 0 pour ne pas bloquer l'interface
      return NextResponse.json({ unreadCount: 0, error: error.message });
    }

    return NextResponse.json({ unreadCount: unreadCount || 0 });
    
  } catch (error) {
    console.error("Erreur serveur lors du comptage des messages:", error);
    return NextResponse.json({ unreadCount: 0 }, { status: 500 });
  }
}
