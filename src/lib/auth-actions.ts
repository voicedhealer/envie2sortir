'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

export async function signUp(firstName: string, email: string, password: string) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        passwordHash,
        provider: 'local',
        role: 'user'
      }
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    throw new Error(error.message || 'Erreur lors de la création du compte');
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    if (!user.passwordHash) {
      throw new Error('Ce compte utilise une connexion sociale. Connectez-vous avec Google ou Facebook.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Rediriger vers la page d'accueil après connexion réussie
    redirect('/');
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    throw new Error(error.message || 'Erreur lors de la connexion');
  }
}

export async function signInWithGoogle(profile: any) {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: profile.email }
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          provider: 'google',
          providerId: profile.sub,
          avatar: profile.picture,
          isVerified: true,
          role: 'user'
        }
      });
    } else if (user.provider !== 'google') {
      // Mettre à jour l'utilisateur existant
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId: profile.sub,
          avatar: profile.picture,
          isVerified: true
        }
      });
    }

    return { success: true, user };
  } catch (error: any) {
    console.error('Erreur lors de la connexion Google:', error);
    throw new Error('Erreur lors de la connexion avec Google');
  }
}

export async function signInWithFacebook(profile: any) {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: profile.email }
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          provider: 'facebook',
          providerId: profile.id,
          avatar: profile.picture?.data?.url,
          isVerified: true,
          role: 'user'
        }
      });
    } else if (user.provider !== 'facebook') {
      // Mettre à jour l'utilisateur existant
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'facebook',
          providerId: profile.id,
          avatar: profile.picture?.data?.url,
          isVerified: true
        }
      });
    }

    return { success: true, user };
  } catch (error: any) {
    console.error('Erreur lors de la connexion Facebook:', error);
    throw new Error('Erreur lors de la connexion avec Facebook');
  }
}
