import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API d'inscription professionnelle
 * Traite le formulaire multi-étapes et crée professionnel + établissement
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Récupération des données du FormData
    const professionalData = {
      siret: formData.get('siret') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      companyName: formData.get('companyName') as string,
      legalStatus: formData.get('legalStatus') as string,
      subscriptionPlan: formData.get('subscriptionPlan') as string || 'free',
    };

    const establishmentData = {
      name: formData.get('establishmentName') as string,
      description: formData.get('description') as string || '',
      address: formData.get('address') as string,
      activities: JSON.parse(formData.get('activities') as string || '[]'),
      services: JSON.parse(formData.get('services') as string || '[]'),
      ambiance: JSON.parse(formData.get('ambiance') as string || '[]'),
      hours: JSON.parse(formData.get('hours') as string || '{}'),
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
    };

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

    // Transaction pour créer professionnel + établissement ensemble
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le professionnel
      const professional = await tx.professional.create({
        data: {
          siret: professionalData.siret,
          firstName: professionalData.firstName,
          lastName: professionalData.lastName,
          email: professionalData.email,
          phone: professionalData.phone,
          companyName: professionalData.companyName,
          legalStatus: professionalData.legalStatus,
          subscriptionPlan: professionalData.subscriptionPlan.toUpperCase() as any,
        }
      });

      // 2. Créer l'établissement lié
      const establishment = await tx.establishment.create({
        data: {
          name: establishmentData.name,
          slug: generateSlug(establishmentData.name),
          description: establishmentData.description,
          address: establishmentData.address,
          activities: establishmentData.activities, // Activités multiples
          services: establishmentData.services, // Déjà un array, pas besoin de JSON.stringify
          ambiance: establishmentData.ambiance, // Déjà un array, pas besoin de JSON.stringify
          horairesOuverture: establishmentData.hours, // Horaires d'ouverture
          website: establishmentData.website,
          instagram: establishmentData.instagram,
          facebook: establishmentData.facebook,
          professionalOwnerId: professional.id, // Changé de ownerId à professionalOwnerId
          status: 'pending', // En attente de validation
        }
      });

      return { professional, establishment };
    });

    // TODO: Upload des photos (prochaine étape)
    // TODO: Envoyer email de confirmation (prochaine étape)

    return NextResponse.json({ 
      success: true,
      message: 'Inscription réussie ! Votre établissement sera vérifié sous 24h.',
      establishmentId: result.establishment.id,
      slug: result.establishment.slug 
    });

  } catch (error) {
    console.error('Erreur inscription professionnelle:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'SIRET ou email déjà utilisé' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Erreur lors de l\'inscription. Veuillez réessayer.' 
    }, { status: 500 });
  }
}
