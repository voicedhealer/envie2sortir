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

    // Récupérer les 5 derniers établissements inscrits (tous statuts confondus)
    // Utiliser le client admin pour contourner RLS si nécessaire
    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let adminClient = supabase;
    if (supabaseUrl && supabaseServiceKey) {
      adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }) as any;
    }

    const { data: recentEstablishments, error: recentError } = await adminClient
      .from('establishments')
      .select(`
        id,
        name,
        status,
        created_at,
        updated_at,
        owner_id,
        professionals!establishments_owner_id_fkey (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Erreur récupération établissements récents:', recentError);
    }

    // Convertir snake_case -> camelCase
    const formattedEstablishments = (recentEstablishments || []).map((est: any) => {
      // La jointure retourne 'professionals' (nom de la table), pas 'owner'
      const owner = Array.isArray(est.professionals) ? est.professionals[0] : est.professionals;
      
      return {
        id: est.id,
        name: est.name,
        category: 'Non spécifié', // À adapter selon vos besoins
        status: est.status,
        createdAt: est.created_at,
        updatedAt: est.updated_at,
        owner: owner ? {
          firstName: owner.first_name || 'Non renseigné',
          lastName: owner.last_name || 'Non renseigné'
        } : {
          firstName: 'Non renseigné',
          lastName: 'Non renseigné'
        }
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
