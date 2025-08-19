import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SeedButton from "./seed-button";
import SearchFilters from "./search-filters";

export default async function EstablishmentsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string };
}) {
  const { q, category, status } = searchParams;
  
  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category }),
    ...(status && { status }),
  };

  const establishments = await prisma.establishment.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Établissements</h1>

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
            <li key={e.id} className="border border-white/10 rounded p-4 hover:bg-white/5 transition-colors">
              <Link href={`/etablissements/${e.slug}`} className="block">
                <div className="font-medium">{e.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {e.address}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Catégorie: {e.category} • Statut: {e.status}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


