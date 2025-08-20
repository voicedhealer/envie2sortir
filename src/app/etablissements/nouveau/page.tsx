import EstablishmentForm from "../establishment-form";

export default function NewEstablishmentPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/etablissements" className="text-blue-500 hover:underline">
          ← Retour à la liste
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-8">Ajouter un établissement</h1>
      
      <EstablishmentForm />
    </main>
  );
}
