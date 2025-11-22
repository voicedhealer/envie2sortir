import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { storeSmsCode } from '@/lib/sms-code-store';
import { sendSMSWithFallback } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { fieldName } = body;

    // Valider le champ demandé
    const allowedFields = ['email', 'siret', 'companyName', 'firstName', 'lastName', 'phone'];
    if (!fieldName || !allowedFields.includes(fieldName)) {
      return NextResponse.json({ 
        error: 'Champ invalide' 
      }, { status: 400 });
    }

    // Récupérer le professionnel
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, phone, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      return NextResponse.json({ 
        error: 'Professionnel non trouvé' 
      }, { status: 404 });
    }

    // Vérifier que le professionnel a un numéro de téléphone
    if (!professional.phone) {
      return NextResponse.json({ 
        error: 'Aucun numéro de téléphone enregistré. Veuillez ajouter un numéro de téléphone.' 
      }, { status: 400 });
    }

    // Générer un code à 6 chiffres
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expiration dans 10 minutes
    const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Envoyer le SMS via Twilio (ou simulation en développement)
    const smsResult = await sendSMSWithFallback(professional.phone, smsCode);

    if (!smsResult.success) {
      console.error('❌ [SMS] Échec envoi SMS:', smsResult.error);
      return NextResponse.json({ 
        error: smsResult.error || 'Erreur lors de l\'envoi du SMS. Veuillez réessayer.' 
      }, { status: 500 });
    }

    // Stocker le code pour vérification ultérieure dans Supabase
    // Utiliser user.id (qui est l'ID du professionnel) pour être cohérent avec verify-sms-code
    await storeSmsCode(user.id, smsCode, smsCodeExpiry);
    
    console.log('✅ [SMS] Code envoyé et stocké pour user.id:', user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Code de vérification envoyé par SMS',
      // En développement, retourner le code pour faciliter les tests
      devCode: smsResult.devCode,
      phone: professional.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 ** ** $5')
    });

  } catch (error) {
    console.error('❌ [SMS] Erreur lors de l\'envoi du code SMS:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi du code de vérification' 
    }, { status: 500 });
  }
}

