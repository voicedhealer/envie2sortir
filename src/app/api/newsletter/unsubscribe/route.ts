import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const unsubscribeSchema = z.object({
  email: z.string().email("Adresse email invalide").toLowerCase().trim(),
  token: z.string().optional() // Pour désinscription sécurisée
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = unsubscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { email, token } = validationResult.data;

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, newsletter_opt_in, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Adresse email non trouvée dans notre base de données" },
        { status: 404 }
      );
    }

    // Vérifier si déjà désabonné
    if (!user.newsletter_opt_in) {
      return NextResponse.json(
        { success: false, error: "Vous êtes déjà désabonné de notre newsletter" },
        { status: 409 }
      );
    }

    // Désabonner l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        newsletter_opt_in: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur désabonnement:', updateError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la désinscription" },
        { status: 500 }
      );
    }

    // Log de la désinscription
    console.log(`📧 [Newsletter] Désinscription: ${email} (Token: ${token || 'N/A'})`);

    return NextResponse.json({
      success: true,
      message: "Vous avez été désabonné avec succès de notre newsletter"
    });

  } catch (error) {
    console.error('❌ [Newsletter Unsubscribe] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la désinscription" },
      { status: 500 }
    );
  }
}

// Route GET pour désinscription via lien email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email requis" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Désabonner directement
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({ 
        newsletter_opt_in: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .eq('newsletter_opt_in', true)
      .select();

    if (updateError) {
      console.error('Erreur désabonnement GET:', updateError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la désinscription" },
        { status: 500 }
      );
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Email non trouvé ou déjà désabonné" },
        { status: 404 }
      );
    }

    console.log(`📧 [Newsletter] Désinscription via lien: ${email} (Token: ${token || 'N/A'})`);

    return NextResponse.json({
      success: true,
      message: "Désinscription réussie"
    });

  } catch (error) {
    console.error('❌ [Newsletter Unsubscribe GET] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la désinscription" },
      { status: 500 }
    );
  }
}


