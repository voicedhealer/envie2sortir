import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/helpers";
import { z } from "zod";

const deleteSchema = z.object({
  subscriberId: z.string().min(1, "ID abonné requis")
});

export async function DELETE(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const validationResult = deleteSchema.safeParse(body);

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
      .select('id, email, role')
      .eq('id', subscriberId)
      .single();

    if (subscriberError || !subscriber) {
      return NextResponse.json(
        { success: false, error: "Abonné non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression d'un admin
    if (subscriber.role === 'admin') {
      return NextResponse.json(
        { success: false, error: "Impossible de supprimer un administrateur" },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', subscriberId);

    if (deleteError) {
      console.error('Erreur suppression abonné:', deleteError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    // Log de l'action
    console.log(`🗑️ [Newsletter Admin] Abonné supprimé: ${subscriber.email}`);

    return NextResponse.json({
      success: true,
      message: "Abonné supprimé avec succès"
    });

  } catch (error) {
    console.error('❌ [Newsletter Delete] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}


