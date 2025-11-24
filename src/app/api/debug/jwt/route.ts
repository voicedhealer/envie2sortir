import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: "Pas de session",
        details: sessionError?.message 
      }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: "Pas d'utilisateur",
        details: userError?.message 
      }, { status: 401 });
    }

    // Afficher les détails du JWT
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      role_in_jwt: user.app_metadata?.role || 'NON DÉFINI',
      jwt_created_at: new Date(session.user.created_at).toISOString(),
    });

  } catch (error) {
    console.error('❌ [Debug JWT] Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du JWT" },
      { status: 500 }
    );
  }
}

