import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Traitement de la récurrence des bons plans...');
    
    // Récupérer tous les bons plans récurrents actifs
    const recurringDeals = await prisma.dailyDeal.findMany({
      where: {
        isRecurring: true,
        isActive: true
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 ${recurringDeals.length} bons plans récurrents trouvés`);

    let processedCount = 0;
    let createdCount = 0;

    for (const deal of recurringDeals) {
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
  const now = new Date();
  const createdDeals = [];

  // Calculer les prochaines dates selon le type de récurrence
  if (deal.recurrenceType === 'weekly' && deal.recurrenceDays) {
    const nextDates = calculateNextWeeklyDates(deal.recurrenceDays, deal.recurrenceEndDate);
    
    for (const date of nextDates) {
      // Vérifier si un bon plan existe déjà pour cette date
      const existingDeal = await prisma.dailyDeal.findFirst({
        where: {
          establishmentId: deal.establishmentId,
          title: deal.title,
          dateDebut: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      });

      if (!existingDeal) {
        const newDeal = await prisma.dailyDeal.create({
          data: {
            establishmentId: deal.establishmentId,
            title: deal.title,
            description: deal.description,
            modality: deal.modality,
            originalPrice: deal.originalPrice,
            discountedPrice: deal.discountedPrice,
            imageUrl: deal.imageUrl,
            pdfUrl: deal.pdfUrl,
            dateDebut: date,
            dateFin: new Date(date.getTime() + (24 * 60 * 60 * 1000) - 1), // Fin de journée
            heureDebut: deal.heureDebut,
            heureFin: deal.heureFin,
            isActive: true,
            isRecurring: false, // Les nouveaux deals ne sont pas récurrents
            recurrenceType: null,
            recurrenceDays: null,
            recurrenceEndDate: null
          }
        });
        createdDeals.push(newDeal);
      }
    }
  } else if (deal.recurrenceType === 'monthly') {
    const nextDates = calculateNextMonthlyDates(deal.dateDebut, deal.recurrenceEndDate);
    
    for (const date of nextDates) {
      // Vérifier si un bon plan existe déjà pour cette date
      const existingDeal = await prisma.dailyDeal.findFirst({
        where: {
          establishmentId: deal.establishmentId,
          title: deal.title,
          dateDebut: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      });

      if (!existingDeal) {
        const newDeal = await prisma.dailyDeal.create({
          data: {
            establishmentId: deal.establishmentId,
            title: deal.title,
            description: deal.description,
            modality: deal.modality,
            originalPrice: deal.originalPrice,
            discountedPrice: deal.discountedPrice,
            imageUrl: deal.imageUrl,
            pdfUrl: deal.pdfUrl,
            dateDebut: date,
            dateFin: new Date(date.getTime() + (24 * 60 * 60 * 1000) - 1), // Fin de journée
            heureDebut: deal.heureDebut,
            heureFin: deal.heureFin,
            isActive: true,
            isRecurring: false, // Les nouveaux deals ne sont pas récurrents
            recurrenceType: null,
            recurrenceDays: null,
            recurrenceEndDate: null
          }
        });
        createdDeals.push(newDeal);
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


