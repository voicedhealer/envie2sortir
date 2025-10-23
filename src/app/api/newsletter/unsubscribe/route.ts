import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const { email, token } = validationResult.data;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, newsletterOptIn: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Adresse email non trouvée dans notre base de données" },
        { status: 404 }
      );
    }

    // Vérifier si déjà désabonné
    if (!user.newsletterOptIn) {
      return NextResponse.json(
        { success: false, error: "Vous êtes déjà désabonné de notre newsletter" },
        { status: 409 }
      );
    }

    // Désabonner l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        newsletterOptIn: false,
        updatedAt: new Date()
      }
    });

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

    // Désabonner directement
    const result = await prisma.user.updateMany({
      where: { 
        email: email.toLowerCase(),
        newsletterOptIn: true
      },
      data: { 
        newsletterOptIn: false,
        updatedAt: new Date()
      }
    });

    if (result.count === 0) {
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
