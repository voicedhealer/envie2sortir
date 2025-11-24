import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { dealId } = await params;
    const body = await request.json();

    // Vérifier que le bon plan existe et que l'utilisateur en est le propriétaire
    const { data: existingDeal, error: dealError } = await supabase
      .from('daily_deals')
      .select(`
        *,
        establishment:establishments!daily_deals_establishment_id_fkey (
          owner_id,
          subscription
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !existingDeal) {
      return NextResponse.json({ error: 'Bon plan introuvable' }, { status: 404 });
    }

    const establishment = Array.isArray(existingDeal.establishment) ? existingDeal.establishment[0] : existingDeal.establishment;
    if (establishment?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Construire les données de mise à jour
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.modality !== undefined) updateData.modality = body.modality || null;
    if (body.originalPrice !== undefined) updateData.original_price = body.originalPrice ? parseFloat(body.originalPrice) : null;
    if (body.discountedPrice !== undefined) updateData.discounted_price = body.discountedPrice ? parseFloat(body.discountedPrice) : null;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl || null;
    if (body.pdfUrl !== undefined) updateData.pdf_url = body.pdfUrl || null;
    if (body.dateDebut !== undefined) updateData.date_debut = new Date(body.dateDebut).toISOString();
    if (body.dateFin !== undefined) updateData.date_fin = new Date(body.dateFin).toISOString();
    if (body.heureDebut !== undefined) updateData.heure_debut = body.heureDebut || null;
    if (body.heureFin !== undefined) updateData.heure_fin = body.heureFin || null;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.isRecurring !== undefined) updateData.is_recurring = body.isRecurring;
    if (body.recurrenceType !== undefined) updateData.recurrence_type = body.recurrenceType || null;
    if (body.recurrenceDays !== undefined) updateData.recurrence_days = body.recurrenceDays ? JSON.stringify(body.recurrenceDays) : null;
    if (body.recurrenceEndDate !== undefined) updateData.recurrence_end_date = body.recurrenceEndDate ? new Date(body.recurrenceEndDate).toISOString() : null;
    if (body.promoUrl !== undefined) updateData.promo_url = body.promoUrl || null;

    // Mettre à jour le bon plan
    const { data: updatedDeal, error: updateError } = await supabase
      .from('daily_deals')
      .update(updateData)
      .eq('id', dealId)
      .select()
      .single();

    if (updateError || !updatedDeal) {
      console.error('Erreur mise à jour deal:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du bon plan' }, { status: 500 });
    }

    // Convertir snake_case -> camelCase
    const formattedDeal = {
      ...updatedDeal,
      establishmentId: updatedDeal.establishment_id,
      originalPrice: updatedDeal.original_price,
      discountedPrice: updatedDeal.discounted_price,
      imageUrl: updatedDeal.image_url,
      pdfUrl: updatedDeal.pdf_url,
      dateDebut: updatedDeal.date_debut,
      dateFin: updatedDeal.date_fin,
      heureDebut: updatedDeal.heure_debut,
      heureFin: updatedDeal.heure_fin,
      isActive: updatedDeal.is_active,
      isRecurring: updatedDeal.is_recurring,
      recurrenceType: updatedDeal.recurrence_type,
      recurrenceDays: updatedDeal.recurrence_days ? JSON.parse(updatedDeal.recurrence_days) : null,
      recurrenceEndDate: updatedDeal.recurrence_end_date,
      promoUrl: updatedDeal.promo_url,
      createdAt: updatedDeal.created_at,
      updatedAt: updatedDeal.updated_at
    };

    return NextResponse.json({ 
      success: true,
      deal: formattedDeal
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du bon plan:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du bon plan' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { dealId } = await params;

    // Vérifier que le bon plan existe et que l'utilisateur en est le propriétaire
    const { data: existingDeal, error: dealError } = await supabase
      .from('daily_deals')
      .select(`
        *,
        establishment:establishments!daily_deals_establishment_id_fkey (
          owner_id
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !existingDeal) {
      return NextResponse.json({ error: 'Bon plan introuvable' }, { status: 404 });
    }

    const establishment = Array.isArray(existingDeal.establishment) ? existingDeal.establishment[0] : existingDeal.establishment;
    if (establishment?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Supprimer le bon plan
    const { error: deleteError } = await supabase
      .from('daily_deals')
      .delete()
      .eq('id', dealId);

    if (deleteError) {
      console.error('Erreur suppression deal:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du bon plan' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Bon plan supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du bon plan:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du bon plan' 
    }, { status: 500 });
  }
}


