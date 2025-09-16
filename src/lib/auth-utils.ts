import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/**
 * Utilitaires d'authentification pour NextAuth
 */

export async function getCurrentUser(request?: NextRequest) {
  if (request) {
    // Utiliser getToken pour les requêtes API
    const token = await getToken({ req: request });
    return token ? { 
      id: token.sub,
      email: token.email,
      name: token.name,
      role: token.role,
      establishmentId: token.establishmentId
    } : null;
  } else {
    // Utiliser getServerSession pour les pages
    const session = await getServerSession(authOptions);
    return session?.user || null;
  }
}

export async function requireAuth(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Authentification requise");
  }
  return user;
}

export async function requireProfessional(request?: NextRequest) {
  const user = await requireAuth(request);
  if (user.role !== 'pro') {
    throw new Error("Accès professionnel requis");
  }
  return user;
}

export async function requireEstablishment(request?: NextRequest) {
  const user = await requireProfessional(request);
  
  // Si l'utilisateur n'a pas d'establishmentId dans la session,
  // vérifier s'il est propriétaire d'un établissement
  if (!user.establishmentId || user.establishmentId === '') {
    const establishment = await prisma.establishment.findFirst({
      where: { ownerId: user.id }
    });
    
    if (!establishment) {
      throw new Error("Aucun établissement associé à ce compte");
    }
    
    // Mettre à jour l'utilisateur avec l'establishmentId trouvé
    user.establishmentId = establishment.id;
  }
  
  return user;
}

/**
 * Crée une session NextAuth programmatiquement
 * Note: NextAuth ne permet pas de créer des sessions côté serveur
 * La connexion doit se faire côté client
 */
export function createAuthResponse(userId: string, establishmentId: string) {
  return {
    success: true,
    userId,
    establishmentId,
    redirectTo: '/dashboard',
    message: 'Compte créé avec succès. Vous allez être connecté automatiquement.'
  };
}
