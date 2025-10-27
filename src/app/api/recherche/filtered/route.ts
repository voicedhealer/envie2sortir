import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fonction pour calculer la distance entre deux points (formule haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fonction intelligente de matching pour éviter les faux positifs
// Priorise les correspondances exactes et par mots entiers
function intelligentMatch(text: string, keyword: string): boolean {
  // 1. Correspondance exacte (priorité maximale)
  if (text === keyword) {
    return true;
  }
  
  // 2. Correspondance par mot entier (mot entouré de limites de mots)
  // Utiliser \b pour s'assurer que c'est un mot complet
  const wordBoundaryRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (wordBoundaryRegex.test(text)) {
    return true;
  }
  
  // 3. Correspondance partielle uniquement pour les mots-clés de 4+ caractères
  // Cela permet "karting" contient "kart" mais pas "art" contient "art" si art est un mot de 3 caractères
  if (keyword.length >= 4 && text.includes(keyword)) {
    return true;
  }
  
  // Pas de correspondance
  return false;
}

// Associations mot-clé -> activités (pour améliorer le matching sémantique)
const ACTIVITY_ASSOCIATIONS: { [key: string]: string[] } = {
  'boire': ['bar', 'cocktails', 'bieres', 'cafe'],
  'verre': ['bar', 'cocktails', 'bieres', 'cafe'],
  'cocktail': ['bar', 'cocktails'],
  'cocktails': ['bar', 'cocktails'],
  'biere': ['bar', 'bieres'],
  'bieres': ['bar', 'bieres'],
  'amis': ['bar', 'karaoke', 'jeux', 'ambiance'],
  'soiree': ['bar', 'karaoke', 'danse', 'concert', 'dj'],
  'manger': ['restaurant', 'burger', 'tapas'],
  'burger': ['burger', 'restaurant'],
  'tapas': ['tapas', 'bar', 'restaurant']
};

// Mots-clés critiques qui nécessitent un filtre strict par activité
const CRITICAL_KEYWORDS: { [key: string]: string[] } = {
  // Cuisine spécifique
  'tandoori': ['restaurant_indien', 'cuisine_indienne'],
  'indien': ['restaurant_indien', 'cuisine_indienne'],
  'sushi': ['restaurant_japonais', 'cuisine_japonaise'],
  'pizza': ['restaurant_italien', 'pizzeria'],
  'burger': ['burger', 'fast_food'],
  'tapas': ['tapas', 'restaurant_espagnol'],
  'chinois': ['restaurant_chinois', 'cuisine_chinoise'],
  
  // Activités spécifiques
  'karting': ['karting'],
  'kart': ['karting'],
  'bowling': ['bowling'],
  'laser': ['laser_game'],
  'escape': ['escape_game'],
  'vr': ['realite_virtuelle'],
  'paintball': ['paintball_exterieur', 'paintball_interieur'],
  'tir': ['tir'],
  'piscine': ['piscine'],
  'cinema': ['cinema_mainstream', 'cinema_art_essai', 'cinema_imax'],
  'theatre': ['theatre_classique', 'theatre_cafe'],
  
  // Types de lieux spécifiques
  'bar': ['bar_ambiance', 'pub_traditionnel', 'bar_cocktails'],
  'cafe': ['cafe'],
  'discotheque': ['discotheque', 'boite_nuit_mainstream', 'club_prive'],
};

/**
 * Filtre préliminaire : exclut les établissements non pertinents avant le scoring
 * @param establishment - L'établissement à vérifier
 * @param keywords - Les mots-clés de la recherche
 * @returns true si l'établissement doit être gardé
 */
function shouldIncludeEstablishment(establishment: any, keywords: string[]): boolean {
  const establishmentActivities = establishment.activities || [];
  
  for (const keyword of keywords) {
    const requiredActivities = CRITICAL_KEYWORDS[keyword];
    
    if (requiredActivities) {
      // Si le mot-clé est critique, l'établissement DOIT avoir au moins une activité requise
      const hasRequiredActivity = establishmentActivities.some((activity: string) => 
        requiredActivities.includes(activity)
      );
      
      if (!hasRequiredActivity) {
        console.log(`❌ FILTRÉ (critique): ${establishment.name} - pas d'activité requise pour "${keyword}"`);
        return false;
      }
    }
  }
  
  // Filtrage spécial pour "manger" + aliment spécifique
  const hasManger = keywords.includes('manger');
  const hasFoodKeyword = keywords.some(k => 
    ['tandoori', 'sushi', 'pizza', 'burger', 'tapas', 'indien', 'chinois', 'italien', 'japonais', 
     'poulet', 'poisson', 'viande', 'vegetarien'].includes(k)
  );
  
  if (hasManger && hasFoodKeyword) {
    // Si recherche alimentaire spécifique, exclure les non-restaurants
    const hasRestaurantActivity = establishmentActivities.some((activity: string) => 
      activity.includes('restaurant') || activity.includes('cuisine') || 
      activity === 'burger' || activity === 'fast_food'
    );
    
    if (!hasRestaurantActivity) {
      console.log(`❌ FILTRÉ (alimentation): ${establishment.name} - pas d'activité restaurant`);
      return false;
    }
  }
  
  return true;
}

// Fonction pour extraire les mots-clés significatifs avec priorité
function extractKeywords(envie: string): { keywords: string[], primaryKeywords: string[], contextKeywords: string[] } {
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'faire', 'découvrir', 'avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux', 'envie', 'sortir', 'aller', 'voir', 'trouver', 'ai', 'as', 'a', 'et', 'ou', 'si', 'on', 'il', 'je', 'tu', 'nous', 'vous', 'ils', 'elle', 'elles'];
  
  // Mots de contexte temporel (moins importants)
  const contextWords = ['ce', 'soir', 'demain', 'aujourd', 'maintenant', 'bientot', 'plus', 'tard'];
  
  // Mots d'action spécifiques (très importants) - correspondance exacte uniquement
  const actionWords = ['kart', 'karting', 'bowling', 'laser', 'escape', 'game', 'paintball', 'tir', 'archery', 'escalade', 'piscine', 'cinema', 'theatre', 'concert', 'danse', 'danser', 'boire', 'manger', 'restaurant', 'bar', 'cafe', 'verre', 'cocktail', 'biere', 'bieres', 'tapas', 'burger', 'karaoke'];
  
  const normalizedText = envie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, ' ');
  
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);
  
  const primaryKeywords: string[] = [];
  const contextKeywords: string[] = [];
  const allKeywords: string[] = [];
  
  words.forEach(word => {
    const trimmed = word.trim();
    if (trimmed.length < 2) return;
    
    console.log(`🔍 Traitement du mot: "${trimmed}"`);
    
    // Mots de contexte = priorité faible (vérifier d'abord pour éviter les conflits)
    if (contextWords.includes(trimmed)) {
      contextKeywords.push(trimmed);
      allKeywords.push(trimmed);
      console.log(`⏰ Mot-clé de contexte: "${trimmed}"`);
    }
    // Mots d'action spécifiques = priorité maximale (correspondance exacte)
    else if (actionWords.includes(trimmed)) {
      primaryKeywords.push(trimmed);
      allKeywords.push(trimmed);
      console.log(`🎯 Mot-clé primaire détecté: "${trimmed}"`);
    }
    // Autres mots significatifs
    else if (!stopWords.includes(trimmed)) {
      allKeywords.push(trimmed);
      console.log(`📝 Mot-clé normal: "${trimmed}"`);
    }
  });
  
  return {
    keywords: allKeywords,
    primaryKeywords,
    contextKeywords
  };
}

// Fonction pour vérifier si un établissement est ouvert
function isOpenNow(horairesOuverture: any): boolean {
  if (!horairesOuverture) return true;
  
  try {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayKey = today as keyof typeof horairesOuverture;
    const todayHours = horairesOuverture[todayKey];
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const slot of todayHours.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      let closeTime = closeHour * 60 + closeMin;
      
      if (closeTime < openTime) {
        closeTime += 24 * 60;
      }
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        return true;
      }
    }
    
    return false;
  } catch {
    return true;
  }
}

// Fonction pour appliquer le tri selon le filtre
function applySorting(establishments: any[], filter: string) {
  // Par défaut, trier par score de pertinence thématique (aucun filtre)
  if (!filter || filter === 'popular') {
    return establishments.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  switch (filter) {
    case 'wanted':
      return establishments.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    
    case 'cheap':
      return establishments.sort((a, b) => {
        const priceA = a.priceMin || a.prixMoyen || 999;
        const priceB = b.priceMin || b.prixMoyen || 999;
        return priceA - priceB;
      });
    
    case 'premium':
      return establishments.sort((a, b) => {
        // Tri par subscription (PREMIUM en premier) puis par score de pertinence
        const subscriptionOrder = { 'PREMIUM': 2, 'FREE': 1 };
        const orderA = subscriptionOrder[a.subscription as keyof typeof subscriptionOrder] || 0;
        const orderB = subscriptionOrder[b.subscription as keyof typeof subscriptionOrder] || 0;
        
        if (orderA !== orderB) return orderB - orderA;
        return (b.score || 0) - (a.score || 0);
      });
    
    case 'newest':
      return establishments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    case 'rating':
      return establishments.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    
    default:
      // Par défaut, trier par score de pertinence
      return establishments.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const envie = searchParams.get('envie');
    const ville = searchParams.get('ville');
    const filter = searchParams.get('filter') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const rayon = parseInt(searchParams.get('rayon') || '5');
    let lat = parseFloat(searchParams.get('lat') || '0');
    let lng = parseFloat(searchParams.get('lng') || '0');

    console.log(`🔍 RECHERCHE FILTRÉE - Envie: "${envie}", Ville: "${ville}", Filtre: ${filter}, Page: ${page}, Limite: ${limit}`);

    if (!envie) {
      return NextResponse.json({ error: "Paramètre 'envie' requis" }, { status: 400 });
    }

    // Géocodage si nécessaire
    if ((lat === 0 || lng === 0) && ville && ville !== "Autour de moi") {
      try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville + ', France')}&limit=1`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
        }
      } catch (geocodeError) {
        console.error('Erreur géocodage:', geocodeError);
      }
    }

    if (lat === 0 || lng === 0) {
      lat = 47.322;
      lng = 5.041;
    }

    const keywordData = extractKeywords(envie);
    const { keywords, primaryKeywords, contextKeywords } = keywordData;
    
    console.log(`📝 Mots-clés extraits: [${keywords.join(', ')}]`);
    console.log(`🎯 Mots-clés primaires: [${primaryKeywords.join(', ')}]`);
    console.log(`⏰ Mots-clés de contexte: [${contextKeywords.join(', ')}]`);
    
    if (keywords.length === 0) {
      return NextResponse.json({ error: "Aucun mot-clé significatif trouvé" }, { status: 400 });
    }

    // Construire la clause WHERE
    const where: any = {
      status: 'approved',
      latitude: { not: null },
      longitude: { not: null }
    };

    // Filtre premium
    if (filter === 'premium') {
      where.subscription = 'PREMIUM';
    }

    // Charger les établissements
    const establishments = await prisma.establishment.findMany({
      where,
      include: { 
        tags: true, 
        images: { 
          where: { isPrimary: true }, 
          take: 1 
        },
        events: {
          where: {
            startDate: {
              gte: new Date()
            }
          },
          orderBy: {
            startDate: 'asc'
          },
          take: 1
        }
      }
    });

    console.log(`🔍 Nombre total d'établissements trouvés: ${establishments.length}`);

    // Appliquer le filtrage géographique
    const establishmentsInRadius = establishments.filter(est => {
      if (lat && lng && est.latitude && est.longitude) {
        const distance = calculateDistance(lat, lng, est.latitude, est.longitude);
        return distance <= rayon;
      }
      return true;
    });

    console.log(`📍 Établissements dans le rayon de ${rayon}km: ${establishmentsInRadius.length}`);

    // FILTRAGE PRÉLIMINAIRE (avant le scoring)
    const preFilteredEstablishments = establishmentsInRadius.filter(est => {
      return shouldIncludeEstablishment(est, keywords);
    });

    console.log(`✅ Après filtrage préliminaire (activités critiques): ${preFilteredEstablishments.length} établissements`);

    // Calculer les scores pour la pertinence thématique (seulement sur les établissements pré-filtrés)
    const scoredEstablishments = preFilteredEstablishments.map(establishment => {
      let thematicScore = 0;
      let matchedTags: string[] = [];
      let distance = 0;
      
      if (lat && lng && establishment.latitude && establishment.longitude) {
        distance = calculateDistance(lat, lng, establishment.latitude, establishment.longitude);
      }
      
      console.log(` CALCUL SCORE: ${establishment.name}`);
      console.log(` Mots-clés extraits: [${keywords.join(', ')}]`);
      
      // Score basé sur les tags avec priorité pour les mots-clés primaires
      const tagMatchedKeywords = new Set<string>(); // Pour éviter les doublons
      
      establishment.tags.forEach(tag => {
        const tagNormalized = tag.tag
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        // Vérifier d'abord les mots-clés primaires (poids très élevé)
        primaryKeywords.forEach(keyword => {
          // Vérifier si le tag contient le mot-clé (uniquement dans ce sens)
          if (intelligentMatch(tagNormalized, keyword)) {
            // Réduire drastiquement le score pour les tags génériques "envie de manger..."
            let tagScore = 150; // Score très élevé pour les mots-clés primaires
            if (tag.tag.toLowerCase().includes('envie de manger') || 
                tag.tag.toLowerCase().includes('envie de boire') ||
                tag.tag.toLowerCase().includes('envie de faire')) {
              tagScore = 20; // Score très faible pour les tags génériques
            }
            thematicScore += tagScore;
            matchedTags.push(tag.tag);
            tagMatchedKeywords.add(keyword);
            console.log(`🎯 PRIMARY TAG MATCH: ${establishment.name} - "${tag.tag}" +${tagScore} (total: ${thematicScore})`);
          }
        });
        
        // Ensuite les autres mots-clés (poids normal)
        keywords.forEach(keyword => {
          // Ignorer les stop words dans les tags (comme "envie", "de", etc.)
          const stopWordsForTags = ['envie', 'de', 'le', 'la', 'les', 'un', 'une', 'des', 'du'];
          
          // Vérifier si le tag contient le mot-clé (uniquement dans ce sens)
          if (!primaryKeywords.includes(keyword) && !tagMatchedKeywords.has(keyword) && !stopWordsForTags.includes(keyword) && intelligentMatch(tagNormalized, keyword)) {
            const isContext = contextKeywords.includes(keyword);
            
            // Ajuster le poids pour les tags "envie de" génériques
            let adjustedPoids = tag.poids;
            if (tag.tag.toLowerCase().includes('envie de découvrir') || 
                tag.tag.toLowerCase().includes('envie de sortir') ||
                tag.tag.toLowerCase().includes('envie de détente')) {
              adjustedPoids = 3; // Réduire le poids des tags génériques
            }
            
            // Réduire drastiquement le poids des mots de contexte - compter seulement 1 fois par mot-clé
            const contextMultiplier = isContext ? 0.5 : 10; // Mots de contexte = 0.5x, autres = 10x
            const tagScore = adjustedPoids * contextMultiplier;
            thematicScore += tagScore;
            matchedTags.push(tag.tag);
            tagMatchedKeywords.add(keyword);
            console.log(`️ TAG MATCH: ${establishment.name} - "${tag.tag}" +${tagScore} (total: ${thematicScore})`);
          }
        });
      });

      // Score basé sur le nom et la description
      const nameNormalized = establishment.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const descriptionNormalized = (establishment.description || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      // Score basé sur le nom et la description avec priorité pour les mots-clés primaires
      keywords.forEach(keyword => {
        const isPrimary = primaryKeywords.includes(keyword);
        const isContext = contextKeywords.includes(keyword);
        
        // Bonus pour les mots spécifiques (pas "manger", "faire", etc.)
        const isGenericWord = ['manger', 'faire', 'boire', 'voir', 'découvrir'].includes(keyword);
        const specificBonus = !isGenericWord && !isContext ? 50 : 0;
        
        if (intelligentMatch(nameNormalized, keyword)) {
          const score = isPrimary ? (isGenericWord ? 50 : 150) : (isContext ? 5 : 20);
          thematicScore += score + specificBonus;
          console.log(` NAME MATCH: ${establishment.name} - "${keyword}" +${score}${specificBonus > 0 ? ` +${specificBonus} (bonus spécifique)` : ''} (total: ${thematicScore})`);
        }
        if (intelligentMatch(descriptionNormalized, keyword)) {
          const score = isPrimary ? (isGenericWord ? 30 : 100) : (isContext ? 3 : 10);
          thematicScore += score + specificBonus;
          console.log(` DESC MATCH: ${establishment.name} - "${keyword}" +${score}${specificBonus > 0 ? ` +${specificBonus} (bonus spécifique)` : ''} (total: ${thematicScore})`);
        }
      });

      // Score basé sur les activités avec priorité pour les mots-clés primaires
      if (establishment.activities && Array.isArray(establishment.activities)) {
        establishment.activities.forEach((activity: any) => {
          if (typeof activity === 'string') {
            const activityNormalized = activity
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            keywords.forEach(keyword => {
              // Matching plus intelligent : vérifier si le mot-clé est contenu dans l'activité ou vice versa
              const keywordInActivity = intelligentMatch(activityNormalized, keyword);
              const activityInKeyword = intelligentMatch(keyword, activityNormalized);
              const isExactMatch = activityNormalized === keyword;
              
              // Vérifier aussi les associations (ex: "boire" -> "bar", "cocktails", etc.)
              const associations = ACTIVITY_ASSOCIATIONS[keyword] || [];
              const hasAssociation = associations.some(assoc => intelligentMatch(activityNormalized, assoc));
              
              if (keywordInActivity || activityInKeyword || isExactMatch || hasAssociation) {
                const isPrimary = primaryKeywords.includes(keyword);
                const isContext = contextKeywords.includes(keyword);
                const score = isPrimary ? 100 : (isContext ? 10 : 25);
                thematicScore += score;
                const matchType = hasAssociation ? 'via association' : 'direct';
                console.log(`🎯 ACTIVITY MATCH (${matchType}): ${establishment.name} - "${activity}" (keyword: "${keyword}") +${score} (total: ${thematicScore})`);
              }
            });
          }
        });
      }

      const isOpen = isOpenNow(establishment.horairesOuverture);
      if (isOpen && thematicScore > 0) {
        thematicScore += 15;
        console.log(`🕐 OPEN BONUS: ${establishment.name} +15 (total: ${thematicScore})`);
      }

      let finalScore = thematicScore;
      let proximityBonus = 0;
      if (thematicScore > 0 && lat && lng && establishment.latitude && establishment.longitude) {
        proximityBonus = Math.max(0, 50 - distance * 2);
        finalScore += proximityBonus;
        console.log(`📍 PROXIMITY BONUS: ${establishment.name} +${proximityBonus} (total: ${finalScore})`);
      }

      console.log(`🎯 FINAL SCORE: ${establishment.name} - thematic: ${thematicScore}, final: ${finalScore}`);
      console.log(`✅ PASS FILTER: ${establishment.name} - ${thematicScore > 30 ? 'OUI' : 'NON'} (seuil: 30)`);

      return {
        ...establishment,
        score: finalScore,
        thematicScore: thematicScore,
        distance: Math.round(distance * 100) / 100,
        isOpen,
        matchedTags: [...new Set(matchedTags)],
        primaryImage: establishment.images[0]?.url || null
      };
    });

    // Filtrer par pertinence thématique - ajusté pour les nouvelles priorités
    const minScore = primaryKeywords.length > 0 ? 30 : 50; // Seuil plus bas si on a des mots-clés primaires
    console.log(`🎯 Seuil de filtrage: ${minScore} (mots-clés primaires: ${primaryKeywords.length})`);
    
    const relevantEstablishments = scoredEstablishments
      .filter(est => est.thematicScore >= minScore);
    
    console.log(`✅ Établissements pertinents après filtrage: ${relevantEstablishments.length}`);
    
    // Fallback: si aucun résultat avec le nouveau système, utiliser l'ancien seuil
    if (relevantEstablishments.length === 0) {
      console.log(`⚠️ Aucun résultat avec le nouveau système, fallback vers l'ancien seuil`);
      const fallbackEstablishments = scoredEstablishments
        .filter(est => est.thematicScore > 30);
      console.log(`🔄 Résultats avec fallback: ${fallbackEstablishments.length}`);
      return NextResponse.json({
        success: true,
        results: fallbackEstablishments.slice(0, limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(fallbackEstablishments.length / limit),
          totalResults: fallbackEstablishments.length,
          hasMore: (page * limit) < fallbackEstablishments.length,
          limit
        },
        filter,
        query: {
          envie,
          ville,
          rayon,
          keywords,
          coordinates: lat && lng ? { lat, lng } : null
        }
      });
    }

    // Appliquer le tri selon le filtre
    const sortedEstablishments = applySorting(relevantEstablishments, filter);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEstablishments = sortedEstablishments.slice(startIndex, endIndex);

    const hasMore = endIndex < sortedEstablishments.length;
    const totalPages = Math.ceil(sortedEstablishments.length / limit);

    return NextResponse.json({
      success: true,
      results: paginatedEstablishments,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: sortedEstablishments.length,
        hasMore,
        limit
      },
      filter,
      query: {
        envie,
        ville,
        rayon: parseInt(rayon.toString()),
        keywords,
        coordinates: lat && lng ? { lat, lng } : null
      }
    });

  } catch (error) {
    console.error('Erreur recherche filtrée:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la recherche",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}