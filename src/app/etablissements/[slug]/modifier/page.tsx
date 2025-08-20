import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EstablishmentForm from "../../establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: params.slug },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href={`/etablissements/${params.slug}`} className="text-blue-500 hover:underline">
          ← Retour aux détails
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-8">Modifier {establishment.name}</h1>
      
      <EstablishmentForm establishment={establishment} />
    </main>
  );
}
