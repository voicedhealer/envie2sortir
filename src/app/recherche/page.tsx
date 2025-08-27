import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapComponent from "../carte/map-component";

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
  searchParams: { q?: string; category?: string; lat?: string; lng?: string };
}) {
  const { q, category } = searchParams;

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
    include: { images: true },
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
        <div className="lg:col-span-2 space-y-4">
          {establishments.length === 0 ? (
            <div className="p-6 border rounded-xl text-gray-600">
              Aucun établissement pour ces critères.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {establishments.map((e) => {
                const primary = e.images.find((img) => img.isPrimary) ?? e.images[0];
                return (
                  <Link key={e.id} href={`/etablissements/${e.slug}`} className="block rounded-xl border border-gray-200 hover:shadow-md transition overflow-hidden">
                    {primary ? (
                      <img src={primary.url} alt={primary.altText ?? e.name} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-500">Aucune image</div>
                    )}
                    <div className="p-4">
                      <div className="text-sm text-gray-500">{e.category}</div>
                      <h3 className="text-lg font-semibold mt-1">{e.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">{formatAddress(e.address)}</div>
                      <div className="mt-3 text-sm text-blue-600">Voir les détails →</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Carte */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[420px] border rounded-xl overflow-hidden">
          <MapComponent establishments={establishments as any} />
        </div>
      </div>
    </main>
  );
}
