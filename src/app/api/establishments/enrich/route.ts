import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { establishmentId, enrichmentData } = await request.json();

    if (!establishmentId || !enrichmentData) {
      return NextResponse.json(
        { error: 'Paramètres manquants: establishmentId et enrichmentData requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement appartient à l'utilisateur
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Parser les champs JSON existants
    const existingHorairesOuverture = typeof establishment.horaires_ouverture === 'string' 
      ? JSON.parse(establishment.horaires_ouverture || '{}') 
      : (establishment.horaires_ouverture || {});
    const existingInformationsPratiques = typeof establishment.informations_pratiques === 'string'
      ? JSON.parse(establishment.informations_pratiques || '[]')
      : (establishment.informations_pratiques || []);
    const existingDetailedPayments = typeof establishment.detailed_payments === 'string'
      ? JSON.parse(establishment.detailed_payments || '{}')
      : (establishment.detailed_payments || {});
    const existingDetailedServices = typeof establishment.detailed_services === 'string'
      ? JSON.parse(establishment.detailed_services || '{}')
      : (establishment.detailed_services || {});
    const existingAccessibilityDetails = typeof establishment.accessibility_details === 'string'
      ? JSON.parse(establishment.accessibility_details || '{}')
      : (establishment.accessibility_details || {});

    // Préparer les données de mise à jour
    const updateData: any = {
      name: enrichmentData.name || establishment.name,
      description: enrichmentData.description || establishment.description,
      phone: enrichmentData.phone || establishment.phone,
      website: enrichmentData.website || establishment.website,
      google_business_url: enrichmentData.googleBusinessUrl,
      google_place_id: enrichmentData.googlePlaceId,
      google_rating: enrichmentData.googleRating,
      google_review_count: enrichmentData.googleReviewCount,
      the_fork_link: enrichmentData.theForkLink,
      envie_tags: JSON.stringify(enrichmentData.envieTags || []),
      specialties: JSON.stringify(enrichmentData.specialties || []),
      atmosphere: JSON.stringify(enrichmentData.atmosphere || []),
      accessibility: JSON.stringify(enrichmentData.accessibility || []),
      services: JSON.stringify(enrichmentData.servicesArray || []),
      ambiance: JSON.stringify(enrichmentData.ambianceArray || []),
      payment_methods: JSON.stringify(enrichmentData.paymentMethodsArray || []),
      clientele_info: JSON.stringify(enrichmentData.clientele || []),
      enriched: true,
      horaires_ouverture: JSON.stringify(enrichmentData.hours || existingHorairesOuverture),
      price_level: enrichmentData.priceLevel || establishment.price_level,
      informations_pratiques: JSON.stringify([
        ...existingInformationsPratiques,
        ...(enrichmentData.practicalInfo || [])
      ].filter((item, index, arr) => arr.indexOf(item) === index)),
      detailed_payments: JSON.stringify(
        Object.keys(existingDetailedPayments).length > 0 
          ? existingDetailedPayments
          : (enrichmentData.detailedPayments || {})
      ),
      detailed_services: JSON.stringify(
        Object.keys(existingDetailedServices).length > 0 
          ? existingDetailedServices
          : (enrichmentData.detailedServices || {})
      ),
      accessibility_details: JSON.stringify(
        Object.keys(existingAccessibilityDetails).length > 0 
          ? existingAccessibilityDetails
          : (enrichmentData.accessibilityDetails || {})
      ),
      enrichment_applied: true,
      enrichment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Mettre à jour l'établissement avec les données enrichies
    const { data: updatedEstablishment, error: updateError } = await supabase
      .from('establishments')
      .update(updateData)
      .eq('id', establishmentId)
      .select()
      .single();

    if (updateError || !updatedEstablishment) {
      console.error('Erreur mise à jour établissement:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde de l\'enrichissement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment
    });

  } catch (error) {
    console.error('Erreur enrichissement établissement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de l\'enrichissement' },
      { status: 500 }
    );
  }
}
