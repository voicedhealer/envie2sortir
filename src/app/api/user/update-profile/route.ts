import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'user') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, email, currentPassword, newPassword } = body;

    console.log('🔍 API - Données reçues:', { firstName, lastName, email });
    console.log('🔍 API - Session user:', session.user);

    const userId = session.user.id;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Si changement de mot de passe, vérifier l'ancien mot de passe
    if (newPassword && currentPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ 
          error: 'Ce compte utilise une connexion sociale. Impossible de changer le mot de passe.' 
        }, { status: 400 });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'Mot de passe actuel incorrect' 
        }, { status: 400 });
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('✅ API - Utilisateur mis à jour:', updatedUser);

    return NextResponse.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Cet email est déjà utilisé par un autre compte' 
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
