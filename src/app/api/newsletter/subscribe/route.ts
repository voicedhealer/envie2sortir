import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema de validation
const newsletterSchema = z.object({
  email: z.string()
    .email("Adresse email invalide")
    .min(5, "Email trop court")
    .max(255, "Email trop long")
    .toLowerCase()
    .trim(),
  consent: z.boolean()
    .refine(val => val === true, "Vous devez accepter de recevoir nos communications")
});

// Rate limiting simple (en mémoire)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 3; // 3 tentatives par minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." 
        },
        { status: 429 }
      );
    }

    // 🔒 Validation des données
    const body = await request.json();
    const validationResult = newsletterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0]?.message || "Données invalides" 
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { email, consent } = validationResult.data;

    // 🔒 Vérifier si l'email existe déjà
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, newsletter_opt_in, is_verified')
      .eq('email', email)
      .single();

    if (existingUser && !existingError) {
      if (existingUser.newsletter_opt_in) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Cette adresse email est déjà inscrite à notre newsletter." 
          },
          { status: 409 }
        );
      } else {
        // Réactiver l'inscription
        const { error: updateError } = await supabase
          .from('users')
          .update({ newsletter_opt_in: true })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Erreur réactivation newsletter:', updateError);
          return NextResponse.json(
            { success: false, error: "Erreur lors de la réactivation" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Votre inscription à la newsletter a été réactivée !"
        });
      }
    }

    // 🔒 Créer un nouvel utilisateur avec newsletter activée
    const preferences = JSON.stringify({
      newsletterConsent: consent,
      consentDate: new Date().toISOString(),
      ipAddress: ip
    });

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        newsletter_opt_in: true,
        is_verified: false, // Double opt-in requis
        role: 'user',
        first_name: email.split('@')[0], // Nom temporaire basé sur l'email
        preferences
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('Erreur création utilisateur newsletter:', createError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    // 🔒 Log de sécurité
    console.log(`📧 [Newsletter] Nouvelle inscription: ${email} (IP: ${ip})`);

    // TODO: Envoyer email de confirmation (double opt-in)
    // await sendConfirmationEmail(email);

    return NextResponse.json({
      success: true,
      message: "Inscription réussie ! Vérifiez votre boîte email pour confirmer votre inscription."
    });

  } catch (error) {
    console.error('❌ [Newsletter] Erreur inscription:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Une erreur est survenue. Veuillez réessayer plus tard." 
      },
      { status: 500 }
    );
  }
}

// 🔒 Seulement POST autorisé
export async function GET() {
  return NextResponse.json(
    { error: "Méthode non autorisée" },
    { status: 405 }
  );
}


