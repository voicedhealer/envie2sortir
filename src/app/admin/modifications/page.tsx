import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ModificationsManager from './ModificationsManager';

export default async function AdminModificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  // Vérifier que l'utilisateur est un admin
  if (session.user.role !== 'admin') {
    redirect('/auth?error=AccessDenied');
  }

  // Récupérer toutes les demandes en attente
  const pendingRequests = await prisma.professionalUpdateRequest.findMany({
    where: {
      status: 'pending'
    },
    include: {
      professional: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          phone: true,
          siret: true
        }
      }
    },
    orderBy: {
      requestedAt: 'desc'
    }
  });

  // Récupérer l'historique récent
  const recentHistory = await prisma.professionalUpdateRequest.findMany({
    where: {
      status: {
        in: ['approved', 'rejected']
      }
    },
    include: {
      professional: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true
        }
      }
    },
    orderBy: {
      reviewedAt: 'desc'
    },
    take: 20
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModificationsManager 
          pendingRequests={pendingRequests as any} 
          recentHistory={recentHistory as any}
        />
      </div>
    </div>
  );
}

