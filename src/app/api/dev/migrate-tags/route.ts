import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTagsData } from "@/lib/category-tags-mapping";

/**
 * Script de migration pour ajouter des tags aux établissements existants
 * Basé sur leurs activités actuelles
 */
export async function POST() {
  try {
    console.log("🚀 Début de la migration des tags...");

    // Récupérer tous les établissements avec leurs activités
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        activities: true,
        tags: {
          select: {
            tag: true
          }
        }
      }
    });

    console.log(`📊 ${establishments.length} établissements trouvés`);

    let totalTagsCreated = 0;
    let establishmentsProcessed = 0;

    for (const establishment of establishments) {
      // Vérifier si l'établissement a déjà des tags
      const existingTags = establishment.tags.map(t => t.tag);
      
      if (existingTags.length > 0) {
        console.log(`⏭️  ${establishment.name} a déjà ${existingTags.length} tags, ignoré`);
        continue;
      }

      // Vérifier si l'établissement a des activités
      if (!establishment.activities || Array.isArray(establishment.activities) === false) {
        console.log(`⚠️  ${establishment.name} n'a pas d'activités définies, ignoré`);
        continue;
      }

      const activities = establishment.activities as string[];
      if (activities.length === 0) {
        console.log(`⚠️  ${establishment.name} a un tableau d'activités vide, ignoré`);
        continue;
      }

      console.log(`🔄 Traitement de ${establishment.name} avec ${activities.length} activité(s): ${activities.join(', ')}`);

      // Créer les tags pour chaque activité
      const allTagsData: Array<{etablissementId: string, tag: string, typeTag: string, poids: number}> = [];
      
      for (const activityKey of activities) {
        const tagsData = createTagsData(establishment.id, activityKey);
        allTagsData.push(...tagsData);
        console.log(`  📝 Activité "${activityKey}" → ${tagsData.length} tags`);
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
      if (uniqueTags.size > 0) {
        await prisma.etablissementTag.createMany({
          data: Array.from(uniqueTags.values())
        });
        
        const tagsCreated = uniqueTags.size;
        totalTagsCreated += tagsCreated;
        console.log(`  ✅ ${tagsCreated} tags créés pour ${establishment.name}`);
      }

      establishmentsProcessed++;
    }

    console.log(`🎉 Migration terminée !`);
    console.log(`📊 Résumé :`);
    console.log(`  - Établissements traités : ${establishmentsProcessed}`);
    console.log(`  - Tags créés au total : ${totalTagsCreated}`);

    return NextResponse.json({ 
      success: true,
      message: "Migration des tags terminée avec succès",
      stats: {
        establishmentsProcessed,
        totalTagsCreated,
        totalEstablishments: establishments.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration des tags:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la migration des tags",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
