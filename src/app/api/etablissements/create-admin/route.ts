import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Création d\'établissement par admin...');
    
    // Récupérer l'utilisateur admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@envie2sortir.com' }
    });
    
    console.log('👤 Utilisateur admin trouvé:', adminUser ? 'Oui' : 'Non');
    
    if (!adminUser) {
      console.log('❌ Utilisateur admin introuvable');
      return NextResponse.json(
        { error: "Utilisateur admin introuvable" },
        { status: 404 }
      );
    }

    // Créer ou récupérer le Professional pour l'admin
    let professional = await prisma.professional.findFirst({
      where: { email: adminUser.email }
    });

    if (!professional) {
      console.log('👨‍💼 Création du Professional pour l\'admin...');
      professional = await prisma.professional.create({
        data: {
          siret: `ADMIN_${adminUser.id}`,
          firstName: adminUser.firstName || 'Admin',
          lastName: adminUser.lastName || 'Envie2Sortir',
          email: adminUser.email,
          phone: '0123456789',
          companyName: 'Admin Envie2Sortir',
          legalStatus: 'Admin',
          subscriptionPlan: 'FREE',
          siretVerified: true
        }
      });
      console.log('✅ Professional créé:', professional.id);
    } else {
      console.log('✅ Professional existant trouvé:', professional.id);
    }
    
    const formData = await request.formData();
    console.log('📝 FormData reçu:', Array.from(formData.keys()));
    
    // Extraire les données du formulaire
    const establishmentData = {
      name: formData.get('establishmentName') as string,
      description: formData.get('description') as string || '',
      address: formData.get('address') as string,
      city: formData.get('city') as string || '',
      postalCode: formData.get('postalCode') as string || '',
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      phone: formData.get('phone') as string || '',
      email: formData.get('email') as string || '',
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
      tiktok: formData.get('tiktok') as string || '',
      activities: (() => {
        try {
          return formData.get('activities') ? JSON.parse(formData.get('activities') as string) : [];
        } catch (e) {
          console.log('⚠️ Erreur parsing activities:', e);
          return [];
        }
      })(),
      services: (() => {
        try {
          return formData.get('services') ? JSON.parse(formData.get('services') as string) : [];
        } catch (e) {
          console.log('⚠️ Erreur parsing services:', e);
          return [];
        }
      })(),
      ambiance: (() => {
        try {
          return formData.get('ambiance') ? JSON.parse(formData.get('ambiance') as string) : [];
        } catch (e) {
          console.log('⚠️ Erreur parsing ambiance:', e);
          return [];
        }
      })(),
      paymentMethods: (() => {
        try {
          return formData.get('paymentMethods') ? JSON.parse(formData.get('paymentMethods') as string) : {};
        } catch (e) {
          console.log('⚠️ Erreur parsing paymentMethods:', e);
          return {};
        }
      })(),
      horairesOuverture: (() => {
        try {
          return formData.get('hours') ? JSON.parse(formData.get('hours') as string) : {};
        } catch (e) {
          console.log('⚠️ Erreur parsing hours:', e);
          return {};
        }
      })(),
      priceMin: formData.get('priceMin') ? parseFloat(formData.get('priceMin') as string) : null,
      priceMax: formData.get('priceMax') ? parseFloat(formData.get('priceMax') as string) : null,
      informationsPratiques: formData.get('informationsPratiques') ? JSON.parse(formData.get('informationsPratiques') as string) : [],
      envieTags: formData.get('envieTags') ? JSON.parse(formData.get('envieTags') as string) : [],
      theForkLink: formData.get('theForkLink') as string || '',
      uberEatsLink: formData.get('uberEatsLink') as string || '',
    };
    
    console.log('📊 Données extraites:', {
      name: establishmentData.name,
      address: establishmentData.address,
      city: establishmentData.city,
      postalCode: establishmentData.postalCode,
      hasActivities: !!establishmentData.activities,
      hasServices: !!establishmentData.services,
      hasAmbiance: !!establishmentData.ambiance
    });
    
    // Validation des champs requis
    if (!establishmentData.name || !establishmentData.address) {
      return NextResponse.json(
        { error: "Nom et adresse sont requis" },
        { status: 400 }
      );
    }
    
    // Générer un slug unique
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ùû]/g, 'u')
        .replace(/[ôö]/g, 'o')
        .replace(/[îï]/g, 'i')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };
    
    let slug = generateSlug(establishmentData.name);
    let counter = 1;
    
    // Vérifier l'unicité du slug
    while (await prisma.establishment.findUnique({ where: { slug } })) {
      slug = `${generateSlug(establishmentData.name)}-${counter}`;
      counter++;
    }
    
    // Créer l'établissement
    const establishment = await prisma.establishment.create({
      data: {
        name: establishmentData.name,
        slug: slug,
        description: establishmentData.description,
        address: establishmentData.address,
        city: establishmentData.city,
        postalCode: establishmentData.postalCode,
        latitude: establishmentData.latitude,
        longitude: establishmentData.longitude,
        phone: establishmentData.phone,
        email: establishmentData.email,
        website: establishmentData.website,
        instagram: establishmentData.instagram,
        facebook: establishmentData.facebook,
        tiktok: establishmentData.tiktok,
        activities: establishmentData.activities,
        services: establishmentData.services,
        ambiance: establishmentData.ambiance,
        paymentMethods: establishmentData.paymentMethods,
        horairesOuverture: establishmentData.horairesOuverture,
        priceMin: establishmentData.priceMin,
        priceMax: establishmentData.priceMax,
        informationsPratiques: establishmentData.informationsPratiques,
        envieTags: establishmentData.envieTags,
        theForkLink: establishmentData.theForkLink,
        uberEatsLink: establishmentData.uberEatsLink,
        ownerId: professional.id,
        status: 'active' // Approuver automatiquement
      }
    });
    
    console.log('✅ Établissement créé:', establishment.name);
    
    return NextResponse.json({
      success: true,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création établissement:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return NextResponse.json(
      { 
        error: "Erreur lors de la création de l'établissement",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
