import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Traitement de la récurrence des bons plans...');
    
    const supabase = await createClient();
    
    // Récupérer tous les bons plans récurrents actifs
    const { data: recurringDeals, error: dealsError } = await supabase
      .from('daily_deals')
      .select('*, establishment:establishments(id, name)')
      .eq('is_recurring', true)
      .eq('is_active', true);
    
    if (dealsError) {
      console.error('❌ Erreur récupération deals:', dealsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des deals' },
        { status: 500 }
      );
    }
    
    const deals = recurringDeals || [];

    console.log(`📊 ${deals.length} bons plans récurrents trouvés`);

    let processedCount = 0;
    let createdCount = 0;

    for (const deal of deals) {
      try {
        processedCount++;
        
        // Vérifier si on doit créer de nouveaux bons plans pour ce deal
        const newDeals = await generateRecurringDeals(deal);
        
        if (newDeals.length > 0) {
          createdCount += newDeals.length;
          console.log(`✅ ${newDeals.length} nouveaux bons plans créés pour "${deal.title}"`);
        }
        
      } catch (error) {
        console.error(`❌ Erreur pour le deal ${deal.id}:`, error);
      }
    }

    console.log(`🎉 Traitement terminé: ${processedCount} deals traités, ${createdCount} nouveaux deals créés`);

    return NextResponse.json({
      success: true,
      message: `Traitement terminé: ${processedCount} deals traités, ${createdCount} nouveaux deals créés`,
      processed: processedCount,
      created: createdCount
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement de la récurrence:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la récurrence' },
      { status: 500 }
    );
  }
}

// Fonction pour générer les bons plans récurrents
async function generateRecurringDeals(deal: any) {
  const supabase = await createClient();
  const now = new Date();
  const createdDeals = [];

  // Convertir les noms de champs de snake_case à camelCase pour la logique
  const recurrenceType = deal.recurrence_type;
  const recurrenceDays = deal.recurrence_days ? JSON.parse(deal.recurrence_days) : null;
  const recurrenceEndDate = deal.recurrence_end_date ? new Date(deal.recurrence_end_date) : null;
  const establishmentId = deal.establishment_id;
  const dateDebut = deal.date_debut ? new Date(deal.date_debut) : null;

  // Calculer les prochaines dates selon le type de récurrence
  if (recurrenceType === 'weekly' && recurrenceDays) {
    const nextDates = calculateNextWeeklyDates(recurrenceDays, recurrenceEndDate);
    
    for (const date of nextDates) {
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      // Vérifier si un bon plan existe déjà pour cette date
      const { data: existingDeal } = await supabase
        .from('daily_deals')
        .select('id')
        .eq('establishment_id', establishmentId)
        .eq('title', deal.title)
        .gte('date_debut', dateStart.toISOString())
        .lt('date_debut', dateEnd.toISOString())
        .single();

      if (!existingDeal) {
        const { data: newDeal, error } = await supabase
          .from('daily_deals')
          .insert({
            establishment_id: establishmentId,
            title: deal.title,
            description: deal.description,
            modality: deal.modality,
            original_price: deal.original_price,
            discounted_price: deal.discounted_price,
            image_url: deal.image_url,
            pdf_url: deal.pdf_url,
            date_debut: date.toISOString(),
            date_fin: new Date(date.getTime() + (24 * 60 * 60 * 1000) - 1).toISOString(), // Fin de journée
            heure_debut: deal.heure_debut,
            heure_fin: deal.heure_fin,
            is_active: true,
            is_recurring: false, // Les nouveaux deals ne sont pas récurrents
            recurrence_type: null,
            recurrence_days: null,
            recurrence_end_date: null
          })
          .select()
          .single();
        
        if (!error && newDeal) {
          createdDeals.push(newDeal);
        }
      }
    }
  } else if (recurrenceType === 'monthly' && dateDebut) {
    const nextDates = calculateNextMonthlyDates(dateDebut, recurrenceEndDate);
    
    for (const date of nextDates) {
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      // Vérifier si un bon plan existe déjà pour cette date
      const { data: existingDeal } = await supabase
        .from('daily_deals')
        .select('id')
        .eq('establishment_id', establishmentId)
        .eq('title', deal.title)
        .gte('date_debut', dateStart.toISOString())
        .lt('date_debut', dateEnd.toISOString())
        .single();

      if (!existingDeal) {
        const { data: newDeal, error } = await supabase
          .from('daily_deals')
          .insert({
            establishment_id: establishmentId,
            title: deal.title,
            description: deal.description,
            modality: deal.modality,
            original_price: deal.original_price,
            discounted_price: deal.discounted_price,
            image_url: deal.image_url,
            pdf_url: deal.pdf_url,
            date_debut: date.toISOString(),
            date_fin: new Date(date.getTime() + (24 * 60 * 60 * 1000) - 1).toISOString(), // Fin de journée
            heure_debut: deal.heure_debut,
            heure_fin: deal.heure_fin,
            is_active: true,
            is_recurring: false, // Les nouveaux deals ne sont pas récurrents
            recurrence_type: null,
            recurrence_days: null,
            recurrence_end_date: null
          })
          .select()
          .single();
        
        if (!error && newDeal) {
          createdDeals.push(newDeal);
        }
      }
    }
  }

  return createdDeals;
}

// Calculer les prochaines dates hebdomadaires
function calculateNextWeeklyDates(recurrenceDays: number[], endDate: Date | null): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  const end = endDate || new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 jours par défaut
  
  // Générer les dates pour les 4 prochaines semaines
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(now.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    
    for (const day of recurrenceDays) {
      const targetDate = new Date(weekStart);
      
      // Ajuster au bon jour de la semaine (1 = lundi, 7 = dimanche)
      const dayOfWeek = targetDate.getDay(); // 0 = dimanche, 6 = samedi
      const targetDayOfWeek = day === 7 ? 0 : day; // Convertir 7 (dimanche) en 0
      
      const daysToAdd = (targetDayOfWeek - dayOfWeek + 7) % 7;
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      
      // Vérifier que la date est dans la plage valide
      if (targetDate >= now && targetDate <= end) {
        dates.push(targetDate);
      }
    }
  }
  
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

// Calculer les prochaines dates mensuelles
function calculateNextMonthlyDates(startDate: Date, endDate: Date | null): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  const end = endDate || new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 3 mois par défaut
  
  let currentDate = new Date(startDate);
  
  // Générer les dates pour les 3 prochains mois
  for (let month = 0; month < 3; month++) {
    if (month > 0) {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }
    
    if (currentDate >= now && currentDate <= end) {
      dates.push(new Date(currentDate));
    }
  }
  
  return dates;
}


