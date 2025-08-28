import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Vérification du mot de passe (à configurer dans .env)
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123envie2sortir";

    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: "Authentification réussie",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Mot de passe incorrect",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'authentification",
      },
      { status: 500 }
    );
  }
}
