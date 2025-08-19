export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Envie2Sortir</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Trouvez où sortir près de chez vous
      </p>
      
      <div className="mt-8 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="/etablissements" 
            className="block p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            <h2 className="text-xl font-semibold mb-2">📋 Liste des établissements</h2>
            <p className="text-gray-400">Parcourez tous nos établissements avec recherche et filtres</p>
          </a>
          
          <a 
            href="/carte" 
            className="block p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            <h2 className="text-xl font-semibold mb-2">🗺️ Carte interactive</h2>
            <p className="text-gray-400">Visualisez les établissements sur une carte</p>
          </a>
        </div>
      </div>
    </main>
  );
}
