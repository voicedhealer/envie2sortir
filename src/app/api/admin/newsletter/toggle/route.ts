import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";
import { z } from "zod";

const toggleSchema = z.object({
  subscriberId: z.string().min(1, "ID abonné requis"),
  status: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = createClient();
    const body = await request.json();
    const validationResult = toggleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { subscriberId, status } = validationResult.data;

    // Vérifier que l'abonné existe
    const { data: subscriber, error: subscriberError } = await supabase
      .from('users')
      .select('id, email, newsletter_opt_in')
      .eq('id', subscriberId)
      .single();

    if (subscriberError || !subscriber) {
      return NextResponse.json(
        { success: false, error: "Abonné non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        newsletter_opt_in: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriberId);

    if (updateError) {
      console.error('Erreur mise à jour abonné:', updateError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la modification du statut" },
        { status: 500 }
      );
    }

    // Log de l'action
    console.log(`📧 [Newsletter Admin] Statut modifié pour ${subscriber.email}: ${status ? 'Activé' : 'Désactivé'}`);

    return NextResponse.json({
      success: true,
      message: `Abonnement ${status ? 'activé' : 'désactivé'} avec succès`
    });

  } catch (error) {
    console.error('❌ [Newsletter Toggle] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la modification du statut" },
      { status: 500 }
    );
  }
}


