import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envie2Sortir - Lancement Prochainement",
  description: "Découvrez, sortez, profitez ! Lancement le 1er janvier 2026",
};

export default function WaitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Le layout racine gère déjà html et body
  // Ce layout sert uniquement à définir les métadonnées
  return <>{children}</>;
}

