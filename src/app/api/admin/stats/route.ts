import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const supabase = await createClient();

    // Compter les établissements par statut
    const [pendingResult, activeResult] = await Promise.all([
      supabase.from('establishments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('establishments').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    ]);

    const pendingCount = pendingResult.count || 0;
    const activeCount = activeResult.count || 0;

    // Récupérer les 5 derniers établissements inscrits
    const { data: recentEstablishments, error: recentError } = await supabase
      .from('establishments')
      .select(`
        *,
        owner:professionals!establishments_owner_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Erreur récupération établissements récents:', recentError);
    }

    // Convertir snake_case -> camelCase
    const formattedEstablishments = (recentEstablishments || []).map((est: any) => {
      const owner = Array.isArray(est.owner) ? est.owner[0] : est.owner;
      
      return {
        ...est,
        createdAt: est.created_at,
        updatedAt: est.updated_at,
        owner: owner ? {
          firstName: owner.first_name,
          lastName: owner.last_name
        } : null
      };
    });

    return NextResponse.json({
      pendingCount,
      activeCount,
      recentEstablishments: formattedEstablishments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des statistiques",
      },
      { status: 500 }
    );
  }
}
