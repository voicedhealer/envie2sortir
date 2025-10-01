import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { fieldName, newValue, smsVerified } = body;

    // Vérifier que le SMS a été vérifié
    if (!smsVerified) {
      return NextResponse.json({ 
        error: 'Vérification SMS requise' 
      }, { status: 400 });
    }

    // Valider le champ
    const fieldsRequiringAdminApproval = ['email', 'siret', 'companyName'];
    const fieldsWithImmediateUpdate = ['firstName', 'lastName', 'phone'];
    
    if (!fieldName || (!fieldsRequiringAdminApproval.includes(fieldName) && !fieldsWithImmediateUpdate.includes(fieldName))) {
      return NextResponse.json({ 
        error: 'Champ invalide' 
      }, { status: 400 });
    }

    if (!newValue || typeof newValue !== 'string' || newValue.trim() === '') {
      return NextResponse.json({ 
        error: 'Nouvelle valeur requise' 
      }, { status: 400 });
    }

    // Récupérer le professionnel avec toutes les informations
    const professional = await prisma.professional.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        siret: true,
        companyName: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    if (!professional) {
      return NextResponse.json({ 
        error: 'Professionnel non trouvé' 
      }, { status: 404 });
    }

    // Récupérer l'ancienne valeur
    const oldValue = professional[fieldName as keyof typeof professional] as string;

    // Vérifier que la nouvelle valeur est différente
    if (oldValue === newValue.trim()) {
      return NextResponse.json({ 
        error: 'La nouvelle valeur est identique à l\'ancienne' 
      }, { status: 400 });
    }

    // Validation spécifique selon le champ
    if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newValue)) {
        return NextResponse.json({ 
          error: 'Format d\'email invalide' 
        }, { status: 400 });
      }

      // Vérifier que l'email n'existe pas déjà
      const existingPro = await prisma.professional.findUnique({
        where: { email: newValue }
      });
      if (existingPro) {
        return NextResponse.json({ 
          error: 'Cet email est déjà utilisé' 
        }, { status: 400 });
      }
    }

    if (fieldName === 'siret') {
      if (!/^\d{14}$/.test(newValue)) {
        return NextResponse.json({ 
          error: 'Le SIRET doit contenir 14 chiffres' 
        }, { status: 400 });
      }

      // Vérifier que le SIRET n'existe pas déjà
      const existingPro = await prisma.professional.findUnique({
        where: { siret: newValue }
      });
      if (existingPro) {
        return NextResponse.json({ 
          error: 'Ce SIRET est déjà utilisé' 
        }, { status: 400 });
      }
    }

    if (fieldName === 'phone') {
      const phoneRegex = /^(0[67]|\+33[67])[0-9]{8}$/;
      const cleanPhone = newValue.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json({ 
          error: 'Numéro de téléphone mobile invalide (06 ou 07)' 
        }, { status: 400 });
      }
    }

    // Champs avec mise à jour immédiate
    if (fieldsWithImmediateUpdate.includes(fieldName)) {
      await prisma.professional.update({
        where: { id: professional.id },
        data: { [fieldName]: newValue.trim() }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Informations mises à jour avec succès',
        requiresAdminApproval: false
      });
    }

    // Champs nécessitant validation admin
    if (fieldsRequiringAdminApproval.includes(fieldName)) {
      // Vérifier s'il existe déjà une demande en attente pour ce champ
      const existingRequest = await prisma.professionalUpdateRequest.findFirst({
        where: {
          professionalId: professional.id,
          fieldName,
          status: 'pending'
        }
      });

      if (existingRequest) {
        return NextResponse.json({ 
          error: 'Une demande de modification est déjà en attente pour ce champ' 
        }, { status: 400 });
      }

      // Créer un token de vérification pour l'email si nécessaire
      let verificationToken = null;
      if (fieldName === 'email') {
        verificationToken = crypto.randomBytes(32).toString('hex');
        
        // TODO: Envoyer l'email de vérification
        console.log('📧 Email de vérification à envoyer à:', newValue);
        console.log('🔗 Token:', verificationToken);
        console.log('🔗 Lien:', `${process.env.NEXTAUTH_URL}/api/professional/verify-email?token=${verificationToken}`);
      }

      // Créer la demande de modification
      const updateRequest = await prisma.professionalUpdateRequest.create({
        data: {
          professionalId: professional.id,
          fieldName,
          oldValue,
          newValue: newValue.trim(),
          verificationToken,
          isEmailVerified: fieldName !== 'email', // Pour les autres champs, pas besoin de vérification email
          isSmsVerified: true,
          status: 'pending'
        }
      });

      return NextResponse.json({ 
        success: true,
        message: fieldName === 'email' 
          ? 'Demande créée. Veuillez vérifier votre nouvel email pour confirmer.' 
          : 'Demande de modification envoyée. En attente de validation par l\'administrateur.',
        requiresAdminApproval: true,
        requiresEmailVerification: fieldName === 'email',
        requestId: updateRequest.id
      });
    }

    return NextResponse.json({ 
      error: 'Cas non géré' 
    }, { status: 500 });

  } catch (error) {
    console.error('Erreur lors de la demande de modification:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la demande de modification' 
    }, { status: 500 });
  }
}

