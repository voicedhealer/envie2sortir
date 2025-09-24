import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting pour l'authentification admin
    const rateLimitResult = await adminRateLimit(request);
    if (!rateLimitResult.success) {
      console.log("🚫 Rate limit dépassé pour l'authentification admin");
      return NextResponse.json(
        {
          success: false,
          message: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { password } = await request.json();

    // Vérification des données d'entrée
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: "Mot de passe requis",
        },
        { status: 400 }
      );
    }

    // Récupération du hash du mot de passe admin depuis les variables d'environnement
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!adminPasswordHash) {
      console.error("❌ ADMIN_PASSWORD_HASH non configuré dans .env");
      return NextResponse.json(
        {
          success: false,
          message: "Configuration admin manquante",
        },
        { status: 500 }
      );
    }

    // Vérification du mot de passe avec bcrypt
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (isValidPassword) {
      console.log("✅ Authentification admin réussie");
      return NextResponse.json({
        success: true,
        message: "Authentification réussie",
      });
    } else {
      console.log("❌ Tentative d'authentification admin échouée");
      return NextResponse.json(
        {
          success: false,
          message: "Mot de passe incorrect",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur d'authentification admin:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'authentification",
      },
      { status: 500 }
    );
  }
}
