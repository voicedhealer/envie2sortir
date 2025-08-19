export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Envie2Sortir</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Aperçu de ma page d’accueil.
      </p>
      <div className="mt-6">
        <a className="underline" href="/etablissements">Voir les établissements</a>
      </div>
    </main>
  );
}
