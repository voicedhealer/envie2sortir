import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Actions sur les établissements avec historique
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const { establishmentId, action, reason } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ message: 'ID établissement et action requis' }, { status: 400 });
    }

    // Récupérer l'établissement actuel
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    });

    if (!establishment) {
      return NextResponse.json({ message: 'Établissement non trouvé' }, { status: 404 });
    }

    const previousStatus = establishment.status;
    let newStatus: string;
    let updateData: any = {};

    // Déterminer le nouveau statut selon l'action
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        updateData = {
          status: 'approved',
          rejectionReason: null,
          rejectedAt: null,
          lastModifiedAt: new Date()
        };
        break;
      
      case 'reject':
        if (!reason) {
          return NextResponse.json({ message: 'Raison du rejet requise' }, { status: 400 });
        }
        newStatus = 'rejected';
        updateData = {
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date(),
          lastModifiedAt: new Date()
        };
        break;
      
      case 'pending':
        newStatus = 'pending';
        updateData = {
          status: 'pending',
          rejectionReason: null,
          rejectedAt: null,
          lastModifiedAt: new Date()
        };
        break;
      
      case 'delete':
        // Soft delete - marquer comme supprimé
        newStatus = 'deleted';
        updateData = {
          status: 'deleted',
          lastModifiedAt: new Date()
        };
        break;
      
      default:
        return NextResponse.json({ message: 'Action non valide' }, { status: 400 });
    }

    // Mettre à jour l'établissement et créer l'action admin en une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'établissement
      const updatedEstablishment = await tx.establishment.update({
        where: { id: establishmentId },
        data: updateData
      });

      // Créer l'action administrative
      const adminAction = await tx.adminAction.create({
        data: {
          adminId: session.user.id,
          establishmentId,
          action: action.toUpperCase(),
          reason,
          previousStatus,
          newStatus,
          details: {
            establishmentName: establishment.name,
            adminEmail: session.user.email,
            timestamp: new Date().toISOString()
          }
        }
      });

      return { updatedEstablishment, adminAction };
    });

    return NextResponse.json({ 
      success: true, 
      establishment: result.updatedEstablishment,
      action: result.adminAction,
      message: `Établissement ${action === 'approve' ? 'approuvé' : 
                action === 'reject' ? 'rejeté' : 
                action === 'pending' ? 'remis en attente' : 'supprimé'} avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'action sur l\'établissement:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

