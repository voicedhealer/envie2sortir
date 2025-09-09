import { redirect } from "next/navigation";

export default async function EstablishmentsPage() {
  // Rediriger vers la carte car la page de liste n'a plus lieu d'être
  // Les utilisateurs découvrent les établissements via :
  // - La carte interactive (/carte)
  // - La recherche par envie (/recherche/envie)
  // - La recherche classique (/recherche)
  // - La page d'accueil avec suggestions
  redirect('/carte');
}