import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    
    console.log('🔐 Réinitialisation du mot de passe pour:', email);
    
    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email et nouveau mot de passe requis" }, { status: 400 });
    }

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ 
        error: "Utilisateur non trouvé"
      }, { status: 404 });
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Hacher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: passwordHash }
    });

    console.log('✅ Mot de passe mis à jour avec succès');

    return NextResponse.json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Erreur réinitialisation mot de passe:', error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation", details: error.message },
      { status: 500 }
    );
  }
}
