/**
 * Utilitaires pour la gestion des Professionals
 * 
 * Ce fichier contient les fonctions d'aide pour gérer
 * la relation entre User et Professional dans la nouvelle architecture
 */

import { prisma } from "@/lib/prisma";

/**
 * Récupère le Professional associé à un User
 * @param userId - ID de l'utilisateur
 * @returns Professional ou null
 */
export async function getProfessionalByUserId(userId: string) {
  try {
    const professional = await prisma.professional.findFirst({
      where: {
        email: {
          // On suppose que l'email du Professional correspond à l'email du User
          // Dans un vrai système, on aurait une relation directe
        }
      },
      include: {
        establishment: true
      }
    });

    return professional;
  } catch (error) {
    console.error('Erreur lors de la récupération du Professional:', error);
    return null;
  }
}

/**
 * Récupère l'établissement d'un Professional
 * @param professionalId - ID du Professional
 * @returns Establishment ou null
 */
export async function getEstablishmentByProfessionalId(professionalId: string) {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: {
        ownerId: professionalId
      },
      include: {
        owner: true
      }
    });

    return establishment;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'établissement:', error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur est un Professional
 * @param userId - ID de l'utilisateur
 * @returns boolean
 */
export async function isUserProfessional(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Rechercher un Professional avec le même email
    const professional = await prisma.professional.findFirst({
      where: { email: user.email }
    });

    return !!professional;
  } catch (error) {
    console.error('Erreur lors de la vérification du Professional:', error);
    return false;
  }
}

/**
 * Récupère l'établissement d'un utilisateur (s'il est Professional)
 * @param userId - ID de l'utilisateur
 * @returns Establishment ou null
 */
export async function getUserEstablishment(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    // Rechercher le Professional correspondant
    const professional = await prisma.professional.findFirst({
      where: { email: user.email }
    });

    if (!professional) return null;

    // Récupérer l'établissement du Professional
    const establishment = await prisma.establishment.findUnique({
      where: { ownerId: professional.id }
    });

    return establishment;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'établissement utilisateur:', error);
    return null;
  }
}

/**
 * Crée un Professional à partir d'un User
 * @param user - Utilisateur à convertir
 * @param siret - SIRET du Professional
 * @param companyName - Nom de l'entreprise
 * @returns Professional créé
 */
export async function createProfessionalFromUser(
  user: any,
  siret: string,
  companyName: string
) {
  try {
    const professional = await prisma.professional.create({
      data: {
        siret,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        companyName,
        legalStatus: 'Migration',
        subscriptionPlan: 'FREE',
        siretVerified: false
      }
    });

    return professional;
  } catch (error) {
    console.error('Erreur lors de la création du Professional:', error);
    throw error;
  }
}
