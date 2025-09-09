import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Test de connexion pour:', email);
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ 
        error: "Utilisateur non trouvé",
        found: false 
      }, { status: 404 });
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.passwordHash
    });

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect');
      return NextResponse.json({ 
        error: "Mot de passe incorrect",
        found: true,
        passwordValid: false
      }, { status: 401 });
    }

    console.log('✅ Mot de passe valide');

    // Rechercher l'établissement de l'utilisateur (seulement pour les pros)
    let establishment = null;
    if (user.role === 'pro') {
      establishment = await prisma.establishment.findFirst({
        where: { ownerId: user.id },
        select: {
          id: true,
          name: true,
          status: true
        }
      });
      
      if (establishment) {
        console.log('✅ Établissement trouvé:', establishment);
      } else {
        console.log('⚠️  Aucun établissement trouvé pour ce pro');
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      establishment: establishment,
      canLogin: true
    });

  } catch (error: any) {
    console.error('Erreur test de connexion:', error);
    return NextResponse.json(
      { error: "Erreur lors du test de connexion", details: error.message },
      { status: 500 }
    );
  }
}
