import { prisma } from '@/lib/prisma';

export interface SubscriptionChangeLog {
  establishmentId: string;
  establishmentName: string;
  oldSubscription: string;
  newSubscription: string;
  changedBy: string;
  timestamp: Date;
  reason?: string;
}

export async function logSubscriptionChange(
  establishmentId: string,
  newSubscription: string,
  changedBy: string,
  reason?: string
) {
  try {
    // Récupérer les infos de l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { 
        name: true, 
        subscription: true,
        ownerId: true
      }
    });

    if (!establishment) {
      console.error('❌ Établissement introuvable pour le log de subscription:', establishmentId);
      return;
    }

    const logData: SubscriptionChangeLog = {
      establishmentId,
      establishmentName: establishment.name,
      oldSubscription: establishment.subscription,
      newSubscription,
      changedBy,
      timestamp: new Date(),
      reason
    };

    // Log dans la console
    console.log('🔄 Changement de subscription:', {
      établissement: establishment.name,
      ancien: establishment.subscription,
      nouveau: newSubscription,
      modifié_par: changedBy,
      raison: reason || 'Non spécifiée',
      timestamp: logData.timestamp.toISOString()
    });

    // TODO: Sauvegarder en base de données si nécessaire
    // await prisma.subscriptionChangeLog.create({ data: logData });

  } catch (error) {
    console.error('❌ Erreur lors du logging de subscription:', error);
  }
}

export async function logUnauthorizedAccess(
  establishmentId: string,
  attemptedAction: string,
  userId: string,
  userEmail: string
) {
  console.log('🚨 Tentative d\'accès non autorisé:', {
    établissement: establishmentId,
    action: attemptedAction,
    utilisateur: `${userEmail} (${userId})`,
    timestamp: new Date().toISOString()
  });
}

export async function logPremiumFeatureUsage(
  establishmentId: string,
  feature: string,
  userId: string
) {
  console.log('⭐ Utilisation fonctionnalité premium:', {
    établissement: establishmentId,
    fonctionnalité: feature,
    utilisateur: userId,
    timestamp: new Date().toISOString()
  });
}
