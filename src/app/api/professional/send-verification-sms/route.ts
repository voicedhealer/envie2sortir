import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { storeSmsCode } from '../verify-sms-code/route';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient();
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

    // Générer un code à 6 chiffres
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expiration dans 10 minutes
    const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // TODO: Intégration Twilio réelle
    // Pour le moment, on log le code pour le développement
    console.log('🔐 Code de vérification SMS pour', professional.phone, ':', smsCode);
    console.log('📱 Expiration:', smsCodeExpiry);

    // Envoyer le SMS via Twilio (à implémenter)
    /*
    const twilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await twilioClient.messages.create({
      body: `Votre code de vérification Envie2Sortir est : ${smsCode}. Valide pendant 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: professional.phone
    });
    */

    // Stocker le code pour vérification ultérieure
    storeSmsCode(professional.id, smsCode, smsCodeExpiry);
    
    return NextResponse.json({ 
      success: true,
      message: 'Code de vérification envoyé par SMS',
      // À RETIRER EN PRODUCTION:
      devCode: process.env.NODE_ENV === 'development' ? smsCode : undefined,
      phone: professional.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 ** ** $5')
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du code SMS:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi du code de vérification' 
    }, { status: 500 });
  }
}

