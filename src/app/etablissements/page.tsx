import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SeedButton from "./seed-button";
import SearchFilters from "./search-filters";
import ActionButtons from "./action-buttons";

export default async function EstablishmentsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string };
}) {
  const { q, category, status } = searchParams;
  
  const where: any = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { address: { contains: q } },
    ];
  }
  
  if (category) {
    where.category = category;
  }
  
  if (status) {
    where.status = status;
  }

  const establishments = await prisma.establishment.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { name: "asc" },
  });

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


