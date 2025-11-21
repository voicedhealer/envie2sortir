import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";
import { z } from "zod";

const verifySchema = z.object({
  subscriberId: z.string().min(1, "ID abonné requis")
});

export async function POST(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { subscriberId } = validationResult.data;

    // Vérifier que l'abonné existe
    const { data: subscriber, error: subscriberError } = await supabase
      .from('users')
      .select('id, email, is_verified, newsletter_opt_in')
      .eq('id', subscriberId)
      .single();

    if (subscriberError || !subscriber) {
      return NextResponse.json(
        { success: false, error: "Abonné non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'abonné n'est pas déjà vérifié
    if (subscriber.is_verified) {
      return NextResponse.json({
        success: true,
        message: "Cet abonné est déjà vérifié"
      });
    }

    // Marquer l'email comme vérifié
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriberId);

    if (updateError) {
      console.error('Erreur vérification abonné:', updateError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la vérification" },
        { status: 500 }
      );
    }

    // Log de l'action
    console.log(`✅ [Newsletter Admin] Email vérifié manuellement: ${subscriber.email}`);

    return NextResponse.json({
      success: true,
      message: "Email vérifié avec succès"
    });

  } catch (error) {
    console.error('❌ [Newsletter Verify] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}

