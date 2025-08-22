import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map enum -> label lisible
const LABELS: Record<string, string> = {
  bar: "Bar d'ambiance / Pub / Brasserie",
  bowling: "Bowling / Billard / Snooker",
  escape_game: "Escape game / Jeu d'évasion",
  market: "Marché / Marché nocturne",
  nightclub: "Discothèque / Club",
  restaurant: "Restaurant",
  cinema: "Cinéma / Drive-in",
  theater: "Théâtre / Spectacle",
  concert: "Concert",
  museum: "Musée / Exposition",
  other: "Autres activités",
};

export async function GET() {
  try {
    const rows = await prisma.establishment.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });

    const data = rows.map((r) => ({
      value: r.category,
      label: LABELS[r.category] ?? r.category,
      count: r._count.category,
    }));

    return NextResponse.json({ categories: data });
  } catch (e) {
    console.error("categories GET error", e);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
