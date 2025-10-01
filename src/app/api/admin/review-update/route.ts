import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ 
        error: 'Paramètres requis: requestId, action' 
      }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ 
        error: 'Action invalide. Doit être "approve" ou "reject"' 
      }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ 
        error: 'La raison du rejet est requise' 
      }, { status: 400 });
    }

    // Récupérer la demande
    const updateRequest = await prisma.professionalUpdateRequest.findUnique({
      where: { id: requestId },
      include: {
        professional: {
          select: {
            id: true,
            email: true,
            siret: true,
            companyName: true
          }
        }
      }
    });

    if (!updateRequest) {
      return NextResponse.json({ 
        error: 'Demande non trouvée' 
      }, { status: 404 });
    }

    if (updateRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Cette demande a déjà été traitée' 
      }, { status: 400 });
    }

    // Pour l'email, vérifier que l'email a été vérifié
    if (updateRequest.fieldName === 'email' && !updateRequest.isEmailVerified) {
      return NextResponse.json({ 
        error: 'Le nouvel email doit être vérifié avant approbation' 
      }, { status: 400 });
    }

    if (action === 'approve') {
      // Mettre à jour la demande
      await prisma.professionalUpdateRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.user.id
        }
      });

      // Appliquer la modification au professionnel
      await prisma.professional.update({
        where: { id: updateRequest.professionalId },
        data: {
          [updateRequest.fieldName]: updateRequest.newValue
        }
      });

      console.log(`✅ Modification approuvée: ${updateRequest.fieldName} de ${updateRequest.oldValue} à ${updateRequest.newValue}`);

      // TODO: Envoyer une notification au professionnel
      console.log('📧 Notification à envoyer à:', updateRequest.professional.email);

      return NextResponse.json({ 
        success: true,
        message: 'Modification approuvée et appliquée'
      });

    } else {
      // Rejeter la demande
      await prisma.professionalUpdateRequest.update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          rejectionReason,
          reviewedAt: new Date(),
          reviewedBy: session.user.id
        }
      });

      console.log(`❌ Modification rejetée: ${updateRequest.fieldName}`);
      console.log(`   Raison: ${rejectionReason}`);

      // TODO: Envoyer une notification au professionnel
      console.log('📧 Notification de rejet à envoyer à:', updateRequest.professional.email);

      return NextResponse.json({ 
        success: true,
        message: 'Modification rejetée'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la révision de la demande:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la révision de la demande' 
    }, { status: 500 });
  }
}

