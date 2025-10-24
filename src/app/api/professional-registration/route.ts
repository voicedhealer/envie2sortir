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

    // Fonction pour extraire city et postalCode de l'adresse complète
    const parseAddressComponents = (fullAddress: string) => {
      if (!fullAddress) {
        console.log('⚠️ Adresse vide');
        return { city: null, postalCode: null };
      }
      
      console.log('📍 Parsing de l\'adresse:', fullAddress);
      
      // Pattern 1 : "19 Rue du Garet, 69001 Lyon" (standard)
      let match = fullAddress.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
      if (match) {
        console.log('✅ Pattern 1 réussi');
        return {
          city: match[3].trim(),
          postalCode: match[2].trim()
        };
      }
      
      // Pattern 2 : "19 Rue du Garet 69001 Lyon" (sans virgule)
      match = fullAddress.match(/^(.+?)\s+(\d{5})\s+(.+)$/);
      if (match) {
        console.log('✅ Pattern 2 réussi');
        return {
          city: match[3].trim(),
          postalCode: match[2].trim()
        };
      }
      
      // Pattern 3 : Avec virgules multiples "19 Rue du Garet, 69001, Lyon"
      const parts = fullAddress.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Chercher le code postal dans toutes les parties
        for (let i = 0; i < parts.length; i++) {
          const postalCodeMatch = parts[i].match(/(\d{5})/);
          if (postalCodeMatch && i < parts.length - 1) {
            console.log('✅ Pattern 3 réussi');
            return {
              city: parts[i + 1].trim(),
              postalCode: postalCodeMatch[1]
            };
          }
        }
      }
      
      // Pattern 4 : Code postal à la fin "19 Rue du Garet Lyon 69001"
      match = fullAddress.match(/^(.+?)\s+([A-Za-zÀ-ÿ\s-]+)\s+(\d{5})$/);
      if (match) {
        console.log('✅ Pattern 4 réussi');
        return {
          city: match[2].trim(),
          postalCode: match[3].trim()
        };
      }
      
      // Fallback : Extraire n'importe quel code postal 5 chiffres
      const postalCodeMatch = fullAddress.match(/(\d{5})/);
      if (postalCodeMatch) {
        // Chercher le nom de ville après le code postal
        const afterPostalCode = fullAddress.split(postalCodeMatch[0])[1];
        if (afterPostalCode) {
          const cityMatch = afterPostalCode.match(/([A-Za-zÀ-ÿ\s-]+)/);
          if (cityMatch) {
            console.log('✅ Fallback réussi');
            return {
              city: cityMatch[1].trim(),
              postalCode: postalCodeMatch[1]
            };
          }
        }
      }
      
      console.log('❌ Aucun pattern ne correspond');
      return { city: null, postalCode: null };
    };

    const fullAddress = formData.get('address') as string;
    const addressComponents = parseAddressComponents(fullAddress);
    console.log('🔍 Résultat du parsing:', {
      fullAddress,
      city: addressComponents.city,
      postalCode: addressComponents.postalCode
    });
    
    // Avertir si le parsing a échoué
    if (!addressComponents.city || !addressComponents.postalCode) {
      console.warn('⚠️ Parsing de l\'adresse partiel ou échoué, city/postalCode seront null');
    }

    const establishmentData = {
      name: formData.get('establishmentName') as string,
      description: formData.get('description') as string || '',
      address: fullAddress, // Adresse complète
      city: addressComponents.city,
      postalCode: addressComponents.postalCode,
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
            return {};
          }
        }
        return {};
      })(),
      hours: JSON.parse(formData.get('hours') as string || '{}'),
      website: formData.get('website') as string || '',
      instagram: formData.get('instagram') as string || '',
      facebook: formData.get('facebook') as string || '',
      tiktok: formData.get('tiktok') as string || '',
      youtube: formData.get('youtube') as string || '',
      phone: formData.get('phone') as string || '',
      whatsappPhone: formData.get('whatsappPhone') as string || '',
      messengerUrl: formData.get('messengerUrl') as string || '',
      email: formData.get('email') as string || '',
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
      // Données hybrides
      accessibilityDetails: (() => {
        const data = formData.get('hybridAccessibilityDetails');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridAccessibilityDetails');
            return null;
          }
        }
        return null;
      })(),
      detailedServices: (() => {
        const data = formData.get('hybridDetailedServices');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridDetailedServices');
            return null;
          }
        }
        return null;
      })(),
      clienteleInfo: (() => {
        const data = formData.get('hybridClienteleInfo');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridClienteleInfo');
            return null;
          }
        }
        return null;
      })(),
      detailedPayments: (() => {
        const data = formData.get('hybridDetailedPayments');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridDetailedPayments');
            return null;
          }
        }
        return null;
      })(),
      childrenServices: (() => {
        const data = formData.get('hybridChildrenServices');
        if (data && typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Erreur parsing hybridChildrenServices');
            return null;
          }
        }
        return null;
      })(),
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
    // ✅ CORRECTION : Prioriser les coordonnées GPS du formulaire
    const manualLatitude = formData.get('latitude') as string;
    const manualLongitude = formData.get('longitude') as string;
    
    console.log('📍 Coordonnées GPS du formulaire:');
    console.log('  Latitude:', manualLatitude, 'Type:', typeof manualLatitude);
    console.log('  Longitude:', manualLongitude, 'Type:', typeof manualLongitude);
    
    let finalCoordinates = null;
    
    // Si des coordonnées GPS sont fournies manuellement, les utiliser
    if (manualLatitude && manualLongitude) {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        finalCoordinates = { latitude: lat, longitude: lng };
        console.log('✅ Utilisation des coordonnées GPS du formulaire:', finalCoordinates);
      } else {
        console.log('⚠️ Coordonnées GPS invalides, tentative de géocodage automatique');
      }
    }
    
    // Si pas de coordonnées manuelles, essayer le géocodage automatique
    if (!finalCoordinates) {
      console.log('🌍 Géocodage automatique de l\'adresse:', establishmentData.address);
      
      // Fonction de géocodage optimisée (délais réduits)
      const geocodeWithRetry = async (address, maxRetries = 2) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`🔄 Tentative de géocodage ${attempt}/${maxRetries}`);
            const result = await geocodeAddress(address);
            
            if (result) {
              console.log(`✅ Géocodage réussi (tentative ${attempt}):`, result);
              return result;
            }
            
            if (attempt < maxRetries) {
              console.log(`⏳ Attente avant retry (${attempt * 500}ms)...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 500)); // Réduit de 1000ms à 500ms
            }
          } catch (error) {
            console.warn(`⚠️ Erreur tentative ${attempt}:`, error.message);
            
            if (attempt < maxRetries) {
              console.log(`⏳ Attente avant retry (${attempt * 500}ms)...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 500)); // Réduit de 1000ms à 500ms
            }
          }
        }
        
        console.log('❌ Toutes les tentatives de géocodage ont échoué');
        return null;
      };
      
      try {
        finalCoordinates = await geocodeWithRetry(establishmentData.address);
        
        if (finalCoordinates) {
          console.log('✅ Coordonnées GPS trouvées par géocodage:', finalCoordinates);
        } else {
          console.log('⚠️ Géocodage n\'a pas retourné de coordonnées, mais on continue');
          console.log('💡 Les coordonnées pourront être ajoutées manuellement dans le dashboard');
        }
      } catch (geocodeError) {
        console.warn('⚠️ Erreur lors du géocodage (non-bloquant):', geocodeError);
        console.log('➡️  L\'établissement sera créé sans coordonnées GPS');
        // On continue quand même, les coordonnées seront null
      }
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
          city: establishmentData.city,
          postalCode: establishmentData.postalCode,
          latitude: finalCoordinates?.latitude || null, // Coordonnées GPS (priorité au formulaire)
          longitude: finalCoordinates?.longitude || null, // Coordonnées GPS (priorité au formulaire)
          activities: establishmentData.activities, // Activités multiples (JSON)
          services: establishmentData.services, // Services (JSON)
          ambiance: establishmentData.ambiance, // Ambiance (JSON)
          paymentMethods: establishmentData.paymentMethods, // Moyens de paiement (JSON)
          horairesOuverture: establishmentData.hours, // Horaires d'ouverture (JSON)
          phone: establishmentData.phone,
          email: establishmentData.email,
          website: establishmentData.website,
          instagram: establishmentData.instagram,
          facebook: establishmentData.facebook,
          tiktok: establishmentData.tiktok,
          priceMin: establishmentData.priceMin,
          priceMax: establishmentData.priceMax,
          informationsPratiques: establishmentData.informationsPratiques,
          theForkLink: establishmentData.theForkLink, // Lien TheFork pour réservations
          uberEatsLink: establishmentData.uberEatsLink, // Lien Uber Eats
          // Données hybrides
          accessibilityDetails: establishmentData.accessibilityDetails,
          detailedServices: establishmentData.detailedServices,
          clienteleInfo: establishmentData.clienteleInfo,
          detailedPayments: establishmentData.detailedPayments,
          childrenServices: establishmentData.childrenServices,
          ownerId: professional.id, // Lien vers le professionnel
          status: 'pending', // En attente de validation
          subscription: professionalData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE', // Plan d'abonnement
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
      
      // Vérifier les contraintes uniques spécifiques
      if (error.message.includes('Unique constraint')) {
        // Vérifier quel champ pose problème
        if (error.message.includes('siret')) {
          return NextResponse.json({ 
            error: 'Ce SIRET est déjà utilisé par un autre établissement. Si vous êtes le propriétaire, veuillez vous connecter à votre compte existant.' 
          }, { status: 400 });
        }
        if (error.message.includes('email')) {
          return NextResponse.json({ 
            error: 'Cet email est déjà utilisé. Si vous avez déjà un compte, veuillez vous connecter.' 
          }, { status: 400 });
        }
        // Message générique si on ne peut pas déterminer le champ
        return NextResponse.json({ 
          error: 'SIRET ou email déjà utilisé. Vérifiez vos informations ou connectez-vous si vous avez déjà un compte.' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
