import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTagsData } from "@/lib/category-tags-mapping";
import bcrypt from "bcryptjs";
import { logSubscriptionChange } from "@/lib/subscription-logger";

// Fonction pour géocoder une adresse
async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr`);
    
    if (!response.ok) {
      console.error('Erreur géocodage:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    return null;
  }
}

/**
 * API d'inscription professionnelle
 * Traite le formulaire multi-étapes et crée professionnel + établissement
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Récupération des données du FormData
    const accountData = {
      email: formData.get('accountEmail') as string,
      password: formData.get('accountPassword') as string,
      firstName: formData.get('accountFirstName') as string,
      lastName: formData.get('accountLastName') as string,
      phone: formData.get('accountPhone') as string,
    };

    const professionalData = {
      siret: formData.get('siret') as string,
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
      paymentMethods: JSON.parse(formData.get('paymentMethods') as string || '[]'), // <- Nouveau
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      hours: JSON.parse(formData.get('hours') as string || '{}'),
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
      tiktok: formData.get('tiktok') as string || '',
      priceMin: formData.get('priceMin') ? parseFloat(formData.get('priceMin') as string) : null,
      priceMax: formData.get('priceMax') ? parseFloat(formData.get('priceMax') as string) : null,
      informationsPratiques: JSON.parse(formData.get('informationsPratiques') as string || '[]'),
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

    // Géocoder l'adresse automatiquement
    console.log('🌍 Géocodage de l\'adresse:', establishmentData.address);
    const coordinates = await geocodeAddress(establishmentData.address);
    
    if (coordinates) {
      console.log('✅ Coordonnées trouvées:', coordinates);
    } else {
      console.log('❌ Impossible de géocoder l\'adresse');
    }

    // Transaction pour créer user + établissement ensemble
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hacher le mot de passe
      const passwordHash = await bcrypt.hash(accountData.password, 12);

      // 2. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: accountData.email,
          passwordHash: passwordHash,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          phone: accountData.phone,
          role: 'pro', // Rôle professionnel
          name: `${accountData.firstName} ${accountData.lastName}`,
        }
      });

      // 3. Créer l'établissement lié à l'utilisateur
      const establishment = await tx.establishment.create({
        data: {
          name: establishmentData.name,
          slug: generateSlug(establishmentData.name),
          description: establishmentData.description,
          address: establishmentData.address,
          latitude: coordinates?.latitude || null, // Coordonnées GPS
          longitude: coordinates?.longitude || null, // Coordonnées GPS
          activities: establishmentData.activities, // Activités multiples (JSON)
          services: establishmentData.services, // Services (JSON)
          ambiance: establishmentData.ambiance, // Ambiance (JSON)
          paymentMethods: establishmentData.paymentMethods, // Moyens de paiement (JSON)
          horairesOuverture: establishmentData.hours, // Horaires d'ouverture (JSON)
          website: establishmentData.website,
          instagram: establishmentData.instagram,
          facebook: establishmentData.facebook,
          tiktok: establishmentData.tiktok,
          priceMin: establishmentData.priceMin,
          priceMax: establishmentData.priceMax,
          informationsPratiques: establishmentData.informationsPratiques,
          ownerId: user.id, // Lien vers l'utilisateur
          status: 'pending', // En attente de validation
          subscription: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'STANDARD', // Plan d'abonnement
        }
      });

      // 3. Créer les tags : automatiques (basés sur activités) + manuels (sélectionnés par l'utilisateur)
      console.log('🏷️  Création des tags pour:', establishment.name);
      console.log('📝 Activités:', establishmentData.activities);
      console.log('🏷️  Tags manuels:', establishmentData.tags);
      
      const allTagsData: Array<{etablissementId: string, tag: string, typeTag: string, poids: number}> = [];
      
      // Tags automatiques basés sur les activités sélectionnées
      for (const activityKey of establishmentData.activities) {
        const tagsData = createTagsData(establishment.id, activityKey);
        console.log(`  🔄 Activité "${activityKey}" → ${tagsData.length} tags automatiques`);
        allTagsData.push(...tagsData);
      }
      
      // Tags manuels sélectionnés par l'utilisateur (poids élevé car choisis explicitement)
      for (const tagId of establishmentData.tags) {
        console.log(`  ✏️  Tag manuel ajouté: "${tagId}"`);
        allTagsData.push({
          etablissementId: establishment.id,
          tag: tagId.toLowerCase(),
          typeTag: 'manuel',
          poids: 10 // Poids élevé pour les tags manuels
        });
      }
      
      // Supprimer les doublons (même tag avec poids différents)
      const uniqueTags = new Map<string, {etablissementId: string, tag: string, typeTag: string, poids: number}>();
      allTagsData.forEach(tagData => {
        const existing = uniqueTags.get(tagData.tag);
        if (!existing || tagData.poids > existing.poids) {
          uniqueTags.set(tagData.tag, tagData);
        }
      });
      
      // Créer les tags en base
      console.log(`📊 Total tags uniques à créer: ${uniqueTags.size}`);
      if (uniqueTags.size > 0) {
        const tagsToCreate = Array.from(uniqueTags.values());
        console.log('🏷️  Tags finaux:', tagsToCreate.map(t => `${t.tag} (${t.typeTag}, poids: ${t.poids})`));
        
        await tx.etablissementTag.createMany({
          data: tagsToCreate
        });
        console.log('✅ Tags créés avec succès en base de données');
      } else {
        console.log('⚠️  Aucun tag à créer');
      }

      return { user, establishment };
    });

    // Logger le changement de subscription
    await logSubscriptionChange(
      result.establishment.id,
      result.establishment.subscription,
      result.user.id,
      'Inscription professionnelle'
    );

    // TODO: Upload des photos (prochaine étape)
    // TODO: Envoyer email de confirmation (prochaine étape)

    return NextResponse.json({ 
      success: true,
      message: 'Inscription réussie ! Votre établissement sera vérifié sous 24h.',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      },
      establishment: {
        id: result.establishment.id,
        name: result.establishment.name,
        slug: result.establishment.slug
      },
      autoLogin: true // Indique au client de faire la connexion automatique
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
