import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les abonnés
    const subscribers = await prisma.user.findMany({
      where: { newsletterOptIn: true },
      select: {
        id: true,
        email: true,
        newsletterOptIn: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        preferences: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Générer le CSV
    const csvHeader = 'Email,Statut,Vérifié,Date Inscription,Date Modification\n';
    const csvRows = subscribers.map(sub => {
      const status = sub.newsletterOptIn ? 'Actif' : 'Inactif';
      const verified = sub.isVerified ? 'Oui' : 'Non';
      const createdAt = new Date(sub.createdAt).toLocaleDateString('fr-FR');
      const updatedAt = new Date(sub.updatedAt).toLocaleDateString('fr-FR');
      
      return `"${sub.email}","${status}","${verified}","${createdAt}","${updatedAt}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Log de l'export
    console.log(`📊 [Newsletter Export] Export de ${subscribers.length} abonnés`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abonnes-newsletter-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('❌ [Newsletter Export] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}


