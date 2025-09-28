import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardContent from "@/app/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  // Vérifier que l'utilisateur est un professionnel
  if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
    redirect('/auth?error=AccessDenied');
  }

  // Récupérer l'établissement de l'utilisateur (nouvelle architecture)
  // Essayer plusieurs fois avec un délai pour gérer les problèmes de timing
  let establishment = null;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (!establishment && attempts < maxAttempts) {
    establishment = await prisma.establishment.findFirst({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        website: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        imageUrl: true,
        status: true,
        subscription: true,
        rejectionReason: true,
        rejectedAt: true,
        lastModifiedAt: true,
        viewsCount: true,
        clicksCount: true,
        avgRating: true,
        totalComments: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        tags: true,
        events: true,
      }
    });
    
    if (!establishment && attempts < maxAttempts - 1) {
      // Attendre 1 seconde avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    } else {
      break;
    }
  }

  if (!establishment) {
    console.error('Aucun établissement trouvé après', maxAttempts, 'tentatives pour l\'utilisateur:', session.user.id);
    redirect('/auth?error=EstablishmentNotFound');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardContent 
        user={session.user} 
        establishment={establishment as any} 
      />
    </div>
  );
}