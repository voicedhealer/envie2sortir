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

  if (session.user.role !== 'pro') {
    redirect('/auth?error=AccessDenied');
  }

  if (!session.user.establishmentId || session.user.establishmentId === '') {
    redirect('/etablissements/nouveau');
  }

  // Récupérer l'établissement de l'utilisateur
  const establishment = await prisma.establishment.findUnique({
    where: { id: session.user.establishmentId },
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

  if (!establishment) {
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