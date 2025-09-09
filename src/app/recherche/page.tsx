import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapComponent from "../carte/map-component";
import EstablishmentGrid from "@/components/EstablishmentGrid";

function formatAddress(address?: string | null): string {
  return address ?? "Adresse non renseignée";
}

const PRISMA_CATEGORIES = new Set([
  "bar",
  "bowling",
  "escape_game",
  "market",
  "nightclub",
  "restaurant",
  "cinema",
  "theater",
  "concert",
  "museum",
  "other",
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; lat?: string; lng?: string }>;
}) {
  const { q, category } = await searchParams;

  const where: any = {};
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q } },
      { address: { contains: q } },
    ];
  }
  if (category && category.trim()) {
    const raw = normalizeText(category);
    const underscored = raw.replace(/\s+/g, "_");
    if (PRISMA_CATEGORIES.has(raw)) {
      where.category = raw;
    } else if (PRISMA_CATEGORIES.has(underscored)) {
      where.category = underscored;
    }
    // sinon, on ignore la catégorie invalide ("toutes les sorties" par ex.)
  }

  const establishments = await prisma.establishment.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { name: "asc" },
    include: { 
      images: true,
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
    },
  });

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header recherche */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Résultats de recherche</h1>
          <p className="text-gray-600">
            {establishments.length} lieu{establishments.length > 1 ? "x" : ""} trouvé{establishments.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/" className="text-sm underline">Modifier la recherche</Link>
      </div>

      {/* Layout grille + carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grille de cards */}
        <div className="lg:col-span-2">
          <EstablishmentGrid 
            establishments={establishments as any}
            from="recherche"
            title={q ? `Résultats pour "${q}"` : category ? `Catégorie : ${category}` : "Tous les établissements"}
            subtitle={`${establishments.length} établissement${establishments.length > 1 ? 's' : ''} trouvé${establishments.length > 1 ? 's' : ''}`}
          />
        </div>

        {/* Carte */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[420px] border rounded-xl overflow-hidden">
          <MapComponent establishments={establishments as any} />
        </div>
      </div>
    </main>
  );
}
