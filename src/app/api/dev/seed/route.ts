import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Ajoute quelques établissements de démo si la table est vide
  const count = await prisma.establishment.count();
  if (count > 0) {
    return NextResponse.json({ ok: true, alreadySeeded: true });
  }

  await prisma.establishment.createMany({
    data: [
      {
        name: "Le Central Bar",
        slug: "central-bar",
        address: "10 Rue Principale, 21000 Dijon",
        latitude: 47.322,
        longitude: 5.041,
        category: "bar",
        status: "active",
      },
      {
        name: "Cinéma Lumière",
        slug: "cinema-lumiere",
        address: "25 Avenue des Arts, 21000 Dijon",
        latitude: 47.329,
        longitude: 5.05,
        category: "cinema",
        status: "active",
      },
      {
        name: "Ristorante Bella Vita",
        slug: "ristorante-bella-vita",
        address: "3 Rue des Gourmets, 21000 Dijon",
        latitude: 47.321,
        longitude: 5.035,
        category: "restaurant",
        status: "pending",
      },
    ],
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true });
}


