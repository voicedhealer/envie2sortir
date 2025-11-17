import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/deals - Début de la requête POST');
    
    const user = await requireEstablishment();
    if (!user) {
      console.error('❌ Utilisateur non authentifié');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();

    const body = await request.json();
    console.log('📦 Corps de la requête reçu:', {
      establishmentId: body.establishmentId,
      title: body.title,
      hasImage: !!body.imageUrl,
      hasPdf: !!body.pdfUrl
    });

    const {
      establishmentId,
      title,
      description,
      modality,
      originalPrice,
      discountedPrice,
      imageUrl,
      pdfUrl,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      isActive,
      // Récurrence
      isRecurring,
      recurrenceType,
      recurrenceDays,
      recurrenceEndDate,
      // Champs pour l'effet flip
      shortTitle,
      shortDescription,
      promoUrl
    } = body;

    // Validation des champs requis
    if (!establishmentId || !title || !description || !dateDebut || !dateFin) {
      const missingFields = [];
      if (!establishmentId) missingFields.push('establishmentId');
      if (!title) missingFields.push('title');
      if (!description) missingFields.push('description');
      if (!dateDebut) missingFields.push('dateDebut');
      if (!dateFin) missingFields.push('dateFin');
      
      console.error('❌ Champs requis manquants:', missingFields);
      return NextResponse.json({ 
        error: `Champs requis manquants: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    console.log('🔍 Vérification de l\'établissement:', establishmentId, 'pour l\'utilisateur:', user.id);
    
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, subscription, name, owner_id')
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    console.log('🏢 Établissement trouvé:', establishment);

    if (establishmentError || !establishment) {
      console.error('❌ Établissement introuvable ou accès refusé');
      return NextResponse.json({ 
        error: 'Établissement introuvable ou accès refusé' 
      }, { status: 404 });
    }

    // Vérifier que l'établissement est premium
    if (establishment.subscription !== 'PREMIUM') {
      console.error('❌ Établissement non premium:', establishment.subscription);
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    console.log('✅ Création du bon plan pour:', establishment.name);

    // Préparer les données à insérer
    const dealData = {
      establishment_id: establishmentId,
      title,
      description,
      modality: modality || null,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      discounted_price: discountedPrice ? parseFloat(discountedPrice) : null,
      image_url: imageUrl || null,
      pdf_url: pdfUrl || null,
      date_debut: new Date(dateDebut).toISOString(),
      date_fin: new Date(dateFin).toISOString(),
      heure_debut: heureDebut || null,
      heure_fin: heureFin || null,
      is_active: isActive !== undefined ? isActive : true,
      is_recurring: isRecurring || false,
      recurrence_type: recurrenceType || null,
      recurrence_days: recurrenceDays ? JSON.stringify(recurrenceDays) : null,
      recurrence_end_date: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
      promo_url: promoUrl || null
    };

    console.log('📝 Données à insérer:', dealData);

    // Créer le bon plan
    const { data: deal, error: dealError } = await supabase
      .from('daily_deals')
      .insert(dealData)
      .select()
      .single();

    if (dealError || !deal) {
      console.error('❌ Erreur création deal:', dealError);
      console.error('❌ Code:', dealError?.code);
      console.error('❌ Message:', dealError?.message);
      console.error('❌ Details:', dealError?.details);
      console.error('❌ Hint:', dealError?.hint);
      return NextResponse.json({ 
        error: `Erreur lors de la création du bon plan: ${dealError?.message || 'Erreur inconnue'}` 
      }, { status: 500 });
    }

    console.log('✅ Bon plan créé avec succès:', deal.id);

    // Convertir snake_case -> camelCase
    const formattedDeal = {
      ...deal,
      id: deal.id,
      establishmentId: deal.establishment_id,
      originalPrice: deal.original_price,
      discountedPrice: deal.discounted_price,
      imageUrl: deal.image_url,
      pdfUrl: deal.pdf_url,
      dateDebut: deal.date_debut,
      dateFin: deal.date_fin,
      heureDebut: deal.heure_debut,
      heureFin: deal.heure_fin,
      isActive: deal.is_active,
      isRecurring: deal.is_recurring,
      recurrenceType: deal.recurrence_type,
      recurrenceDays: deal.recurrence_days ? JSON.parse(deal.recurrence_days) : null,
      recurrenceEndDate: deal.recurrence_end_date,
      promoUrl: deal.promo_url,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    };

    return NextResponse.json({ 
      success: true,
      deal: formattedDeal
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du bon plan:', error);
    
    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de la création du bon plan' 
    }, { status: 500 });
  }
}


