import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Vérifier si des tags existent déjà
    const existingTags = await prisma.etablissementTag.count();
    if (existingTags > 0) {
      return NextResponse.json({ ok: true, alreadySeeded: true, message: "Tags déjà présents" });
    }

    // Récupérer tous les établissements
    const establishments = await prisma.establishment.findMany();
    
    if (establishments.length === 0) {
      return NextResponse.json({ ok: false, error: "Aucun établissement trouvé. Créez d'abord des établissements." });
    }

    // Définir les tags pour chaque type d'établissement
    const tagsByCategory = {
      bar: [
        { tag: "boire un verre", typeTag: "activite", poids: 8 },
        { tag: "cocktail mojito", typeTag: "nourriture", poids: 7 },
        { tag: "bière artisanale", typeTag: "nourriture", poids: 7 },
        { tag: "bar d'ambiance", typeTag: "ambiance", poids: 8 },
        { tag: "bar dansant", typeTag: "ambiance", poids: 8 },
        { tag: "bar avec jeux arcade", typeTag: "activite", poids: 6 },
        { tag: "bar avec billards", typeTag: "activite", poids: 6 },
        { tag: "apéro entre amis", typeTag: "activite", poids: 7 },
        { tag: "bar à thème", typeTag: "ambiance", poids: 7 },
        { tag: "bar karaoké", typeTag: "activite", poids: 6 }
      ],
      restaurant: [
        { tag: "manger une pizza", typeTag: "nourriture", poids: 9 },
        { tag: "pizza au fromage", typeTag: "nourriture", poids: 8 },
        { tag: "burger gourmet", typeTag: "nourriture", poids: 8 },
        { tag: "cuisine française", typeTag: "nourriture", poids: 7 },
        { tag: "cuisine italienne", typeTag: "nourriture", poids: 7 },
        { tag: "cuisine japonaise", typeTag: "nourriture", poids: 7 },
        { tag: "restaurant gastronomique", typeTag: "ambiance", poids: 8 },
        { tag: "restaurant romantique", typeTag: "ambiance", poids: 7 },
        { tag: "restaurant familial", typeTag: "ambiance", poids: 6 },
        { tag: "déjeuner d'affaires", typeTag: "activite", poids: 6 }
      ],
      escape_game: [
        { tag: "faire un escape game", typeTag: "activite", poids: 9 },
        { tag: "escape game en équipe", typeTag: "activite", poids: 8 },
        { tag: "résoudre des énigmes", typeTag: "activite", poids: 8 },
        { tag: "salle thématique", typeTag: "ambiance", poids: 7 },
        { tag: "jeu d'évasion", typeTag: "activite", poids: 7 },
        { tag: "activité entre amis", typeTag: "activite", poids: 7 },
        { tag: "challenge intellectuel", typeTag: "activite", poids: 6 },
        { tag: "aventure immersive", typeTag: "ambiance", poids: 7 }
      ],
      bowling: [
        { tag: "faire un bowling", typeTag: "activite", poids: 9 },
        { tag: "bowling entre amis", typeTag: "activite", poids: 8 },
        { tag: "jeu de quilles", typeTag: "activite", poids: 7 },
        { tag: "activité familiale", typeTag: "activite", poids: 7 },
        { tag: "compétition bowling", typeTag: "activite", poids: 6 },
        { tag: "loisir indoor", typeTag: "activite", poids: 6 }
      ],
      cinema: [
        { tag: "voir un film", typeTag: "activite", poids: 9 },
        { tag: "cinéma", typeTag: "activite", poids: 8 },
        { tag: "film d'action", typeTag: "activite", poids: 7 },
        { tag: "film comédie", typeTag: "activite", poids: 7 },
        { tag: "film drame", typeTag: "activite", poids: 7 },
        { tag: "séance cinéma", typeTag: "activite", poids: 7 },
        { tag: "sortie culturelle", typeTag: "activite", poids: 6 }
      ],
      theater: [
        { tag: "voir une pièce", typeTag: "activite", poids: 9 },
        { tag: "théâtre", typeTag: "activite", poids: 8 },
        { tag: "spectacle vivant", typeTag: "activite", poids: 8 },
        { tag: "comédie théâtrale", typeTag: "activite", poids: 7 },
        { tag: "drame théâtral", typeTag: "activite", poids: 7 },
        { tag: "sortie culturelle", typeTag: "activite", poids: 7 },
        { tag: "art dramatique", typeTag: "activite", poids: 6 }
      ],
      concert: [
        { tag: "assister à un concert", typeTag: "activite", poids: 9 },
        { tag: "concert live", typeTag: "activite", poids: 8 },
        { tag: "musique en direct", typeTag: "activite", poids: 8 },
        { tag: "concert rock", typeTag: "activite", poids: 7 },
        { tag: "concert jazz", typeTag: "activite", poids: 7 },
        { tag: "concert pop", typeTag: "activite", poids: 7 },
        { tag: "événement musical", typeTag: "activite", poids: 7 }
      ],
      museum: [
        { tag: "visiter un musée", typeTag: "activite", poids: 9 },
        { tag: "exposition d'art", typeTag: "activite", poids: 8 },
        { tag: "découverte culturelle", typeTag: "activite", poids: 8 },
        { tag: "art contemporain", typeTag: "activite", poids: 7 },
        { tag: "art classique", typeTag: "activite", poids: 7 },
        { tag: "histoire locale", typeTag: "activite", poids: 7 },
        { tag: "sortie éducative", typeTag: "activite", poids: 6 }
      ],
      nightclub: [
        { tag: "danser en boîte", typeTag: "activite", poids: 9 },
        { tag: "boîte de nuit", typeTag: "activite", poids: 8 },
        { tag: "musique électro", typeTag: "activite", poids: 7 },
        { tag: "ambiance festive", typeTag: "ambiance", poids: 8 },
        { tag: "soirée dansante", typeTag: "activite", poids: 7 },
        { tag: "club de nuit", typeTag: "activite", poids: 7 },
        { tag: "fête nocturne", typeTag: "activite", poids: 7 }
      ],
      other: [
        { tag: "faire du karting", typeTag: "activite", poids: 9 },
        { tag: "karting avec mes potes", typeTag: "activite", poids: 8 },
        { tag: "course automobile", typeTag: "activite", poids: 7 },
        { tag: "adrénaline", typeTag: "ambiance", poids: 7 },
        { tag: "laser game", typeTag: "activite", poids: 8 },
        { tag: "paintball", typeTag: "activite", poids: 7 },
        { tag: "réalité virtuelle", typeTag: "activite", poids: 7 },
        { tag: "jeux d'arcade", typeTag: "activite", poids: 7 },
        { tag: "casino", typeTag: "activite", poids: 7 },
        { tag: "jeux d'argent", typeTag: "activite", poids: 6 },
        { tag: "patinoire", typeTag: "activite", poids: 7 },
        { tag: "patin à roulettes", typeTag: "activite", poids: 6 },
        { tag: "accrobranche", typeTag: "activite", poids: 7 },
        { tag: "parcours aventure", typeTag: "activite", poids: 7 },
        { tag: "parc de loisirs enfants", typeTag: "activite", poids: 7 },
        { tag: "jungle kids", typeTag: "activite", poids: 7 },
        { tag: "karaoké", typeTag: "activite", poids: 7 },
        { tag: "salle de jeux", typeTag: "activite", poids: 7 },
        { tag: "flipper", typeTag: "activite", poids: 6 },
        { tag: "mini golf", typeTag: "activite", poids: 7 },
        { tag: "golf indoor", typeTag: "activite", poids: 7 },
        { tag: "trampoline park", typeTag: "activite", poids: 7 },
        { tag: "parc d'attractions indoor", typeTag: "activite", poids: 7 },
        { tag: "spa", typeTag: "activite", poids: 7 },
        { tag: "hammam", typeTag: "activite", poids: 7 },
        { tag: "bien être", typeTag: "activite", poids: 7 },
        { tag: "food truck", typeTag: "nourriture", poids: 7 },
        { tag: "street food", typeTag: "nourriture", poids: 7 },
        { tag: "rooftop", typeTag: "ambiance", poids: 7 },
        { tag: "terrasse panoramique", typeTag: "ambiance", poids: 7 }
      ]
    };

    // Créer les tags pour chaque établissement
    let totalTagsCreated = 0;
    
    for (const establishment of establishments) {
      const categoryTags = tagsByCategory[establishment.category as keyof typeof tagsByCategory] || [];
      
      // Sélectionner 3-5 tags aléatoires pour chaque établissement
      const selectedTags = categoryTags
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 3);
      
      for (const tagData of selectedTags) {
        await prisma.etablissementTag.create({
          data: {
            etablissementId: establishment.id,
            tag: tagData.tag,
            typeTag: tagData.typeTag,
            poids: tagData.poids
          }
        });
        totalTagsCreated++;
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `${totalTagsCreated} tags créés pour ${establishments.length} établissements`,
      totalTags: totalTagsCreated,
      totalEstablishments: establishments.length
    });

  } catch (error) {
    console.error("Erreur lors du seeding des tags:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
