import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Ajoute quelques établissements de démo si la table est vide
    const count = await prisma.establishment.count();
    if (count > 0) {
      return NextResponse.json({ ok: true, alreadySeeded: true });
    }

    const data = [
      {
        name: "Le Central Bar démo",
        slug: "central-bar",
        address: "10 Rue Principale, 21000 Dijon",
        latitude: 47.322,
        longitude: 5.041,
        category: "bar",
        status: "approved",
        ownerId: "demo-owner-1",
      },
      {
        name: "Cinéma Lumière démo",
        slug: "cinema-lumiere",
        address: "25 Avenue des Arts, 21000 Dijon",
        latitude: 47.329,
        longitude: 5.05,
        category: "cinema",
        status: "approved",
        ownerId: "demo-owner-2",
      },
      {
        name: "Ristorante Bella Vita démo",
        slug: "ristorante-bella-vita",
        address: "3 Rue des Gourmets, 21000 Dijon",
        latitude: 47.321,
        longitude: 5.035,
        category: "restaurant",
        status: "pending",
        ownerId: "demo-owner-3",
      },
    ] as const;

    for (const e of data) {
      await prisma.establishment.upsert({
        where: { slug: e.slug },
        create: e,
        update: e,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


