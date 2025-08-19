"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const categories = [
  "bar", "bowling", "escape_game", "market", "nightclub", 
  "restaurant", "cinema", "theater", "concert", "museum", "other"
];

const statuses = ["active", "pending", "suspended"];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    startTransition(() => {
      const queryString = createQueryString("q", term);
      router.push(`/etablissements?${queryString}`);
    });
  };

  const handleFilter = (name: string, value: string) => {
    startTransition(() => {
      const queryString = createQueryString(name, value);
      router.push(`/etablissements?${queryString}`);
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Barre de recherche */}
      <div>
        <input
          type="text"
          placeholder="Rechercher par nom ou adresse..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => handleFilter("category", e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => handleFilter("status", e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "active" ? "Actif" : s === "pending" ? "En attente" : "Suspendu"}
            </option>
          ))}
        </select>

        {(searchParams.get("q") || searchParams.get("category") || searchParams.get("status")) && (
          <button
            onClick={() => router.push("/etablissements")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-gray-400">Recherche en cours...</div>
      )}
    </div>
  );
}
