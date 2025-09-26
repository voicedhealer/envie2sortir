import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { geocodeAddress } from '@/lib/geocoding';
import { createTagsData } from '@/lib/category-tags-mapping';
import { logSubscriptionChange } from '@/lib/subscription-logger';

export async function POST(request: NextRequest) {
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
      paymentMethods: (() => {
        const paymentMethodsData = formData.get('paymentMethods');
        console.log('🔍 paymentMethodsData type:', typeof paymentMethodsData);
        console.log('🔍 paymentMethodsData value:', paymentMethodsData);
        if (paymentMethodsData && typeof paymentMethodsData === 'string') {
          try {
            return JSON.parse(paymentMethodsData);
          } catch (e) {
            console.log('⚠️ Erreur parsing paymentMethods, utilisation de la valeur brute');
            return [paymentMethodsData];
          }
        }
        return [];
      })(),
      hours: JSON.parse(formData.get('hours') as string || '{}'),
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
      tiktok: formData.get('tiktok') as string || '',
      priceMin: parseFloat(formData.get('priceMin') as string) || 0,
      priceMax: parseFloat(formData.get('priceMax') as string) || 0,
      informationsPratiques: (() => {
        const infosData = formData.get('informationsPratiques');
        if (infosData && typeof infosData === 'string') {
          try {
            return JSON.parse(infosData);
          } catch (e) {
            return [infosData];
          }
        }
        return [];
      })(),
      theForkLink: formData.get('theForkLink') as string || '',
      uberEatsLink: formData.get('uberEatsLink') as string || '',
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      envieTags: JSON.parse(formData.get('envieTags') as string || '[]'),
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

    // Transaction pour créer professional + établissement ensemble
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hacher le mot de passe
      console.log('🔐 Password type:', typeof accountData.password);
      console.log('🔐 Password value:', accountData.password);
      const passwordHash = await bcrypt.hash(accountData.password, 12);

      // 2. Créer le professionnel (contient tout : auth + données pro)
      const professional = await tx.professional.create({
        data: {
          siret: professionalData.siret,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          email: accountData.email,
          passwordHash: passwordHash,
          phone: accountData.phone,
          companyName: professionalData.companyName,
          legalStatus: professionalData.legalStatus,
          subscriptionPlan: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE',
          siretVerified: false, // À vérifier plus tard
        }
      });

      // 3. Créer l'établissement lié au professionnel
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
          theForkLink: establishmentData.theForkLink, // Lien TheFork pour réservations
          uberEatsLink: establishmentData.uberEatsLink, // Lien Uber Eats
          ownerId: professional.id, // Lien vers le professionnel
          status: 'pending', // En attente de validation
          subscription: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'STANDARD', // Plan d'abonnement
        }
      });

      // 4. Créer les tags : automatiques (basés sur activités) + manuels (sélectionnés par l'utilisateur)
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
      
      // Tags "envie de" personnalisés (poids modéré pour éviter les scores trop élevés)
      for (const envieTag of establishmentData.envieTags) {
        console.log(`  💭 Tag "envie de" ajouté: "${envieTag}"`);
        allTagsData.push({
          etablissementId: establishment.id,
          tag: envieTag.toLowerCase(),
          typeTag: 'envie',
          poids: 3 // Poids modéré pour les tags "envie de" (3 × 10 = 30 points)
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

      return { professional, establishment };
    });

    // Logger le changement de subscription
    await logSubscriptionChange(
      result.establishment.id,
      result.establishment.subscription,
      result.professional.id,
      'Inscription professionnelle'
    );

    // TODO: Upload des photos (prochaine étape)
    // TODO: Envoyer email de confirmation (prochaine étape)

    return NextResponse.json({ 
      success: true,
      message: 'Inscription réussie ! Votre établissement sera vérifié sous 24h.',
      professional: {
        id: result.professional.id,
        email: result.professional.email,
        firstName: result.professional.firstName,
        lastName: result.professional.lastName,
        siret: result.professional.siret
      },
      establishment: {
        id: result.establishment.id,
        name: result.establishment.name,
        slug: result.establishment.slug
      },
      autoLogin: true // Indique au client de faire la connexion automatique
    });

  } catch (error) {
    console.error('❌ Erreur inscription professionnelle:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'SIRET ou email déjà utilisé' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
