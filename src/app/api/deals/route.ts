import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/deals - Début de la requête POST');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session utilisateur:', session?.user?.id, session?.user?.email);

    if (!session?.user) {
      console.error('❌ Utilisateur non authentifié');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

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
    console.log('🔍 Vérification de l\'établissement:', establishmentId, 'pour l\'utilisateur:', session.user.id);
    
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        ownerId: session.user.id 
      },
      select: { 
        id: true, 
        subscription: true,
        name: true
      }
    });

    console.log('🏢 Établissement trouvé:', establishment);

    if (!establishment) {
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

    // Créer le bon plan
    const deal = await prisma.dailyDeal.create({
      data: {
        establishmentId,
        title,
        description,
        modality: modality || null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        imageUrl: imageUrl || null,
        pdfUrl: pdfUrl || null,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        heureDebut: heureDebut || null,
        heureFin: heureFin || null,
        isActive: isActive !== undefined ? isActive : true,
        // Récurrence
        isRecurring: isRecurring || false,
        recurrenceType: recurrenceType || null,
        recurrenceDays: recurrenceDays || null,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        // Champs pour l'effet flip
        promoUrl: promoUrl || null
      }
    });

    console.log('✅ Bon plan créé avec succès:', deal.id);

    return NextResponse.json({ 
      success: true,
      deal
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


