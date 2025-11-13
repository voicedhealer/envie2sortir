import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient();
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
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, email, siret, company_name, first_name, last_name, phone')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json({ 
        error: 'Professionnel non trouvé' 
      }, { status: 404 });
    }

    // Mapper les noms de champs camelCase -> snake_case
    const fieldMapping: Record<string, string> = {
      'email': 'email',
      'siret': 'siret',
      'companyName': 'company_name',
      'firstName': 'first_name',
      'lastName': 'last_name',
      'phone': 'phone'
    };

    const dbFieldName = fieldMapping[fieldName] || fieldName;
    const oldValue = professional[dbFieldName as keyof typeof professional] as string;

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
      const { data: existingPro } = await supabase
        .from('professionals')
        .select('id')
        .eq('email', newValue)
        .single();
      
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
      const { data: existingPro } = await supabase
        .from('professionals')
        .select('id')
        .eq('siret', newValue)
        .single();
      
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
      const updateData: any = {};
      updateData[dbFieldName] = newValue.trim();

      const { error: updateError } = await supabase
        .from('professionals')
        .update(updateData)
        .eq('id', professional.id);

      if (updateError) {
        console.error('Erreur mise à jour professionnel:', updateError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Informations mises à jour avec succès',
        requiresAdminApproval: false
      });
    }

    // Champs nécessitant validation admin
    if (fieldsRequiringAdminApproval.includes(fieldName)) {
      // Vérifier s'il existe déjà une demande en attente pour ce champ
      const { data: existingRequest } = await supabase
        .from('professional_update_requests')
        .select('id')
        .eq('professional_id', professional.id)
        .eq('field_name', fieldName)
        .eq('status', 'pending')
        .limit(1)
        .single();

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
      const { data: updateRequest, error: createError } = await supabase
        .from('professional_update_requests')
        .insert({
          professional_id: professional.id,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue.trim(),
          verification_token: verificationToken,
          is_email_verified: fieldName !== 'email',
          is_sms_verified: true,
          status: 'pending'
        })
        .select()
        .single();

      if (createError || !updateRequest) {
        console.error('Erreur création demande:', createError);
        return NextResponse.json({ error: 'Erreur lors de la création de la demande' }, { status: 500 });
      }

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

