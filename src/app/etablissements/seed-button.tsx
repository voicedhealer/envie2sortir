"use client";

import { useState } from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seed échoué");
      setDone(true);
      // Recharge la page pour voir les données
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erreur lors du seed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded bg-foreground text-background disabled:opacity-60"
    >
      {done ? "Données ajoutées ✓" : loading ? "Ajout en cours…" : "Ajouter des données de démo"}
    </button>
  );
}


