import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation des données
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Mot de passe actuel et nouveau mot de passe requis' 
      }, { status: 400 });
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      }, { status: 400 });
    }

    // Validation forte du mot de passe
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' 
      }, { status: 400 });
    }

    // Récupérer le professionnel
    const professional = await prisma.professional.findUnique({
      where: { id: session.user.id }
    });

    if (!professional || !professional.passwordHash) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, professional.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Mot de passe actuel incorrect' 
      }, { status: 401 });
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, professional.passwordHash);
    if (isSamePassword) {
      return NextResponse.json({ 
        error: 'Le nouveau mot de passe doit être différent de l\'ancien' 
      }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.professional.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du changement de mot de passe' 
    }, { status: 500 });
  }
}

