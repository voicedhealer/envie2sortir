import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SeedButton from "./seed-button";
import SearchFilters from "./search-filters";
import ActionButtons from "./action-buttons";

// Catégories Prisma (enum EstablishmentCategory)
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

// Mapping de synonymes -> enum Prisma
const CATEGORY_SYNONYMS: Record<string, string> = {
  bar: "bar",
  pub: "bar",
  brasserie: "bar",
  "bar d'ambiance": "bar",
  nightclub: "nightclub",
  discotheque: "nightclub",
  "discotheque club": "nightclub",
  "boite de nuit": "nightclub",
  "boîte de nuit": "nightclub",
  club: "nightclub",
  bowling: "bowling",
  billard: "bowling",
  snooker: "bowling",
  restaurant: "restaurant",
  resto: "restaurant",
  cinema: "cinema",
  "cinema drive in": "cinema",
  "drive in": "cinema",
  theatre: "theater",
  théâtre: "theater",
  spectacle: "theater",
  concert: "concert",
  musee: "museum",
  musée: "museum",
  museum: "museum",
  marche: "market",
  marché: "market",
  market: "market",
  "escape game": "escape_game",
  "escape-game": "escape_game",
  "jeu d'evasion": "escape_game",
  "jeu d’évasion": "escape_game",
  evasion: "escape_game",
  "realite virtuelle": "other",
  "réalité virtuelle": "other",
  karting: "other",
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // suppr. accents
    .replace(/\s+/g, " ")
    .trim();
}

export default async function EstablishmentsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string };
}) {
  const { q, category, status } = searchParams;
  
  const where: any = {};

  if (q) {
    const term = q.trim();
    if (term.length > 0) {
      where.OR = [
        { name: { contains: term } },
        { address: { contains: term } },
      ];
    }
  }

  if (category) {
    const raw = normalizeText(category);
    // Essayer d'abord une correspondance directe à l'enum
    let prismaCategory: string | undefined = PRISMA_CATEGORIES.has(raw)
      ? raw
      : CATEGORY_SYNONYMS[raw];
    // Si non trouvé, tenter de transformer les espaces en underscore
    if (!prismaCategory) {
      const underscored = raw.replace(/\s+/g, "_");
      if (PRISMA_CATEGORIES.has(underscored)) {
        prismaCategory = underscored;
      }
    }
    // Appliquer uniquement si valide
    if (prismaCategory && PRISMA_CATEGORIES.has(prismaCategory)) {
      where.category = prismaCategory;
    }
  }

  if (status) {
    const st = normalizeText(status);
    if (st === "active" || st === "pending" || st === "suspended") {
      where.status = st;
    }
  }

  const args: any = { orderBy: { name: "asc" } };
  if (Object.keys(where).length > 0) {
    args.where = where;
  }

  const establishments = await prisma.establishment.findMany(args);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Établissements</h1>
        <Link
          href="/etablissements/nouveau"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter un établissement
        </Link>
      </div>

      <SearchFilters />

      {establishments.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">
            {q || category || status ? "Aucun établissement trouvé avec ces critères." : "Aucun établissement pour le moment."}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <SeedButton />
            <Link className="underline" href="/">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {establishments.map((e) => (
            <li key={e.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <Link href={`/etablissements/${e.slug}`} className="flex-1">
                  <div className="font-medium text-lg">{e.name}</div>
                  <div className="text-sm text-gray-600">
                    {e.address}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Catégorie: {e.category} • Statut: {e.status}
                  </div>
                </Link>
                
                <ActionButtons establishment={e} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


