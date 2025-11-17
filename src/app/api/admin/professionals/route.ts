import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";

// GET /api/admin/professionals - Récupérer la liste des professionnels (pour admin)
export async function GET() {
  try {
    const userIsAdmin = await isAdmin();
    
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('id, first_name, last_name, email, company_name, siret')
      .order('company_name', { ascending: true });

    if (professionalsError) {
      console.error('Erreur récupération professionnels:', professionalsError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedProfessionals = (professionals || []).map((pro: any) => ({
      id: pro.id,
      firstName: pro.first_name,
      lastName: pro.last_name,
      email: pro.email,
      companyName: pro.company_name,
      siret: pro.siret
    }));

    return NextResponse.json({ professionals: formattedProfessionals });
  } catch (error) {
    console.error("Erreur lors de la récupération des professionnels:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

