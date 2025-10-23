import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Statistiques générales
    const [
      totalSubscribers,
      activeSubscribers,
      verifiedSubscribers,
      newThisWeek,
      unsubscribedThisWeek
    ] = await Promise.all([
      // Total des abonnés (tous ceux qui ont newsletterOptIn = true)
      prisma.user.count({
        where: { newsletterOptIn: true }
      }),
      
      // Abonnés actifs (newsletterOptIn = true ET isVerified = true)
      prisma.user.count({
        where: { 
          newsletterOptIn: true,
          isVerified: true
        }
      }),
      
      // Abonnés vérifiés
      prisma.user.count({
        where: { isVerified: true }
      }),
      
      // Nouveaux abonnés cette semaine
      prisma.user.count({
        where: {
          newsletterOptIn: true,
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      
      // Désabonnements cette semaine (approximatif)
      prisma.user.count({
        where: {
          newsletterOptIn: false,
          updatedAt: {
            gte: oneWeekAgo
          }
        }
      })
    ]);

    const stats = {
      totalSubscribers,
      activeSubscribers,
      verifiedSubscribers,
      newThisWeek,
      unsubscribedThisWeek,
      // Calculs dérivés
      verificationRate: totalSubscribers > 0 ? Math.round((verifiedSubscribers / totalSubscribers) * 100) : 0,
      weeklyGrowth: newThisWeek,
      churnRate: totalSubscribers > 0 ? Math.round((unsubscribedThisWeek / totalSubscribers) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [Newsletter Stats] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du calcul des statistiques" },
      { status: 500 }
    );
  }
}
