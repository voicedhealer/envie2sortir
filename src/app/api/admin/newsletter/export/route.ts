import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = await createClient();

    // Récupérer tous les abonnés
    const { data: subscribers, error: subscribersError } = await supabase
      .from('users')
      .select('id, email, newsletter_opt_in, is_verified, created_at, updated_at, preferences')
      .eq('newsletter_opt_in', true)
      .order('created_at', { ascending: false });

    if (subscribersError) {
      console.error('Erreur récupération abonnés:', subscribersError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'export" },
        { status: 500 }
      );
    }

    // Générer le CSV
    const csvHeader = 'Email,Statut,Vérifié,Date Inscription,Date Modification\n';
    const csvRows = (subscribers || []).map((sub: any) => {
      const status = sub.newsletter_opt_in ? 'Actif' : 'Inactif';
      const verified = sub.is_verified ? 'Oui' : 'Non';
      const createdAt = new Date(sub.created_at).toLocaleDateString('fr-FR');
      const updatedAt = new Date(sub.updated_at).toLocaleDateString('fr-FR');
      
      return `"${sub.email}","${status}","${verified}","${createdAt}","${updatedAt}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Log de l'export
    console.log(`📊 [Newsletter Export] Export de ${subscribers.length} abonnés`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abonnes-newsletter-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('❌ [Newsletter Export] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}


