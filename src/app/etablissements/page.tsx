import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SeedButton from "./seed-button";

export default async function EstablishmentsPage() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Établissements</h1>

      {establishments.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun établissement pour le moment.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <SeedButton />
            <Link className="underline" href="/">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {establishments.map((e) => (
            <li key={e.id} className="border border-white/10 rounded p-4">
              <div className="font-medium">{e.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {e.address}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Catégorie: {e.category} • Statut: {e.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


